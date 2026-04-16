import { prisma } from "./prisma";
import { enrichBeast } from "@game/core";

const BASE_RATE_GOLD_PER_HOUR = 50;
const MAX_TIME_HOURS = 12;
const MIN_CLAIM_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

export async function calculateOfflineIncome(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { beasts: { where: { isEquipped: true } } }
    });

    if (!user) throw new Error("User không tồn tại.");

    const now = Date.now();
    const lastActive = new Date((user as any).lastActiveAt).getTime();
    const elapsedTimeMs = now - lastActive;

    // Calculate Pet Bonuses
    let goldMultiplier = 1.0;
    let maxTimeBonusHours = 0;

    user.beasts.forEach(pet => {
        const enriched = enrichBeast(pet);
        if (enriched.role === "DPS") goldMultiplier += 0.1;
        if (enriched.role === "TANK") goldMultiplier += 0.1;
        if (enriched.role === "SUPPORT") maxTimeBonusHours += 1;
    });

    const finalMaxTimeMs = (MAX_TIME_HOURS + maxTimeBonusHours) * 3600 * 1000;
    const effectiveTimeMs = Math.min(elapsedTimeMs, finalMaxTimeMs);

    // gold = rate_per_hour * time_in_hours * multiplier
    const goldEarned = Math.floor((BASE_RATE_GOLD_PER_HOUR * (effectiveTimeMs / (3600 * 1000))) * goldMultiplier);

    return {
        goldEarned,
        elapsedTime: elapsedTimeMs,
        effectiveTime: effectiveTimeMs,
        finalMaxTime: finalMaxTimeMs,
        goldMultiplier,
        isClaimable: elapsedTimeMs >= MIN_CLAIM_INTERVAL_MS
    };
}

export async function claimOfflineIncome(userId: string) {
    const info = await calculateOfflineIncome(userId);

    if (!info.isClaimable) {
        const remainingMs = MIN_CLAIM_INTERVAL_MS - info.elapsedTime;
        const remainingMin = Math.ceil(remainingMs / 60000);
        throw new Error(`Bạn cần chờ thêm ${remainingMin} phút nữa để nhận thu nhập ngoại tuyến.`);
    }

    if (info.goldEarned <= 0) {
        throw new Error("Không có thu nhập nào để nhận.");
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            gold: { increment: info.goldEarned },
            lastActiveAt: new Date()
        } as any
    });

    return {
        goldEarned: info.goldEarned,
        elapsedTime: info.elapsedTime,
        effectiveTime: info.effectiveTime,
        bonusApplied: {
            goldMult: info.goldMultiplier,
            maxTimeBonusMs: info.finalMaxTime - (MAX_TIME_HOURS * 3600 * 1000)
        }
    };
}

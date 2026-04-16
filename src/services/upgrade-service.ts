import { ItemType, Rarity } from "@prisma/client";
import { prisma } from "./prisma";

export const SCRAP_VALUE_IN_GOLD = 5;
export const MAX_UPGRADE_LEVEL = 100;
const FAIL_BONUS_RATE = 0.10;
const MAX_FAILS_FOR_PITY = 5;

const GEAR_TYPES: ItemType[] = [ItemType.WEAPON, ItemType.ARMOR, ItemType.ACCESSORY];

// Rarity multiplier for cost and scrap
export function getRarityMultiplier(rarity: Rarity): number {
  if (rarity === Rarity.LEGENDARY) return 15.0;
  if (rarity === Rarity.EPIC) return 6.0;
  if (rarity === Rarity.RARE) return 2.5;
  return 1.0;
}

function rarityRank(rarity: Rarity): number {
  if (rarity === Rarity.LEGENDARY) return 4;
  if (rarity === Rarity.EPIC) return 3;
  if (rarity === Rarity.RARE) return 2;
  return 1;
}

/** Gold equivalent before scrap offset: `(level + 1) * 300 * rarityMultiplier` */
export function getUpgradeCost(currentLevel: number, rarity: Rarity): number {
  return Math.floor((currentLevel + 1) * 300 * getRarityMultiplier(rarity));
}

// Success rate decreases as level goes up.
export function getBaseSuccessRate(currentLevel: number): number {
  if (currentLevel < 3) return 1.0;   // 100%
  if (currentLevel < 5) return 0.8;   // 80%
  if (currentLevel < 7) return 0.6;   // 60%
  if (currentLevel < 9) return 0.4;   // 40%
  return 0.2;                         // 20%
}

/** Alias for UI — base rate only (no pity / fail streak). */
export function getUpgradeSuccessRate(currentLevel: number): number {
  return getBaseSuccessRate(currentLevel);
}

export function getEffectiveSuccessRate(currentLevel: number, failCount: number): number {
  let baseRate = getBaseSuccessRate(currentLevel);
  let totalRate = baseRate + failCount * FAIL_BONUS_RATE;
  if (failCount >= MAX_FAILS_FOR_PITY) return 1.0;
  return Math.min(1.0, totalRate);
}

export type UpgradePaymentPreview = {
  baseGoldCost: number;
  scrapToUse: number;
  goldToUse: number;
};

export function previewUpgradePayment(userScrap: number, currentLevel: number, rarity: Rarity): UpgradePaymentPreview {
  const baseGoldCost = getUpgradeCost(currentLevel, rarity);
  let remainingGoldCost = baseGoldCost;
  let scrapToUse = 0;
  let goldToUse = 0;
  const totalScrapValue = userScrap * SCRAP_VALUE_IN_GOLD;

  if (totalScrapValue >= remainingGoldCost) {
    scrapToUse = Math.ceil(remainingGoldCost / SCRAP_VALUE_IN_GOLD);
    remainingGoldCost = 0;
  } else {
    scrapToUse = userScrap;
    remainingGoldCost -= scrapToUse * SCRAP_VALUE_IN_GOLD;
    goldToUse = Math.ceil(remainingGoldCost);
  }

  return { baseGoldCost, scrapToUse, goldToUse };
}

export function calculateScrapValue(item: { power: number; bonusStr: number; bonusAgi: number; bonusDef: number; bonusHp: number; rarity: Rarity }): number {
  const statScore = item.power + item.bonusStr + item.bonusAgi + (item.bonusDef * 1.5) + (item.bonusHp * 0.25);
  return Math.floor(statScore * getRarityMultiplier(item.rarity));
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isGearItem(type: ItemType): boolean {
  return GEAR_TYPES.includes(type);
}

function sortGearKeepBestFirst(a: { upgradeLevel: number; rarity: Rarity; power: number; id: string }, b: { upgradeLevel: number; rarity: Rarity; power: number; id: string }): number {
  if (b.upgradeLevel !== a.upgradeLevel) return b.upgradeLevel - a.upgradeLevel;
  const rr = rarityRank(b.rarity) - rarityRank(a.rarity);
  if (rr !== 0) return rr;
  if (b.power !== a.power) return b.power - a.power;
  return a.id.localeCompare(b.id);
}

/** Phân giải 1 đơn vị (giảm quantity hoặc xóa dòng). Không cho phép khi đang trang bị. */
export async function scrapOneItemUnit(
  userId: string,
  target: string
): Promise<{ ok: boolean; message: string; scrapGained?: number }> {
  const trimmed = target.trim();
  const byId = UUID_RE.test(trimmed)
    ? await prisma.item.findFirst({ where: { id: trimmed, ownerId: userId } })
    : null;

  let item = byId;
  if (!item) {
    const lower = trimmed.toLowerCase();
    const matches = await prisma.item.findMany({
      where: {
        ownerId: userId,
        name: { contains: trimmed },
      },
    });
    const gearMatches = matches.filter((i) => isGearItem(i.type));
    const exact = gearMatches.filter((i) => i.name.toLowerCase() === lower);
    const pool = exact.length > 0 ? exact : gearMatches;
    if (pool.length === 0) {
      return { ok: false, message: "Không tìm thấy trang bị khớp tên hoặc ID." };
    }
    if (pool.length > 1) {
      const names = pool.map((i) => `• \`${i.name}\` (${i.type}, +${i.upgradeLevel})`).join("\n");
      return {
        ok: false,
        message: `Có nhiều kết quả — hãy dùng ID hoặc tên chính xác hơn:\n${names}`,
      };
    }
    item = pool[0]!;
  }

  if (!isGearItem(item.type)) {
    return { ok: false, message: "Chỉ có thể phân giải Vũ khí, Giáp hoặc Trang sức." };
  }
  if (item.isEquipped) {
    return { ok: false, message: "Hãy **tháo** trang bị trước khi phân giải." };
  }

  const perUnit = calculateScrapValue(item);

  await prisma.$transaction(async (tx) => {
    const fresh = await tx.item.findUnique({ where: { id: item!.id } });
    if (!fresh || fresh.ownerId !== userId || fresh.quantity < 1) return;
    if (fresh.quantity > 1) {
      await tx.item.update({
        where: { id: fresh.id },
        data: { quantity: { decrement: 1 } },
      });
    } else {
      await tx.item.delete({ where: { id: fresh.id } });
    }
    await tx.user.update({
      where: { id: userId },
      data: { scrap: { increment: perUnit } },
    });
  });

  return {
    ok: true,
    scrapGained: perUnit,
    message: `Đã phân giải **${item.name}** → **+${perUnit}** Scrap (≈ ${perUnit * SCRAP_VALUE_IN_GOLD} vàng).`,
  };
}

/** Phân giải mọi trang bị **chưa đeo** thuộc độ hiếm chỉ định. */
export async function scrapAllUnequippedByRarity(
  userId: string,
  rarity: Rarity
): Promise<{ ok: boolean; message: string; count?: number; totalScrap?: number }> {
  return prisma.$transaction(async (tx) => {
    const items = await tx.item.findMany({
      where: {
        ownerId: userId,
        rarity,
        isEquipped: false,
        type: { in: GEAR_TYPES },
        quantity: { gt: 0 },
      },
    });

    if (items.length === 0) {
      return { ok: true, message: "Không có trang bị nào (chưa trang bị) thuộc độ hiếm này.", count: 0, totalScrap: 0 };
    }

    let totalScrap = 0;
    for (const it of items) {
      const unitScrap = calculateScrapValue(it);
      const q = it.quantity;
      totalScrap += unitScrap * q;
    }

    await tx.item.deleteMany({
      where: { id: { in: items.map((i) => i.id) } },
    });

    await tx.user.update({
      where: { id: userId },
      data: { scrap: { increment: totalScrap } },
    });

    return {
      ok: true,
      count: items.reduce((s, i) => s + i.quantity, 0),
      totalScrap,
      message: `Đã phân giải **${items.reduce((s, i) => s + i.quantity, 0)}** món ${rarity} → **+${totalScrap}** Scrap.`,
    };
  });
}

/**
 * Gom phế liệu từ trùng lặp:
 * - Cùng tên (khác type): giữ 1 món (ưu tiên +cao, hiếm, power).
 * - Cùng dòng xếp chồng quantity>1: giữ 1 đơn vị, phân giải phần dư.
 */
export async function scrapDuplicates(userId: string): Promise<{ ok: boolean; message: string; totalScrap: number }> {
  return prisma.$transaction(async (tx) => {
    const gear = await tx.item.findMany({
      where: {
        ownerId: userId,
        type: { in: GEAR_TYPES },
        quantity: { gt: 0 },
      },
    });

    let totalScrap = 0;
    const toDelete: string[] = [];

    const byName = new Map<string, typeof gear>();
    for (const it of gear) {
      const key = it.name.toLowerCase();
      if (!byName.has(key)) byName.set(key, []);
      byName.get(key)!.push(it);
    }

    for (const [, group] of byName) {
      if (group.length <= 1) continue;
      const sorted = [...group].sort(sortGearKeepBestFirst);
      const keep = sorted[0];
      for (const drop of sorted.slice(1)) {
        if (drop.isEquipped) continue;
        const unit = calculateScrapValue(drop);
        totalScrap += unit * drop.quantity;
        toDelete.push(drop.id);
      }
    }

    const toDeleteSet = new Set(toDelete);

    if (toDelete.length > 0) {
      await tx.item.deleteMany({ where: { id: { in: toDelete } } });
    }

    for (const it of gear) {
      if (toDeleteSet.has(it.id)) continue;
      if (it.quantity <= 1) continue;
      if (it.isEquipped) continue;
      const unit = calculateScrapValue(it);
      const extra = it.quantity - 1;
      totalScrap += unit * extra;
      await tx.item.update({
        where: { id: it.id },
        data: { quantity: 1 },
      });
    }

    if (totalScrap > 0) {
      await tx.user.update({
        where: { id: userId },
        data: { scrap: { increment: totalScrap } },
      });
    }

    const msg =
      totalScrap === 0
        ? "Không có bản trùng để phân giải (cùng tên nhiều dòng chưa trang bị, hoặc xếp chồng quantity > 1)."
        : `Đã gom phế liệu từ bản trùng → **+${totalScrap}** Scrap.`;

    return { ok: true, totalScrap, message: msg };
  });
}

export async function upgradeEquipment(userId: string, itemId: string): Promise<{ success: boolean; message: string; leveledUp?: boolean }> {
  return prisma.$transaction(async (tx) => {
    const item = await tx.item.findUnique({
      where: { id: itemId },
    });

    if (!item || item.ownerId !== userId) {
      return { success: false, message: "Không tìm thấy vật phẩm hoặc đây không phải vật phẩm của bạn." };
    }

    if (item.type !== ItemType.WEAPON && item.type !== ItemType.ARMOR && item.type !== ItemType.ACCESSORY) {
      return { success: false, message: "Chỉ có thể nâng cấp Vũ Khí, Giáp và Trang Sức." };
    }

    if (item.upgradeLevel >= MAX_UPGRADE_LEVEL) {
      return { success: false, message: `Vật phẩm đã đạt cấp nâng cấp tối đa (+${MAX_UPGRADE_LEVEL}).` };
    }

    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) {
      return { success: false, message: "Không tìm thấy người chơi." };
    }

    const baseGoldCost = getUpgradeCost(item.upgradeLevel, item.rarity);

    let remainingGoldCost = baseGoldCost;
    let scrapToUse = 0;
    let goldToUse = 0;

    const totalScrapValue = user.scrap * SCRAP_VALUE_IN_GOLD;

    if (totalScrapValue >= remainingGoldCost) {
      scrapToUse = Math.ceil(remainingGoldCost / SCRAP_VALUE_IN_GOLD);
      remainingGoldCost = 0; 
    } else {
      scrapToUse = user.scrap;
      remainingGoldCost -= scrapToUse * SCRAP_VALUE_IN_GOLD;
      goldToUse = Math.ceil(remainingGoldCost);
    }

    if (user.gold < goldToUse) {
      const extraMsg = scrapToUse > 0 ? ` (Sau khi đã miễn giảm bằng ${scrapToUse} Scrap)` : "";
      return { success: false, message: `Bạn cần thêm **${goldToUse} vàng** nữa${extraMsg} để nâng cấp.` };
    }

    // Deduct cost
    await tx.user.update({
      where: { id: userId },
      data: {
        scrap: { decrement: scrapToUse },
        gold: { decrement: goldToUse }
      }
    });

    let baseRate = getBaseSuccessRate(item.upgradeLevel);
    let failCount = item.failCount || 0;
    let totalRate = baseRate + failCount * FAIL_BONUS_RATE;

    let isPityTriggered = false;
    if (failCount >= MAX_FAILS_FOR_PITY) {
      totalRate = 1.0; 
      isPityTriggered = true;
    } else if (totalRate > 1.0) {
      totalRate = 1.0;
    }

    const roll = Math.random();
    const isSuccess = roll <= totalRate;

    let message = "";
    let leveledUp = false;

    let costStr = "";
    if (scrapToUse > 0 && goldToUse > 0) costStr = `**${scrapToUse} Scrap** & **${goldToUse} Vàng**`;
    else if (scrapToUse > 0) costStr = `**${scrapToUse} Scrap**`;
    else costStr = `**${goldToUse} Vàng**`;

    if (isSuccess) {
      const updatedItem = await tx.item.update({
        where: { id: itemId },
        data: { upgradeLevel: { increment: 1 }, failCount: 0 },
      });
      const pityMsg = isPityTriggered ? "\n🌟 *Hệ thống Bảo Hiểm (Pity) đã can thiệp!*" : "";
      message = `Ting ting! Nâng cấp thành công **${item.name} [+${updatedItem.upgradeLevel}]**. (Tỷ lệ: ${(totalRate*100).toFixed(0)}%)${pityMsg}\nTiêu hao: ${costStr}`;
      leveledUp = true;
    } else {
      const dropLevel = Math.max(0, item.upgradeLevel - 1);
      const updatedItem = await tx.item.update({
        where: { id: itemId },
        data: { upgradeLevel: dropLevel, failCount: failCount + 1 },
      });
      message = `Rắc... Nâng cấp xịt! (Tỷ lệ: ${(totalRate*100).toFixed(0)}%)\n**${item.name}** bị ngót xuống **[+${dropLevel}]**.\n🌟 *Nhận Bảo hiểm Pity +10% rate cho lần sau! (Fail Streak: ${failCount+1}/${MAX_FAILS_FOR_PITY})*\nTiêu hao: ${costStr}`;
      leveledUp = false;
    }

    return { success: true, leveledUp, message };
  });
}

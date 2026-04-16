/**
 * equipment-service.ts
 * Handles weapon/armor equip logic, stat calculation, and damage formulas.
 * Designed for a small-scale Discord RPG bot.
 */

import { ItemType } from "@prisma/client";
import { prisma } from "./prisma";

// ==========================================
// 1. TYPES
// ==========================================

/** Equipment slot types we care about */
const EQUIP_SLOTS: ItemType[] = [ItemType.WEAPON, ItemType.ARMOR, ItemType.ACCESSORY];

/** The computed final stats after gear bonuses */
export interface FinalStats {
    str: number;
    agi: number;
    def: number;
    maxHp: number;
    weaponPower: number; // raw power from weapon
}

// ==========================================
// 2. STAT CALCULATION
// ==========================================

/**
 * Computes final stats from base user stats + all equipped items.
 * Does NOT mutate the database — pure calculation.
 */
export function getFinalStats(
    user: { str: number; agi: number; maxHp: number },
    items: { type: string; power: number; bonusStr: number; bonusAgi: number; bonusDef: number; bonusHp: number; isEquipped: boolean; upgradeLevel?: number }[]
): FinalStats {
    const equipped = items.filter(i => i.isEquipped);

    let bonusStr = 0;
    let bonusAgi = 0;
    let bonusDef = 0;
    let bonusHp = 0;
    let weaponPower = 0;

    for (const item of equipped) {
        const upgradeLevel = item.upgradeLevel || 0;
        const upgradeMultiplier = 1 + (upgradeLevel * 0.1); // +10% max power per level

        bonusStr += Math.floor(item.bonusStr * upgradeMultiplier);
        bonusAgi += Math.floor(item.bonusAgi * upgradeMultiplier);
        bonusDef += Math.floor(item.bonusDef * upgradeMultiplier);
        bonusHp += Math.floor(item.bonusHp * upgradeMultiplier);

        if (item.type === ItemType.WEAPON) {
            weaponPower += Math.floor(item.power * upgradeMultiplier);
        }
    }

    return {
        str: user.str + bonusStr,
        agi: user.agi + bonusAgi,
        def: bonusDef,            // base def comes from gear only
        maxHp: user.maxHp + bonusHp,
        weaponPower
    };
}

// ==========================================
// 3. DAMAGE FORMULAS
// ==========================================

const STR_SCALING_FACTOR = 0.5;

/**
 * Calculate attack damage from attacker stats.
 * Formula: baseAtk + weaponPower + (str * scaling)
 */
export function calculateAttackDamage(
    attackerStr: number,
    weaponPower: number,
    baseAtk: number
): number {
    return Math.floor(baseAtk + weaponPower + (attackerStr * STR_SCALING_FACTOR));
}

/**
 * Calculate damage reduction from armor def%.
 * Formula: finalDmg = rawDmg * (1 - defReduction)
 * def% = def / (def + 100), capped at 75%
 */
export function getArmorReduction(def: number): number {
    const reduction = def / (def + 100);
    return Math.min(0.75, reduction); // hard cap 75%
}

/**
 * Full damage pipeline: attacker hits defender.
 * Returns the final damage number after all gear modifiers.
 */
export function calculateGearDamage(
    attacker: { str: number; weaponPower: number; baseAtk: number },
    defender: { def: number }
): number {
    const rawDmg = calculateAttackDamage(attacker.str, attacker.weaponPower, attacker.baseAtk);
    const reduction = getArmorReduction(defender.def);
    const finalDmg = Math.floor(rawDmg * (1 - reduction));
    return Math.max(1, finalDmg); // always deal at least 1
}

// ==========================================
// 4. EQUIP / UNEQUIP
// ==========================================

/**
 * Equip an item for a user.
 * Rules:
 *   - Only WEAPON, ARMOR, and ACCESSORY can be equipped
 *   - Auto-unequips old item of same type (for WEAPON/ARMOR)
 *   - For ACCESSORY, it uses the specified slot (1 or 2) or defaults to 1.
 *   - Item must belong to the user
 */
export async function equipItem(userId: string, itemId: string, slot?: number): Promise<{ success: boolean; message: string }> {
    return prisma.$transaction(async (tx) => {
        const item = await tx.item.findFirst({
            where: { id: itemId, ownerId: userId }
        });

        if (!item) return { success: false, message: "Không tìm thấy vật phẩm này trong túi đồ." };

        if (!EQUIP_SLOTS.includes(item.type)) {
            return { success: false, message: `Không thể trang bị loại **${item.type}**. Chỉ hỗ trợ Vũ Khí, Giáp và Trang Sức.` };
        }

        if (item.isEquipped) {
            return { success: false, message: `**${item.name}** đã được trang bị rồi.` };
        }

        let currentlyEquippedId: string | null = null;
        let currentlyEquippedName: string | null = null;

        if (item.type === ItemType.ACCESSORY) {
            let targetSlot = slot;
            
            // If no slot specified, try to find an empty one first
            if (!targetSlot) {
                const equippedAccessories = await tx.item.findMany({
                    where: { ownerId: userId, type: ItemType.ACCESSORY, isEquipped: true }
                });
                const usedSlots = equippedAccessories.map(a => a.equipSlot);
                if (!usedSlots.includes(1)) targetSlot = 1;
                else if (!usedSlots.includes(2)) targetSlot = 2;
                else targetSlot = 1; // Default to 1 if both full
            }

            const existing = await tx.item.findFirst({
                where: { ownerId: userId, type: ItemType.ACCESSORY, isEquipped: true, equipSlot: targetSlot }
            });
            if (existing) {
                currentlyEquippedId = existing.id;
                currentlyEquippedName = existing.name;
            }
            
            // Unequip old in target slot if exists
            if (currentlyEquippedId) {
                await tx.item.update({
                    where: { id: currentlyEquippedId },
                    data: { isEquipped: false, equipSlot: null }
                });
            }

            // Equip new in target slot
            await tx.item.update({
                where: { id: item.id },
                data: { isEquipped: true, equipSlot: targetSlot }
            });

            // Update display slot for the final message
            slot = targetSlot;
        } else {
            // Auto-unequip any currently equipped item of the same type for Weapon/Armor
            const existing = await tx.item.findFirst({
                where: { ownerId: userId, type: item.type, isEquipped: true }
            });

            if (existing) {
                currentlyEquippedId = existing.id;
                currentlyEquippedName = existing.name;
                await tx.item.update({
                    where: { id: currentlyEquippedId },
                    data: { isEquipped: false, equipSlot: null }
                });
            }

            // Equip the new item
            await tx.item.update({
                where: { id: item.id },
                data: { isEquipped: true, equipSlot: 1 }
            });
        }

        let slotDisplay = "";
        if (item.type === ItemType.WEAPON) slotDisplay = "⚔️ Vũ Khí";
        else if (item.type === ItemType.ARMOR) slotDisplay = "🛡️ Giáp";
        else slotDisplay = `💍 Trang Sức (Ô ${slot || 1})`;

        const swapMsg = currentlyEquippedName
            ? `\n↳ Đã tháo **${currentlyEquippedName}** ra.`
            : "";

        return {
            success: true,
            message: `Đã trang bị ${slotDisplay}: **${item.name}**!${swapMsg}`
        };
    });
}

/**
 * Unequip an item.
 */
export async function unequipItem(userId: string, itemId: string): Promise<{ success: boolean; message: string }> {
    return prisma.$transaction(async (tx) => {
        const item = await tx.item.findFirst({
            where: { id: itemId, ownerId: userId }
        });

        if (!item) return { success: false, message: "Không tìm thấy vật phẩm này." };

        if (!item.isEquipped) {
            return { success: false, message: `**${item.name}** chưa được trang bị.` };
        }

        await tx.item.update({
            where: { id: item.id },
            data: { isEquipped: false }
        });

        return { success: true, message: `Đã tháo **${item.name}** ra.` };
    });
}

// ==========================================
// 5. INVENTORY HELPERS
// ==========================================

/**
 * Add an equipment item to the user's inventory.
 * Trùng (cùng name + type) → tăng quantity trên stack hiện có (không đổi vàng).
 * Hết slot dòng mới → không nhận đồ, không cộng vàng.
 */
export async function addEquipmentToInventory(
    userId: string,
    item: { name: string; type: ItemType; power: number; rarity: any; bonusStr?: number; bonusAgi?: number; bonusDef?: number; bonusHp?: number }
): Promise<{ added: boolean; message: string }> {
    return prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({ where: { id: userId } });
        if (!user) return { added: false, message: "Người chơi không tồn tại." };

        const existing = await tx.item.findFirst({
            where: { ownerId: userId, name: item.name, type: item.type }
        });

        if (existing) {
            const updated = await tx.item.update({
                where: { id: existing.id },
                data: { quantity: { increment: 1 } },
            });
            return {
                added: true,
                message: `Đã gộp **${item.name}** (x${updated.quantity}).`,
            };
        }

        const itemCount = await tx.item.count({ where: { ownerId: userId } });
        if (itemCount >= user.inventoryLimit) {
            return {
                added: false,
                message: `Túi đồ đầy (**${itemCount}/${user.inventoryLimit}**). Không thể nhận **${item.name}** — hãy dọn túi hoặc dùng \`/scrap\`.`,
            };
        }

        await tx.item.create({
            data: {
                ownerId: userId,
                name: item.name,
                type: item.type,
                power: item.power,
                rarity: item.rarity,
                bonusStr: item.bonusStr ?? 0,
                bonusAgi: item.bonusAgi ?? 0,
                bonusDef: item.bonusDef ?? 0,
                bonusHp: item.bonusHp ?? 0,
                quantity: 1
            }
        });

        return { added: true, message: `Đã nhận **${item.name}**!` };
    });
}

/**
 * Returns the user's full inventory grouped by type for display.
 */
export async function getInventoryDisplay(userId: string) {
    const items = await prisma.item.findMany({
        where: { ownerId: userId, quantity: { gt: 0 } },
        orderBy: [{ type: "asc" }, { power: "desc" }]
    });

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { inventoryLimit: true }
    });

    return { items, limit: user?.inventoryLimit ?? 50 };
}

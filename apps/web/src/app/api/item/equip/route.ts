import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ItemType } from "@prisma/client";

const EQUIP_SLOTS: ItemType[] = [ItemType.WEAPON, ItemType.ARMOR, ItemType.ACCESSORY];

export async function POST(req: NextRequest) {
  try {
    const { userId, itemId, slot } = await req.json();

    if (!userId || !itemId) {
      return NextResponse.json({ success: false, message: "Missing userId or itemId" }, { status: 400 });
    }

    const item = await prisma.item.findFirst({
      where: { id: itemId, ownerId: userId }
    });

    if (!item) {
      return NextResponse.json({ success: false, message: "Item not found in inventory." });
    }

    if (!EQUIP_SLOTS.includes(item.type)) {
      return NextResponse.json({ success: false, message: `Cannot equip this type of item.` });
    }

    if (item.isEquipped) {
      return NextResponse.json({ success: false, message: `Already equipped.` });
    }

    const result = await prisma.$transaction(async (tx) => {
      let currentlyEquippedId: string | null = null;
      let currentlyEquippedName: string | null = null;

      if (item.type === ItemType.ACCESSORY) {
        let targetSlot = slot;
        if (!targetSlot) {
          const equippedAccessories = await tx.item.findMany({
            where: { ownerId: userId, type: ItemType.ACCESSORY, isEquipped: true }
          });
          const usedSlots = equippedAccessories.map(a => a.equipSlot);
          if (!usedSlots.includes(1)) targetSlot = 1;
          else if (!usedSlots.includes(2)) targetSlot = 2;
          else targetSlot = 1;
        }

        const existing = await tx.item.findFirst({
          where: { ownerId: userId, type: ItemType.ACCESSORY, isEquipped: true, equipSlot: targetSlot }
        });
        if (existing) {
          currentlyEquippedId = existing.id;
          currentlyEquippedName = existing.name;
          await tx.item.update({
            where: { id: currentlyEquippedId },
            data: { isEquipped: false, equipSlot: null }
          });
        }

        await tx.item.update({
          where: { id: item.id },
          data: { isEquipped: true, equipSlot: targetSlot }
        });

        return {
          success: true,
          message: `Equipped **${item.name}**${currentlyEquippedName ? `, unequipped ${currentlyEquippedName}` : ""}`,
          unequippedId: currentlyEquippedId,
        };
      } else {
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

        await tx.item.update({
          where: { id: item.id },
          data: { isEquipped: true, equipSlot: 1 }
        });

        return {
          success: true,
          message: `Equipped **${item.name}**${currentlyEquippedName ? `, unequipped ${currentlyEquippedName}` : ""}`,
          unequippedId: currentlyEquippedId,
        };
      }
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[/api/item/equip]", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

import type { PrismaClient } from "@prisma/client";
import type { Item } from "@prisma/client";

type DbClient = PrismaClient | Parameters<Parameters<typeof import("./prisma").prisma.$transaction>[0]>[0];

/**
 * Inventory helpers for item effects.
 * Keeps consumption logic (decrement vs delete) in one place.
 */
export async function consumeInventoryItem(
  db: any,
  item: Pick<Item, "id" | "quantity">,
  decrementBy: number = 1
): Promise<void> {
  const dec = Math.max(1, decrementBy);

  if (item.quantity > dec) {
    await db.item.update({
      where: { id: item.id },
      data: { quantity: { decrement: dec } }
    });
    return;
  }

  await db.item.delete({
    where: { id: item.id }
  });
}

export async function consumeAllInventoryItem(db: any, item: Pick<Item, "id">): Promise<void> {
  await db.item.delete({ where: { id: item.id } });
}


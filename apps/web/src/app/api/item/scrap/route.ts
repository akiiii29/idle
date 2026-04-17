import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GEAR_TYPES, calculateScrapValue, sortGearKeepBestFirst } from "@game/core";
import { SCRAP_VALUE_IN_GOLD } from "@game/core";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(req: NextRequest) {
  try {
    const { userId, action, target } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ── Scrap one item by ID or name ──────────────────────────────────────────
    if (action === "item" && target) {
      const trimmed = String(target).trim();
      const byId = UUID_RE.test(trimmed)
        ? await prisma.item.findFirst({ where: { id: trimmed, ownerId: userId } })
        : null;

      let item = byId;
      if (!item) {
        const lower = trimmed.toLowerCase();
        const matches = await prisma.item.findMany({
          where: { ownerId: userId, name: { contains: trimmed } },
        });
        const gearMatches = matches.filter((i) => GEAR_TYPES.includes(i.type as any));
        const exact = gearMatches.filter((i) => i.name.toLowerCase() === lower);
        item = exact.length > 0 ? exact[0] : gearMatches[0];
      }

      if (!item) {
        return NextResponse.json({ ok: false, message: "Item not found." });
      }
      if (!GEAR_TYPES.includes(item.type as any)) {
        return NextResponse.json({ ok: false, message: "Only WEAPON, ARMOR, or ACCESSORY can be scrapped." });
      }
      if (item.isEquipped) {
        return NextResponse.json({ ok: false, message: "Unequip the item before scrapping." });
      }

      const perUnit = calculateScrapValue(item);

      await prisma.$transaction(async (tx) => {
        const fresh = await tx.item.findUnique({ where: { id: item!.id } });
        if (!fresh || fresh.ownerId !== userId || fresh.quantity < 1) return;
        if (fresh.quantity > 1) {
          await tx.item.update({ where: { id: fresh.id }, data: { quantity: { decrement: 1 } } });
        } else {
          await tx.item.delete({ where: { id: fresh.id } });
        }
        await tx.user.update({ where: { id: userId }, data: { scrap: { increment: perUnit } } });
      });

      return NextResponse.json({
        ok: true,
        scrapGained: perUnit,
        message: `Scrapped **${item.name}** → **+${perUnit}** Scrap (≈ ${perUnit * SCRAP_VALUE_IN_GOLD} gold).`,
      });
    }

    // ── Scrap all unequipped by rarity ────────────────────────────────────────
    if (action === "rarity" && target) {
      const rarity = String(target).toUpperCase() as any;
      const items = await prisma.item.findMany({
        where: { ownerId: userId, rarity, isEquipped: false, type: { in: GEAR_TYPES as any[] }, quantity: { gt: 0 } },
      });

      if (items.length === 0) {
        return NextResponse.json({ ok: true, message: "No unequipped items of this rarity.", count: 0, totalScrap: 0 });
      }

      let totalScrap = 0;
      for (const it of items) {
        totalScrap += calculateScrapValue(it) * it.quantity;
      }

      await prisma.$transaction(async (tx) => {
        await tx.item.deleteMany({ where: { id: { in: items.map((i) => i.id) } } });
        await tx.user.update({ where: { id: userId }, data: { scrap: { increment: totalScrap } } });
      });

      const count = items.reduce((s, i) => s + i.quantity, 0);
      return NextResponse.json({
        ok: true,
        count,
        totalScrap,
        message: `Scrapped **${count}** items (${rarity}) → **+${totalScrap}** Scrap.`,
      });
    }

    // ── Scrap duplicates ───────────────────────────────────────────────────────
    if (action === "duplicates") {
      const gear = await prisma.item.findMany({
        where: { ownerId: userId, type: { in: GEAR_TYPES as any[] }, quantity: { gt: 0 } },
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
        for (const drop of sorted.slice(1)) {
          if (drop.isEquipped) continue;
          totalScrap += calculateScrapValue(drop) * drop.quantity;
          toDelete.push(drop.id);
        }
      }

      const toDeleteSet = new Set(toDelete);

      await prisma.$transaction(async (tx) => {
        if (toDelete.length > 0) {
          await tx.item.deleteMany({ where: { id: { in: toDelete } } });
        }
        for (const it of gear) {
          if (toDeleteSet.has(it.id)) continue;
          if (it.quantity <= 1) continue;
          if (it.isEquipped) continue;
          const extra = it.quantity - 1;
          totalScrap += calculateScrapValue(it) * extra;
          await tx.item.update({ where: { id: it.id }, data: { quantity: 1 } });
        }
        if (totalScrap > 0) {
          await tx.user.update({ where: { id: userId }, data: { scrap: { increment: totalScrap } } });
        }
      });

      return NextResponse.json({
        ok: true,
        totalScrap,
        message: totalScrap === 0
          ? "No duplicate items to scrap."
          : `Scrapped duplicates → **+${totalScrap}** Scrap.`,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("[/api/item/scrap]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

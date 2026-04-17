import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId, itemId } = await req.json();

    if (!userId || !itemId) {
      return NextResponse.json({ success: false, message: "Missing userId or itemId" }, { status: 400 });
    }

    const item = await prisma.item.findFirst({
      where: { id: itemId, ownerId: userId }
    });

    if (!item) {
      return NextResponse.json({ success: false, message: "Item not found." });
    }

    if (!item.isEquipped) {
      return NextResponse.json({ success: false, message: "Item is not equipped." });
    }

    await prisma.item.update({
      where: { id: item.id },
      data: { isEquipped: false }
    });

    return NextResponse.json({
      success: true,
      message: `Unequipped **${item.name}**.`,
    });
  } catch (err) {
    console.error("[/api/item/unequip]", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

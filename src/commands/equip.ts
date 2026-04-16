import { EmbedBuilder, SlashCommandBuilder, type AutocompleteInteraction } from "discord.js";
import { ItemType } from "@prisma/client";
import { equipItem } from "../services/equipment-service";
import { prisma } from "../services/prisma";
import type { SlashCommand } from "../types/command";

const EQUIPPABLE_TYPES = [ItemType.WEAPON, ItemType.ARMOR, ItemType.ACCESSORY];

export const equipCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName("equip")
        .setDescription("Trang bị vũ khí, giáp hoặc trang sức")
        .addStringOption(opt =>
            opt.setName("item")
                .setDescription("Chọn vật phẩm để trang bị")
                .setRequired(true)
                .setAutocomplete(true)
        )
        .addStringOption(opt =>
            opt.setName("slot")
                .setDescription("Chọn ô trang bị (Chỉ dành cho Trang sức)")
                .addChoices(
                    { name: "Ô 1", value: "1" },
                    { name: "Ô 2", value: "2" }
                )
        ) as any,

    async execute(interaction) {
        try {
            await interaction.deferReply();
            const itemId = (interaction.options as any).getString("item");
            const slotStr = (interaction.options as any).getString("slot");
            const slot = slotStr ? parseInt(slotStr) : undefined;

            if (!itemId) {
                await interaction.editReply("Vui lòng chọn một vật phẩm.");
                return;
            }

            const result = await equipItem(interaction.user.id, itemId, slot);

            const embed = new EmbedBuilder()
                .setColor(result.success ? 0x2ecc71 : 0xe74c3c)
                .setTitle(result.success ? "✅ Trang Bị Thành Công" : "❌ Không Thể Trang Bị")
                .setDescription(result.message);

            await interaction.editReply({ embeds: [embed] });
        } catch (e) {
            console.error("equip command failed:", e);
            if (!interaction.replied) {
                await interaction.editReply("Trang bị thất bại.");
            }
        }
    }
};

export async function handleEquipAutocomplete(interaction: AutocompleteInteraction): Promise<void> {
    const userId = interaction.user.id;
    const focused = interaction.options.getFocused();

    const items = await prisma.item.findMany({
        where: {
            ownerId: userId,
            type: { in: EQUIPPABLE_TYPES },
            isEquipped: false,
            ...(focused ? { name: { contains: focused } } : {})
        },
        take: 25,
        orderBy: { power: "desc" }
    });

    const typeEmoji: Record<string, string> = {
        WEAPON: "⚔️",
        ARMOR: "🛡️",
        ACCESSORY: "💍"
    };

    await interaction.respond(
        items.map(i => ({
            name: `${typeEmoji[i.type] || "📦"} ${i.name} (Sức mạnh: ${i.power})`,
            value: i.id
        }))
    );
}

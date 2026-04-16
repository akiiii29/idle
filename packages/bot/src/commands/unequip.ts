import { EmbedBuilder, SlashCommandBuilder, type AutocompleteInteraction } from "discord.js";
import { unequipItem } from "../services/equipment-service";
import { prisma } from "../services/prisma";
import type { SlashCommand } from "../types/command";

export const unequipCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName("unequip")
        .setDescription("Tháo trang bị đang mang")
        .addStringOption(opt =>
            opt.setName("item")
                .setDescription("Chọn vật phẩm để tháo")
                .setRequired(true)
                .setAutocomplete(true)
        ) as any,

    async execute(interaction) {
        try {
            await interaction.deferReply();
            const itemId = (interaction.options as any).getString("item");

            if (!itemId) {
                await interaction.editReply("Vui lòng chọn một vật phẩm.");
                return;
            }

            const result = await unequipItem(interaction.user.id, itemId);

            const embed = new EmbedBuilder()
                .setColor(result.success ? 0xf39c12 : 0xe74c3c)
                .setTitle(result.success ? "🔓 Đã Tháo Trang Bị" : "❌ Lỗi")
                .setDescription(result.message);

            await interaction.editReply({ embeds: [embed] });
        } catch (e) {
            console.error("unequip command failed:", e);
            if (!interaction.replied) {
                await interaction.editReply("Tháo trang bị thất bại.");
            }
        }
    }
};

export async function handleUnequipAutocomplete(interaction: AutocompleteInteraction): Promise<void> {
    const userId = interaction.user.id;
    const focused = interaction.options.getFocused();

    const items = await prisma.item.findMany({
        where: {
            ownerId: userId,
            isEquipped: true,
            ...(focused ? { name: { contains: focused } } : {})
        },
        take: 25,
        orderBy: { power: "desc" }
    });

    const typeEmoji: Record<string, string> = {
        WEAPON: "⚔️",
        ARMOR: "🛡️",
        HELMET: "🪖",
        ACCESSORY: "💍"
    };

    await interaction.respond(
        items.map(i => ({
            name: `${typeEmoji[i.type] || "📦"} ${i.name} (Sức mạnh: ${i.power})`,
            value: i.id
        }))
    );
}

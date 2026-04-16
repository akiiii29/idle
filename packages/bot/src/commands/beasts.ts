import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
  type ButtonInteraction,
  type AutocompleteInteraction,
  type ChatInputCommandInteraction
} from "discord.js";
import { prisma } from "../services/prisma";
import { getUserWithRelations, formatDuration } from "../services/user-service";
import { Rarity } from "@prisma/client";
import type { SlashCommand } from "../types/command";
import { enrichBeast, getActiveSynergies } from "@game/core";
import { 
  upgradePet, 
  sellPet, 
  dismantlePet, 
  sacrificePet, 
  GOLD_VALUES, 
  ESSENCE_VALUES, 
  UPGRADE_COSTS,
  calculateDismantleEssence,
  bulkDismantlePets,
  bulkSellPets,
  bulkSacrificePets
} from "../services/pet-management";

const ROLE_ICONS: Record<string, string> = {
  DPS: "⚔️",
  TANK: "🛡️",
  SUPPORT: "🧪"
};

function formatStars(count: number): string {
  if (count <= 0) return "";
  if (count <= 5) return " " + "⭐".repeat(count);
  return ` 🌟x${count}`;
}

function formatRarity(rarity: string): string {
  switch (rarity) {
    case "COMMON": return "`[COMMON]`";
    case "RARE": return "**`[✨ RARE]`**";
    case "EPIC": return "**`[🔥 EPIC]`**";
    case "LEGENDARY": return "**`[👑 LEGENDARY]`**";
    default: return `\`[${rarity}]\``;
  }
}

function buildBeastEmbed(user: any) {
  const equipped = user.beasts.filter((b: any) => b.isEquipped).sort((a: any, b: any) => (a.equipSlot || 0) - (b.equipSlot || 0));
  const unequipped = user.beasts.filter((b: any) => !b.isEquipped);

  const embed = new EmbedBuilder()
    .setTitle("🐾 Quản lý Sủng Vật")
    .setColor(0x2ecc71)
    .setDescription(`Chọn tối đa 3 thằng đệ để cùng bạn chinh chiến.\n🧪 **Tinh hoa sủng vật:** \`${user.petEssence || 0}\``)
    .addFields({
      name: `📋 Đội hình hiện tại (${equipped.length}/3)`,
      value: equipped.length > 0 ? equipped.map((b: any, idx: number) => {
        const enriched = enrichBeast(b);
        const roleIcon = ROLE_ICONS[enriched.role] || "🐾";
        const starStr = formatStars(b.upgradeLevel || 0);
        return `Slot ${idx + 1}: ${roleIcon} **${b.name}**${starStr} (Cấp ${b.level || 1}) ${formatRarity(b.rarity)} (P: \`${b.power}\`)`;
      }).join("\n") : "Chưa có thằng đệ nào được trang bị."
    });

  const activeSynergies = getActiveSynergies(equipped);
  if (activeSynergies.length > 0) {
    embed.addFields({
      name: "✨ Hệ thống Cộng hưởng (Synergy)",
      value: activeSynergies.map(s => `${s.icon} **${s.name}**: \`${s.description}\``).join("\n")
    });
  }
  if (unequipped.length > 0) {
    embed.addFields({
      name: "💤 Thằng đệ đang nghỉ ngơi",
      value: unequipped.map((b: any) => {
        const enriched = enrichBeast(b);
        const roleIcon = ROLE_ICONS[enriched.role] || "🐾";
        const starStr = formatStars(b.upgradeLevel || 0);
        return `${roleIcon} **${b.name}**${starStr} (Cấp ${b.level || 1}) ${formatRarity(b.rarity)} (P: \`${b.power}\`)`;
      }).slice(0, 15).join("\n") + (unequipped.length > 15 ? `\n*... và ${unequipped.length - 15} thằng đệ khác*` : "")
    });
  } else if (equipped.length === 0) {
    embed.addFields({ name: "Kho đệ", value: "Bạn chưa bắt được thằng đệ nào." });
  }

  return embed;
}

function buildBeastButtons(user: any) {
  const equipped = user.beasts.filter((b: any) => b.isEquipped);
  const unequipped = user.beasts.filter((b: any) => !b.isEquipped);

  const rows: ActionRowBuilder<ButtonBuilder>[] = [];

  if (equipped.length > 0) {
    const equippedRow = new ActionRowBuilder<ButtonBuilder>();
    for (const b of equipped) {
      if (equippedRow.components.length >= 5) break;
      equippedRow.addComponents(
        new ButtonBuilder()
          .setCustomId(`beast_unequip:${b.id}:${user.id}`)
          .setLabel(`Tháo ${b.name}`)
          .setStyle(ButtonStyle.Danger)
      );
    }
    rows.push(equippedRow);
  }

  let currentRow = new ActionRowBuilder<ButtonBuilder>();
  for (let i = 0; i < unequipped.length; i++) {
    const b = unequipped[i];
    if (rows.length >= 5 && currentRow.components.length === 0) break;

    currentRow.addComponents(
      new ButtonBuilder()
        .setCustomId(`beast_equip:${b.id}:${user.id}`)
        .setLabel(`Trang bị ${b.name}`)
        .setStyle(ButtonStyle.Secondary)
    );

    if (currentRow.components.length === 5) {
      rows.push(currentRow);
      currentRow = new ActionRowBuilder<ButtonBuilder>();
    }
    if (rows.length >= 5) break;
  }

  if (currentRow.components.length > 0 && rows.length < 5) {
    rows.push(currentRow);
  }

  return rows;
}

function buildInspectEmbed(user: any, pet: any) {
  const enriched = enrichBeast(pet);
  const roleIcon = ROLE_ICONS[enriched.role] || "🐾";
  
  const nextLevel = (pet.level || 1) + 1;
  const upgradeCost = UPGRADE_COSTS[nextLevel] || 0;
  const sellPrice = GOLD_VALUES[pet.rarity as Rarity] || 0;
  const essenceGain = calculateDismantleEssence(pet);

  const starStr = formatStars(pet.upgradeLevel || 0);
  const embed = new EmbedBuilder()
    .setTitle(`${roleIcon} Chi Tiết Sủng Vật: ${pet.name}${starStr} (Cấp ${pet.level || 1})`)
    .setColor(0x3498db)
    .addFields(
      { name: "💎 Độ hiếm", value: formatRarity(pet.rarity), inline: true },
      { name: "⚡ Sức mạnh", value: `\`${pet.power}\``, inline: true },
      { name: "🎭 Vai trò", value: `\`${enriched.role}\``, inline: true },
      { name: "📈 Tiến độ", value: `• Cấp độ: **${pet.level || 1}/10**\n• Cấp sao: **${pet.upgradeLevel || 0}/10** ⭐`, inline: true },
      { name: "✨ Kỹ năng", value: `• Sức mạnh kỹ năng: **${(enriched.skillPower * 100).toFixed(1)}%**\n• Loại: \`${enriched.skillType}\``, inline: true },
      { name: "🧪 Ví Tinh Hoa", value: `\`${user.petEssence || 0}\``, inline: true },
      { name: "📖 Mô tả", value: `*${enriched.config?.description || "Không có mô tả."}*` },
      {
        name: "💰 Tùy chọn quản lý",
        value: `• Nâng cấp (+1): **${upgradeCost} Tinh hoa**\n• Bán: **${sellPrice} vàng**\n• Phân rã: **${essenceGain} Tinh hoa**`
      }
    )
    .setFooter({ text: "Sử dụng các nút bên dưới để quản lý sủng vật này." });

  return embed;
}

function buildInspectButtons(user: any, pet: any) {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`beast_upgrade:${pet.id}:${user.id}`)
      .setLabel("Nâng Cấp")
      .setEmoji("⚒️")
      .setStyle(ButtonStyle.Success)
      .setDisabled((pet.level || 1) >= 10),
    new ButtonBuilder()
      .setCustomId(`beast_dismantle:${pet.id}:${user.id}`)
      .setLabel("Phân Rã")
      .setEmoji("⚗️")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`beast_sell:${pet.id}:${user.id}`)
      .setLabel("Bán")
      .setEmoji("💰")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`beast_sacrifice:${pet.id}:${user.id}`)
      .setLabel("Hiến Tế")
      .setEmoji("🔯")
      .setStyle(ButtonStyle.Danger)
  );
}

export const beastsCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("beasts")
    .setDescription("Quản lý sủng vật của bạn")
    .addSubcommand(sub => 
      sub.setName("team")
        .setDescription("Xem đội hình hiện tại và kho đệ")
    )
    .addSubcommand(sub => 
      sub.setName("inspect")
        .setDescription("Xem chi tiết và nâng cấp một đệ cụ thể")
        .addStringOption(option =>
          option.setName("pet")
            .setDescription("Chọn sủng vật")
            .setAutocomplete(true)
            .setRequired(true)
        )
    )
    .addSubcommand(sub => 
      sub.setName("bulk")
        .setDescription("Thực hiện hành động hàng loạt (Phân rã/Bán/Hiến tế)")
        .addStringOption(option =>
          option.setName("action")
            .setDescription("Hành động cần thực hiện")
            .addChoices(
              { name: "Phân rã (Essence)", value: "dismantle" },
              { name: "Bán (Vàng)", value: "sell" },
              { name: "Hiến tế (Talent)", value: "sacrifice" }
            )
            .setRequired(true)
        )
        .addStringOption(option =>
          option.setName("rarity")
            .setDescription("Độ hiếm mục tiêu")
            .addChoices(
              { name: "COMMON", value: "COMMON" },
              { name: "RARE", value: "RARE" }
            )
            .setRequired(true)
        )
    ) as any,

  async autocomplete(interaction: AutocompleteInteraction) {
    const focusedValue = interaction.options.getFocused();
    const user = await prisma.user.findUnique({
      where: { id: interaction.user.id },
      include: { beasts: true }
    });

    if (!user || !user.beasts) return interaction.respond([]);

    const choices = (user.beasts as any[]).map(b => ({ name: `${b.name} (${b.rarity})`, value: b.id }));
    const filtered = choices.filter(choice => choice.name.toLowerCase().includes(focusedValue.toLowerCase())).slice(0, 25);
    await interaction.respond(filtered);
  },

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const subcommand = interaction.options.getSubcommand();
    const user = await getUserWithRelations(interaction.user.id);

    if (!user) {
      await interaction.editReply("Bạn chưa đăng ký tài khoản! (Dùng /register)");
      return;
    }

    if (subcommand === "bulk") {
      const bulkAction = interaction.options.getString("action");
      const bulkRarity = interaction.options.getString("rarity") as Rarity | null;
      
      if (!bulkAction || !bulkRarity) return; // Should not happen with required

      if (bulkAction === "dismantle") {
        const res = await bulkDismantlePets(interaction.user.id, bulkRarity);
        await interaction.editReply(`⚗️ **Dọn kho:** Đã phân rã **${res.count}** sủng vật ${bulkRarity}, nhận được **${res.essenceGained} Tinh hoa**!`);
      } else if (bulkAction === "sell") {
        const res = await bulkSellPets(interaction.user.id, bulkRarity);
        await interaction.editReply(`💰 **Dọn kho:** Đã bán **${res.count}** sủng vật ${bulkRarity}, nhận được **${res.goldGained} vàng**!`);
      } else if (bulkAction === "sacrifice") {
        const res = await bulkSacrificePets(interaction.user.id, bulkRarity);
        await interaction.editReply(`🔯 **Dọn kho:** Đã hiến tế **${res.count}** sủng vật ${bulkRarity} để tăng Thiên phú!`);
      }
      return;
    }

    if (subcommand === "inspect") {
      const petId = interaction.options.getString("pet");
      const pet = (user.beasts as any[]).find(b => b.id === petId);
      if (!pet) {
        await interaction.editReply("Không tìm thấy sủng vật này trong kho của bạn.");
        return;
      }

      await interaction.editReply({ 
        embeds: [buildInspectEmbed(user, pet)], 
        components: [buildInspectButtons(user, pet)] 
      });
      return;
    }

    // Default: Subcommand "team"
    await interaction.editReply({
      embeds: [buildBeastEmbed(user)],
      components: buildBeastButtons(user)
    });
  }
};

export async function handleBeastButton(interaction: ButtonInteraction): Promise<boolean> {
  const customId = interaction.customId;
  const parts = customId.split(":");
  const action = parts[0];
  const beastIdRaw = parts[1];
  const ownerIdRaw = parts[2];

  if (!action || !beastIdRaw || !ownerIdRaw) return false;

  const bId: string = beastIdRaw;
  const oId: string = ownerIdRaw;
  const act: string = action;

  const ACTIONS = ["beast_equip", "beast_unequip", "beast_upgrade", "beast_dismantle", "beast_sell", "beast_sacrifice"];
  if (!ACTIONS.includes(act)) return false;

  if (interaction.user.id !== oId) {
    await interaction.reply({ content: "Đây không phải kho đệ của bạn!", ephemeral: true });
    return true;
  }

  try {
    const user = await getUserWithRelations(interaction.user.id);
    if (!user) throw new Error("Tài khoản không tồn tại.");

    if (act === "beast_equip" || act === "beast_unequip") {
        const beast = user.beasts.find((b: any) => b.id === bId);
        if (!beast) throw new Error("Bạn không sở hữu sủng vật này!");

        if (act === "beast_equip") {
            const equipped = user.beasts.filter((b: any) => b.isEquipped);
            if (equipped.length >= 3) throw new Error("Bạn đã trang bị đủ 3 sủng vật. Hãy tháo bớt sủng vật khác.");
            const nextSlot = [1, 2, 3].find(s => !equipped.some((eb: any) => eb.equipSlot === s)) || (equipped.length + 1);
            await prisma.beast.update({ where: { id: bId }, data: { isEquipped: true, equipSlot: nextSlot } as any });
        } else {
            await prisma.beast.update({ where: { id: bId }, data: { isEquipped: false, equipSlot: null } as any });
        }

        const updatedUser = await getUserWithRelations(interaction.user.id);
        await interaction.update({ embeds: [buildBeastEmbed(updatedUser)], components: buildBeastButtons(updatedUser) });
        return true;
    }

    if (act === "beast_upgrade") {
        await upgradePet(oId, bId);
        const updatedUser = await getUserWithRelations(interaction.user.id);
        const updatedPet = updatedUser!.beasts.find((b: any) => b.id === bId);
        await interaction.update({ 
            embeds: [buildInspectEmbed(updatedUser, updatedPet)], 
            components: [buildInspectButtons(updatedUser!, updatedPet)] 
        });
        return true;
    } 
    
    if (act === "beast_sell") {
        const res = await sellPet(oId, bId);
        await interaction.update({ content: `💰 Đã bán sủng vật nhận được **${res.goldGained} vàng**!`, embeds: [], components: [] });
        return true;
    } 
    
    if (act === "beast_dismantle") {
        const res = await dismantlePet(oId, bId);
        await interaction.update({ content: `⚗️ Đã phân rã sủng vật nhận được **${res.essenceGained} Tinh hoa**!`, embeds: [], components: [] });
        return true;
    } 
    
    if (act === "beast_sacrifice") {
        const res = await sacrificePet(oId, bId);
        await interaction.update({ 
            content: `🔯 Đã hiến tế sủng vật! Thiên phú của bạn đã tăng lên:\n⚔️ DPS: ${res.talentProgress.dps} | 🛡️ Tank: ${res.talentProgress.tank} | 🧪 Support: ${res.talentProgress.support}`, 
            embeds: [], components: []
        });
        return true;
    }

    return true;
  } catch (err: any) {
    if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: `❌ Lỗi: ${err.message}`, ephemeral: true });
    } else {
        await interaction.reply({ content: `❌ Lỗi: ${err.message}`, ephemeral: true });
    }
    return true;
  }
}

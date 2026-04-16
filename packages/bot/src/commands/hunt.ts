import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
  type ButtonInteraction,
  type AutocompleteInteraction
} from "discord.js";

import { ItemType } from "@prisma/client";

import { CAPTURE_TIMEOUT_MS, EVENT_RATES, HUNT_COOLDOWN_MS } from "@game/core";
import { buildHpBar, RARITY_COLORS, RARITY_BADGE, type Rarity } from "../utils/rpg-ui";
import { createHuntPreviewToken, consumeHuntPreview, type HuntPreviewBranch } from "../services/pending-hunt-preview";
import {
  buildBeastButtons,
  buildChestButtons,
  consumePendingEncounter,
  peekPendingEncounter,
  peekPendingChest,
  consumePendingChest
} from "../services/encounter-service";
import { prisma } from "../services/prisma";
import { updateQuestProgress } from "../services/quest-service";
import { randomInt } from "@game/core";
import { formatDuration, getRemainingCooldown, getUser, getUserWithRelations, upsertItem } from "../services/user-service";
import { autoFuseBeasts } from "../services/beast-service";
import type { SlashCommand } from "../types/command";
import { checkUserStatusErrors, performCoreHunt } from "../services/hunt-core";
import { handleAutoHunt } from "../services/combat-system";

export const huntCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("hunt")
    .setDescription("Đi săn quái thú, tìm chiến lợi phẩm hoặc gặp thú mới.")
    .addSubcommand(sub =>
      sub
        .setName("manual")
        .setDescription("Đi săn thủ công (có cơ hội bắt pet, nhặt rương)")
        .addStringOption(option =>
          option.setName("traps").setDescription("Chọn bẫy (1-10)").setAutocomplete(true)
        )
        .addStringOption(option =>
          option.setName("clovers").setDescription("Chọn cỏ may mắn (1-10)").setAutocomplete(true)
        )
        .addIntegerOption(option =>
          option.setName("scouts").setDescription("Scout Lens (0-1)").setAutocomplete(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName("auto")
        .setDescription("Tự động đi săn liên tục để cày EXP và Vàng")
        .addIntegerOption(option =>
          option.setName("potions")
            .setDescription("Số lượng Potion tối đa muốn dùng (0-50)")
            .setMinValue(0)
            .setMaxValue(50)
            .setRequired(false)
        )
    ) as any,
  async execute(interaction) {
    try {
      await interaction.deferReply();
      const subcommand = interaction.options.getSubcommand();
      const now = new Date();
      const user = await getUserWithRelations(interaction.user.id);

      if (!user) {
        await interaction.editReply({
          content: "Bạn chưa đăng ký. Hãy dùng `/register` trước.",
        });
        return;
      }

      const statusErr = checkUserStatusErrors(user, now);
      if (statusErr) {
        await interaction.editReply({ content: statusErr });
        return;
      }

      if (subcommand === "auto") {
        const potionsToUse = interaction.options.getInteger("potions") || 0;
        const result = await handleAutoHunt(user.id, potionsToUse);

        const summaryEmbed = new EmbedBuilder()
          .setColor(0x2ecc71)
          .setTitle("⚔️ Tổng kết Đi Săn Tự Động")
          .setDescription(`Bạn đã càn quét khu rừng và thu được kết quả sau:`)
          .addFields(
            { name: "💀 Kẻ địch hạ gục", value: `\`${result.totalKills}\``, inline: true },
            { name: "🌟 EXP nhận được", value: `\`+${result.totalExp}\``, inline: true },
            { name: "💰 Vàng thu thập", value: `\`+${result.totalGold}\``, inline: true },
            { name: "🧪 Potion đã dùng", value: `\`${result.potionsUsed}\``, inline: true },
            { name: "❤️ HP Cuối", value: `${buildHpBar(result.finalHp, result.maxHp, 8)} (\`${result.finalHp.toFixed(0)}\`/${result.maxHp})`, inline: true },
            { name: "📊 Nhật ký chiến đấu (Tóm tắt)", value: result.logs.join("\n") || "Không có nhật ký." }
          );

        if (result.levelsGained > 0) {
            summaryEmbed.addFields({ name: "🆙 CẤP ĐỘ MỚI!", value: `Bạn đã thăng lên cấp **${result.newLevel}**! (+${result.levelsGained})` });
        }

        if (result.achievements && result.achievements.length > 0) {
            summaryEmbed.addFields({ name: "🏆 Thành tựu mới", value: result.achievements.map((a: any) => `✅ **${a.name}**`).join("\n") });
        }

        await interaction.editReply({ embeds: [summaryEmbed] });
        return;
      }

      // Manual hunt logic
      const trapInput = interaction.options.getString("traps") || "";
      const cloverInput = interaction.options.getString("clovers") || "";
      const scoutsWanted = interaction.options.getInteger("scouts") || 0;

      // Parsing "Item Name:Qty"
      let trapsWanted = 0;
      let trapItemName = "";
      if (trapInput.includes(":")) {
        const parts = trapInput.split(":");
        trapItemName = parts[0]!;
        trapsWanted = parseInt(parts[1]!) || 0;
      }

      let cloversWanted = 0;
      let cloverItemName = "";
      if (cloverInput.includes(":")) {
        const parts = cloverInput.split(":");
        cloverItemName = parts[0]!;
        cloversWanted = parseInt(parts[1]!) || 0;
      }

      const scoutLensObj = user.inventory.find((i: any) => i.name === "Scout Lens");
      const scoutsOwned = scoutLensObj?.quantity ?? 0;

      if (scoutsWanted > 1) {
        await interaction.editReply({ content: "Bạn chỉ có thể dùng tối đa 1 Scout Lens cho mỗi lần đi săn." });
        return;
      }
      if (scoutsWanted > scoutsOwned) {
        await interaction.editReply({ content: `Bạn không đủ Scout Lens! (Bạn có ${scoutsOwned})` });
        return;
      }

      const cooldown = getRemainingCooldown(user.lastHunt, HUNT_COOLDOWN_MS, now);
      if (cooldown > 0) {
        await interaction.editReply({
          content: `Bạn cần nghỉ trong ${formatDuration(cooldown)} trước khi đi săn tiếp.`,
        });
        return;
      }

      const userCloverObj = cloverItemName 
        ? user.inventory.find((i: any) => i.name === cloverItemName) 
        : user.inventory.find((i: any) => i.type === ItemType.LUCK_BUFF);
      const cloverPower = userCloverObj?.power ?? 1;

      if (scoutsWanted > 0) {
        const cloverLuck = cloversWanted * cloverPower;
        const totalLuckForRates = user.luck + cloverLuck;

        const shiftChance = Math.min(20, totalLuckForRates * 0.5);
        const catchRate = EVENT_RATES.catch + (shiftChance * 0.6);
        const chestRate = EVENT_RATES.chest + (shiftChance * 0.4);
        const combatRate = EVENT_RATES.combat - (shiftChance * 0.5);

        const forcedEventRoll = Math.random() * 100;
        let predictedBranch: HuntPreviewBranch;
        if (forcedEventRoll < combatRate) predictedBranch = "combat";
        else if (forcedEventRoll < combatRate + chestRate) predictedBranch = "chest";
        else if (forcedEventRoll < combatRate + chestRate + catchRate) predictedBranch = "catch";
        else predictedBranch = "nothing";

        const predictedText =
          predictedBranch === "combat"
            ? "Trận chiến (Combat)"
            : predictedBranch === "chest"
              ? "Rương kho báu (Chest)"
              : predictedBranch === "catch"
                ? "Quái thú hoang dã (Wild Beast)"
                : "Không tìm thấy gì";

        const token = createHuntPreviewToken({
          userId: user.id,
          trapsWanted,
          trapItemName,
          cloversWanted,
          cloverItemName,
          scoutLensToUse: 1,
          forcedEventRoll,
          predictedBranch,
          timeoutMs: CAPTURE_TIMEOUT_MS
        });

        const embed = new EmbedBuilder()
          .setColor(0x3498db)
          .setTitle("🔍 Scout Lens — Dự báo lượt đi săn")
          .setDescription(
            `Dự báo: **${predictedText}**.\n\nBạn muốn **xác nhận** đi săn không?\n(Nút sẽ hết hiệu lực sau ${formatDuration(CAPTURE_TIMEOUT_MS)}.)`
          );

        const confirmRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId(`hunt_confirm:${token}`)
            .setLabel("✅ Xác nhận đi săn")
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId(`hunt_cancel:${token}`)
            .setLabel("✖️ Hủy")
            .setStyle(ButtonStyle.Secondary)
        );

        await interaction.editReply({ embeds: [embed], components: [confirmRow] });
        return;
      }

      await performCoreHunt(interaction, user, now, {
        trapsWanted,
        trapItemName,
        cloversWanted,
        cloverItemName,
        scoutLensToUse: 0
      });
    } catch (error) {
      console.error("hunt command failed", error);
      if (!interaction.deferred && !interaction.replied) {
        await interaction.reply({ content: "Đi săn thất bại. Thử lại sau một chút.", ephemeral: true });
      } else {
        await interaction.editReply({ content: "Đi săn thất bại. Thử lại sau một chút." });
      }
    }
  }
};

async function executeHuntAfterScoutConfirm(params: {
  interaction: any;
  userId: string;
  trapsWanted: number;
  trapItemName: string | undefined;
  cloversWanted: number;
  cloverItemName: string | undefined;
  scoutLensToUse: number;
  forcedEventRoll: number;
}): Promise<void> {
  const { interaction, userId, trapsWanted, trapItemName, cloversWanted, cloverItemName, scoutLensToUse, forcedEventRoll } = params;

  try {
    if (!interaction.deferred && !interaction.replied) {
      await interaction.deferReply();
    }

    const now = new Date();
    const user = await getUserWithRelations(userId);

    if (!user) {
      await interaction.editReply({ content: "Không tìm thấy người chơi. Vui lòng đăng ký lại bằng `/register`." });
      return;
    }

    const statusErr = checkUserStatusErrors(user, now);
    if (statusErr) {
      await interaction.editReply({ content: statusErr });
      return;
    }

    const userTrapObj = user.inventory.find((i: any) => i.type === ItemType.TRAP);
    const trapsOwned = userTrapObj?.quantity ?? 0;

    const userCloverObj = user.inventory.find((i: any) => i.type === ItemType.LUCK_BUFF);
    const cloversOwned = userCloverObj?.quantity ?? 0;

    if (trapsWanted > trapsOwned) {
      await interaction.editReply({ content: `Bạn không đủ Hunter Traps! (Bạn có ${trapsOwned})` });
      return;
    }

    if (cloversWanted > cloversOwned) {
      await interaction.editReply({ content: `Bạn không đủ Lucky Clovers! (Bạn có ${cloversOwned})` });
      return;
    }

    const cooldown = getRemainingCooldown(user.lastHunt, HUNT_COOLDOWN_MS, now);
    if (cooldown > 0) {
      await interaction.editReply({ content: `Bạn cần nghỉ trong ${formatDuration(cooldown)} trước khi đi săn tiếp.` });
      return;
    }

    await performCoreHunt(interaction, user, now, {
      trapsWanted,
      trapItemName,
      cloversWanted,
      cloverItemName,
      scoutLensToUse,
      forcedEventRoll
    });
  } catch (error) {
    console.error("hunt confirm failed", error);
    if (!interaction.deferred && !interaction.replied) {
      await interaction.reply({ content: "Đi săn thất bại. Thử lại sau một chút.", ephemeral: true });
    } else {
      await interaction.editReply({ content: "Đi săn thất bại. Thử lại sau một chút." });
    }
  }
}

export async function handleButtonInteraction(interaction: ButtonInteraction): Promise<boolean> {
  const customId = interaction.customId;

  if (customId.startsWith("hunt_cancel:")) {
    const token = customId.replace("hunt_cancel:", "");
    const preview = consumeHuntPreview(token);
    if (!preview) {
      await interaction.reply({ content: "Lệnh dự đoán đã hết hiệu lực.", ephemeral: true });
      return true;
    }

    const toConsume = Math.max(0, preview.scoutLensToUse ?? 0);
    if (toConsume > 0) {
      try {
        await prisma.$transaction(async (tx) => {
          const item = await tx.item.findFirst({
            where: { ownerId: preview.userId, name: "Scout Lens" },
          });
          if (!item) return;

          if (item.quantity > toConsume) {
            await tx.item.update({
              where: { id: item.id },
              data: { quantity: { decrement: toConsume } },
            });
          } else {
            await tx.item.delete({ where: { id: item.id } });
          }
        });
      } catch (e) {}
    }

    await interaction.reply({
      content:
        toConsume > 0
          ? `Bạn đã hủy đi săn và tiêu hao Scout Lens x${toConsume}.`
          : "Bạn đã hủy đi săn.",
      ephemeral: true,
    });
    return true;
  }

  if (customId.startsWith("hunt_confirm:")) {
    const token = customId.replace("hunt_confirm:", "");
    const preview = consumeHuntPreview(token);
    if (!preview) {
      await interaction.reply({ content: "Lệnh dự đoán đã hết hiệu lực.", ephemeral: true });
      return true;
    }

    if (interaction.user.id !== preview.userId) {
      await interaction.reply({ content: "Đây không phải dự đoán của bạn!", ephemeral: true });
      return true;
    }

    await executeHuntAfterScoutConfirm({
      interaction,
      userId: preview.userId,
      trapsWanted: preview.trapsWanted,
      trapItemName: preview.trapItemName,
      cloversWanted: preview.cloversWanted,
      cloverItemName: preview.cloverItemName,
      scoutLensToUse: preview.scoutLensToUse ?? 0,
      forcedEventRoll: preview.forcedEventRoll
    });

    return true;
  }

  const isTame = customId.startsWith("tame:");
  const isKill = customId.startsWith("kill:");
  const isChestStr = customId.startsWith("chest_str:");
  const isChestAgi = customId.startsWith("chest_agi:");

  if (!isTame && !isKill && !isChestStr && !isChestAgi) return false;

  const prefix = customId.split(":")[0];
  const token = customId.replace(`${prefix}:`, "");
  
  if (isChestStr || isChestAgi) {
    const preview = peekPendingChest(token);
    if (!preview) {
      await interaction.reply({ content: "Chiếc rương đã biến mất.", ephemeral: true });
      return true;
    }
    if (preview.userId !== interaction.user.id) {
      await interaction.reply({ content: "Đây không phải rương của bạn.", ephemeral: true });
      return true;
    }
    const goldMultiplier = preview.goldMultiplier ?? 1;
    const strForRoll = preview.strForRoll ?? 0;
    const agiForRoll = preview.agiForRoll ?? 0;
    const chest = consumePendingChest(token);
    if (!chest) {
      await interaction.reply({ content: "Rương đã được xử lý rồi.", ephemeral: true });
      return true;
    }

    try {
      await interaction.update({
        components: [
          buildChestButtons(
            token,
            true,
            isChestStr ? "Đã phá" : "Đã vô hiệu hóa",
            isChestStr ? "Vô hiệu hóa (AGI)" : "Phá (STR)"
          )
        ]
      });
      const user = await getUser(interaction.user.id);
      if (!user) return true;

      const embed = new EmbedBuilder();
      
      if (isChestStr) {
        const potentialGold = randomInt(50, 150);
        const roll = strForRoll + randomInt(0, 10);
        if (roll > 15) {
          const finalGold = Math.floor(potentialGold * goldMultiplier);
          await prisma.user.update({
            where: { id: user.id },
            data: { isBusy: false, busyUntil: null, gold: { increment: finalGold } }
          });
          await updateQuestProgress(user.id, "open_chest", 1);
          embed
            .setColor(0xf1c40f)
            .setTitle("Rương bị phá vỡ!")
            .setDescription(`Bạn đã phá rương và tìm thấy **${finalGold} vàng**!`);
        } else {
          const pityGoldBase = Math.floor(potentialGold / 3);
          const finalPityGold = Math.floor(pityGoldBase * goldMultiplier);
          await prisma.user.update({
            where: { id: user.id },
            data: { isBusy: false, busyUntil: null, gold: { increment: finalPityGold } }
          });
          embed
            .setColor(0xe74c3c)
            .setTitle("Phá rương thất bại!")
            .setDescription(
              `Bạn đập rương quá mạnh làm hỏng một số vật phẩm, nhưng vẫn nhặt được **${finalPityGold} vàng** từ đống đổ nát!`
            );
        }
      } else {
        const roll = agiForRoll + randomInt(0, 10);
        if (roll > 15) {
          const goldMultiplier = preview.goldMultiplier ?? 1;
          const finalGold = Math.floor(randomInt(50, 150) * goldMultiplier);
          const potionWin = randomInt(1, 3);

          let skillWon: any = null;
          if (Math.random() < 0.05) {
            const allSkills = await prisma.skill.findMany();
            if (allSkills.length > 0) {
              skillWon = allSkills[randomInt(0, allSkills.length - 1)];
            }
          }

          await prisma.$transaction(async (tx) => {
            await tx.user.update({
              where: { id: user.id },
              data: {
                gold: { increment: finalGold },
                isBusy: false,
                busyUntil: null
              }
            });
            await upsertItem(tx, user.id, { name: "Potion", type: ItemType.POTION, power: 50, quantity: potionWin });
            if (skillWon) {
              await tx.userSkill.upsert({
                where: { userId_skillId: { userId: user.id, skillId: skillWon.id } },
                create: { userId: user.id, skillId: skillWon.id, isEquipped: false },
                update: {}
              });
            }
          });

          await updateQuestProgress(user.id, "open_chest", 1);

          let rewardTxt = `💰 **${finalGold} vàng**\n🧪 **${potionWin} Potion**`;
          if (skillWon) {
            rewardTxt += `\n📜 **Kỹ năng mới: ${skillWon.name}**`;
          }

          embed.setColor(0x2ecc71)
            .setTitle("Vô hiệu hóa rương thành công!")
            .setDescription(`Bạn nhẹ nhàng mở rương và tìm thấy:\n${rewardTxt}`);
        } else {
          const damage = randomInt(15, 30);
          const currentHp = Math.max(1, user.currentHp - damage);
          await prisma.user.update({ where: { id: user.id }, data: { isBusy: false, busyUntil: null, currentHp: currentHp, lastHpUpdatedAt: new Date() } });
          embed.setColor(0xe74c3c).setTitle("Bẫy kích hoạt!").setDescription(`Bạn không vô hiệu hóa được cái bẫy. Bạn nhận **${damage}** sát thương!`);
        }
      }
      await interaction.editReply({ embeds: [embed] });

    } catch (e) {
      console.error(e);
    } finally {
      await prisma.user.update({ where: { id: interaction.user.id }, data: { isBusy: false, busyUntil: null } }).catch(() => {});
    }
    return true;
  }

  const previewEncounter = peekPendingEncounter(token);
  if (!previewEncounter) {
    await interaction.reply({ content: "Cuộc chạm trán đã hết hạn.", ephemeral: true });
    return true;
  }

  if (previewEncounter.userId !== interaction.user.id) {
    await interaction.reply({ content: "Cuộc chạm trán này không thuộc về bạn.", ephemeral: true });
    return true;
  }

  const encounter = consumePendingEncounter(token);
  if (!encounter) {
    await interaction.reply({ content: "Cuộc chạm trán này đã được xử lý rồi.", ephemeral: true });
    return true;
  }

  try {
    await interaction.update({
      components: [
        buildBeastButtons(
          token,
          true,
          isTame ? "Đã thuần phục" : "Thuần phục",
          isKill ? "Đã hạ gục" : "Giết"
        )
      ]
    });

    const user = await getUserWithRelations(interaction.user.id);
    if (!user) return true;

    if (isKill) {
      const meatDrop = Math.max(1, Math.floor(encounter.beast.power / 10));
      await prisma.$transaction(async (tx) => {
        await upsertItem(tx, user.id, { name: "Wild Meat", type: ItemType.MEAT, power: 10, quantity: meatDrop });
        await tx.user.update({
          where: { id: user.id },
          data: { isBusy: false, busyUntil: null }
        });
      });
      await updateQuestProgress(user.id, "kill_beast", 1);
      
      const embed = new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle("Đã hạ gục quái thú")
        .setDescription(`Bạn dễ dàng hạ gục **${encounter.beast.name}** và thu được **${meatDrop}x Wild Meat**.`);
      
      await interaction.editReply({ embeds: [embed] });
    } else if (isTame) {
      const baseChance = encounter.beast.rarity === 'LEGENDARY' ? 20 : encounter.beast.rarity === 'EPIC' ? 40 : encounter.beast.rarity === 'RARE' ? 60 : 80;
      const luckForTame = encounter.luckForTame ?? user.luck;
      const totalChance = baseChance + (luckForTame * 0.5) + encounter.trapPower;
      const roll = Math.random() * 100;
      
      let tameSuccess = roll <= totalChance;

      await prisma.$transaction(async (tx) => {
        if (encounter.trapsWanted > 0) {
          const userTrapObj = user.inventory.find((i: any) => i.type === ItemType.TRAP);
          if (userTrapObj) {
            await tx.item.update({
              where: { id: userTrapObj.id },
              data: { quantity: { decrement: encounter.trapsWanted } }
            });
          }
        }

        if (tameSuccess) {
          await tx.beast.create({
            data: {
              name: encounter.beast.name,
              rarity: encounter.beast.rarity,
              power: encounter.beast.power,
              role: encounter.beast.role ?? null,
              skillType: encounter.beast.skillType ?? null,
              skillPower: encounter.beast.skillPower ?? null,
              trigger: encounter.beast.trigger ?? null,
              ownerId: interaction.user.id,
              upgradeLevel: 0
            }
          });

          await autoFuseBeasts(interaction.user.id, encounter.beast.name, 0, tx);
        }
        
        await tx.user.update({
          where: { id: interaction.user.id },
          data: { isBusy: false, busyUntil: null }
        });
      });

      if (tameSuccess) {
        await updateQuestProgress(interaction.user.id, "catch_pet", 1);
        if (encounter.beast.rarity === "LEGENDARY") {
          await updateQuestProgress(interaction.user.id, "legendary_hunter", 1);
        }
        const embed = new EmbedBuilder()
          .setColor(RARITY_COLORS[encounter.beast.rarity as Rarity])
          .setTitle("Thuần phục thành công!")
          .setDescription(
            `Bạn đã thuần phục được **${encounter.beast.name}**!${
              encounter.trapsWanted > 0 ? `\n\n(Đã dùng ${encounter.trapsWanted} Hunter Traps để hỗ trợ bắt)` : ""
            }`
          )
          .addFields(
            { name: "Độ hiếm", value: RARITY_BADGE[encounter.beast.rarity as Rarity], inline: true },
            { name: "Sức mạnh", value: `\`${encounter.beast.power}\``, inline: true }
          );
        await interaction.editReply({ embeds: [embed] });
      } else {
        const embed = new EmbedBuilder()
          .setColor(0x95a5a6)
          .setTitle("Thuần phục thất bại")
          .setDescription(
            `**${encounter.beast.name}** đã thoát ra và chạy mất!${
              encounter.trapsWanted > 0 ? `\n\n(Bạn đã mất ${encounter.trapsWanted} Hunter Traps)` : ""
            }`
          );
        await interaction.editReply({ embeds: [embed] });
      }
    }
  } catch (error) {
    console.error("encounter button failed", error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: "Thao tác thất bại.", ephemeral: true });
    }
  } finally {
    await prisma.user.update({ where: { id: interaction.user.id }, data: { isBusy: false, busyUntil: null } }).catch(() => {});
  }

  return true;
}

export async function handleHuntAutocomplete(interaction: AutocompleteInteraction): Promise<void> {
  const userId = interaction.user.id;
  const user = await getUserWithRelations(userId);
  if (!user) {
    await interaction.respond([]);
    return;
  }

  const focusedOption = interaction.options.getFocused(true);

  if (focusedOption.name === "traps") {
    const trapItems = user.inventory.filter((i: any) => i.type === ItemType.TRAP);
    const suggestions: any[] = [];

    for (const item of trapItems) {
      const owned = item.quantity;
      const ownedCap = Math.min(owned, 10);
      const increments = [1, 2, 5, 10].filter(n => n <= ownedCap);
      if (ownedCap > 0 && !increments.includes(ownedCap)) increments.push(ownedCap);
      
      const emoji = item.name.includes("Rare") ? "🔱" : "🚀";
      increments.sort((a,b) => a-b).forEach(c => {
        suggestions.push({ name: `${emoji} Dùng ${c} ${item.name} (Có ${owned})`, value: `${item.name}:${c}` });
      });
    }
    
    await interaction.respond(suggestions.slice(0, 25));
  } else if (focusedOption.name === "clovers") {
    const cloverItems = user.inventory.filter((i: any) => i.type === ItemType.LUCK_BUFF);
    const suggestions: any[] = [];

    for (const item of cloverItems) {
      const owned = item.quantity;
      const ownedCap = Math.min(owned, 10);
      const increments = [1, 2, 5, 10].filter(n => n <= ownedCap);
      if (ownedCap > 0 && !increments.includes(ownedCap)) increments.push(ownedCap);

      const emoji = item.name.includes("Four") ? "🌿" : "🍀";
      increments.sort((a,b) => a-b).forEach(c => {
        suggestions.push({ name: `${emoji} Dùng ${c} ${item.name} (Có ${owned})`, value: `${item.name}:${c}` });
      });
    }

    await interaction.respond(suggestions.slice(0, 25));
  } else if (focusedOption.name === "scouts") {
    const item = user.inventory.find((i: any) => i.name === "Scout Lens");
    const owned = item?.quantity ?? 0;
    const choices = owned >= 1 ? [1] : [];
    
    await interaction.respond(
      choices.map(c => ({ name: `🔍 Dùng 1 (Bạn có ${owned})`, value: c }))
    );
  }
}

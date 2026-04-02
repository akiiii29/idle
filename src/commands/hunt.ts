import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
  type ButtonInteraction
} from "discord.js";

import { ItemType } from "@prisma/client";

import { CAPTURE_TIMEOUT_MS, EVENT_RATES, HUNT_COOLDOWN_MS } from "../constants/config";
import { RARITY_COLORS, RARITY_BANNER, RARITY_BADGE, buildHpBar, randomRpgFooter, type Rarity } from "../utils/rpg-ui";
import { handleHunt } from "../services/combat-system";
import { applyBeforeHuntItemEffects } from "../services/itemEffects";
import { createHuntPreviewToken, consumeHuntPreview, type HuntPreviewBranch } from "../services/pending-hunt-preview";
import {
  buildBeastButtons,
  buildChestButtons,
  consumePendingEncounter,
  createEncounterToken,
  peekPendingEncounter,
  startPendingEncounter,
  startPendingChest,
  peekPendingChest,
  consumePendingChest
} from "../services/encounter-service";
import { createWildBeast } from "../services/hunt-service";
import { applyLevelUps } from "../services/leveling";
import { prisma } from "../services/prisma";
import { updateQuestProgress } from "../services/quest-service";
import { randomInt } from "../services/rng";
import { formatDuration, getRemainingCooldown, getUser, getUserWithRelations, upsertItem } from "../services/user-service";
import type { SlashCommand } from "../types/command";

export const huntCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("hunt")
    .setDescription("Đi săn quái thú, tìm chiến lợi phẩm hoặc gặp thú mới.")
    .addIntegerOption(option =>
      option
        .setName("traps")
        .setDescription("Số lượng Hunter Traps để dùng (tối đa 10)")
        .setMinValue(0)
        .setMaxValue(10)
    )
    .addIntegerOption(option =>
      option
        .setName("clovers")
        .setDescription("Số lượng Lucky Clovers để dùng (tối đa 10)")
        .setMinValue(0)
        .setMaxValue(10)
    )
    .addIntegerOption(option =>
      option
        .setName("scouts")
        .setDescription("Số lượng Scout Lens để dùng cho dự báo (tối đa 1)")
        .setMinValue(0)
        .setMaxValue(1)
    ) as any,
  async execute(interaction) {
    let shouldReleaseBusy = false;

    try {
      await interaction.deferReply();
      const now = new Date();
      const user = await getUserWithRelations(interaction.user.id);

      if (!user) {
        await interaction.editReply({
          content: "Bạn chưa đăng ký. Hãy dùng `/register` trước.",
        });
        return;
      }

      if (user.hospitalUntil && user.hospitalUntil > now) {
        await interaction.editReply({
          content: `Bạn đang ở bệnh viện trong ${formatDuration(user.hospitalUntil.getTime() - now.getTime())}.`,
        });
        return;
      }

      if (user.isBusy) {
        const tavernLeftMs =
          user.tavernUntil && user.tavernUntil > now ? user.tavernUntil.getTime() - now.getTime() : 0;
        const busyLeftMs = user.busyUntil && user.busyUntil > now ? user.busyUntil.getTime() - now.getTime() : 0;

        if (tavernLeftMs > 0) {
          await interaction.editReply({
            content: `Bạn đang nghỉ tại quán trọ trong ${formatDuration(tavernLeftMs)}. Hãy thử lại sau khi nghỉ xong.`,
          });
          return;
        }

        if (busyLeftMs > 0) {
          await interaction.editReply({
            content: `Bạn đang bận ngay lúc này (đang đi săn). Còn ${formatDuration(busyLeftMs)}.`,
          });
          return;
        }

        await interaction.editReply({
          content: "Bạn đang bận ngay lúc này. Vui lòng thử lại sau.",
        });
        return;
      }

      // @ts-ignore
      const trapsWanted = (interaction.options.getInteger('traps') ?? 0) as number;
      // @ts-ignore 
      const cloversWanted = (interaction.options.getInteger('clovers') ?? 0) as number;
      // @ts-ignore
      const scoutsWanted = (interaction.options.getInteger("scouts") ?? 0) as number;

      const userTrapObj = user.inventory.find((i: any) => i.type === ItemType.TRAP);
      const trapsOwned = userTrapObj?.quantity ?? 0;
      const trapPower = userTrapObj?.power ?? 1;

      const userCloverObj = user.inventory.find((i: any) => i.type === ItemType.LUCK_BUFF);
      const cloversOwned = userCloverObj?.quantity ?? 0;
      const cloverPower = userCloverObj?.power ?? 1;

      // Scout Lens owned check (by name, because catalog entry uses name "Scout Lens").
      const scoutLensObj = user.inventory.find((i: any) => i.name === "Scout Lens");
      const scoutsOwned = scoutLensObj?.quantity ?? 0;
      if (scoutsWanted > 1) {
        await interaction.editReply({
          content: "Bạn chỉ có thể dùng tối đa 1 Scout Lens cho mỗi lần đi săn.",
        });
        return;
      }
      if (scoutsWanted > scoutsOwned) {
        await interaction.editReply({ content: `Bạn không đủ Scout Lens! (Bạn có ${scoutsOwned})` });
        return;
      }

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
        await interaction.editReply({
          content: `Bạn cần nghỉ trong ${formatDuration(cooldown)} trước khi đi săn tiếp.`,
        });
        return;
      }

      // Scout Lens preview flow: if player selected scouts > 0, show predicted branch and require confirmation.
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
          cloversWanted,
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

      const busyUntil = new Date(now.getTime() + CAPTURE_TIMEOUT_MS);
      const lockResult = await prisma.user.updateMany({
        where: {
          id: user.id,
          isBusy: false
        },
        data: {
          isBusy: true,
          busyUntil
        }
      });

      if (lockResult.count === 0) {
        const refreshed = (await prisma.user.findUnique({ where: { id: user.id } })) as any;
        const refreshedNow = new Date();
        const tavernLeftMs =
          refreshed?.tavernUntil && refreshed.tavernUntil > refreshedNow
            ? refreshed.tavernUntil.getTime() - refreshedNow.getTime()
            : 0;
        const busyLeftMs =
          refreshed?.busyUntil && refreshed.busyUntil > refreshedNow
            ? refreshed.busyUntil.getTime() - refreshedNow.getTime()
            : 0;

        if (tavernLeftMs > 0) {
          await interaction.editReply({
            content: `Bạn đang nghỉ tại quán trọ trong ${formatDuration(tavernLeftMs)}. Hãy thử lại sau khi nghỉ xong.`,
          });
          return;
        }

        if (busyLeftMs > 0) {
          await interaction.editReply({
            content: `Bạn đang bận ngay lúc này (đang đi săn). Còn ${formatDuration(busyLeftMs)}.`,
          });
          return;
        }

        await interaction.editReply({
          content: "Bạn đang bận ngay lúc này. Vui lòng thử lại sau."
        });
        return;
      }

      shouldReleaseBusy = true;
      await updateQuestProgress(user.id, "hunt_count", 1);
      
      // Apply item effects (buffs, modifiers, risk/reward) for this hunt attempt.
      const effectsResult = await applyBeforeHuntItemEffects({
        db: prisma,
        now,
        user,
        scoutLensToUse: scoutsWanted
      });

      if (effectsResult.shouldStopHunt) {
        await interaction.editReply({ content: effectsResult.stopMessage ?? "Bạn đã không thể bắt đầu cuộc đi săn này." });
        return;
      }

      const effects = effectsResult.ctx;

      const cloverLuck = cloversWanted * cloverPower;
      const totalLuck = effects.luck + cloverLuck;
      
      // Luck reduces "combat" and "fail" to increase "chest" and "catch"
      const shiftChance = Math.min(20, totalLuck * 0.5);
      const catchRate = EVENT_RATES.catch + (shiftChance * 0.6);
      const chestRate = EVENT_RATES.chest + (shiftChance * 0.4);
      const combatRate = EVENT_RATES.combat - (shiftChance * 0.5);
      // Fail naturally gets the remaining part if combat/catch/chest don't hit

      const eventRoll = Math.random() * 100;

      const scoutPrefix = (() => {
        if (!effects.scoutLensActive) return "";
        if (eventRoll < combatRate) return "🔍 Dự báo: Bạn sẽ gặp trận chiến! ";
        if (eventRoll < combatRate + chestRate) return "🔍 Dự báo: Bạn sẽ gặp rương kho báu! ";
        if (eventRoll < combatRate + chestRate + catchRate) return "🔍 Dự báo: Bạn sẽ gặp quái thú hoang dã! ";
        return "🔍 Dự báo: Khu vực sẽ yên ắng. Có thể bạn sẽ chẳng tìm được gì! ";
      })();

      if (eventRoll < combatRate) {
        // Only consume clovers on combat start
        if (cloversWanted > 0 && userCloverObj) {
          await prisma.item.update({
            where: { id: userCloverObj.id },
            data: { quantity: { decrement: cloversWanted } }
          });
        }

        const combat = await handleHunt(user.id, {
          str: effects.str,
          agi: effects.agi,
          luck: effects.luck,
          playerDamageMultiplier: effects.playerDamageMultiplier,
          enemyStrengthMultiplier: effects.enemyStrengthMultiplier,
          topPetBonusMultiplier: effects.topPetBonusMultiplier,
          goldMultiplier: effects.goldMultiplier,
          expMultiplier: effects.expMultiplier,
        });
        if (typeof combat === "string") {
          await interaction.editReply({ content: combat });
          return;
        }

        const log = combat.battleLogs.join("\n");
        const embed = new EmbedBuilder()
          .setColor(combat.isWin ? 0x57f287 : 0xed4245)
          .setAuthor({ name: "Báo cáo chiến đấu", iconURL: interaction.user.displayAvatarURL() })
          .setTitle(combat.isWin ? `⚔️ Chiến thắng trước ${combat.enemyName}` : `💀 Thất bại trước ${combat.enemyName}`)
          .setDescription(scoutPrefix ? `${scoutPrefix}\n\n${log.length > 2000 ? log.substring(0, 1997) + "..." : log}` : (log.length > 2000 ? log.substring(0, 1997) + "..." : log))
          .addFields(
            {
              name: "🎁 Phần thưởng",
              value: combat.isWin
                ? `XP: \`+${combat.expGained}\` | Vàng: \`+${combat.goldGained}\``
                : "Không nhận được phần thưởng.",
              inline: true
            },
            {
              name: "🩺 Trạng thái cuối cùng",
              value:
                buildHpBar(combat.finalHp, user.maxHp) +
                (combat.hospitalUntil
                  ? `\n🏥 Bệnh viện: \`${formatDuration(combat.hospitalUntil.getTime() - now.getTime())}\``
                  : ""),
              inline: true
            }
          )
          .setFooter({ text: randomRpgFooter() });

        await interaction.editReply({ embeds: [embed] });
        return;
      }

      if (eventRoll < combatRate + chestRate) {
        const token = createEncounterToken();

        await prisma.$transaction(async (tx) => {
          await tx.user.update({
            where: { id: user.id },
            data: { lastHunt: now, busyUntil }
          });

          if (cloversWanted > 0 && userCloverObj) {
            await tx.item.update({
              where: { id: userCloverObj.id },
              data: { quantity: { decrement: cloversWanted } }
            });
          }
        });

        const embed = new EmbedBuilder()
          .setColor(0xe67e22)
          .setTitle("Phát hiện Rương Kho Báu!")
          .setDescription(`${scoutPrefix}Một chiếc rương bí ẩn xuất hiện trước mặt bạn. Bạn muốn mở thế nào?`);

        await interaction.editReply({
          embeds: [embed],
          components: [buildChestButtons(token)]
        });

        const message = await interaction.fetchReply();
        shouldReleaseBusy = false;

        startPendingChest(token, user.id, effects.goldMultiplier, effects.str, effects.agi, async () => {
          try {
            await prisma.user.update({
              where: { id: user.id, isBusy: true },
              data: { isBusy: false, busyUntil: null }
            });
          } catch (e) {}

          try {
            await message.edit({ components: [buildChestButtons(token, true)] });
          } catch (e) {}
        });

        return;
      }

      if (eventRoll < combatRate + chestRate + catchRate) {
        const luckBuff = cloversWanted * cloverPower;
        const beastLuck = effects.luck + luckBuff + effects.beastBaitLuckBonus;
        const beast = createWildBeast(user.level, beastLuck);
        const token = createEncounterToken();

        await prisma.$transaction(async (tx) => {
          await tx.user.update({
            where: { id: user.id },
            data: { lastHunt: now, busyUntil }
          });

          if (cloversWanted > 0 && userCloverObj) {
            await tx.item.update({
              where: { id: userCloverObj.id },
              data: { quantity: { decrement: cloversWanted } }
            });
          }
        });

        const embed = new EmbedBuilder()
          .setColor(RARITY_COLORS[beast.rarity as Rarity])
        .setTitle(`${RARITY_BANNER[beast.rarity as Rarity]} Quái thú hoang dã!`)
        .setDescription(`${scoutPrefix}**${beast.name}** hoang dã xuất hiện từ bóng tối!`)
          .addFields(
            { name: "Độ hiếm", value: RARITY_BADGE[beast.rarity as Rarity], inline: true },
            { name: "Sức mạnh", value: `\`${beast.power}\``, inline: true },
            { name: "Khung thời gian", value: "Hãy hành động trong 30 giây.", inline: true }
          );

        await interaction.editReply({
          embeds: [embed],
          components: [buildBeastButtons(token)]
        });

        const message = await interaction.fetchReply();
        shouldReleaseBusy = false;

        startPendingEncounter(token, user.id, beast, trapsWanted, Math.floor(trapsWanted * trapPower), effects.luck, async () => {
          try {
            await prisma.user.update({
              where: { id: user.id },
              data: { isBusy: false, busyUntil: null }
            });
          } catch (e) {}

          try {
            await message.edit({ components: [buildBeastButtons(token, true)] });
          } catch (e) {}
        });

        return;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { lastHunt: now }
      });

      const embed = new EmbedBuilder()
        .setColor(0x95a5a6)
        .setTitle("Không tìm thấy gì")
        .setDescription(`${scoutPrefix}Khu vực yên ắng. Lần này bạn chẳng tìm được gì.`)
        .setFooter({ text: randomRpgFooter() });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("hunt command failed", error);
      if (!interaction.deferred && !interaction.replied) {
        await interaction.reply({ content: "Đi săn thất bại. Thử lại sau một chút.", ephemeral: true });
      } else {
        await interaction.editReply({ content: "Đi săn thất bại. Thử lại sau một chút." });
      }
    } finally {
      if (shouldReleaseBusy) {
        try {
          await prisma.user.update({
            where: { id: interaction.user.id },
            data: { isBusy: false, busyUntil: null }
          });
        } catch (error) {}
      }
    }
  }
};

async function executeHuntAfterScoutConfirm(params: {
  interaction: any;
  userId: string;
  trapsWanted: number;
  cloversWanted: number;
  scoutLensToUse: number;
  forcedEventRoll: number;
}): Promise<void> {
  const { interaction, userId, trapsWanted, cloversWanted, scoutLensToUse, forcedEventRoll } = params;

  let shouldReleaseBusy = false;
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

    if (user.hospitalUntil && user.hospitalUntil > now) {
      await interaction.editReply({
        content: `Bạn đang ở bệnh viện trong ${formatDuration(user.hospitalUntil.getTime() - now.getTime())}.`,
      });
      return;
    }

    if (user.isBusy) {
      const tavernLeftMs =
        user.tavernUntil && user.tavernUntil > now ? user.tavernUntil.getTime() - now.getTime() : 0;
      const busyLeftMs = user.busyUntil && user.busyUntil > now ? user.busyUntil.getTime() - now.getTime() : 0;

      if (tavernLeftMs > 0) {
        await interaction.editReply({
          content: `Bạn đang nghỉ tại quán trọ trong ${formatDuration(tavernLeftMs)}. Hãy thử lại sau khi nghỉ xong.`,
        });
        return;
      }

      if (busyLeftMs > 0) {
        await interaction.editReply({
          content: `Bạn đang bận ngay lúc này (đang đi săn). Còn ${formatDuration(busyLeftMs)}.`,
        });
        return;
      }

      await interaction.editReply({
        content: "Bạn đang bận ngay lúc này. Vui lòng thử lại sau.",
      });
      return;
    }

    const userTrapObj = user.inventory.find((i: any) => i.type === ItemType.TRAP);
    const trapsOwned = userTrapObj?.quantity ?? 0;
    const trapPower = userTrapObj?.power ?? 1;

    const userCloverObj = user.inventory.find((i: any) => i.type === ItemType.LUCK_BUFF);
    const cloversOwned = userCloverObj?.quantity ?? 0;
    const cloverPower = userCloverObj?.power ?? 1;

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

    const busyUntil = new Date(now.getTime() + CAPTURE_TIMEOUT_MS);
    const lockResult = await prisma.user.updateMany({
      where: { id: user.id, isBusy: false },
      data: { isBusy: true, busyUntil }
    });

    if (lockResult.count === 0) {
      await interaction.editReply({ content: "Bạn đang bận ngay lúc này. Vui lòng thử lại sau." });
      return;
    }

    shouldReleaseBusy = true;
    await updateQuestProgress(user.id, "hunt_count", 1);

    // Apply item effects (buffs, modifiers, risk/reward) for this hunt attempt.
    const effectsResult = await applyBeforeHuntItemEffects({
      db: prisma,
      now,
      user,
      scoutLensToUse
    });

    if (effectsResult.shouldStopHunt) {
      await interaction.editReply({ content: effectsResult.stopMessage ?? "Bạn đã không thể bắt đầu cuộc đi săn này." });
      return;
    }

    const effects = effectsResult.ctx;
    const cloverLuck = cloversWanted * cloverPower;
    const totalLuck = effects.luck + cloverLuck;

    const shiftChance = Math.min(20, totalLuck * 0.5);
    const catchRate = EVENT_RATES.catch + (shiftChance * 0.6);
    const chestRate = EVENT_RATES.chest + (shiftChance * 0.4);
    const combatRate = EVENT_RATES.combat - (shiftChance * 0.5);

    const eventRoll = forcedEventRoll;

    const scoutPrefix = (() => {
      if (!effects.scoutLensActive) return "";
      if (eventRoll < combatRate) return "🔍 Dự báo: Bạn sẽ gặp trận chiến! ";
      if (eventRoll < combatRate + chestRate) return "🔍 Dự báo: Bạn sẽ gặp rương kho báu! ";
      if (eventRoll < combatRate + chestRate + catchRate) return "🔍 Dự báo: Bạn sẽ gặp quái thú hoang dã! ";
      return "🔍 Dự báo: Khu vực sẽ yên ắng. Có thể bạn sẽ chẳng tìm được gì! ";
    })();

    if (eventRoll < combatRate) {
      // Only consume clovers on combat start
      if (cloversWanted > 0 && userCloverObj) {
        await prisma.item.update({
          where: { id: userCloverObj.id },
          data: { quantity: { decrement: cloversWanted } }
        });
      }

      const combat = await handleHunt(user.id, {
        str: effects.str,
        agi: effects.agi,
        luck: effects.luck,
        playerDamageMultiplier: effects.playerDamageMultiplier,
        enemyStrengthMultiplier: effects.enemyStrengthMultiplier,
        topPetBonusMultiplier: effects.topPetBonusMultiplier,
        goldMultiplier: effects.goldMultiplier,
        expMultiplier: effects.expMultiplier
      });

      if (typeof combat === "string") {
        await interaction.editReply({ content: combat });
        return;
      }

      const log = combat.battleLogs.join("\n");
      const embed = new EmbedBuilder()
        .setColor(combat.isWin ? 0x57f287 : 0xed4245)
        .setAuthor({ name: "Báo cáo chiến đấu", iconURL: interaction.user.displayAvatarURL() })
        .setTitle(combat.isWin ? `⚔️ Chiến thắng trước ${combat.enemyName}` : `💀 Thất bại trước ${combat.enemyName}`)
        .setDescription(
          scoutPrefix
            ? `${scoutPrefix}\n\n${log.length > 2000 ? log.substring(0, 1997) + "..." : log}`
            : log.length > 2000
              ? log.substring(0, 1997) + "..."
              : log
        )
        .addFields(
          {
            name: "🎁 Phần thưởng",
            value: combat.isWin ? `XP: \`+${combat.expGained}\` | Vàng: \`+${combat.goldGained}\`` : "Không nhận được phần thưởng.",
            inline: true
          },
          {
            name: "🩺 Trạng thái cuối cùng",
            value:
              buildHpBar(combat.finalHp, user.maxHp) +
              (combat.hospitalUntil ? `\n🏥 Bệnh viện: \`${formatDuration(combat.hospitalUntil.getTime() - now.getTime())}\`` : ""),
            inline: true
          }
        )
        .setFooter({ text: randomRpgFooter() });

      await interaction.editReply({ embeds: [embed] });
      return;
    }

    // Chest
    if (eventRoll < combatRate + chestRate) {
      const token = createEncounterToken();

      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: user.id },
          data: { lastHunt: now, busyUntil }
        });

        if (cloversWanted > 0 && userCloverObj) {
          await tx.item.update({
            where: { id: userCloverObj.id },
            data: { quantity: { decrement: cloversWanted } }
          });
        }
      });

      const embed = new EmbedBuilder()
        .setColor(0xe67e22)
        .setTitle("Phát hiện Rương Kho Báu!")
        .setDescription(`${scoutPrefix}Một chiếc rương bí ẩn xuất hiện trước mặt bạn. Bạn muốn mở thế nào?`);

      await interaction.editReply({
        embeds: [embed],
        components: [buildChestButtons(token)]
      });

      const message = await interaction.fetchReply();
      shouldReleaseBusy = false;

      startPendingChest(token, user.id, effects.goldMultiplier, effects.str, effects.agi, async () => {
        try {
          await prisma.user.update({
            where: { id: user.id, isBusy: true },
            data: { isBusy: false, busyUntil: null }
          });
        } catch (e) {}

        try {
          await message.edit({ components: [buildChestButtons(token, true)] });
        } catch (e) {}
      });

      return;
    }

    // Catch / Beast encounter
    if (eventRoll < combatRate + chestRate + catchRate) {
      const luckBuff = cloversWanted * cloverPower;
      const beast = createWildBeast(user.level, effects.luck + luckBuff + effects.beastBaitLuckBonus);
      const token = createEncounterToken();

      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: user.id },
          data: { lastHunt: now, busyUntil }
        });

        if (cloversWanted > 0 && userCloverObj) {
          await tx.item.update({
            where: { id: userCloverObj.id },
            data: { quantity: { decrement: cloversWanted } }
          });
        }
      });

      const embed = new EmbedBuilder()
        .setColor(RARITY_COLORS[beast.rarity as Rarity])
        .setTitle(`${RARITY_BANNER[beast.rarity as Rarity]} Quái thú hoang dã!`)
        .setDescription(`${scoutPrefix}**${beast.name}** hoang dã xuất hiện từ bóng tối!`)
        .addFields(
          { name: "Độ hiếm", value: RARITY_BADGE[beast.rarity as Rarity], inline: true },
          { name: "Sức mạnh", value: `\`${beast.power}\``, inline: true },
          { name: "Khung thời gian", value: "Hãy hành động trong 30 giây.", inline: true }
        );

      await interaction.editReply({
        embeds: [embed],
        components: [buildBeastButtons(token)]
      });

      const message = await interaction.fetchReply();
      shouldReleaseBusy = false;

      startPendingEncounter(token, user.id, beast, trapsWanted, Math.floor(trapsWanted * trapPower), effects.luck, async () => {
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { isBusy: false, busyUntil: null }
          });
        } catch (e) {}

        try {
          await message.edit({ components: [buildBeastButtons(token, true)] });
        } catch (e) {}
      });

      return;
    }

    // Nothing found
    await prisma.user.update({
      where: { id: user.id },
      data: { lastHunt: now }
    });

    const embed = new EmbedBuilder()
      .setColor(0x95a5a6)
      .setTitle("Không tìm thấy gì")
      .setDescription(`${scoutPrefix}Khu vực yên ắng. Lần này bạn chẳng tìm được gì.`)
      .setFooter({ text: randomRpgFooter() });

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error("hunt confirm failed", error);
    if (!interaction.deferred && !interaction.replied) {
      await interaction.reply({ content: "Đi săn thất bại. Thử lại sau một chút.", ephemeral: true });
    } else {
      await interaction.editReply({ content: "Đi săn thất bại. Thử lại sau một chút." });
    }
  } finally {
    if (shouldReleaseBusy) {
      try {
        await prisma.user.update({
          where: { id: userId },
          data: { isBusy: false, busyUntil: null }
        });
      } catch (error) {}
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

    // Cancel: tiêu hao Scout Lens theo đúng lựa chọn của người chơi.
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
      cloversWanted: preview.cloversWanted,
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
          const trapWin = randomInt(1, 3);
          await prisma.$transaction(async (tx) => {
            await upsertItem(tx, user.id, { name: "Hunter Trap", type: ItemType.TRAP, power: 1, quantity: trapWin });
            await tx.user.update({ where: { id: user.id }, data: { isBusy: false, busyUntil: null } });
          });
          await updateQuestProgress(user.id, "open_chest", 1);
          embed.setColor(0x2ecc71).setTitle("Vô hiệu hóa rương thành công!").setDescription(`Bạn nhẹ nhàng mở rương và tìm thấy **${trapWin} Hunter Traps**!`);
        } else {
          const damage = randomInt(15, 30);
          const currentHp = Math.max(1, user.hp - damage);
          await prisma.user.update({ where: { id: user.id }, data: { isBusy: false, busyUntil: null, hp: currentHp, lastHpUpdatedAt: new Date() } });
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

  // Beast encounters
  const preview = peekPendingEncounter(token);
  if (!preview) {
    await interaction.reply({ content: "Cuộc chạm trán đã hết hạn.", ephemeral: true });
    return true;
  }

  if (preview.userId !== interaction.user.id) {
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
              ownerId: interaction.user.id
            }
          });
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

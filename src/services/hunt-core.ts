import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { ItemType } from "@prisma/client";
import { CAPTURE_TIMEOUT_MS, EVENT_RATES } from "../constants/config";
import { RARITY_COLORS, RARITY_BANNER, RARITY_BADGE, buildHpBar, randomRpgFooter, type Rarity } from "../utils/rpg-ui";
import { handleHunt } from "./combat-system";
import { runCombatAnimation, type CombatUIData } from "../utils/combat-ui";
import { applyBeforeHuntItemEffects } from "./itemEffects";
import { buildBeastButtons, buildChestButtons, createEncounterToken, startPendingEncounter, startPendingChest } from "./encounter-service";
import { createWildBeast } from "./hunt-service";
import { prisma } from "./prisma";
import { updateQuestProgress } from "./quest-service";
import { formatDuration } from "./user-service";
import { randomInt } from "./rng";

export function checkUserStatusErrors(user: any, now: Date): string | null {
  if (user.hospitalUntil && user.hospitalUntil > now) {
    return `Bạn đang ở bệnh viện trong ${formatDuration(user.hospitalUntil.getTime() - now.getTime())}.`;
  }
  if (user.isBusy) {
    const tavernLeftMs = user.tavernUntil && user.tavernUntil > now ? user.tavernUntil.getTime() - now.getTime() : 0;
    const busyLeftMs = user.busyUntil && user.busyUntil > now ? user.busyUntil.getTime() - now.getTime() : 0;
    if (tavernLeftMs > 0) return `Bạn đang nghỉ tại quán trọ trong ${formatDuration(tavernLeftMs)}. Hãy thử lại sau khi nghỉ xong.`;
    if (busyLeftMs > 0) return `Bạn đang bận ngay lúc này (đang đi săn). Còn ${formatDuration(busyLeftMs)}.`;
    return "Bạn đang bận ngay lúc này. Vui lòng thử lại sau.";
  }
  return null;
}

export async function performCoreHunt(interaction: any, user: any, now: Date, options: {
  trapsWanted: number, 
  trapItemName: string | undefined,
  cloversWanted: number, 
  cloverItemName: string | undefined,
  scoutLensToUse: number, 
  forcedEventRoll?: number
}) {
  const { trapsWanted, trapItemName, cloversWanted, cloverItemName, scoutLensToUse, forcedEventRoll } = options;
  let shouldReleaseBusy = false;

  try {
    const busyUntil = new Date(now.getTime() + CAPTURE_TIMEOUT_MS);
    const lockResult = await prisma.user.updateMany({
      where: { id: user.id, isBusy: false },
      data: { isBusy: true, busyUntil }
    });

    if (lockResult.count === 0) {
      const refreshed = (await prisma.user.findUnique({ where: { id: user.id } })) as any;
      const statusErr = refreshed ? checkUserStatusErrors(refreshed, new Date()) : null;
      await interaction.editReply({ content: statusErr ?? "Bạn đang bận ngay lúc này. Vui lòng thử lại sau." });
      return;
    }

    shouldReleaseBusy = true;
    await updateQuestProgress(user.id, "hunt_count", 1);

    const effectsResult = await applyBeforeHuntItemEffects({ db: prisma, now, user, scoutLensToUse });
    if (effectsResult.shouldStopHunt) {
      await interaction.editReply({ content: effectsResult.stopMessage ?? "Bạn đã không thể bắt đầu cuộc đi săn này." });
      return;
    }

    const effects = effectsResult.ctx;
    
    const userTrapObj = trapItemName 
      ? user.inventory.find((i: any) => i.name === trapItemName) 
      : user.inventory.find((i: any) => i.type === ItemType.TRAP);
    const trapPower = userTrapObj?.power ?? 1;

    const userCloverObj = cloverItemName 
      ? user.inventory.find((i: any) => i.name === cloverItemName) 
      : user.inventory.find((i: any) => i.type === ItemType.LUCK_BUFF);
    const cloverPower = userCloverObj?.power ?? 1;

    const cloverLuck = cloversWanted * cloverPower;
    const totalLuck = effects.luck + cloverLuck;

    const shiftChance = Math.min(20, totalLuck * 0.5);
    const catchRate = EVENT_RATES.catch + (shiftChance * 0.6);
    const chestRate = EVENT_RATES.chest + (shiftChance * 0.4);
    const combatRate = EVENT_RATES.combat - (shiftChance * 0.5);

    const eventRoll = forcedEventRoll ?? Math.random() * 100;

    const scoutPrefix = (() => {
      if (!effects.scoutLensActive) return "";
      if (eventRoll < combatRate) return "🔍 Dự báo: Bạn sẽ gặp trận chiến! ";
      if (eventRoll < combatRate + chestRate) return "🔍 Dự báo: Bạn sẽ gặp rương kho báu! ";
      if (eventRoll < combatRate + chestRate + catchRate) return "🔍 Dự báo: Bạn sẽ gặp quái thú hoang dã! ";
      return "🔍 Dự báo: Khu vực sẽ yên ắng. Có thể bạn sẽ chẳng tìm được gì! ";
    })();

    if (eventRoll < combatRate) {
      if (cloversWanted > 0 && userCloverObj) {
        await prisma.item.update({ where: { id: userCloverObj.id }, data: { quantity: { decrement: cloversWanted } } });
      }

      const combat = await handleHunt(interaction, user.id, {
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

      // Build CombatUIData for the result embed (skills/synergies already shown per-turn)
      const uiData: CombatUIData = {
        isWin: combat.isWin,
        isBoss: false,
        enemyName: combat.enemyName,
        playerHpBar: buildHpBar(combat.finalHp, (combat as any).playerMaxHp),
        enemyHpBar: !combat.isWin ? buildHpBar(combat.finalEnemyHp, (combat as any).enemyMaxHp) : undefined,
        goldGained: combat.goldGained,
        expGained: combat.expGained,
        hospitalDuration: combat.hospitalUntil
          ? formatDuration(combat.hospitalUntil.getTime() - now.getTime())
          : undefined,
        achievementProgressText: (combat as any).achievementData?.updatedAchievements?.length > 0
          ? (combat as any).achievementData.formattedProgress
          : undefined,
        scoutPrefix: scoutPrefix || undefined,
        summary: (combat as any).combatSummary ?? undefined,
      };

      await runCombatAnimation(
        interaction,
        uiData,
        interaction.user.displayAvatarURL({ extension: "png", size: 128 }),
      );

      // Achievement completion notifications
      if ((combat as any).achievementData?.notificationSent) {
        await interaction.followUp({ embeds: (combat as any).achievementData.embedPayload });
      }

      // --- LEVEL UP NOTIFICATION ---
      if (combat.levelsGained > 0 && combat.newStats) {
        const lvEmbed = new EmbedBuilder()
          .setColor(0xF1C40F)
          .setTitle("🎊 CHÚC MỪNG LÊN CẤP! 🎊")
          .setDescription(`Bạn đã đạt đến cấp độ **${combat.newStats.level}**!`)
          .addFields(
            { name: "💪 Sức mạnh", value: `\`${combat.newStats.str}\``, inline: true },
            { name: "🏃 Nhanh nhẹn", value: `\`${combat.newStats.agi}\``, inline: true },
            { name: "🍀 May mắn", value: `\`${combat.newStats.luck}\``, inline: true },
            { name: "❤️ Máu tối đa", value: `\`${combat.newStats.maxHp}\``, inline: true }
          )
          .setFooter({ text: "Chỉ số của bạn đã được gia tăng tự động!" });
        
        await interaction.followUp({ embeds: [lvEmbed] });
        
        // Track Achievement
        await updateQuestProgress(user.id, "slayer_novice", combat.newStats.level, true);
      }
      return;
    }

    if (eventRoll < combatRate + chestRate) {
      const token = createEncounterToken();
      await prisma.$transaction(async (tx) => {
        await tx.user.update({ where: { id: user.id }, data: { lastHunt: now, busyUntil } });
        if (cloversWanted > 0 && userCloverObj) {
          await tx.item.update({ where: { id: userCloverObj.id }, data: { quantity: { decrement: cloversWanted } } });
        }
      });

      const embed = new EmbedBuilder()
        .setColor(0xe67e22)
        .setTitle("Phát hiện Rương Kho Báu!")
        .setDescription(`${scoutPrefix}Một chiếc rương bí ẩn xuất hiện trước mặt bạn. Bạn muốn mở thế nào?`);

      await interaction.editReply({ embeds: [embed], components: [buildChestButtons(token)] });
      const message = await interaction.fetchReply();
      shouldReleaseBusy = false;

      startPendingChest(token, user.id, effects.goldMultiplier, effects.str, effects.agi, async () => {
        try { await prisma.user.update({ where: { id: user.id, isBusy: true }, data: { isBusy: false, busyUntil: null } }); } catch (e) {}
        try { await message.edit({ components: [buildChestButtons(token, true)] }); } catch (e) {}
      });
      return;
    }

    if (eventRoll < combatRate + chestRate + catchRate) {
      const beastLuck = effects.luck + cloverLuck + effects.beastBaitLuckBonus;
      const beastLevel = Math.max(1, user.level - randomInt(0, 2));
      const beast = createWildBeast(beastLevel, beastLuck);
      const token = createEncounterToken();

      await prisma.$transaction(async (tx) => {
        await tx.user.update({ where: { id: user.id }, data: { lastHunt: now, busyUntil } });
        if (cloversWanted > 0 && userCloverObj) {
          await tx.item.update({ where: { id: userCloverObj.id }, data: { quantity: { decrement: cloversWanted } } });
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

      await interaction.editReply({ embeds: [embed], components: [buildBeastButtons(token)] });
      const message = await interaction.fetchReply();
      shouldReleaseBusy = false;

      startPendingEncounter(token, user.id, beast, trapsWanted, Math.floor(trapsWanted * trapPower), effects.luck, async () => {
        try { await prisma.user.update({ where: { id: user.id }, data: { isBusy: false, busyUntil: null } }); } catch (e) {}
        try { await message.edit({ components: [buildBeastButtons(token, true)] }); } catch (e) {}
      });
      return;
    }

    await prisma.user.update({ where: { id: user.id }, data: { lastHunt: now } });
    const embed = new EmbedBuilder()
      .setColor(0x95a5a6)
      .setTitle("Không tìm thấy gì")
      .setDescription(`${scoutPrefix}Khu vực yên ắng. Lần này bạn chẳng tìm được gì.`)
      .setFooter({ text: randomRpgFooter() });

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error("perfomCoreHunt failed", error);
    throw error;
  } finally {
    if (shouldReleaseBusy) {
      try { await prisma.user.update({ where: { id: user.id }, data: { isBusy: false, busyUntil: null } }); } catch (error) {}
    }
  }
}

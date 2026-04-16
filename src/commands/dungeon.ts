/**
 * dungeon.ts — Interactive step-by-step roguelike dungeon with button decisions.
 * State stored in-memory. Combat, events, boss, final boss, potions, branching events.
 */

import {
    ActionRowBuilder, ButtonBuilder, ButtonStyle,
    EmbedBuilder, SlashCommandBuilder,
    type ButtonInteraction, type ChatInputCommandInteraction
} from "discord.js";
import { formatDuration, getUserWithRelations } from "../services/user-service";
import { checkUserStatusErrors } from "../services/hunt-core";
import { prisma } from "../services/prisma";
import { ItemType } from "@prisma/client";
import type { SlashCommand } from "../types/command";
import { GameItem, rollLootDrop, WEAPON_POOL, ARMOR_POOL, getItemsByRarity, pickRandomItem } from "../constants/item-pool";
import { addEquipmentToInventory } from "../services/equipment-service";
import { buildHighTierDropEmbed } from "../utils/rpg-ui";
import { computeCombatStats, calculatePipelineDamage } from "../services/stats-service";
import { applySkills } from "../services/skill-system";
import { type CombatContext } from "../types/combat";
import { applyPetEffects } from "../services/pet-system";
import { applyPetSynergy } from "../services/pet-synergy";
import { addPetExp } from "../services/pet-management";
import { HOSPITAL_COOLDOWN_MS } from "../constants/config";

// ─────────────────────────────────────────────
// 1. STATE
// ─────────────────────────────────────────────

interface DungeonEnemy {
    name: string;
    hp: number;
    maxHp: number;
    damage: number;
    def: number;
    isBoss: boolean;
}

type DungeonPhase = "COMBAT" | "BOSS" | "FINAL_BOSS" | "EVENT" | "REST" | "END";

interface DungeonState {
    userId: string;
    currentFloor: number;
    maxFloor: number;
    currentHp: number;
    maxHp: number;
    baseAtk: number;
    potionsLeft: number;
    potionPower: number;
    phase: DungeonPhase;
    enemy: DungeonEnemy | null;
    log: string[];
    hasActedThisTurn: boolean;
    goldGained: number;
    /** If set, next floor is forced to BOSS */
    forceBossNext: boolean;
    /** Reward pending for event */
    pendingRelicRarity?: "EPIC" | "LEGENDARY";
    /** Items looted during run */
    foundItems: GameItem[];
    /** Player's currently equipped weapon power */
    playerWeaponPower: number;
    /** Player's currently equipped armor defense */
    playerArmorDef: number;
    /** Defense value loaded at start */
    baseDef: number;
    /** Luck value loaded at start */
    luck: number;
    /** Loot rarity bonus (Lucky Charm) */
    luckyCharmBonus: number;
    /** User's skills */
    userSkills: any[];
    /** User's pets */
    userPets: any[];
    /** Pet ID -> amount of exp to grant at finish */
    petExpPool: Map<string, number>;
}

const activeSessions = new Map<string, DungeonState>();
const MAX_FLOOR = 10;

// ─────────────────────────────────────────────
// 2. ENEMY GENERATION
// ─────────────────────────────────────────────

function makeEnemy(floor: number, phase: DungeonPhase): DungeonEnemy {
    const scale = 1 + floor * 0.12;

    if (phase === "FINAL_BOSS") {
        return {
            name: "🔥 Ác Thần Vực Tối",
            hp: Math.floor(900 * scale),
            maxHp: Math.floor(900 * scale),
            damage: Math.floor(60 * scale),
            def: Math.floor(40 * scale),
            isBoss: true
        };
    }
    if (phase === "BOSS") {
        const names = ["💀 Quỷ Tộc Trưởng", "🐲 Long Thần", "👹 Đại Yêu Vương", "💀 Ác Linh"];
        return {
            name: names[floor % names.length]!,
            hp: Math.floor(400 * scale),
            maxHp: Math.floor(400 * scale),
            damage: Math.floor(35 * scale),
            def: Math.floor(25 * scale),
            isBoss: true
        };
    }
    // Normal combat
    const names = ["🐺 Lang Sói", "🕷️ Nhện Khổng Lồ", "💀 Xương Cốt", "🐍 Rắn Độc", "👻 Oan Hồn"];
    return {
        name: names[floor % names.length]!,
        hp: Math.floor(120 * scale),
        maxHp: Math.floor(120 * scale),
        damage: Math.floor(18 * scale),
        def: Math.floor(10 * scale),
        isBoss: false
    };
}

// ─────────────────────────────────────────────
// 3. PHASE DECISION
// ─────────────────────────────────────────────

function decidePhase(state: DungeonState): DungeonPhase {
    const { currentFloor, maxFloor, forceBossNext } = state;

    if (forceBossNext) return "BOSS";
    if (currentFloor >= maxFloor) return "FINAL_BOSS";
    if (currentFloor === maxFloor - 1) return "EVENT";
    if (currentFloor % 4 === 0) return "BOSS";
    if (currentFloor % 4 === 3) return "EVENT";
    return "COMBAT";
}

// ─────────────────────────────────────────────
// 4. UI HELPERS
// ─────────────────────────────────────────────

/** Dynamic HP bar: color shifts green → yellow → orange → red by HP% */
function buildHpBar(current: number, max: number): string {
    const SIZE = 10;
    const safeCurrent = Math.max(0, current);
    const pct = max > 0 ? safeCurrent / max : 0;
    const filled = Math.max(0, Math.min(SIZE, Math.round(pct * SIZE)));
    const empty = SIZE - filled;
    const fill = pct > 0.6 ? "🟩" : pct > 0.35 ? "🟨" : pct > 0.15 ? "🟧" : "🟥";
    return fill.repeat(filled) + "⬜".repeat(empty);
}

/** Compact enemy HP bar always red */
function buildEnemyBar(current: number, max: number): string {
    const SIZE = 12;
    const safeCurrent = Math.max(0, current);
    const pct = max > 0 ? safeCurrent / max : 0;
    const filled = Math.max(0, Math.min(SIZE, Math.round(pct * SIZE)));
    return "🔴".repeat(filled) + "⚫".repeat(SIZE - filled);
}

/** Floor progress strip */
function buildFloorTrack(floor: number, max: number): string {
    const parts: string[] = [];
    for (let i = 1; i <= max; i++) {
        if (i < floor) parts.push("✅");
        else if (i === floor) parts.push("📍");
        else if (i === max) parts.push("👑");
        else if (i % 4 === 0) parts.push("💀");
        else parts.push("▪️");
    }
    return parts.join("");
}

/** Embed accent color by phase + player HP% */
function resolveColor(phase: DungeonPhase, hpPct: number): number {
    if (phase === "FINAL_BOSS") return 0xff2222;
    if (phase === "BOSS") return 0xc0392b;
    if (phase === "EVENT") return 0xe67e22;
    if (phase === "REST") return 0x27ae60;
    // COMBAT: shift warm as HP drops
    if (hpPct > 0.6) return 0x5865f2;
    if (hpPct > 0.3) return 0xf39c12;
    return 0xe74c3c;
}

// ─────────────────────────────────────────────
// 5. EMBED BUILDER (PREMIUM)
// ─────────────────────────────────────────────

function buildDungeonEmbed(state: DungeonState): EmbedBuilder {
    const { currentFloor, maxFloor, currentHp, maxHp, phase, enemy, log, potionsLeft, goldGained } = state;

    const hpPct = maxHp > 0 ? currentHp / maxHp : 1;
    const color = resolveColor(phase, hpPct);

    // Phase banner text
    const phaseBanner: Record<DungeonPhase, string> = {
        COMBAT: "⚔️  CHIẾN ĐẤU",
        BOSS: "💀  BOSS  💀",
        FINAL_BOSS: "🔥  TRÙM CUỐI  🔥",
        EVENT: "✦  SỰ KIỆN  ✦",
        REST: "🛏️  NGHỈ NGƠI",
        END: "🏁  KẾT THÚC"
    };

    // HP status flavor
    const hpFlavor = hpPct > 0.7 ? "Sung sức"
        : hpPct > 0.4 ? "Bị thương"
            : hpPct > 0.2 ? "⚠️ Nguy hiểm!"
                : "🚨 Sắp chết!";

    const hpBar = buildHpBar(currentHp, maxHp);
    const floorTrack = buildFloorTrack(currentFloor, maxFloor);

    const ANSI_BLUE = "\u001b[1;34m";
    const ANSI_RESET = "\u001b[0m";

    // Build the description block (cinematic header)
    const descLines: string[] = [
        `\`\`\`ansi`,
        `${ANSI_BLUE}╔═══════════════════════════════╗`,
        `║  ${phaseBanner[phase].padEnd(27, " ")}  ║`,
        `╚═══════════════════════════════╝${ANSI_RESET}`,
        `\`\`\``
    ];

    const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(`🏰  Hầm Ngục Vô Tận  ·  Tầng ${currentFloor} / ${maxFloor}`)
        .setDescription(descLines.join("\n"));

    // ── Tiến trình tầng ──────────────────────────
    embed.addFields({
        name: "📍 Lộ Trình",
        value: floorTrack,
        inline: false
    });

    // ── Trạng thái người chơi ───────────────────
    embed.addFields(
        {
            name: "❤️  Sinh Lực",
            value: `${hpBar}\n\`${currentHp} / ${maxHp}\`  —  *${hpFlavor}*`,
            inline: true
        },
        {
            name: "🧪  Potion",
            value: potionsLeft > 0
                ? `${"|🧪".repeat(Math.min(potionsLeft, 5))} \`×${potionsLeft}\``
                : "`Hết rồi...`",
            inline: true
        },
        {
            name: "💰  Vàng",
            value: `\`${goldGained}\``,
            inline: true
        }
    );

    // ── Kẻ địch (combat) ────────────────────────
    if (enemy && (phase === "COMBAT" || phase === "BOSS" || phase === "FINAL_BOSS")) {
        const enemyBar = buildEnemyBar(enemy.hp, enemy.maxHp);
        const hpPercent = Math.round((enemy.hp / enemy.maxHp) * 100);
        const threat = enemy.isBoss ? "☠️ NGUY HIỂM CHẾT NGƯỜI" : `⚡ Sát thương: ${enemy.damage}/lượt`;
        const bossWarn = phase === "FINAL_BOSS" ? "\n> 🔥 *Tên Boss cuối — không có đường lùi!*" : "";

        embed.addFields({
            name: `${enemy.name}  ·  ${hpPercent}% HP`,
            value: `${enemyBar}\n\`${enemy.hp} / ${enemy.maxHp}\`\n${threat}${bossWarn}`,
            inline: false
        });
    }

    // ── Combat log (cinematic) ───────────────────
    const recentLog = log.slice(-10);
    if (recentLog.length > 0) {
        const formatted = recentLog.map(line => `> ${line}`).join("\n");
        embed.addFields({
            name: "📜  Nhật Chiến",
            value: formatted,
            inline: false
        });
    }

    // Footer
    const footerPhrases = [
        "Mỗi bước tiến là một cược với tử thần.",
        "Ánh sáng cuối đường hầm... hay miệng rồng?",
        "Máu không phải nước — hãy dùng đúng lúc.",
        "Kẻ mạnh nhất không phải kẻ mạnh nhất — là kẻ còn sống."
    ];
    const phrase = footerPhrases[currentFloor % footerPhrases.length]!;
    embed.setFooter({ text: `✦  ${phrase}  ✦` });

    return embed;
}

// ─────────────────────────────────────────────
// 5. AUTO COMBAT ENGINE
// ─────────────────────────────────────────────

async function runAutoCombat(interaction: ChatInputCommandInteraction | ButtonInteraction, state: DungeonState): Promise<boolean> {
    const enemy = state.enemy;
    if (!enemy) return true;

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    let turn = 0;
    while (enemy.hp > 0 && state.currentHp > 0 && turn < 30) {
        turn++;
        // 1. Auto Potion Logic
        if (state.currentHp < state.maxHp * 0.3 && state.potionsLeft > 0) {
            state.potionsLeft--;
            const healPct = (state.potionPower || 25) / 100;
            const heal = Math.floor(state.maxHp * healPct);
            const before = state.currentHp;
            state.currentHp = Math.min(state.maxHp, state.currentHp + heal);
            state.log.push(`🧪 Auto-Potion: Hồi **${state.currentHp - before}** HP.`);
        }

            // 2. Player Turn
            const ctx: CombatContext = {
                player: {
                    hp: state.currentHp, maxHp: state.maxHp, atk: state.baseAtk, def: state.baseDef,
                    shield: 0, petPower: 0, multipliers: { damage: 1, gold: 1, exp: 1, defense: 1 },
                    name: "Bạn", spd: 0, critRate: 0,
                } as any,
                enemy: { 
                    hp: enemy.hp, maxHp: enemy.maxHp, atk: enemy.damage, def: enemy.def,
                    name: enemy.name, spd: 0, critRate: 0, petPower: 0
                } as any,
                effects: { player: [], enemy: [] },
                flags: { 
                    player: { dodged: false, extraHit: false, ignoreDef: false }, 
                    enemy: { dodged: false, ignoreDef: false, bossPhaseTriggered: false, isBoss: false } 
                } as any,
                extra: { player: { instantHeal: 0, bonusDamage: 0, reduceDamage: 0 } },
                accessories: { effects: [], sets: [], uniquePowers: {} },
                fullLogs: []
            };

            // Pet ON_TURN_START
            const petStartRes = applyPetEffects(ctx, state.userPets, "ON_TURN_START");
            if (petStartRes.triggered.length > 0) {
                state.log.push(...petStartRes.triggered);
                for (const pid of petStartRes.triggeredPetIds) {
                    state.petExpPool.set(pid, (state.petExpPool.get(pid) || 0) + 1);
                }
            }

            const skillRes = applySkills(state.userSkills, "ON_ATTACK", ctx);
            if (skillRes.triggeredSkills.length > 0) {
                // Dedup skills for shorter logs
                const uniqueSkills = Array.from(new Set(skillRes.triggeredSkills));
                state.log.push(`✨ Kích hoạt: ${uniqueSkills.join(", ")}`);
            }

            // Pet ON_ATTACK
            const attackFlags: any = {};
            const petAttackRes = applyPetEffects(ctx, state.userPets, "ON_ATTACK", attackFlags);
            if (petAttackRes.triggered.length > 0) {
                state.log.push(...petAttackRes.triggered);
                for (const pid of petAttackRes.triggeredPetIds) {
                    state.petExpPool.set(pid, (state.petExpPool.get(pid) || 0) + 1);
                }
            }

            let dmg = playerDamage(state);
            dmg = Math.floor(dmg * ctx.player.multipliers.damage) + ctx.extra.player.bonusDamage + skillRes.totalDamage;
            
            enemy.hp = Math.max(0, enemy.hp - dmg);
            const isCrit = (dmg > state.baseAtk * 1.3) || skillRes.flags.didCrit || attackFlags.petCrit;
        state.log.push(`🗡️ Bạn gây **${dmg}${isCrit ? " 💥" : ""}** lên ${enemy.name}.`);

        const totalHeal = ctx.extra.player.instantHeal + skillRes.healAmount;
        if (totalHeal > 0) {
            state.currentHp = Math.min(state.maxHp, state.currentHp + totalHeal);
        }

        if (enemy.hp <= 0) {
             state.log.push(`✅ **${enemy.name}** đã bị hạ gục!`);
             const dropChance = enemy.isBoss ? 1.0 : 0.20;
             if (Math.random() < dropChance) {
                 const drop = rollLootDrop(state.currentFloor);
                 if (drop) {
                     state.foundItems.push(drop);
                     state.log.push(`📦 Nhặt được: **${drop.name}**!`);
                 }
             }
             return true;
        }

        // 3. Enemy Turn
        const defendFlags: any = {};
        const petDefendRes = applyPetEffects(ctx, state.userPets, "ON_DEFEND", defendFlags);
        if (petDefendRes.triggered.length > 0) {
            state.log.push(...petDefendRes.triggered);
            for (const pid of petDefendRes.triggeredPetIds) {
                state.petExpPool.set(pid, (state.petExpPool.get(pid) || 0) + 1);
            }
        }

        const enemyDmg = calculatePipelineDamage(enemy.damage, state.baseDef);
        const randomizedEnemyDmg = Math.floor(enemyDmg * (0.85 + Math.random() * 0.3));
        state.currentHp = Math.max(0, state.currentHp - randomizedEnemyDmg);
        state.log.push(`🔸 ${enemy.name} phản công: **${randomizedEnemyDmg}** sát thương.`);

        if (state.currentHp <= 0) {
            state.log.push("💀 Bạn đã gục ngã...");
            // Final update for death
            const embed = buildDungeonEmbed(state);
            await interaction.editReply({ embeds: [embed], components: [] }).catch(() => {});
            return false;
        }

        // --- UPDATE UI AFTER EACH TURN ---
        const embed = buildDungeonEmbed(state);
        await interaction.editReply({ embeds: [embed], components: [] }).catch(() => {});
        await sleep(900);
    }

    if (turn >= 30) state.log.push("⏰ Trận đấu kéo dài quá lâu! Bạn phải rút lui.");
    return false;
}

// ─────────────────────────────────────────────
// 6. BUTTON ROW BUILDERS (STYLED)
// ─────────────────────────────────────────────

function continueButton(): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId("dungeon_continue")
            .setLabel("➡️  Tầng Tiếp Theo")
            .setStyle(ButtonStyle.Success)
    );
}

function finishButton(): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId("dungeon_finish")
            .setLabel("🏁  Hoàn Thành Hầm Ngục")
            .setStyle(ButtonStyle.Success)
    );
}

function actionButtons(state: DungeonState): ActionRowBuilder<ButtonBuilder> {
    if (state.currentFloor >= state.maxFloor && (!state.enemy || state.enemy.hp <= 0)) {
        return finishButton();
    }
    return continueButton();
}

// ─────────────────────────────────────────────
// 6. EVENT LOGIC
// ─────────────────────────────────────────────

interface EventData {
    title: string;
    description: string;
    choice1Label: string;
    choice2Label: string;
    type: "REST" | "RISK" | "TREASURE" | "BRANCH";
}

function rollEvent(state: DungeonState): EventData {
    // 12% chance for rare branch event
    if (Math.random() < 0.12) {
        state.log.push("✨ *Một sự kiện bí ẩn xuất hiện...*");
        return {
            title: "🌀 Ngã Tư Bí Ẩn",
            description: "Hai con đường hiện ra trước mắt bạn. Một bên toả ánh vàng, một bên tối tăm...\n**Bạn chọn hướng nào?**",
            choice1Label: "⬅️ Đi Trái",
            choice2Label: "➡️ Đi Phải",
            type: "BRANCH"
        };
    }

    const roll = Math.random();
    if (roll < 0.4) {
        return {
            title: "🛏️ Khu Nghỉ Ngơi",
            description: "Bạn tìm thấy một nơi trú ẩn yên tĩnh. Hồi phục hoặc tiếp tục?",
            choice1Label: "💤 Nghỉ Ngơi (+HP)",
            choice2Label: "⏩ Tiếp Tục",
            type: "REST"
        };
    } else if (roll < 0.7) {
        return {
            title: "🏺 Ngôi Đền Thờ Bị Nguyền Rủa",
            description: "Một ngôi đền cổ rỉ sáng kỳ lạ...\n**Cầu nguyện:** 50% hồi lớn, 50% mất máu.",
            choice1Label: "🙏 Cầu Nguyện (50/50)",
            choice2Label: "🚪 Bỏ Qua",
            type: "RISK"
        };
    } else {
        return {
            title: "💰 Rương Kho Báu",
            description: "Một chiếc rương óng ánh hiện ra giữa bóng tối...",
            choice1Label: "🔓 Mở Rương",
            choice2Label: "🚪 Để Đó",
            type: "TREASURE"
        };
    }
}

// Stored temporarily per user for the duration of an event
const activeEvents = new Map<string, EventData>();

// ─────────────────────────────────────────────
// 7. APPLY EVENT CHOICE
// ─────────────────────────────────────────────

function applyEventChoice(state: DungeonState, event: EventData, choiceIndex: 1 | 2): string[] {
    const messages: string[] = [];
    const isChoice1 = choiceIndex === 1;

    switch (event.type) {
        case "REST": {
            if (isChoice1) {
                const heal = Math.floor(state.maxHp * (0.3 + Math.random() * 0.1)); // 30-40%
                const before = state.currentHp;
                state.currentHp = Math.min(state.maxHp, state.currentHp + heal);
                messages.push(`💤 Bạn nghỉ ngơi và hồi phục **${state.currentHp - before}** HP.`);
            } else {
                messages.push("⏩ Bạn bỏ qua cơ hội nghỉ ngơi và tiếp tục tiến lên.");
            }
            break;
        }
        case "RISK": {
            if (isChoice1) {
                if (Math.random() < 0.5) {
                    const heal = Math.floor(state.maxHp * 0.4);
                    const before = state.currentHp;
                    state.currentHp = Math.min(state.maxHp, state.currentHp + heal);
                    messages.push(`✨ Thần linh phù hộ! Hồi phục **${state.currentHp - before}** HP!`);
                } else {
                    const dmg = Math.floor(state.maxHp * 0.2);
                    state.currentHp = Math.max(1, state.currentHp - dmg);
                    messages.push(`💀 Lời nguyền kích hoạt! Mất **${dmg}** HP!`);
                }
            } else {
                messages.push("🚪 Bạn thận trọng bước qua, không chú ý đến ngôi đền.");
            }
            break;
        }
        case "TREASURE": {
            if (isChoice1) {
                const trapRoll = Math.random();
                if (trapRoll < 0.25) {
                    const dmg = Math.floor(state.maxHp * 0.15);
                    state.currentHp = Math.max(1, state.currentHp - dmg);
                    messages.push(`💥 Bẫy! Mất **${dmg}** HP, rương trống rỗng.`);
                } else {
                    const gold = Math.floor(100 + Math.random() * 200);
                    state.goldGained += gold;
                    const item = rollLootDrop(state.currentFloor, state.luckyCharmBonus);
                    if (item) {
                        state.foundItems.push(item);
                        let hint = "";
                        if (item.type === "WEAPON" && (item.power || 0) > state.playerWeaponPower) hint = " *(Mạnh hơn vũ khí hiện tại! 🚀)*";
                        if (item.type === "ARMOR" && (item.bonusDef || 0) > state.playerArmorDef) hint = " *(Phòng thủ tốt hơn! 🛡️)*";

                        messages.push(`💰 Tìm thấy **${gold} vàng** và 📦 **${item.name}** trong rương!${hint}`);
                    } else {
                        messages.push(`💰 Tìm thấy **${gold} vàng** trong rương!`);
                    }
                }
            } else {
                messages.push("🚪 Bạn để rương lại và tiếp tục con đường của mình.");
            }
            break;
        }
        case "BRANCH": {
            const correctPath = Math.random() < 0.5 ? 1 : 2;
            if (choiceIndex === correctPath) {
                const epic = Math.random() < 0.8;
                const pool = Math.random() < 0.5 ? WEAPON_POOL : ARMOR_POOL;
                const items = getItemsByRarity(pool, epic ? "EPIC" : "LEGENDARY");
                const item = pickRandomItem(items.length > 0 ? items : getItemsByRarity(pool, "COMMON"));

                const goldBonus = epic ? 300 : 800;
                state.goldGained += goldBonus;
                if (item) {
                    state.foundItems.push(item);
                    let hint = "";
                    if (item.type === "WEAPON" && (item.power || 0) > state.playerWeaponPower) hint = " *(Mạnh hơn vũ khí hiện tại! 🚀)*";
                    if (item.type === "ARMOR" && (item.bonusDef || 0) > state.playerArmorDef) hint = " *(Phòng thủ tốt hơn! 🛡️)*";

                    messages.push(`✨ **Kho Báu Ẩn!** Bạn tìm thấy 📦 **${item.name}** (${epic ? "🟣 EPIC" : "🟡 LEGENDARY"}) và **${goldBonus} vàng**!${hint}`);
                } else {
                    messages.push(`✨ **Kho Báu Ẩn!** Bạn tìm thấy **${goldBonus} vàng**!`);
                }
            } else {
                state.forceBossNext = true;
                messages.push(`😈 **Bẫy!** *Một tên Boss hung tàn đang chờ đón ở tầng tiếp theo...*`);
            }
            break;
        }
    }

    return messages;
}

// ─────────────────────────────────────────────
// 8. COMBAT HELPERS
// ─────────────────────────────────────────────

function playerDamage(state: DungeonState): number {
    const enemyDef = state.enemy?.def ?? 0;
    const rawAtk = state.baseAtk;

    let dmg = calculatePipelineDamage(rawAtk, enemyDef);

    // Add randomness and crit (Luck influenced)
    const critChance = Math.min(0.75, 0.15 + (state.luck * 0.001));
    const isCrit = Math.random() < critChance;
    dmg = Math.floor(dmg * (isCrit ? 1.5 : 1) * (0.9 + Math.random() * 0.2));

    return Math.max(1, dmg);
}

// ─────────────────────────────────────────────
// 9. FLOOR TRANSITION
// ─────────────────────────────────────────────

function enterNextFloor(state: DungeonState) {
    state.currentFloor++;
    state.forceBossNext = false;
    // Clear logs for the next floor transition
    state.log = [];

    const newPhase = decidePhase(state);
    state.phase = newPhase;
    state.hasActedThisTurn = false;

    if (newPhase === "COMBAT" || newPhase === "BOSS" || newPhase === "FINAL_BOSS") {
        state.enemy = makeEnemy(state.currentFloor, newPhase);
        const goldBonus = Math.floor(50 * state.currentFloor);
        state.goldGained += goldBonus;
        state.log.push(`\n⚔️ **Tầng ${state.currentFloor}** — ${state.enemy.name} xuất hiện!`);
    } else {
        state.enemy = null;
    }
}

// ─────────────────────────────────────────────
// 10. SLASH COMMAND
// ─────────────────────────────────────────────

export const dungeonCommand: SlashCommand = {
    data: new SlashCommandBuilder()
        .setName("dungeon")
        .setDescription("Thám hiểm hầm ngục tương tác — Roguelike 10 tầng")
        .addIntegerOption(opt =>
            opt.setName("potions")
                .setDescription("Số Potion mang theo (tối đa 5)")
                .setMinValue(0).setMaxValue(5)
        )
        .addStringOption(opt =>
            opt.setName("type")
                .setDescription("Loại Potion dùng (mặc định ưu tiên Potion cao cấp)")
                .setAutocomplete(true)
        ) as any,

    async execute(interaction: ChatInputCommandInteraction) {
        const userId = interaction.user.id;

        if (activeSessions.has(userId)) {
            await interaction.reply({ content: "⚠️ Bạn đang trong hầm ngục! Hoàn thành lượt hiện tại trước.", ephemeral: true });
            return;
        }

        await interaction.deferReply();

        const user = await getUserWithRelations(userId);
        if (!user) {
            await interaction.editReply("Bạn chưa đăng ký. Dùng `/register` trước.");
            return;
        }

        const statusErr = checkUserStatusErrors(user, new Date());
        if (statusErr) { await interaction.editReply(statusErr); return; }

        if (user.inventory.length >= user.inventoryLimit) {
            await interaction.editReply(`❌ Túi đồ của bạn đã đầy (**${user.inventory.length}/${user.inventoryLimit}**). Hãy \`/inven\` để dọn dẹp bớt trước khi vào Hầm Ngục. Chết hoặc đầy túi trong hầm ngục sẽ rất đau đớn!`);
            return;
        }

        const potionQty = Math.min(5, (interaction.options as any).getInteger("potions") || 0);
        const selectedPotionName = (interaction.options as any).getString("type");

        // Deduct potions from DB (Find ANY type POTION)
        let foundPotionStack: any = null;
        if (potionQty > 0) {
            if (selectedPotionName) {
                foundPotionStack = user.inventory.find((i: any) => i.name === selectedPotionName && i.type === ItemType.POTION);
            } else {
                // Default: Best potion
                const allPotions = user.inventory.filter((i: any) => i.type === ItemType.POTION)
                    .sort((a: any, b: any) => (b.power || 0) - (a.power || 0));
                foundPotionStack = allPotions[0];
            }

            const owned = foundPotionStack?.quantity ?? 0;
            if (!foundPotionStack || owned < potionQty) {
                await interaction.editReply(`Bạn không có đủ **${selectedPotionName || "Potion"}** (có ${owned}, cần ${potionQty}). Mua thêm tại \`/shop\`.`);
                return;
            }
            await prisma.item.update({ where: { id: foundPotionStack.id }, data: { quantity: { decrement: potionQty } } });
        }

        // Build initial state using Pipeline
        const equippedItems = user.inventory.filter((i: any) => i.isEquipped);
        const equippedPets = user.beasts.filter((b: any) => b.isEquipped);
        const combatStats = computeCombatStats(
            { str: user.str, agi: user.agi, maxHp: user.maxHp, luck: user.luck },
            equippedItems,
            equippedPets
        );

        const baseAtk = combatStats.final.attack;
        const baseDef = combatStats.final.defense;

        // ─── Apply Buffs (Hunter's Mark, Steel Skin, etc.) ─────────────
        let floor1Atk = baseAtk;
        let floor1Def = baseDef;
        let floor1Str = user.str;
        let floor1Agi = user.agi;
        let floor1Luck = user.luck;
        let startHp = user.currentHp;
        let buffLogLines: string[] = [];

        const buffsToConsume = [
            { name: "Hunter's Mark", apply: () => { floor1Atk *= 1.30; buffLogLines.push("🎯 **Hunter's Mark** (+30% DMG) đã kích hoạt!"); } },
            { name: "Berserker Brew", apply: () => { floor1Atk *= 1.20; floor1Def *= 0.9; buffLogLines.push("🍷 **Berserker Brew** (+20% ATK, -10% DEF) đã kích hoạt!"); } },
            { name: "Guardian Elixir", apply: () => { floor1Def *= 1.20; floor1Agi *= 0.9; buffLogLines.push("🛡️ **Guardian Elixir** (+20% DEF, -10% AGI) đã kích hoạt!"); } },
            { name: "Steel Skin", apply: () => { floor1Def += 15; buffLogLines.push("🛡️ **Steel Skin** (+15 DEF) đã kích hoạt!"); } },
            { name: "Swift Tonic", apply: () => { floor1Agi += 15; buffLogLines.push("🍃 **Swift Tonic** (+15 AGI) đã kích hoạt!"); } },
            { name: "Luck Potion", apply: () => { floor1Luck += 20; buffLogLines.push("🍀 **Luck Potion** (+20 LUCK) đã kích hoạt!"); } },
            { name: "Lucky Charm", apply: () => { luckyCharmVal = 10; buffLogLines.push("🧧 **Lucky Charm** (+10% Rarity Bonus) đã kích hoạt!"); } },
            { name: "Blood Vial", apply: () => { floor1Str += 5; startHp = Math.max(1, startHp - 10); buffLogLines.push("🩸 **Blood Vial** (+5 STR, -10 HP) đã kích hoạt!"); } }
        ];

        let luckyCharmVal = 0;
        for (const b of buffsToConsume) {
            const has = user.inventory.find((i: any) => i.name === b.name && i.quantity > 0);
            if (has) {
                await prisma.item.update({ where: { id: has.id }, data: { quantity: { decrement: 1 } } });
                b.apply();
            }
        }

        // Determine equipped stats for hype text later
        const equippedWeapon = equippedItems.find((i: any) => i.type === "WEAPON");
        const equippedArmor = equippedItems.find((i: any) => i.type === "ARMOR");

        const state: DungeonState = {
            userId,
            currentFloor: 1,
            maxFloor: MAX_FLOOR,
            currentHp: startHp,
            maxHp: combatStats.final.maxHp,
            baseAtk: floor1Atk,
            potionsLeft: potionQty,
            potionPower: foundPotionStack?.power ?? 25,
            phase: "COMBAT",
            enemy: makeEnemy(1, "COMBAT"),
            log: [],
            hasActedThisTurn: false,
            goldGained: 0,
            forceBossNext: false,
            foundItems: [],
            playerWeaponPower: equippedWeapon?.power ?? 0,
            playerArmorDef: equippedArmor?.bonusDef ?? 0,
            baseDef: floor1Def,
            luck: floor1Luck,
            luckyCharmBonus: luckyCharmVal,
            userSkills: user.skills || [],
            userPets: equippedPets,
            petExpPool: new Map()
        };

        // Apply Initial Pet Synergy
        const startCtx: any = { player: { multipliers: { damage: 1, gold: 1, exp: 1, defense: 1 } } };
        applyPetSynergy(startCtx, equippedPets);
        state.baseAtk *= startCtx.player.multipliers.damage; // Simple merge for dungeon

        if (buffLogLines.length > 0) state.log.push(buffLogLines.join("\n"));
        state.log.push(`⚔️ **Tầng 1** — ${state.enemy!.name} xuất hiện!`);
        activeSessions.set(userId, state);

        const win = await runAutoCombat(interaction, state);
        
        if (!win) {
            await finishDungeon(interaction, state, false);
            return;
        }

        const embed = buildDungeonEmbed(state);
        await interaction.editReply({ embeds: [embed], components: [continueButton()] });
    }
};

// ─────────────────────────────────────────────
// 11. BUTTON HANDLER
// ─────────────────────────────────────────────

async function finishDungeon(interaction: ButtonInteraction | ChatInputCommandInteraction, state: DungeonState, isSuccess: boolean) {
    const userId = state.userId;
    activeSessions.delete(userId);
    activeEvents.delete(userId);

    const goldFinal = isSuccess ? state.goldGained : Math.floor(state.goldGained * 0.5);
    const expFinal = Math.floor(state.currentFloor * 60 * (isSuccess ? 1 : 0.6));

    let inventoryLog = "";
    if (isSuccess && state.foundItems.length > 0) {
        for (const item of state.foundItems) {
            const res = await addEquipmentToInventory(userId, {
                ...item,
                type: item.type as any,
                power: item.power ?? 0
            });
            if (res.added) {
                inventoryLog += `\n🎒 ${res.message}`;
            } else {
                inventoryLog += `\n⚠️ ${res.message}`;
            }
        }
    }

    await prisma.user.update({
        where: { id: userId },
        data: {
            currentHp: isSuccess ? Math.max(1, state.currentHp) : 0,
            lastHpUpdatedAt: new Date(),
            gold: { increment: goldFinal },
            exp: { increment: expFinal },
            ...(isSuccess
                ? {}
                : {
                    hospitalUntil: new Date(Date.now() + HOSPITAL_COOLDOWN_MS),
                  }),
        },
    }).catch(() => { });

    // ─── PET EXP GAIN (Dungeon) ───
    let petLvlLogs = "";
    for (const [petId, amount] of state.petExpPool.entries()) {
        const res = await addPetExp(petId, amount);
        if (res && res.leveledUp) {
            const pet = state.userPets.find((p: any) => p.id === petId);
            if (pet) petLvlLogs += `\n🎊 **${pet.name}** thăng lên -> **Cấp ${res.newLevel}**!`;
        }
    }

    const embed = new EmbedBuilder()
        .setColor(isSuccess ? 0x9b59b6 : 0xe74c3c)
        .setTitle(isSuccess ? "🏆 KHẢI HOÀN!" : "☠️ GỤC NGÃ")
        .setDescription(
            `**Tầng đạt được:** ${state.currentFloor}/${state.maxFloor}\n` +
            `❤️ HP còn lại: **${Math.max(0, state.currentHp)}/${state.maxHp}**\n` +
            `💰 Vàng nhận: **${goldFinal}**\n` +
            `⭐ EXP nhận: **${expFinal}**\n` +
            (isSuccess
                ? `\n**Chiến lợi phẩm:**${inventoryLog || " Không có gì mới."}`
                : `\n*Chết = mất 50% vàng nhặt được & MẤT SẠCH vật phẩm!*\n🏥 **Bệnh viện:** ${formatDuration(HOSPITAL_COOLDOWN_MS)} — dùng \`/revive\` (trả phí) hoặc chờ hết thời gian.`) +
            (petLvlLogs ? `\n\n**Tiến hóa sủng vật:**${petLvlLogs}` : "")
        )
        .setFooter({ text: "Dùng /dungeon lần nữa nếu bạn dám!" });

    const embedsToSend = [embed];

    if (isSuccess && state.foundItems.length > 0) {
        for (const item of state.foundItems) {
            if (item.rarity === "EPIC" || item.rarity === "LEGENDARY") {
                embedsToSend.push(buildHighTierDropEmbed(item, "Bạn đã mang thành công vật phẩm này khỏi Hầm Ngục!"));
            }
        }
    }

    if (interaction.replied || interaction.deferred) {
        await interaction.editReply({ embeds: embedsToSend, components: [] });
    } else {
        await interaction.reply({ embeds: embedsToSend, components: [] });
    }
}

export async function handleDungeonButton(interaction: ButtonInteraction): Promise<boolean> {
    const id = interaction.customId;
    const dungeonIds = [
        "dungeon_continue", "dungeon_event_choice_1", "dungeon_event_choice_2", 
        "dungeon_finish", "dungeon_rest"
    ];
    if (!dungeonIds.includes(id)) return false;

    const userId = interaction.user.id;
    const state = activeSessions.get(userId);

    if (!state) {
        await interaction.reply({ content: "❌ Không tìm thấy phiên hầm ngục. Dùng `/dungeon` để bắt đầu.", ephemeral: true });
        return true;
    }

    await interaction.deferUpdate();
    state.hasActedThisTurn = true;

    // ── CONTINUE → next floor ───────────────────
    if (id === "dungeon_continue") {
        enterNextFloor(state);
        state.hasActedThisTurn = false;

        if (state.phase === "EVENT") {
            const event = rollEvent(state);
            activeEvents.set(userId, event);

            const embed = buildDungeonEmbed(state);
            embed.setTitle(`📜 Tầng ${state.currentFloor} — ${event.title}`);
            embed.setDescription(event.description);

            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder().setCustomId("dungeon_event_choice_1").setLabel(event.choice1Label).setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId("dungeon_event_choice_2").setLabel(event.choice2Label).setStyle(ButtonStyle.Secondary)
            );
            await interaction.editReply({ embeds: [embed], components: [row] });
            return true;
        }

        if (state.phase === "COMBAT" || state.phase === "BOSS" || state.phase === "FINAL_BOSS") {
            const win = await runAutoCombat(interaction, state);
            if (!win) {
                await finishDungeon(interaction, state, false);
                return true;
            }
            const embed = buildDungeonEmbed(state);
            await interaction.editReply({ embeds: [embed], components: [actionButtons(state)] });
            return true;
        }

        const embed = buildDungeonEmbed(state);
        await interaction.editReply({ embeds: [embed], components: [actionButtons(state)] });
        return true;
    }

    // ── FINISH ───────────────────────────────────
    if (id === "dungeon_finish") {
        await finishDungeon(interaction, state, true);
        return true;
    }

    // ── REST (from event) ────────────────────────
    if (id === "dungeon_rest") {
        const heal = Math.floor(state.maxHp * (0.3 + Math.random() * 0.1));
        const before = state.currentHp;
        state.currentHp = Math.min(state.maxHp, state.currentHp + heal);
        state.log.push(`💤 Nghỉ ngơi, hồi **${state.currentHp - before}** HP.`);
        state.hasActedThisTurn = false;

        const embed = buildDungeonEmbed(state);
        await interaction.editReply({ embeds: [embed], components: [continueButton()] });
        return true;
    }

    // ── EVENT CHOICE 1 or 2 ──────────────────────
    if (id === "dungeon_event_choice_1" || id === "dungeon_event_choice_2") {
        const event = activeEvents.get(userId);
        if (!event) {
            state.hasActedThisTurn = false;
            const embed = buildDungeonEmbed(state);
            await interaction.editReply({ embeds: [embed], components: [continueButton()] });
            return true;
        }

        activeEvents.delete(userId);
        const choice = id === "dungeon_event_choice_1" ? 1 : 2;
        const messages = applyEventChoice(state, event, choice as 1 | 2);
        state.log.push(...messages);
        state.hasActedThisTurn = false;

        if (state.currentHp <= 0) {
            await finishDungeon(interaction, state, false);
            return true;
        }

        const embed = buildDungeonEmbed(state);
        await interaction.editReply({ embeds: [embed], components: [continueButton()] });
        return true;
    }

    return true;
}

export async function handleDungeonAutocomplete(interaction: any): Promise<void> {
    const userId = interaction.user.id;
    const user = await getUserWithRelations(userId);
    if (!user) {
        await (interaction as any).respond([]);
        return;
    }

    const focused = (interaction.options.getFocused() ?? "").toString().toLowerCase();
    
    // Find all unique potion names in user inventory
    const potions = user.inventory.filter((i: any) => i.type === ItemType.POTION);

    const suggestions = potions
        .filter((i: any) => i.name.toLowerCase().includes(focused))
        .map((i: any) => ({
            name: `${i.name} (x${i.quantity}) - Hồi ${i.power}% HP`,
            value: i.name
        }))
        .slice(0, 25);

    await interaction.respond(suggestions);
}

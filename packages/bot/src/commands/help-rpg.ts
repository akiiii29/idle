import {
  ActionRowBuilder,
  EmbedBuilder,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";

import {
  CAPTURE_TIMEOUT_MS,
  HOSPITAL_COOLDOWN_MS,
  HUNT_COOLDOWN_MS,
  HP_RECOVERY_INTERVAL_MS,
} from "@game/core";
import type { SlashCommand } from "../types/command";
import { formatDuration } from "../services/user-service";

const SECONDS = (ms: number) => Math.ceil(ms / 1000);

export const HELP_RPG_SELECT_ID = "help_rpg_section";

const PAGES = [
  "intro",
  "commands",
  "gear",
  "flow",
  "skills",
  "pets",
  "afk",
  "achievements",
  "combat",
  "talents",
  "quests",
  "dungeon",
] as const;

export type HelpRpgPage = (typeof PAGES)[number];

function isHelpRpgPage(v: string): v is HelpRpgPage {
  return (PAGES as readonly string[]).includes(v);
}

export interface HelpRpgContext {
  huntCd: number;
  captureT: number;
  hospitalT: string;
  passiveInterval: string;
}

function buildHelpRpgContext(): HelpRpgContext {
  return {
    huntCd: SECONDS(HUNT_COOLDOWN_MS),
    captureT: SECONDS(CAPTURE_TIMEOUT_MS),
    hospitalT: formatDuration(HOSPITAL_COOLDOWN_MS),
    passiveInterval: formatDuration(HP_RECOVERY_INTERVAL_MS),
  };
}

function buildSelectRow(current: HelpRpgPage): ActionRowBuilder<StringSelectMenuBuilder> {
  const opt = (
    value: HelpRpgPage,
    label: string,
    emoji: string
  ) =>
    new StringSelectMenuOptionBuilder()
      .setLabel(label)
      .setValue(value)
      .setEmoji(emoji)
      .setDefault(value === current);

  const menu = new StringSelectMenuBuilder()
    .setCustomId(HELP_RPG_SELECT_ID)
    .setPlaceholder("Chọn mục hướng dẫn…")
    .addOptions(
      opt("intro", "Giới thiệu & luật", "📖"),
      opt("commands", "Danh sách lệnh", "⌨️"),
      opt("gear", "Trang bị · Hầm ngục · Relic", "⚔️"),
      opt("flow", "Luồng chơi nhanh", "🚀"),
      opt("skills", "Kỹ năng · Shop · Auto-hunt", "📜"),
      opt("pets", "Pet & cộng hưởng", "🐾"),
      opt("afk", "Thu nhập AFK / offline", "💰"),
      opt("achievements", "Thành tựu & danh hiệu", "🏆"),
      opt("combat", "Giao diện combat & /upgrade", "✨"),
      opt("talents", "Thiên phú & Scrap", "🔯"),
      opt("quests", "Nhiệm vụ hàng ngày/tuần", "🎯"),
      opt("dungeon", "Hầm ngục chi tiết", "🏰")
    );

  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
}

function embedIntro(ctx: HelpRpgContext): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle("📖 Hướng dẫn RPG")
    .setDescription(
      "**Mục tiêu:** Đi `/hunt` để chiến đấu, nhặt rương, bắt thú → nhận EXP + vàng → nâng cấp.\n\n" +
        "**Luật quan trọng:**\n" +
        `• Cooldown đi săn: ~${ctx.huntCd}s\n` +
        `• Nút chạm trán: ${ctx.captureT}s hết hạn\n` +
        `• Bị gục → bệnh viện: ${ctx.hospitalT}\n` +
        `• Hồi máu thụ động: 1 HP / ${ctx.passiveInterval}\n` +
        `• **Reset Hằng Ngày**: Shop, Daily, Quest reset lúc **00:00 UTC+7**.\n` +
        `• **Thu nhập Offline**: Tích lũy 50 vàng/giờ (tối đa 12 giờ).\n`
    );
}

function embedCommands(): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0xe67e22)
    .setTitle("⌨️ Danh sách lệnh")
    .addFields(
      {
        name: "🏠 Cơ bản",
        value:
          "`/register` — Tạo nhân vật\n" +
          "`/profile` — Xem thẻ thợ săn\n" +
          "`/daily` — Nhận thưởng hằng ngày\n" +
          "`/quest` — Nhiệm vụ & nhận thưởng\n" +
          "`/setname` — Đổi tên thợ săn (1 lần)\n" +
          "`/quatanthu` — Nhận quà tân thủ",
        inline: true,
      },
      {
        name: "⚔️ Chiến đấu",
        value:
          "`/hunt manual` — Đi săn thủ công & bắt Pet\n" +
          "`/hunt auto` — Cày EXP/Vàng (Max 20 trận)\n" +
          "`/dungeon` — Hầm ngục (Chiến đấu tự động)\n" +
          "`/practice` — Luyện tập / xem log\n" +
          "`/skills` — Quản lý kỹ năng\n" +
          "`/beasts` — Quản lý thú cưng\n" +
          "`/synergies` — Xem tất cả bộ cộng hưởng\n" +
          "`/synergy` — Kiểm tra cộng hưởng của bạn",
        inline: true,
      },
      {
        name: "🎒 Trang bị & Vật phẩm",
        value:
          "`/inven` — Xem túi đồ\n" +
          "`/equip` — Mang vũ khí/giáp\n" +
          "`/unequip` — Tháo trang bị\n" +
          "`/use` — Dùng thuốc hồi máu\n" +
          "`/upgrade` — Nâng cấp trang bị tại Lò Rèn\n" +
          "`/scrap` — Phân giải đồ lấy Scrap (item / theo hiếm / trùng lặp)",
        inline: true,
      },
      {
        name: "🏪 Cửa hàng & Dịch vụ",
        value:
          "`/shop` — Cửa hàng (Vật phẩm hoặc Trang bị)\n" +
          "`/skill_shop` — Phòng tập kỹ năng (2000 vàng/skill)\n" +
          "`/tavern` — Quán trọ hồi HP\n" +
          "`/revive` — Thoát bệnh viện\n" +
          "`/stats` — Xem chỉ số & Breakdown",
        inline: true,
      },
      {
        name: "🏆 Thành tựu & Danh hiệu",
        value:
          "`/achievements` — Xem & nhận thành tựu\n" +
          "Trang bị danh hiệu để nhận buff chiến đấu.",
        inline: true,
      }
    );
}

function embedGear(): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0xe91e63)
    .setTitle("⚔️ Trang Bị  ·  🏰 Hầm Ngục  ·  🎲 Relic")
    .addFields(
      {
        name: "⚔️ Trang Bị",
        value:
          "• Mang **1 Vũ Khí** + **1 Giáp** + **2 Phụ kiện**\n" +
          "• Vũ Khí → Sát thương | Giáp → HP & Giảm ST\n" +
          "• Phụ kiện (Accessory) → Hút máu, Chí mạng...\n" +
          "• `/stats` để xem thống kê chi tiết lifesteal/crit.",
        inline: true,
      },
      {
        name: "🏰 Hầm Ngục (Auto)",
        value:
          "• **Chiến đấu Cinematic**: Tự động đánh từng lượt.\n" +
          "• **Auto-Potion**: Tự dùng máu khi dưới 30% HP.\n" +
          "• **Tiến trình**: Nhấn 'Tầng tiếp theo' sau mỗi trận thắng.\n" +
          "• Boss xuất hiện tại tầng **4, 8, 10**.",
        inline: true,
      },
      {
        name: "🎲 Thánh Tích (Relic)",
        value:
          "• Rơi ngẫu nhiên khi qua tầng (Tỉ lệ tăng dần).\n" +
          "• Buff chỉ số 'khủng' trong suốt chuyến đi Dungeon.\n" +
          "• Relic hiếm (Epic/Legendary) chỉ xuất hiện ở tầng 8+.",
        inline: false,
      }
    );
}

function embedFlow(): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0x2ecc71)
    .setTitle("🚀 Luồng chơi nhanh")
    .setDescription(
      "**1.** `/register` → Tạo nhân vật\n" +
        "**2.** `/profile` → Kiểm tra trạng thái\n" +
        "**3.** `/inven` + `/equip` → Mang đồ tốt nhất\n" +
        "**4.** `/hunt` hoặc `/dungeon` → Chiến đấu!\n" +
        "**5.** Máu thấp? → `/use` hoặc `/tavern start`\n" +
        "**6.** Bị gục? → `/revive` (tốn vàng = Max HP đồ + pet)\n\n" +
        "*Muốn đi săn ngay?* → `/tavern stop` để dừng nghỉ."
    );
}

function embedSkills(): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0x9b59b6)
    .setTitle("📜 Kỹ Năng · Cộng Hưởng · Mẹo Shop")
    .addFields(
      {
        name: "Kỹ Năng",
        value:
          "• Tối đa **5 skill** trang bị cùng lúc\n" +
          "• Trigger: `ON_ATTACK` · `ON_DEFEND` · `ON_TURN_START`\n" +
          "• Type: 💥DMG · 🔥DOT · 💨Dodge · 💚Heal · 🛡️Reduce · 🌀Chaos\n" +
          "• Mua kỹ năng mới: `/skill_shop` (đổi hàng hằng ngày)",
        inline: true,
      },
      {
        name: "Shop & Auto-Hunt",
        value:
          "• 🪤 Trap/Clover → tăng tỉ lệ bắt thú\n" +
          "• 🧪 **Auto-Potion**: Hệ thống tự dùng Potion khi **HP < 30%** (trong Hầm ngục & Săn tự động).\n" +
          "• 🐺 **Hunt Auto**: Cày EXP hối hả, quái sẽ mạnh hơn bạn (**Lv + 1~3**), tối đa 20 trận/lượt.",
        inline: true,
      }
    )
    .setFooter({ text: "⚔️ Cứ thử trước, hỏng thì đọc lại phần này!" });
}

function embedPets(): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0x1abc9c)
    .setTitle("🐾 Hệ Thống Sủng Vật (Pets) & Cộng Hưởng")
    .addFields(
      {
        name: "🐾 Phân Loại & Vai Trò",
        value:
          "• **DPS** · **TANK** · **SUPPORT**\n" +
          "• **Lục (Common)** → **Lam (Rare)** → **Tím (Epic)** → **Vàng (Legendary)**\n" +
          "• Mới: **European Pets** (Griffin, Fenrir, Cerberus...) với kỹ năng mạnh mẽ.",
        inline: true,
      },
      {
        name: "♻️ Quản Lý Pet",
        value:
          "• **Nâng cấp**: Dùng Tinh hoa (Essence) lên Max Level 10.\n" +
          "• **Phân rã**: Chuyển Pet không dùng thành Tinh hoa.\n" +
          "• **Hiến tế (Sacrifice)**: Hiến tế vĩnh viễn để nhận chỉ số Talent (DMG, HP, Healing...).",
        inline: true,
      },
      {
        name: "✨ Cộng Hưởng (Synergy)",
        value:
          "• **Role Combo**: 2 DPS (+15% Dmg), Tank+Support (Def & Heal).\n" +
          "• **Pet + Player**: Kết hợp Skill Pet và Skill Người để tạo hiệu ứng cực mạnh (Crit+Crit = x1.2 Dmg, Burn+Burn = x1.5 Burn Dmg).\n" +
          "• **Phẩm cấp**: 3 Pet cùng màu tăng 10% toàn bộ chỉ số.",
        inline: false,
      }
    );
}

function embedAfk(): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0xf1c40f)
    .setTitle("💰 Thu Nhập Ngoại Tuyến (AFK)")
    .addFields(
      {
        name: "📈 Cơ chế tích lũy",
        value:
          "• **Tỉ lệ**: 50 vàng / mỗi giờ treo máy.\n" +
          "• **Giới hạn**: Tối đa tích lũy trong 12 giờ.\n" +
          "• **Lưu ý**: Cần ít nhất 10 phút offline để có thể nhận thưởng.",
        inline: true,
      },
      {
        name: "🐾 Buff từ Pet (Equipped)",
        value:
          "• **DPS / TANK**: Mỗi Pet tăng +10% lượng vàng.\n" +
          "• **SUPPORT**: Mỗi Pet tăng thêm +1 giờ vào giới hạn tích lũy tối đa.",
        inline: true,
      },
      {
        name: "🚀 Cách nhận",
        value:
          "• Dùng lệnh `/afk` để kiểm tra và nhận vàng tích lũy (nếu lệnh đã được bật trên server).\n" +
          "• Mọi hành động (Hunt, Dungeon...) sẽ reset bộ đếm thời gian offline.",
        inline: false,
      }
    );
}

function embedAchievements(): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0xffd700)
    .setTitle("🏆 Hệ Thống Thành Tựu & Danh Hiệu")
    .addFields(
      {
        name: "📊 Cách hoạt động",
        value:
          "• Hoàn thành các mốc thành tựu để mở khóa **Danh Hiệu**.\n" +
          "• Cho phép trang bị **nhiều danh hiệu** cùng lúc:\n" +
          "  - **3 Common** | **3 Rare** | **2 Epic** | **1 Legendary**\n" +
          "• Toàn bộ chỉ số từ các danh hiệu đang mang sẽ được **cộng dồn**.",
        inline: true,
      },
      {
        name: "👑 Danh Hiệu (Title)",
        value:
          "• **Hiển thị**: Profile chỉ hiện **danh hiệu hiếm nhất** bạn đang mang.\n" +
          "• **Buff**: +ST, +Chí mạng, +Hút máu, +Vàng, +Sức mạnh Pet...\n" +
          "• Quản lý & Trang bị: Tắt/Mở tại `/achievements`.",
        inline: true,
      }
    );
}

function embedCombat(): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0x3498db)
    .setTitle("⚔️ Giao Diện Chiến Đấu · Nâng Cấp Trang Bị")
    .addFields(
      {
        name: "✨ Hiển thị kỹ năng & cộng hưởng",
        value:
          "• Sau trận đấu sẽ hiển thị **kỹ năng đã kích hoạt** (tối đa 3).\n" +
          "• **Cộng hưởng (Synergy)** giữa các kỹ năng/pet cũng được hiện rõ.\n" +
          "• Xem tất cả bộ cộng hưởng: `/synergies`\n" +
          "• Kiểm tra cộng hưởng hiện tại: `/synergy`",
        inline: true,
      },
      {
        name: "🔥 Combo & Sát thương",
        value:
          "• ≥3 kỹ năng kích hoạt → 🔥 **COMBO x3!**\n" +
          "• ≥5 kỹ năng kích hoạt → 🔥🔥 **ULTRA COMBO x5!**\n" +
          "• Sát thương hiển thị: Thường / 💥 CHÍ MẠNG / ⚡ Đa Đòn\n" +
          "• Kết quả hiện dạng **hoạt ảnh** theo từng bước.",
        inline: true,
      },
      {
        name: "⚒️ Nâng cấp trang bị",
        value:
          "• Dùng `/upgrade` để cường hóa vũ khí/giáp đang đeo.\n" +
          "• Tầng cao hơn → tỉ lệ thành công giảm, chi phí tăng.\n" +
          "• Tối đa **+10**. Thất bại không mất đồ.\n" +
          "• Theo dõi **fail count** để tăng tỉ lệ thành công.",
        inline: false,
      }
    );
}

function embedTalents(): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0x9b59b6)
    .setTitle("🔯 Hệ Thống Thiên Phú (Talents) & Scrap")
    .addFields(
      {
        name: "🔯 Thiên Phú (Talent)",
        value:
          "• **Hiến tế Pet** để nhận điểm thiên phú vĩnh viễn.\n" +
          "• **5 loại Talent**: DPS, TANK, SUPPORT, BURN, POISON.\n" +
          "• Mỗi điểm: **+1% đến +2%** chỉ số tương ứng.\n" +
          "• Talent được cộng vào **pipeline tính sát thương**.",
        inline: true,
      },
      {
        name: "♻️ Scrap (Phân Giải)",
        value:
          "• `/scrap` để phân giải trang bị không dùng.\n" +
          "• **3 chế độ**: Theo item / Theo rarity / Theo duplicate.\n" +
          "• Scrap dùng để **nâng cấp trang bị**.\n" +
          "• Item càng hiếm → càng nhiều Scrap.",
        inline: true,
      },
      {
        name: "💡 Mẹo",
        value:
          "• Hiến tế pet **không phù hợp** với build.\n" +
          "• Giữ lại pet **hiếm/có skill tốt**.\n" +
          "• Phân giải đồ **trùng lặp** hoặc không dùng.\n" +
          "• Cân nhắc trước khi nâng cấp đồ **rarity thấp**.",
        inline: false,
      }
    );
}

function embedQuests(): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0xf39c12)
    .setTitle("🎯 Hệ Thống Nhiệm Vụ (Quests)")
    .addFields(
      {
        name: "📋 Loại Nhiệm Vụ",
        value:
          "• **Daily Quests**: Reset hàng ngày lúc **00:00 UTC+7**.\n" +
          "• **Weekly Quests**: Reset hàng tuần.\n" +
          "• **Achievement Quests**: Dài hạn, mở khóa danh hiệu.\n" +
          "• Xem tiến độ: `/quest`",
        inline: true,
      },
      {
        name: "🎁 Phần Thưởng",
        value:
          "• **Vàng**: Tiền tệ chính để mua đồ.\n" +
          "• **Vật phẩm**: Equipment, potions, traps.\n" +
          "• **Danh hiệu**: Mở khóa titles mới.\n" +
          "• **Hiệu ứng đặc biệt**: Buffs hiếm.",
        inline: true,
      },
      {
        name: "📈 Theo Dõi Tiến Độ",
        value:
          "• Tiến độ **tự động cập nhật** qua hành động.\n" +
          "• `/quest` để xem nhiệm vụ đang thực hiện.\n" +
          "• Nhận thưởng khi **hoàn thành**.\n" +
          "• Đừng quên **claim** trước khi reset!",
        inline: false,
      }
    );
}

function embedDungeon(): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0xe74c3c)
    .setTitle("🏰 Hầm Ngục (Dungeon) Chi Tiết")
    .addFields(
      {
        name: "🎮 Cơ Chế Chơi",
        value:
          "• **Chiến đấu cinematic**: Tự động đánh từng lượt.\n" +
          "• **Auto-Potion**: Tự dùng máu khi **HP < 30%**.\n" +
          "• **Tiến trình**: Nhấn 'Tầng tiếp theo' sau mỗi trận thắng.\n" +
          "• Dùng `/dungeon` để bắt đầu.",
        inline: true,
      },
      {
        name: "👹 Boss Floors",
        value:
          "• **Tầng 4**: Boss đầu tiên.\n" +
          "• **Tầng 8**: Boss mạnh + Relic hiếm.\n" +
          "• **Tầng 10**: Boss cuối cùng.\n" +
          "• Boss có **chỉ số cao hơn** thường.",
        inline: true,
      },
      {
        name: "🎲 Thánh Tích (Relics)",
        value:
          "• **Rơi ngẫu nhiên** khi qua tầng.\n" +
          "• **Tỉ lệ tăng dần** theo tầng.\n" +
          "• **Epic/Legendary**: Chỉ xuất hiện tầng **8+**.\n" +
          "• Buff **khủng** trong suốt chuyến đi (ví dụ: +50% ATK).",
        inline: false,
      }
    );
}

function embedForPage(page: HelpRpgPage, ctx: HelpRpgContext): EmbedBuilder {
  switch (page) {
    case "intro":
      return embedIntro(ctx);
    case "commands":
      return embedCommands();
    case "gear":
      return embedGear();
    case "flow":
      return embedFlow();
    case "skills":
      return embedSkills();
    case "pets":
      return embedPets();
    case "afk":
      return embedAfk();
    case "achievements":
      return embedAchievements();
    case "combat":
      return embedCombat();
    case "talents":
      return embedTalents();
    case "quests":
      return embedQuests();
    case "dungeon":
      return embedDungeon();
    default:
      return embedIntro(ctx);
  }
}

export async function handleHelpRpgSelect(interaction: import("discord.js").StringSelectMenuInteraction): Promise<boolean> {
  if (interaction.customId !== HELP_RPG_SELECT_ID) {
    return false;
  }

  const raw = interaction.values[0];
  if (!raw || !isHelpRpgPage(raw)) {
    return true;
  }

  try {
    await interaction.deferUpdate();
    const ctx = buildHelpRpgContext();
    await interaction.editReply({
      embeds: [embedForPage(raw, ctx)],
      components: [buildSelectRow(raw)],
    });
  } catch (e) {
    console.error("help_rpg select error", e);
  }
  return true;
}

export const helpRpgCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("help_rpg")
    .setDescription("Hướng dẫn chi tiết cho người mới chơi."),

  async execute(interaction) {
    const ctx = buildHelpRpgContext();
    await interaction.reply({
      ephemeral: true,
      embeds: [embedIntro(ctx)],
      components: [buildSelectRow("intro")],
    });
  },
};

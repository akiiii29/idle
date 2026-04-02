import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

import {
  CAPTURE_TIMEOUT_MS,
  HOSPITAL_COOLDOWN_MS,
  HUNT_COOLDOWN_MS,
  HP_RECOVERY_INTERVAL_MS,
  TAVERN_GOLD_PER_HP,
  TAVERN_HEAL_HP_PER_MIN,
} from "../constants/config";
import type { SlashCommand } from "../types/command";
import { formatDuration } from "../services/user-service";

const SECONDS = (ms: number) => Math.ceil(ms / 1000);

export const helpRpgCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("help_rpg")
    .setDescription("Hướng dẫn chi tiết cho người mới chơi."),

  async execute(interaction) {
    const huntCd = SECONDS(HUNT_COOLDOWN_MS);
    const captureT = SECONDS(CAPTURE_TIMEOUT_MS);
    const hospitalT = formatDuration(HOSPITAL_COOLDOWN_MS);
    const passiveInterval = formatDuration(HP_RECOVERY_INTERVAL_MS);

    const tavernHealPerMin = TAVERN_HEAL_HP_PER_MIN;
    const tavernHealTickMs = 60_000 / TAVERN_HEAL_HP_PER_MIN;
    const tavernCostPerHp = TAVERN_GOLD_PER_HP;

    const embed1 = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("Hướng dẫn RPG (Người mới)")
      .setDescription(
        "Mục tiêu của bạn: tham gia **/hunt** để chiến đấu/nhặt rương/bắt thú, nhận EXP + vàng, rồi nâng cấp nhân vật.\n\n" +
          "**Luật quan trọng:**\n" +
          `- Cooldown đi săn: ~${huntCd}s\n` +
          `- Nút chạm trán (Taming/Chest): ${captureT}s (hết là không bấm được)\n` +
          `- Bị gục -> bệnh viện: ${hospitalT}\n` +
          `- Hồi máu thụ động (khi không bận & không ở bệnh viện): 1 HP mỗi ${passiveInterval}\n`
      )
      .setFooter({ text: "Cứ thử trước, hỏng thì đọc phần mục lục dưới." });

    const embed2 = new EmbedBuilder()
      .setColor(0xe67e22)
      .setTitle("Danh sách lệnh & cách dùng")
      .addFields(
        {
          name: "1) /register",
          value: "Tạo hồ sơ nhân vật cho bạn.",
          inline: false,
        },
        {
          name: "2) /profile",
          value:
            "Xem trạng thái hiện tại: Cấp độ, Vàng, Máu, Thuộc tính, Kỹ năng, Túi đồ, và thời gian còn lại của cooldown / Hospital / Quán trọ.",
          inline: false,
        },
        {
          name: "3) /daily",
          value: "Nhận vàng hằng ngày hoặc nhận ngẫu nhiên item (theo tỷ lệ hệ thống).",
          inline: false,
        },
        {
          name: "4) /hunt",
          value:
            "Đi săn quái thú.\n" +
            "**Tùy chọn:**\n" +
            `- traps: số lượng *Hunter Traps* bạn muốn dùng (0 → 10)\n` +
            `- clovers: số lượng *Lucky Clovers* bạn muốn dùng (0 → 10)\n\n` +
            "Khi đi săn, bot sẽ quyết định kết quả theo xác suất: Combat / Treasure Chest / Wild Beast.",
          inline: false,
        },
        {
          name: "5) /use",
          value:
            "Dùng vật phẩm hồi máu trong túi đồ.\n" +
            "Ví dụ: **Wild Meat** / **Potion** / **Basic Potion** (tất cả đều hồi máu bằng `power`).\n\n" +
            "Bạn có thể gõ vài ký tự và bot sẽ tự gợi ý (autocomplete).",
          inline: false,
        },
        {
          name: "6) /quest",
          value:
            "Xem nhiệm vụ đang hoạt động và nhận thưởng khi hoàn thành.\n" +
            "Nếu có nút nhận thưởng, bạn bấm trực tiếp.",
          inline: false,
        },
        {
          name: "7) /shop",
          value:
            "Cửa hàng thương nhân lưu động.\n" +
            `- Mỗi ngày có **5 slots**\n` +
            "- Nút 🔄 *Làm mới* giá **500 vàng** để thay thế toàn bộ 5 slot bằng hàng mới.",
          inline: false,
        },
        {
          name: "8) /tavern",
          value:
            "Nghỉ ở quán trọ để hồi HP theo thời gian.\n" +
            `- Tốc độ hồi: ${tavernHealPerMin} HP/phút (mỗi ${formatDuration(tavernHealTickMs)} )\n` +
            `- Chi phí: ${tavernCostPerHp} vàng / 1 HP hồi\n\n` +
            "**Tùy chọn:**\n" +
            "- hp: bạn muốn hồi tối đa bao nhiêu HP (mặc định hồi đến full).",
          inline: false,
        },
        {
          name: "9) /revive",
          value:
            "Chỉ dùng khi đang ở bệnh viện.\n" +
            `- Trả **vàng = maxHp** để rời bệnh viện ngay lập tức và đầy máu.`,
          inline: false,
        }
      );

    // Fix up shop field without placeholder width
    // (We keep it simple by rewriting embed2 description-like section using an extra small embed.)
    const embedShop = new EmbedBuilder()
      .setColor(0xe67e22)
      .setTitle("Shop & Làm mới (Chi tiết)")
      .setDescription(
        "• Shop làm mới mỗi ngày lúc **00:00 UTC**.\n" +
          "• Mỗi ngày có **5 vị trí**.\n" +
          "• Bấm nút **🔄 Làm mới (500v)** để thay thế toàn bộ 5 slot bằng hàng mới.\n"
      );

    const embed3 = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle("Luồng chơi nhanh (khuyên dùng)")
      .addFields(
        {
          name: "Bước 1: Tạo nhân vật",
          value: "Gõ `/register`.",
          inline: false,
        },
        {
          name: "Bước 2: Xem trạng thái",
          value: "Gõ `/profile` để biết bạn còn bao lâu thì săn được, còn máu bao nhiêu.",
          inline: false,
        },
        {
          name: "Bước 3: Chuẩn bị cho /hunt",
          value:
            "Dùng Hunter Traps để tăng cơ hội *bắt*.\nDùng Lucky Clovers để tăng Luck (tác động xác suất theo hệ thống).\n" +
            "Nếu máu thấp: dùng `/use` hoặc `/tavern`.",
          inline: false,
        },
        {
          name: "Bước 4: Bấm nút trong 30 giây",
          value:
            "Nếu xuất hiện nút Taming / Chest, bạn phải bấm trong khoảng **30 giây**.\nHết thời gian thì nút sẽ không còn tác dụng.",
          inline: false,
        },
        {
          name: "Bước 5: Nếu bị gục",
          value:
            "Bạn bị đưa vào bệnh viện trong " +
            hospitalT +
            ".\nTrong thời gian đó HP không hồi thụ động.\nMuốn thoát nhanh: `/revive` (vàng = maxHp).",
          inline: false,
        }
      );

    const embed4 = new EmbedBuilder()
      .setColor(0xf1c40f)
      .setTitle("Vật phẩm trong Shop (Tóm tắt tác dụng)")
      .setDescription(
        "• Hunter Trap (+1 tame chance) / Rare Trap (+5)\n" +
        "• Lucky Clover (+1 Luck khi đi săn) / Four-Leaf Clover (+5)\n" +
        "• Basic Potion: hồi 10 HP ngay lập tức / Potion: hồi 25 HP ngay lập tức\n\n" +
        "• Scout Lens: dự báo event đi săn tiếp theo trước khi /hunt\n" +
        "• Risk Coin: nhân phần thưởng vàng của lượt đi săn (ngẫu nhiên 0x/1.5x/2x/5x)\n" +
        "• Blood Vial: mất 10 HP để nhận +5 STR cho lượt đi săn kế tiếp\n" +
        "• Hunter's Mark: +30% sát thương chiến đấu cho lượt kế tiếp\n" +
        "• Reinforced Bag: tăng giới hạn hành trang tối đa vĩnh viễn (+5 mỗi món)\n" +
        "• Beast Bait: tăng xác suất gặp quái hiếm ở lượt kế tiếp\n" +
        "• Golden Contract: kẻ địch mạnh gấp đôi, nhưng phần thưởng tăng mạnh\n" +
        "• Chaos Orb: ngẫu nhiên +10 hoặc -10 cho STR/AGI/LUCK (tất cả cùng chung 1 cú lắc)\n" +
        "• Spirit Bond: tăng bonus của pet mạnh nhất (cho ~3 lượt đi săn)\n\n" +
        "Ghi nhớ: chỉ các item hồi máu như `Wild Meat`/`Potion`/`Basic Potion` dùng được bằng `/use`."
      );

    await interaction.reply({
      ephemeral: true,
      embeds: [embed1, embed2, embedShop, embed3, embed4],
    });
  },
};


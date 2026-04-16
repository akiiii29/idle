# 👹 Dungeons & Events System

Tài liệu này giải thích về các hoạt động đi rạch (Dungeon), leo tầng và hệ thống Thánh Vật (Relics).

---

## 🏛️ 1. Dungeon Mechanics
Lệnh `/dungeon` cho phép người chơi thám hiểm một ngục tối 10 tầng. Logic trong `packages/bot/src/services/dungeon-service.ts` (gọi `simulateCombat()` từ `@game/core`):
*   **Floors**: Mỗi tầng tăng độ khó (1.1x-1.12x Mob HP/ATK mỗi tầng).
*   **Checkpoint**: Sau mỗi 5 tầng, người chơi có thể ra ngoài hoặc tiếp tục.
*   **Daily Entry**: Miễn phí hoặc trả vàng để vào lại.

---

## 🎲 2. Floor Types & Events
Mỗi tầng ngục tối là một trong các loại sau:
*   **Battle**: Đánh quái vật thường.
*   **Boss**: Tầng 4, 8, 10 gặp boss mạnh mẽ (Final Boss ở tầng 10).
*   **Event (Mystery)**: Các lựa chọn ngẫu nhiên (chọn cánh cửa, cầu xin thánh vật, hồi máu).
*   **Rest**: Hồi 30-50% HP.
*   **Shop (Merchant)**: Mua vật phẩm đặc biệt trong rạch.

---

## 🗿 3. Relic System (Dungeon Only)
Thánh Vật (Relics) là các buff cực mạnh nhưng **chỉ tồn tại trong lượt đi dungeon đó**. Định nghĩa trong `@game/core` (`constants/relic-pool.ts`):
*   **Rarity**: Common, Rare, Epic, Legendary.
*   **Types**: DAMAGE_BOOST, LIFESTEAL, BURN_BOOST, POISON_BOOST, CRIT_BOOST, SPD_BOOST, v.v.
*   **Relic Synergy**: Kết hợp các thánh vật cùng bộ sẽ mở khóa hiệu ứng ẩn (trong `@game/core` — `relic-synergy.ts`).

---

## ⚔️ 4. Dungeon Combat (Auto & Manual)
*   **Auto-Combat**: Tự động đánh và dùng Potion khi máu thấp (<30%).
*   **Combat Logs**: Combat logs được hiển thị lần lượt từng tầng để người chơi theo dõi.
*   **Death**: Nếu chết trong rạch, người chơi mất toàn bộ Thánh Vật đã nhặt và phải bắt đầu lại từ tầng 1.

---

## 🎁 5. Dungeon Rewards
*   **Loot**: Vật phẩm rớt từ Boss tầng cao thường là đồ Epic/Legendary.
*   **Gold & XP**: Cao hơn nhiều so với săn quái thường (`hunt`).
*   **Relics**: Nhặt được relic ngẫu nhiên sau khi giết quái.

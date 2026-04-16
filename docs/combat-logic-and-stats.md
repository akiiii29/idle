# ⚔️ Combat Logic & Stats System

Tài liệu này giải thích sâu về trái tim của Idle RPG: Hệ thống tính toán chỉ số (Pipeline) và bộ máy chiến đấu (Combat Engine).

---

## 🏗️ 1. Damage Pipeline (Cách Tính Chỉ Số)
Quy trình tính toán `Final Attack` và `Final Defense` (Nằm trong `@game/core` — `stats-service.ts`) tuân theo một chuỗi tuyến tính (Pipeline):

### Giai đoạn 1: Base & Flat Stats
1.  **Base Stats**: Lấy các chỉ số STR, AGI, LUCK thô của người dùng.
2.  **Equipment Power**: Trang bị cộng chỉ số phẳng (Bonus STR/AGI) và sức mạnh tấn công (Weapon Power). Bao gồm cả chỉ số từ nâng cấp (`upgradeLevel`).
3.  **Pet Power**: Sủng vật được chuyển đổi sức mạnh (Power) thành Pet ATK/DEF thông qua `calculatePetStatBonus` từ `@game/core`.
4.  **Accessory Stats**: Phụ kiện (2 slot) cung cấp các chỉ số đặc biệt (Lifesteal, Crit Chance, Crit Damage, v.v.).

### Giai đoạn 2: Title Scaling
5.  **Pet Power Buff**: Các danh hiệu có hiệu ứng `petPower` (ví dụ: +15%) sẽ được nhân trực tiếp vào `Pet ATK/DEF` **trước** khi tính chỉ số dẫn xuất.
6.  **Title Stacking**: Nhiều danh hiệu có thể được trang bị cùng lúc (giới hạn theo phẩm cấp: 3 Common, 3 Rare, 2 Epic, 1 Legendary). Chỉ số từ tất cả danh hiệu được **cộng dồn**.

### Giai đoạn 3: Derived Stats (Chỉ số dẫn xuất)
7.  **Biến đổi chỉ số thô**:
    *   `Raw ATK = (STR * 0.5) + Weapon Power + (AGI * 0.3) + Pet ATK`
    *   `Raw DEF = Armor DEF + Pet DEF`
    *   `Raw HP = Base HP + Equipment HP + Pet HP`

### Giai đoạn 4: Multiplier Stacking (Nhân chỉ số)
8.  **Gộp các Multipliers**: Toàn bộ các buffs phần trăm (%) từ Danh hiệu, Cộng hưởng Pet (Synergy), Thiên phú (Talents), Trang sức (Accessories), Kỹ năng (Skills) và Buff tạm thời được **cộng dồn (stack)** lại với nhau cho từng loại chỉ số: Sát thương (Damage), Thủ (Defense), Máu (HP), Chí mạng (Crit Dmg), Hút máu (Lifesteal), Đốt/Độc (Burn/Poison Multiplier).
    *   *Công thức*: `1.0 (Base) + Titles + Synergies + Talents + Acc + Skills = Total Multiplier`

### Giai đoạn 5: Final Stats
9.  **Sát thương cuối**: `Final Stats = Derived Stats * Total Multiplier`. Đây là con số hiển thị trong lệnh `/stats`.

---

## ⚡ 2. Combat Engine (Bộ Máy Chiến Đấu)
Bộ máy `simulateCombat` trong `@game/core` (`combat-engine.ts`) xử lý logic theo từng lượt. Đây là **pure function** — không có Discord.js hay Prisma.

### Quy Trình Mỗi Lượt (Turn Loop)
1.  **Resolve Turn Effects**: Xử lý các hiệu ứng duy trì (DoT - Burn, Poison, Bleed) và hồi phục (HoT).
2.  **Turn Start Phase**: Kích hoạt các kỹ năng/hiệu ứng thú cưng có trigger `ON_TURN_START`.
3.  **Action Phase**:
    *   **Thứ tự tấn công**: Dựa trên tốc độ (`SPD`). Người nhanh hơn ra đòn trước.
    *   **Tấn công (Attack)**:
        *   Tính `Base Damage` dựa trên công thức giảm trừ giáp: `Def / (Def + 100)` (Capped 75%).
        *   Kiểm tra `Crit Rate`. Nếu trúng, nhân với `Crit Damage Multiplier`.
        *   Kiểm tra kỹ năng `ON_ATTACK`. Nếu kích hoạt, cộng dồn sát thương bồi thêm (`bonusDamage`).
        *   **Log bóc tách**: Sát thương gốc và sát thương kỹ năng được áp dụng và log riêng biệt để người dùng nhìn rõ.
4.  **Lifesteal**: Sau khi gây sát thương, lượng máu hút được tính trên tổng dame thực nhận và hồi lại cho người chơi.
5.  **Reflect**: Nếu đối thủ có phản đạn, một phần dame sẽ dội ngược lại người tấn công.
6.  **Cleanup**: Giảm thời gian tác dụng (turns) của các hiệu ứng buff/debuff.

### Kỹ Năng Chiến Đấu (Skill System)
Hệ thống kỹ năng cho phép người chơi trang bị tối đa **5 kỹ năng** cùng lúc. Logic trong `@game/core` (`skill-system.ts`):
*   **Trigger Types**:
    *   `ON_ATTACK`: Kích hoạt khi tấn công
    *   `ON_DEFEND`: Kích hoạt khi phòng thủ
    *   `ON_TURN_START`: Kích hoạt đầu mỗi lượt
*   **Skill Types**:
    *   💥 **DAMAGE**: Gây sát thương bổ sung
    *   🔥 **DOT / BURN / POISON**: Gây sát thương theo thời gian
    *   💨 **DODGE**: Né đòn tấn công
    *   💚 **HEAL / SHIELD**: Hồi máu hoặc tạo khiên
    *   🛡️ **REDUCE_DAMAGE**: Giảm sát thương nhận vào
    *   🌀 **CHAOS**: Hiệu ứng đặc biệt
    *   ⚔️ **COUNTER**: Phản công
    *   💉 **LIFESTEAL**: Hút máu bổ sung
*   **Advanced Mechanics**:
    *   Multi-hit (đa đòn), guaranteed crit, self-damage skills
    *   HP threshold triggers (trên/dưới ngưỡng HP nhất định)
    *   Scale với max HP hoặc pet stats
    *   Stackable effects (tối đa stack quy định)

---

## 🐾 3. Pet & Synergy System
Hệ thống sủng vật không chỉ tăng chỉ số mà còn cung cấp **Cộng hưởng (Synergy)**. Logic trong `@game/core` (`pet-synergy.ts`, `pet-system.ts`):
*   **Pet System**: Mỗi loại pet (DPS, Tank, Support) đóng góp tỉ lệ stats khác nhau.
*   **Pet Roles**:
    *   **DPS**: Tăng sát thương
    *   **TANK**: Tăng phòng thủ và HP
    *   **SUPPORT**: Hỗ trợ hồi phục và buff
*   **Pet Rarity**: Lục (Common) → Lam (Rare) → Tím (Epic) → Vàng (Legendary)
*   **Pet Management**:
    *   **Nâng cấp**: Dùng Tinh hoa (Essence) lên Max Level 10
    *   **Phân rã**: Chuyển Pet không dùng thành Tinh hoa
    *   **Hiến tế (Sacrifice)**: Nhận điểm thiên phú vĩnh viễn
*   **Pet Synergy**: Xảy ra khi có sự kết hợp đúng của sủng vật hoặc sự kết hợp giữa Player-Pet.
*   **Synergy Buffs**: Cộng thêm % sát thương, xuyên giáp 100% (True Damage), hoặc tăng lượng máu hút được cực cao.

---

## 🔯 4. Talent System (Sacrifice)
Hệ thống thiên phú là cơ chế nâng cấp vĩnh viễn. Logic trong `@game/core` (`leveling.ts`):
*   Khi người chơi hiến tế (sacrifice) một sủng vật, họ nhận được **Talent Points** tương ứng với hệ của sủng vật đó.
*   **Talent Categories**:
    *   **Talent DPS**: +1% đến +2% sát thương mỗi điểm
    *   **Talent TANK**: +1% đến +2% phòng thủ/HP mỗi điểm
    *   **Talent SUPPORT**: +1% đến +2% hồi phục/healing mỗi điểm
    *   **Talent BURN**: +1% đến +2% sát thương đốt mỗi điểm
    *   **Talent POISON**: +1% đến +2% sát thương độc mỗi điểm
*   Mỗi điểm cộng vĩnh viễn vào chỉ số tương ứng trong chuỗi Pipeline.

---

## 🎯 5. Quest System (Nhiệm Vụ)
Hệ thống nhiệm vụ cung cấp mục tiêu và phần thưởng cho người chơi. Logic trong `packages/bot/src/services/quest-service.ts`:
*   **Daily Quests**: Reset hàng ngày lúc 00:00 UTC+7
*   **Weekly Quests**: Reset hàng tuần
*   **Achievement Quests**: Nhiệm vụ thành tựu dài hạn
*   **Reward Types**: Vàng, vật phẩm, danh hiệu, hiệu ứng đặc biệt
*   **Progress Tracking**: Theo dõi tiến độ tự động qua các hành động

---

## 🏆 6. Achievement & Title System
*   **Achievements**: Hoàn thành các mốc để mở khóa danh hiệu. Logic trong `packages/bot/src/services/achievement-service.ts`.
*   **Title Slots**: Giới hạn theo phẩm cấp (3 Common, 3 Rare, 2 Epic, 1 Legendary)
*   **Title Buffs**: +ST, +Chí mạng, +Hút máu, +Vàng, +Sức mạnh Pet, v.v. Danh hiệu được định nghĩa trong `@game/core` (`constants/titles.ts`).
*   **Stacking Rule**: Tất cả danh hiệu đang mang được cộng dồn chỉ số
*   **Display**: Profile hiển thị danh hiệu hiếm nhất đang mang

---

## ⚒️ 7. Equipment Upgrade System
Hệ thống nâng cấp trang bị tại Lò Rèn (`/upgrade`). Logic trong `packages/bot/src/services/upgrade-service.ts`:
*   **Upgrade Levels**: +1 đến +10
*   **Success Rate**: Giảm theo từng tầng nâng cấp
*   **Cost**: Tăng dần theo cấp số nhân
*   **No Loss**: Thất bại không mất đồ, chỉ mất tài nguyên
*   **Fail Count**: Theo dõi số lần thất bại để tăng tỉ lệ thành công

---

## ♻️ 8. Scrap System
Hệ thống phân giải trang bị (`/scrap`). Logic trong `packages/bot/src/services/inventory-service.ts`:
*   **Phân giải theo item**: Chọn vật phẩm cụ thể
*   **Phân giải theo rarity**: Phân giải toàn bộ đồ theo độ hiếm
*   **Phân giải duplicate**: Phân giải các vật phẩm trùng lặp
*   **Scrap Usage**: Dùng để nâng cấp trang bị hoặc các tính năng tương lai

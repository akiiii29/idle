# ⚔️ RPG Combat Damage Pipeline

Tài liệu này giải thích chi tiết quy trình tính toán chỉ số (Stats) và sát thương (Damage) trong hệ thống RPG, từ các chỉ số cơ bản đến con số cuối cùng hiển thị trên màn hình.

---

## 1. Hệ Thống Chỉ Số Gốc (Base Stats)
Mọi nhân vật đều bắt đầu với 4 chỉ số cơ bản:
*   **STR (Sức mạnh)**: Ảnh hưởng lớn nhất đến tấn công vật lý.
*   **AGI (Nhanh nhẹn)**: Ảnh hưởng đến tốc độ ra đòn và một phần sát thương.
*   **LUCK (May mắn)**: Quyết định tỉ lệ Chí mạng (Crit Rate = `Luck * 0.5%`).
*   **HP (Sinh mệnh)**: Lượng máu tối đa cơ bản.

---

## 2. Giai Đoạn Tính Toán Chỉ Số Phẳng (Flat Multipliers)
Trước khi tính ra Attack, hệ thống sẽ gom toàn bộ các chỉ số "phẳng" từ trang bị và sủng vật:
1.  **Trang bị (Weapon/Armor)**: Lấy `power` và các chỉ số `bonusStr`, `bonusAgi`. Vũ khí có thêm `Weapon Power`. Chỉ số được tăng cường qua hệ thống nâng cấp (`upgradeLevel`).
2.  **Phụ kiện (Accessories)**: 2 slot phụ kiện cung cấp các chỉ số đặc biệt như Lifesteal, Crit Chance, Crit Damage, v.v.
3.  **Sủng vật (Pets)**: Chuyển đổi `Pet Power` thành `Pet ATK` và `Pet DEF`.
4.  **Danh hiệu (Titles)**: Một số danh hiệu có hiệu ứng `petPower` (ví dụ: +15%). Hiệu ứng này sẽ nhân trực tiếp vào `Pet ATK` trước khi bước vào giai đoạn tiếp theo. Nhiều danh hiệu có thể trang bị cùng lúc và chỉ số được cộng dồn.
    *   *Công thức*: `Effective Pet ATK = Base Pet ATK * (1 + Title Pet Power Bonus)`

---

## 3. Giai Đoạn Tính Toán Chỉ Số Dẫn Xuất (Derived Stats)
Đây là bước tính ra chỉ số Tấn công và Phòng thủ "thô" (Raw Stats):
*   **Raw ATK** = `(STR * 0.5)` + `Weapon Power` + `(AGI * 0.3)` + `Pet ATK`
*   **Raw DEF** = `Phòng thủ trang bị` + `Pet DEF`
*   **Raw HP** = `HP cơ bản` + `HP từ trang bị` + `HP từ pet`
*   **Raw Speed** = `AGI tổng`

---

## 4. Hệ Thống Nhân Chỉ Số (Multipliers)
Hệ thống sẽ cộng dồn (Stack) tất cả các phần trăm cộng thêm từ nhiều nguồn khác nhau:
1.  **Danh hiệu (Titles)**: Sát thương chủ động, Vàng, Chí mạng, Hút máu... (Có giới hạn slot theo phẩm cấp: 3 Common, 3 Rare, 2 Epic, 1 Legendary).
2.  **Cộng hưởng Pet (Pet Synergy)**: Ví dụ: "Double DPS" (+15% Dmg).
3.  **Thiên phú (Talents)**: Chỉ số vĩnh viễn từ việc hiến tế Pet (+1% mỗi Pet).
4.  **Trang sức (Accessories)**: Chỉ số từ trang sức và hiệu ứng bộ (Set Bonus).
5.  **Kỹ năng (Skills)**: Buff từ kỹ năng đang được trang bị và kích hoạt.
6.  **Vật phẩm tiêu hao (Buffs)**: Các loại thuốc tăng lực dùng trong trận.

*Quy tắc cộng*: Các chỉ số cùng loại (ví dụ: Damage %) sẽ được **cộng dồn** trước khi nhân với chỉ số thô.
*Ví dụ*: Title (+10%) + Talent (+5%) + Skill (+10%) = +25% Damage Multiplier (`x1.25`).

---

## 5. Quy Trình Tính Sát Thương Trong Trận (Combat Engine)
Khi một đòn đánh được tung ra, các bước sau sẽ được thực hiện:

### Bước A: Tính Final ATK của lượt đó
`Final ATK = Raw ATK * Tổng Multiplier %`
*(Có thể cộng thêm Berserk hoặc các hiệu ứng kỹ năng kích hoạt trong lượt đó)*.

### Bước B: Kiểm tra Chí mạng (Critical Hit)
Nếu tung ra đòn chí mạng:
`Sát thương = Final ATK * (1.5 + Thưởng thêm từ trang bị/danh hiệu/kỹ năng)`

### Bước C: Đi qua Giáp mục tiêu (Mitigation)
Hệ thống sử dụng công thức Diminishing Returns để tính tỉ lệ giảm thương:
`Tỉ lệ giảm thương = DEF / (DEF + 100)`
*   *Lưu ý*: Tỉ lệ này bị giới hạn tối đa (Cap) ở mức **75%**.

### Bước D: Sát thương cuối cùng (Final Damage)
`Final Damage = Final ATK * (1 - Tỉ lệ giảm thương)`

---

## 6. Các Nguồn Sát Thương Phụ (Extra Damage)
Ngoài đòn đánh chính, sát thương còn đến từ:
*   **Đốt/Độc (Burn/Poison)**: Gây sát thương vào đầu mỗi lượt dựa trên ATK của người chơi hoặc % Máu quái.
*   **Chảy máu (Bleed)**: Hiệu ứng DoT đặc biệt với tick damage tức thì hoặc theo lượt.
*   **Sát thương kỹ năng (Bonus Damage)**: Các kỹ năng như "Heavy Blow" hoặc "Execute" gây ra một lượng sát thương cố định cộng thêm, được log riêng biệt để dễ theo dõi.
*   **Đa đòn (Multi-Hit)**: Một số kỹ năng cho phép tấn công nhiều lần trong 1 lượt.
*   **Phản đòn (Counter)**: Tự động tấn công lại khi bị tấn công.

---

## 7. Cơ Chế Hồi Phục (Lifesteal & Healing)
*   **Lifesteal**: `Hồi phục = Sát thương thực nhận trên mục tiêu * (Tỉ lệ Hút máu từ danh hiệu/kỹ năng/phụ kiện)`
    *   *Ví dụ*: Gây 1000 dame, có 20% Hút máu -> +200 HP.
*   **Heal Skills**: Kỹ năng hồi phục có thể scale với max HP hoặc pet stats.
*   **Shield**: Khiên bảo vệ, hấp thụ sát thương trước khi vào HP thật.
*   **Auto-Potion**: Tự động dùng thuốc khi HP < 30% (trong Dungeon và Auto-Hunt).

---

## 8. Kỹ Năng Chiến Đấu (Skill System)
Người chơi có thể trang bị tối đa **5 kỹ năng** cùng lúc:

### Trigger Types
*   **ON_ATTACK**: Kích hoạt khi người chơi tấn công
*   **ON_DEFEND**: Kích hoạt khi người chơi bị tấn công
*   **ON_TURN_START**: Kích hoạt ở đầu mỗi lượt

### Skill Categories
*   💥 **DAMAGE**: Gây sát thương bổ sung (multiplier dựa trên ATK)
*   🔥 **DOT / BURN / POISON**: Gây sát thương theo thời gian (nhiều lượt)
*   💨 **DODGE**: chance né đòn tấn công hoàn toàn
*   💚 **HEAL**: Hồi phục HP dựa trên % max HP hoặc fixed amount
*   🛡️ **SHIELD / REDUCE_DAMAGE**: Giảm sát thương nhận vào
*   🌀 **CHAOS**: Hiệu ứng đặc biệt (thay đổi trận đấu)
*   ⚔️ **COUNTER**: Tự động phản công khi bị đánh
*   💉 **LIFESTEAL**: Tăng cường hút máu

### Advanced Mechanics
*   **HP Threshold Triggers**: Chỉ kích hoạt khi HP trên/dưới ngưỡng nhất định
*   **Target HP Triggers**: Hiệu quả hơn khi mục tiêu HP thấp
*   **Stackable Effects**: Có thể chồng nhiều lần (có giới hạn stack)
*   **Guaranteed Crit**: Một số skill đảm bảo chí mạng
*   **Self Damage**: Skill gây tổn thương bản thân để đổi lấy sức mạnh
*   **Scale with Stats**: Sát thương scale với max HP, pet stats, hoặc số skill đã kích hoạt

---

## 9. Thánh Tích (Relic System)
*   **Relics** là các vật phẩm đặc biệt rơi ngẫu nhiên khi vượt qua tầng trong Dungeon.
*   **Tỉ lệ rơi**: Tăng dần theo tầng, cao nhất ở tầng 8+.
*   **Hiệu ứng**: Buff chỉ số "khủng" trong suốt chuyến đi Dungeon.
*   **Độ hiếm**: Epic/Legendary relics chỉ xuất hiện ở tầng 8+.
*   **Ví dụ**: +50% ATK, +30% HP, Double Lifesteal, v.v.

---

*Tài liệu này được cập nhật theo phiên bản Patch: Multi-Title Stacking System & Skill Enhancement.*

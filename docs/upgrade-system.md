# Cấu trúc Hệ thống Nâng cấp & Phân giải Trang bị (Scrap & Upgrade System)

Dưới đây là bản thiết kế hệ thống chi tiết, tối ưu hoá cho Discord RPG (Node.js/Prisma), bao gồm công thức toán học cân bằng kinh tế và flow code (Pseudocode) sẵn sàng để đưa vào thực tế.

---

## PHẦN 1 — HỆ THỐNG PHÂN GIẢI (SCRAP SYSTEM)

### 1. Chuẩn hóa Điểm chỉ số (Stat Scoring)

Trang bị trong game có các chỉ số phân bổ khác nhau. HP thường có giá trị hàng trăm, trong khi DEF có giá trị nhỏ nhưng ảnh hưởng đến tỷ lệ giảm sát thương phần trăm.

**Công thức:**
```typescript
statScore = power + bonusStr + bonusAgi + (bonusDef * 1.5) + (bonusHp * 0.25)
```

**Giải thích Trọng số:**
*   `X = 1.5` (trọng số của DEF): Chỉ số phòng thủ làm giảm tổng sát thương nhận vào theo công thức biên độ mỏng `def / (def + 100)`. 10 DEF đầu game mang lại giá trị sinh tồn lớn hơn 10 HP rất nhiều. Do đó, điểm DEF cần được nhân hệ số 1.5 để phản ánh đúng tác động của nó lên cấp độ khó của game.
*   `Y = 0.25` (trọng số của HP): HP là một bể máu khổng lồ. Việc cộng 100 HP thường dễ dàng hơn nhiều so với việc kiếm 10 Power hay 10 DEF (Ví dụ: Level up hoặc trang bị). Việc chia 4 (nhân 0.25) giúp đưa 100 HP về tương đương với 25 Power/STR/AGI, không để đồ buff HP cày nát hệ thống Scrap.

### 2. Thu lượng Phế liệu (Scrap Calculation)

Định nghĩa hệ số Rarity (rarityMultiplier) phi tuyến tính nhằm đẩy mạnh giá trị cho hàng hiếm lúc Late Game:

*   **COMMON**: 1.0
*   **RARE**: 2.5
*   **EPIC**: 6.0
*   **LEGENDARY**: 15.0

**Công thức chung:**
```typescript
// Lấy chẵn xuống
scrap = Math.floor(statScore * rarityMultiplier) 
```

### 3. Kiểm chứng độ Cân bằng (Balance Validation)

| Loại trang bị | Chỉ số cơ bản | Tính toán statScore | Phế liệu (Scrap) thu được |
| :--- | :--- | :--- | :--- |
| **Vũ khí Common** | 10 Power | `10` | 10 * 1.0 = **10 Scrap** |
| **Vũ khí Rare** | 25 Power, 5 STR | `30` | 30 * 2.5 = **75 Scrap** |
| **Vũ khí Epic** | 55 Power, 15 STR | `70` | 70 * 6.0 = **420 Scrap** |
| **Giáp Legendary** | 30 DEF, 200 HP | `30*1.5 + 200*0.25 = 95` | 95 * 15.0 = **1425 Scrap** |

**Vì sao cân bằng?** 
Một món Legendary dù không có Power hay STR rốt cuộc vẫn mang lại khả năng chống chịu cực cao (200HP + 30DEF). Với `statScore` là 95 kết hợp hệ số x15 cực khủng của Legendary, nó nhả ra lượng Scrap tương xứng với công sức farm boss/Raid. Ngược lại, việc spam Auto-Hunt map Newbie ra hàng chục thanh kiếm Common cũng chỉ đổi được lượng Scrap bọt bèo (10 / thanh), triệt tiêu hoàn toàn nạn Bot Farm.

### 4. Quy tắc Chống Lạm phát (Anti-Exploit Rules)

**Tỷ giá cố định:** `1 Scrap = 5 Gold`

Kiểm tra vòng lặp vô hạn (Phân giải → Upgrade → Phân giải để cày lời):
*   Nâng cấp Vũ Khí Epic lên +1 tốn: `(0 + 1) * 300 * 6.0 = 1800 Gold`
*   Phân giải Epic +0 được: **420 Scrap (Giá trị 2100 Gold)**
*   Epic +1 có stat cao hơn 10% -> statScore tầm 77 -> Scrap = **462 (Giá trị 2310 Gold)**
*   Lợi nhuận rã đồ = 2310 - 2100 = 210 Gold (Sản phẩm thặng dư).
*   Chi phí bỏ ra để thu được 210 Gold thặng dư = 1800 Gold (Đầu tư lỗ vốn).
*   **Trạng thái:** Lỗ sấp mặt (-1590 Gold). Không có khả năng vắt kiệt hệ thống.

### 5. Lệnh Tương tác UX (UX Commands)
*   `/scrap item <ID_hoặc_Tên>`: Phân giải 1 vật phẩm chỉ định.
*   `/scrap rarity <COMMON/RARE/EPIC/LEGENDARY>`: Phân giải toàn bộ trang bị rác theo cấp độ hiếm.
*   `/scrap duplicates`: Phân giải những vật phẩm trùng tên (giữ lại 1 món có Upgrade Level cao nhất).

---

## PHẦN 2 — TÍCH HỢP CHI PHÍ NÂNG CẤP (UPGRADE COST INTEGRATION)

**Cơ chế:** Luôn trừ Scrap trong người trước, thiếu bao nhiêu mới bù bằng tiền mặt (Gold).

**Đoạn lệnh Pseudocode:**
```typescript
const SCRAP_VALUE_IN_GOLD = 5;

// Formula hiện tại: cost = (level + 1) * 300 * rarityMultiplier
let baseGoldCost = (item.upgradeLevel + 1) * 300 * rarityMultipliers[item.rarity];

let remainingGoldCost = baseGoldCost;
let scrapToUse = 0;
let goldToUse = 0;

const totalScrapValue = user.scrap * SCRAP_VALUE_IN_GOLD;

if (totalScrapValue >= remainingGoldCost) {
    // Nếu Scrap đủ trả 100% bill
    scrapToUse = Math.ceil(remainingGoldCost / SCRAP_VALUE_IN_GOLD);
    remainingGoldCost = 0; 
} else {
    // Tuốt sạch Scrap, phần dư gõ vào túi Gold
    scrapToUse = user.scrap;
    remainingGoldCost -= (scrapToUse * SCRAP_VALUE_IN_GOLD);
    goldToUse = remainingGoldCost;
}

// Transaction giảm trừ Database
await tx.user.update({
    where: { id: userId },
    data: {
        scrap: { decrement: scrapToUse },
        gold: { decrement: goldToUse }
    }
});
```

---

## PHẦN 3 — ĐƯỜNG CONG TỶ LỆ THÀNH CÔNG (SUCCESS RATE CURVE)

Đường cong bậc thang (Progressive Curve) giảm dần, tạo cảm giác an toàn đầu game và máu me đỏ đen ở late game:

```typescript
function getBaseSuccessRate(currentLevel: number): number {
    if (currentLevel < 3) return 1.0;   // +0 -> +1, +1 -> +2, +2 -> +3: Rate 100%
    if (currentLevel < 5) return 0.8;   // +3 -> +4, +4 -> +5: Rate 80%
    if (currentLevel < 7) return 0.6;   // +5 -> +6, +6 -> +7: Rate 60%
    if (currentLevel < 9) return 0.4;   // +7 -> +8, +8 -> +9: Rate 40%
    return 0.2;                         // +9 -> +10 trở lên: Rate 20%
}
```

---

## PHẦN 4 & 5 — HÌNH PHẠT VÀ HỆ THỐNG BẢO HIỂM (FAIL PENALTY & PITY)

*   **Hình phạt rớt cấp (Downgrade):** Rớt 1 Level chính xác cho mỗi lần đập xịt (Sàn đáy là +0).
*   **Bonus tỷ lệ rớt cấp (Fail Streak Bonus):** Thêm **10% (0.1)** vào tỷ lệ thành công cho đợt đập vũ khí đó ở lần tiếp theo.
*   **Bảo hiểm tuyệt đối (Pity System):** Xịt đúng 5 lần liên tục => nhắm mắt auto qua (100% Guarantee).

> Quản trị Database: Khởi tạo schema `Item` thêm field `failCount Int @default(0)` để theo dõi sát mỗi trang bị (chống lợi dụng bug chuyền tay cho người khác).

**Đoạn lệnh Pseudocode:**
```typescript
const FAIL_BONUS_RATE = 0.10; // 10%
const MAX_FAILS = 5;

let baseRate = getBaseSuccessRate(item.upgradeLevel);
let totalRate = baseRate + (item.failCount * FAIL_BONUS_RATE);

// Pity Caps Trigger
if (item.failCount >= MAX_FAILS) {
    totalRate = 1.0; 
} else if (totalRate > 1.0) {
    totalRate = 1.0;
}

const diceRoll = Math.random(); // 0.0 to 1.0
const isSuccess = diceRoll <= totalRate;

if (isSuccess) {
    item.upgradeLevel += 1;
    item.failCount = 0; // Tẩy Karma xui xẻo
} else {
    // Trừng phạt nhưng giữ failCount để an ủi
    item.upgradeLevel = Math.max(0, item.upgradeLevel - 1);
    item.failCount += 1; 
}

await tx.item.update({
   where: { id: item.id },
   data: { upgradeLevel: item.upgradeLevel, failCount: item.failCount }
});
```

---

## PHẦN 6 — KỊCH BẢN THỰC CHIẾN MẪU (FULL FLOW EXAMPLE)

**Bối cảnh:** 
*   **Người chơi:** Vô Danh
*   **Mục tiêu:** Up "Kiếm Epic" từ +5 lên +8.
*   **Định phí:** Kéo từ +5 lên +6 tốn: `(5 + 1) * 300 * 6.0` = **10,800 Gold.**
*   **Ví:** Có 1000 Scrap, 50,000 Gold. Trang bị hiện có `failCount = 0`.

**Cuộc hành trình:**

*   **Lần 1 (+5 -> +6):**
    *   **Thanh toán:** Hệ thống tự động mổ 1000 Scrap trước (được 5000 Gold equivalent). Trừ thêm 5,800 Gold mặt. Kể từ giờ người chơi cạn sạch Scrap (= 0).
    *   **Tỷ lệ Roll:** Rate nền +5 là 60%. (0 Fail count). Tổng = 60%.
    *   **Kết quả/Lò sấy:** Roll RNG ra 0.70 -> **THẤT BẠI**.
    *   **Hậu quả:** Kiếm đứt mảnh, rớt xuống **+4**. Tích tụ `failCount` = 1.

*   **Lần 2 (+4 -> +5):**
    *   **Thanh toán:** Vũ khí đã rớt cấp nên mức phí rẻ hơn: `5 * 300 * 6.0` = **9,000 Gold**.
    *   **Tỷ lệ Roll:** Rate nền của +4 là 80%. Nhờ lúc nãy xịt 1 nháy nên Bonus Rate = 10%. Tổng = 90%.
    *   **Kết quả/Lò sấy:** Roll RNG ra 0.23 -> **THÀNH CÔNG**.
    *   **Hậu quả:** Kiếm lên lại **+5**. Ánh sáng chói lòa tảy hết đen đủi -> Reset `failCount` = 0.

*   **Lần 3 (+5 -> +6):**
    *   **Thanh toán:** Lại tốn **10,800 Gold**.
    *   **Tỷ lệ Roll:** Cửa ải tâm lý (60%), không có bảo hiểm (0) => Tổng = 60%.
    *   **Kết quả/Lò sấy:** Roll RNG ra 0.40 -> **THÀNH CÔNG**.
    *   **Hậu quả:** Cuối cùng cũng vượt ải thành công lên **+6**. `failCount` = 0.

*   **Lần 4 (+6 -> +7):**
    *   **Thanh toán:** Tốn `7 * 300 * 6.0` = **12,600 Gold**.
    *   **Tỷ lệ Roll:** Rate nền +6 vững ở mức 60%.
    *   **Kết quả/Lò sấy:** Roll RNG ra 0.55 -> **THÀNH CÔNG**. Vũ khí bước vào ngưỡng **+7**.

*   **Lần 5 (+7 -> +8):**
    *   **Thanh toán:** Tốn `8 * 300 * 6.0` = **14,400 Gold**.
    *   **Tỷ lệ Roll:** Rate nền cho cấp 7 bắt đầu tụt thảm hại, chỉ còn **40%**.
    *   *Người chơi bước vào chuỗi ngày đen tối... Xịt rớt xuống +6, đập lên lại +7 và lại xịt rớt về +6... Cho đến khi `failCount` chạm mốc 5.*

*   **Lần X (Kích hoạt Đặc Quyền Pity):**
    *   Lúc này thanh kiếm đang nằm chỏng trơ ở +6, tốn cả đống tiền, nhưng `failCount` đã là 5. Cố đập lên +7.
    *   **Tỷ lệ Roll:** Tổng vượt quá 100% do chạm mức Max Fails (1.0 theo cơ chế Guarantee).
    *   **Kết quả/Lò sấy:** Hệ thống **ÉP THÀNH CÔNG** đẩy kiếm lên **+7** mà không cần may mắn. Lại reset `failCount` = 0 và cuộc hành trình chinh phục +8 tiếp tục.

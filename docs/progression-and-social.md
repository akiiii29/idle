# 🏆 Progression & Social Systems

Tài liệu này giải thích về các hệ thống thăng tiến nhân vật, thành tựu, nhiệm vụ và các chỉ số tích lũy lâu dài.

---

## 📈 1. Leveling & XP System
*   **XP Requirements**: Được tính qua `requiredExpForLevel(lvl)` trong `@game/core` (`services/leveling.ts`).
*   **XP Scaling**: Độ khó tăng dần theo cấp số cộng và nhân để tránh việc người chơi "vượt cấp" quá nhanh ở giai đoạn cuối (Late Game).
*   **Bonus XP**: Đến từ vật phẩm tiêu hao (Buff), Danh hiệu (+expGain), và Quà tân thủ.

---

## 🏆 2. Achievement & Title System
Hệ thống thành tựu là cơ chế mở khóa Title vĩnh viễn. Logic trong `packages/bot/src/services/achievement-service.ts`:
*   **Achievement Tracking**: Mọi hành động chiến đấu (Crit, Hút máu, Tiêu diệt quái, Nhặt vàng) đều được lưu trữ và cộng dồn điểm thành tựu.
*   **Unlockable Titles**: Khi đạt đủ mốc, người chơi nhận được danh hiệu (Titles) tương ứng. Định nghĩa Titles trong `@game/core` (`constants/titles.ts`).
*   **Multi-Title Stacking**:
    *   Người chơi không chỉ mang 1 danh hiệu mà có thể **trang bị nhiều danh hiệu cùng lúc**.
    *   **Slot Limits**: 3 Common | 3 Rare | 2 Epic | 1 Legendary.
    *   **Cumulative Buffs**: Toàn bộ chỉ số từ các danh hiệu đang mang sẽ được **cộng dồn** vào Pipeline.
*   **Prestige Display**: Trong profile, bot tự động chọn danh hiệu có **phẩm cấp cao nhất** để hiển thị (Legendary > Epic > Rare > Common).

---

## 📜 3. Quest System
*   **Types**: Nhiệm vụ hàng ngày và hàng tuần (Daily/Weekly Quests). Logic trong `packages/bot/src/services/quest-service.ts`.
*   **Tracking**: Theo dõi tiến độ hoàn thành (ví dụ: Miết 10 quái, kiếm 1000 vàng).
*   **Rewards**: Thường là Vàng (Gold), Đá nâng cấp (Upgrade Stones), hoặc Rương vật phẩm (Chests).
*   **Reset Time**: Toàn bộ nhiệm vụ được reset hàng ngày lúc **00:00 (UTC+7)**.

---

## 🛡️ 4. User Interaction & Identity
*   **Name Change**: Người chơi có 1 lần đổi tên duy nhất (Name Change item).
*   **Profiles**: Lệnh `/profile` hiển thị thẻ Canvas chi tiết về tình trạng hiện tại, kinh nghiệm, và thú nuôi mạnh nhất.
*   **Hospital & Tavern**: Người chơi sẽ vào viện (phục hồi) nếu thua trận hoặc vào tửu quán (nhận buff exp/gold) khi nghỉ ngơi.

---

## 💎 5. Thu nhập ngoại tuyến (AFK / Offline)
Logic trong `packages/bot/src/services/offline-service.ts`:
*   **Vàng**: Cơ bản **50 vàng/giờ** trong thời gian không tương tác với bot; tối đa tích **12 giờ** (Support pet mỗi con +1 giờ trần).
*   **Pet đang trang bị**: DPS/TANK mỗi con **+10%** vàng offline; SUPPORT tăng trần thời gian tích như trên.
*   **Ngưỡng nhận**: Cần ít nhất **10 phút** offline (`MIN_CLAIM_INTERVAL_MS`) mới đủ điều kiện claim.
*   **Lệnh nhận**: Khi triển khai, thường qua `/afk` (xem `/help_rpg` → mục AFK); mọi lệnh chơi game cập nhật `lastActiveAt` và reset bộ đếm offline.

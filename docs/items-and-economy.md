# 🎒 Items & Economy System

Tài liệu này giải thích chi tiết về kho đồ, chỉ số trang bị, hệ thống rương (Chest) và kinh tế trong Idle RPG.

---

## 📦 1. Inventory & Equipment Slots
Mọi vật phẩm (Items) được lưu trữ trong `Inventory` model (liên kết với User qua Prisma):
*   **Slots**: Người chơi có giới hạn kho đồ (Max 50+).
*   **Categories**:
    *   **WEAPON**: Cộng `Primary Power` và `Str/Agi`.
    *   **ARMOR**: Cộng `Def` và `Hp`.
    *   **ACCESSORY**: Cộng `% Multipliers` (Crit Rate, Dmg, v.v.) và hiệu ứng độc nhất.
    *   **CONSUMABLE**: Potion (HP), Elixir (Buff), Chest (Rương).

---

## 💎 2. Economy Logic
*   **Gold Acquisition**: Nhận được từ đi săn (`hunt`), đi rạch (`dungeon`), quà tân thủ, và AFK.
    *   *Buffs*: Danh hiệu có `goldGain` (ví dụ: +20%) sẽ cộng dồn và nhân vào lượng vàng gốc.
*   **Shop System**: Danh sách vật phẩm trong `@game/core` (`constants/item-pool.ts`).
    *   **Marketplace**: Mua vật phẩm cơ bản bằng vàng. Logic trong `packages/bot/src/services/shop-service.ts`.
    *   **Skill Shop**: Mua sách kỹ năng (Skill Books). Reset ngẫu nhiên hàng ngày lúc **00:00 (UTC+7)**.

---

## 🛠️ 3. Upgrade System (Nâng Cấp)
Logic trong `packages/bot/src/services/upgrade-service.ts`:
*   **Upgrade Stones**: Cần đá cường hóa để tăng cấp cho Vũ khí và Giáp.
*   **Scaling**: Mỗi cấp cường hóa (`+1, +2...`) tăng **10% chỉ số thô** của vật phẩm đó.
*   **Success Rate**: Tỉ lệ thành công giảm dần ở các cấp cao. Khi thất bại:
    *   Giữ nguyên cấp (Cấp 1-5).
    *   Giảm 1 cấp (Cấp 6+).
    *   Bảo hiểm (Protection Stone): Ngăn việc giảm cấp.

---

## 💍 4. Accessory & Set System
Trang sức (Accessories) là endgame gear. Định nghĩa trong `@game/core` (`constants/accessory-config.ts`):
*   **Slots**: Tối đa 2 slot trang sức (Thường là Nhẫn và Dây chuyền).
*   **Set Bonus**: Khi trang bị 2/3 món cùng một bộ (v.v. Sun Set, Moon Set), người chơi nhận được buff cực mạnh (ví dụ: +25% sát thương crit).
*   **Unique Powers**: Một số trang sức có hiệu ứng đặc biệt:
    *   **Berserk**: Tăng dame khi máu thấp
    *   **Block**: Chặn 1 đòn tấn công mỗi 3 lượt
    *   **Crit Execute**: +30% crit damage khi enemy HP < 50%

---

## 🎁 5. Loot & Chest System
*   **Chest Rarity**: Common, Rare, Epic, Legendary.
*   **Drop Pool**: Rương chứa tỉ lệ rơi vật phẩm theo phẩm cấp tương ứng. Logic trong `packages/bot/src/services/chest-service.ts`.
*   **Source**: Rơi ngẫu nhiên từ săn quái vật hoặc mua trong shop.

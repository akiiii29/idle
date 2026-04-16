# 🐺 Hunting System (Hệ thống Săn Bắn)

Tài liệu này giải thích chi tiết về cơ chế Săn bắn (Hunt) - nguồn thu nhập và kinh nghiệm (XP) chính của người chơi.

---

## ⚔️ 1. Các Chế Độ Săn Bắn

### A. Săn Thủ Công (`/hunt`)
*   **Cơ chế**: Người chơi gặp ngẫu nhiên một quái vật phù hợp với cấp độ.
*   **Hồi chiêu (Cooldown)**: 5 phút mỗi lần săn (`HUNT_COOLDOWN_MS`).
*   **Ưu điểm**: Có thể xem trực tiếp diễn biến trận đấu qua Embed cập nhật liên tục (Interaction-based).

### B. Săn Tự Động (Auto Hunt)
*   **Cơ chế**: Cho phép người chơi thực hiện chuỗi trận đấu liên tục mà không cần can thiệp từng bước.
*   **Giới hạn**: Tối đa **20 trận đấu** mỗi lần chạy (`maxFights = 20`).
*   **Hồi phục**: Người chơi có thể mang theo Potion để tự động hồi phục khi máu thấp (**<30% HP**).
*   **Log**: Kết quả được tổng hợp thành một báo cáo cuối cùng bao gồm tổng Vàng, Exp và vật phẩm nhặt được.

---

## 👹 2. Quái Vật & Độ Khó
Hệ thống quái vật được sinh ra dựa trên sức mạnh của người chơi:
*   **Cấp độ quái**: `Cấp người chơi + (1 đến 3)`. Điều này đảm bảo việc đi săn luôn có độ thử thách và phần thưởng xứng đáng.
*   **Chỉ số quái**: HP và ATK của quái vật tăng trưởng tuyến tính theo cấp độ.
*   **Newbie Buff**: Đối với người chơi dưới cấp 5 (`lvl < 5`), quái vật sẽ bị giảm 30% HP để hỗ trợ giai đoạn khởi đầu.

---

## 💰 3. Hệ Thống Phần Thưởng (Rewards)
Phần thưởng sau mỗi trận thắng được tính toán qua `combat-system.ts`:

### A. Công thức Vàng (Gold)
`Vàng = (Cơ bản + (Cấp quái * 10)) * Buff Tân thủ * Buff Danh hiệu`
*   **Buff Tân thủ**: x2 Vàng cho người chơi dưới cấp 5.
*   **Buff Danh hiệu**: Cộng dồn toàn bộ chỉ số `goldGain` từ tất cả các danh hiệu đang trang bị.

### B. Kinh nghiệm (Exp)
`Exp = (Cơ bản + (Cấp quái * 5)) * Buff Tân thủ`
*   Độ khó của quái càng cao, lượng Exp nhận được càng lớn.

---

## 📈 4. Tích Hợp Thành Tựu (Achievements)
Mọi hành động trong khi săn đều được ghi nhận ngay lập tức vào database:
*   Số lần tiêu diệt quái (Thợ săn quái thú).
*   Số đòn chí mặt (Crit Master).
*   Lượng máu đã hút (Blood Feast).
*   Số lượng rương nhặt được trong quá trình săn.

---

## 🏥 5. Rủi Ro Thất Bại
*   **Vào viện (Hospital)**: Nếu người chơi hết máu (HP <= 0), họ sẽ bị đưa vào bệnh viện để hồi phục trong 30 phút.
*   **Hồi phục**: Người chơi có thể dùng vật phẩm (Potions) hoặc chờ thời gian phục hồi để tiếp tục đi săn.
*   **Mất mát**: Khi thua trận, người chơi không nhận được Vàng/Exp và phải chịu thời gian chờ hồi phục.

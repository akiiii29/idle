import type { Rarity } from "../types/rpg-enums";

export const BEAST_LIBRARY: Record<Rarity, string[]> = {
  COMMON: ["Sói Rừng", "Cua Đá", "Nấm Độc", "Dơi Hang", "Chuột Chũi", "Chim Sẻ", "Rùa Cạn", "Bọ Hung"],
  RARE: ["Hổ Vằn", "Gấu Xám", "Cáo Tuyết", "Đại Bàng", "Rắn Hổ Mang", "Khỉ Đột", "Nai Sừng Tấm", "Cá Sấu"],
  EPIC: ["Lân Tinh", "Hỏa Ngưu", "Băng Long Con", "Phượng Hoàng Non", "Sư Tử Vàng", "Tê Giác Thép", "U Minh Miêu"],
  LEGENDARY: ["Rồng Thần", "Huyền Vũ", "Phượng Hoàng Lửa", "Bạch Hổ", "Kỳ Lân", "Thiên Bằng", "Tử Thần Khuyển"]
};

import { Rarity } from "@prisma/client";

export const BEAST_LIBRARY: Record<Rarity, string[]> = {
  [Rarity.COMMON]: ["Sói Rừng", "Cua Đá", "Nấm Độc", "Dơi Hang", "Chuột Chũi", "Chim Sẻ", "Rùa Cạn", "Bọ Hung"],
  [Rarity.RARE]: ["Hổ Vằn", "Gấu Xám", "Cáo Tuyết", "Đại Bàng", "Rắn Hổ Mang", "Khỉ Đột", "Nai Sừng Tấm", "Cá Sấu"],
  [Rarity.EPIC]: ["Lân Tinh", "Hỏa Ngưu", "Băng Long Con", "Phượng Hoàng Non", "Sư Tử Vàng", "Tê Giác Thép", "U Minh Miêu"],
  [Rarity.LEGENDARY]: ["Rồng Thần", "Huyền Vũ", "Phượng Hoàng Lửa", "Bạch Hổ", "Kỳ Lân", "Thiên Bằng", "Tử Thần Khuyển"]
};

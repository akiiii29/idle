import { Rarity } from "@prisma/client";

export type PetRole = "DPS" | "TANK" | "SUPPORT";

export interface PetConfig {
  name: string;
  role: PetRole;
  skillType: string;
  skillPower: number;
  trigger: "ON_ATTACK" | "ON_DEFEND" | "ON_TURN_START";
  rarity: Rarity;
  description: string;
}

export const PET_CONFIGS: Record<string, PetConfig> = {
  // COMMON
  "Sói Rừng": { name: "Sói Rừng", role: "DPS", skillType: "DAMAGE", skillPower: 0.1, trigger: "ON_ATTACK", rarity: Rarity.COMMON, description: "Cú cắn xé cơ bản tăng sát thương." },
  "Cua Đá": { name: "Cua Đá", role: "TANK", skillType: "REDUCE_DAMAGE", skillPower: 0.05, trigger: "ON_DEFEND", rarity: Rarity.COMMON, description: "Vỏ cứng giúp giảm sát thương nhận vào." },
  "Nấm Độc": { name: "Nấm Độc", role: "SUPPORT", skillType: "DOT", skillPower: 0.05, trigger: "ON_ATTACK", rarity: Rarity.COMMON, description: "Phát tán bào tử gây sát thương theo thời gian." },
  "Dơi Hang": { name: "Dơi Hang", role: "DPS", skillType: "HEAL", skillPower: 0.03, trigger: "ON_ATTACK", rarity: Rarity.COMMON, description: "Hút máu đối thủ để hồi phục nhẹ." },
  "Chuột Chũi": { name: "Chuột Chũi", role: "TANK", skillType: "SHIELD", skillPower: 0.05, trigger: "ON_TURN_START", rarity: Rarity.COMMON, description: "Đào hang tạo lớp chắn bảo vệ." },
  "Chim Sẻ": { name: "Chim Sẻ", role: "SUPPORT", skillType: "DODGE", skillPower: 0.05, trigger: "ON_DEFEND", rarity: Rarity.COMMON, description: "Linh hoạt né tránh đòn tấn công." },
  "Rùa Cạn": { name: "Rùa Cạn", role: "TANK", skillType: "REDUCE_DAMAGE", skillPower: 0.08, trigger: "ON_DEFEND", rarity: Rarity.COMMON, description: "Rúc đầu vào mai để phòng thủ." },
  "Bọ Hung": { name: "Bọ Hung", role: "DPS", skillType: "DAMAGE", skillPower: 0.12, trigger: "ON_ATTACK", rarity: Rarity.COMMON, description: "Húc mạnh vào kẻ địch." },

  // RARE
  "Hổ Vằn": { name: "Hổ Vằn", role: "DPS", skillType: "DAMAGE", skillPower: 0.15, trigger: "ON_ATTACK", rarity: Rarity.RARE, description: "Mãnh hổ vồ mồi với sát thương lớn." },
  "Gấu Xám": { name: "Gấu Xám", role: "TANK", skillType: "SHIELD", skillPower: 0.1, trigger: "ON_TURN_START", rarity: Rarity.RARE, description: "Lớp mỡ và lông dày tạo khiên chắn." },
  "Cáo Tuyết": { name: "Cáo Tuyết", role: "SUPPORT", skillType: "DODGE", skillPower: 0.1, trigger: "ON_DEFEND", rarity: Rarity.RARE, description: "Ảo ảnh tuyết giúp né tránh tốt hơn." },
  "Đại Bàng": { name: "Đại Bàng", role: "DPS", skillType: "DAMAGE", skillPower: 0.18, trigger: "ON_ATTACK", rarity: Rarity.RARE, description: "Cú mổ từ trên cao đầy uy lực." },
  "Rắn Hổ Mang": { name: "Rắn Hổ Mang", role: "SUPPORT", skillType: "POISON", skillPower: 0.08, trigger: "ON_ATTACK", rarity: Rarity.RARE, description: "Nọc độc làm suy yếu kẻ thù." },
  "Khỉ Đột": { name: "Khỉ Đột", role: "TANK", skillType: "REDUCE_DAMAGE", skillPower: 0.12, trigger: "ON_DEFEND", rarity: Rarity.RARE, description: "Sức mạnh cơ bắp chống chọi đòn đánh." },
  "Nai Sừng Tấm": { name: "Nai Sừng Tấm", role: "SUPPORT", skillType: "BUFF", skillPower: 0.08, trigger: "ON_TURN_START", rarity: Rarity.RARE, description: "Tiếng gầm khích lệ tinh thần." },
  "Cá Sấu": { name: "Cá Sấu", role: "DPS", skillType: "BURN", skillPower: 0.06, trigger: "ON_ATTACK", rarity: Rarity.RARE, description: "Cú táp tử thần (hiệu ứng chảy máu)." },

  // EPIC
  "Lân Tinh": { name: "Lân Tinh", role: "SUPPORT", skillType: "HEAL", skillPower: 0.1, trigger: "ON_TURN_START", rarity: Rarity.EPIC, description: "Ánh sáng tiên giới hồi phục vết thương." },
  "Hỏa Ngưu": { name: "Hỏa Ngưu", role: "DPS", skillType: "BURN", skillPower: 0.1, trigger: "ON_ATTACK", rarity: Rarity.EPIC, description: "Húc lửa thiêu đốt kẻ thù." },
  "Băng Long Con": { name: "Băng Long Con", role: "TANK", skillType: "SHIELD", skillPower: 0.15, trigger: "ON_TURN_START", rarity: Rarity.EPIC, description: "Giáp băng cứng cáp bảo vệ chủ nhân." },
  "Phượng Hoàng Non": { name: "Phượng Hoàng Non", role: "SUPPORT", skillType: "HEAL", skillPower: 0.12, trigger: "ON_TURN_START", rarity: Rarity.EPIC, description: "Tái sinh nhẹ nhàng mỗi lượt." },
  "Sư Tử Vàng": { name: "Sư Tử Vàng", role: "DPS", skillType: "DAMAGE", skillPower: 0.25, trigger: "ON_ATTACK", rarity: Rarity.EPIC, description: "Oai phong lẫm liệt, sát thương chí mạng." },
  "Tê Giác Thép": { name: "Tê Giác Thép", role: "TANK", skillType: "REDUCE_DAMAGE", skillPower: 0.2, trigger: "ON_DEFEND", rarity: Rarity.EPIC, description: "Lớp giáp thép bất hoại." },
  "U Minh Miêu": { name: "U Minh Miêu", role: "SUPPORT", skillType: "DODGE", skillPower: 0.15, trigger: "ON_DEFEND", rarity: Rarity.EPIC, description: "Di chuyển giữa các bóng tối để né tránh." },

  // LEGENDARY
  "Rồng Thần": { name: "Rồng Thần", role: "DPS", skillType: "DAMAGE", skillPower: 0.4, trigger: "ON_ATTACK", rarity: Rarity.LEGENDARY, description: "Sức mạnh tối thượng của loài rồng." },
  "Huyền Vũ": { name: "Huyền Vũ", role: "TANK", skillType: "REDUCE_DAMAGE", skillPower: 0.35, trigger: "ON_DEFEND", rarity: Rarity.LEGENDARY, description: "Phòng thủ tuyệt đối không thể lay chuyển." },
  "Phượng Hoàng Lửa": { name: "Phượng Hoàng Lửa", role: "SUPPORT", skillType: "HEAL", skillPower: 0.2, trigger: "ON_TURN_START", rarity: Rarity.LEGENDARY, description: "Ngọn lửa hồi sinh vĩnh cửu." },
  "Bạch Hổ": { name: "Bạch Hổ", role: "DPS", skillType: "BURN", skillPower: 0.2, trigger: "ON_ATTACK", rarity: Rarity.LEGENDARY, description: "Sát khí phương Tây thiêu rụi kẻ địch." },
  "Kỳ Lân": { name: "Kỳ Lân", role: "SUPPORT", skillType: "BUFF", skillPower: 0.2, trigger: "ON_TURN_START", rarity: Rarity.LEGENDARY, description: "Phước lành vạn vật tăng mọi chỉ số." },
  "Thiên Bằng": { name: "Thiên Bằng", role: "DPS", skillType: "DAMAGE", skillPower: 0.35, trigger: "ON_ATTACK", rarity: Rarity.LEGENDARY, description: "Sải cánh che trời, tấn công sấm sét." },
  "Tử Thần Khuyển": { name: "Tử Thần Khuyển", role: "DPS", skillType: "DOT", skillPower: 0.2, trigger: "ON_ATTACK", rarity: Rarity.LEGENDARY, description: "Cú táp mang theo hơi thở của địa ngục." },

  // EUROPE (Added by Antigravity)
  "Chó Săn Anh": { name: "Chó Săn Anh", role: "DPS", skillType: "CRIT", skillPower: 0.08, trigger: "ON_ATTACK", rarity: Rarity.COMMON, description: "Tăng nhẹ tỉ lệ chí mạng." },
  "Nhím Châu Âu": { name: "Nhím Châu Âu", role: "TANK", skillType: "REFLECT", skillPower: 0.05, trigger: "ON_DEFEND", rarity: Rarity.COMMON, description: "Phản lại 5% sát thương nhận vào." },
  "Cú Đêm": { name: "Cú Đêm", role: "SUPPORT", skillType: "BUFF", skillPower: 0.05, trigger: "ON_TURN_START", rarity: Rarity.COMMON, description: "Tăng 5% tỉ lệ chí mạng cho chủ nhân." },

  "Sói Bắc Âu": { name: "Sói Bắc Âu", role: "DPS", skillType: "BLEED", skillPower: 0.1, trigger: "ON_ATTACK", rarity: Rarity.RARE, description: "Vết cắn gây chảy máu, tăng cộng dồn bleeding." },
  "Gấu Nâu Châu Âu": { name: "Gấu Nâu Châu Âu", role: "TANK", skillType: "REDUCE_DAMAGE", skillPower: 0.12, trigger: "ON_DEFEND", rarity: Rarity.RARE, description: "Giảm sát thương gánh chịu." },
  "Quạ Đen": { name: "Quạ Đen", role: "SUPPORT", skillType: "DEBUFF", skillPower: 0.08, trigger: "ON_ATTACK", rarity: Rarity.RARE, description: "Mổ mắt kẻ thù, giảm 10% phòng thủ." },

  "Griffin": { name: "Griffin", role: "DPS", skillType: "CRIT", skillPower: 0.2, trigger: "ON_ATTACK", rarity: Rarity.EPIC, description: "Tăng mạnh sát thương chí mạng." },
  "Cerberus": { name: "Cerberus", role: "DPS", skillType: "DOT", skillPower: 0.15, trigger: "ON_ATTACK", rarity: Rarity.EPIC, description: "Ba đầu phun lửa và độc cùng lúc." },
  "Unicorn": { name: "Unicorn", role: "SUPPORT", skillType: "CLEANSE", skillPower: 0.12, trigger: "ON_TURN_START", rarity: Rarity.EPIC, description: "Hóa giải hiệu ứng xấu và tăng hiệu quả hồi máu." },

  "Fenrir": { name: "Fenrir", role: "DPS", skillType: "EXECUTE", skillPower: 0.3, trigger: "ON_ATTACK", rarity: Rarity.LEGENDARY, description: "Gây thêm sát thương khi kẻ địch dưới 30% HP." },
  "European Dragon": { name: "European Dragon", role: "DPS", skillType: "BURN", skillPower: 0.25, trigger: "ON_ATTACK", rarity: Rarity.LEGENDARY, description: "Phun lửa rồng thiêu rụi mọi thứ." },
  "Knight Guardian": { name: "Knight Guardian", role: "TANK", skillType: "SHIELD", skillPower: 0.25, trigger: "ON_DEFEND", rarity: Rarity.LEGENDARY, description: "Triệu hồi khiên thánh bảo vệ." },
  "Archangel": { name: "Archangel", role: "SUPPORT", skillType: "HEAL_BUFF", skillPower: 0.2, trigger: "ON_TURN_START", rarity: Rarity.LEGENDARY, description: "Hồi máu và ban phước lành tăng sức mạnh." }
};


module.exports = [
"[project]/apps/web/.next-internal/server/app/api/item/open-chest/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/@prisma/client [external] (@prisma/client, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("@prisma/client", () => require("@prisma/client"));

module.exports = mod;
}),
"[project]/apps/web/src/lib/prisma.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prisma",
    ()=>prisma
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs)");
;
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma || new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["PrismaClient"]();
if ("TURBOPACK compile-time truthy", 1) globalForPrisma.prisma = prisma;
}),
"[project]/packages/game-core/dist/types/combat.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * combat.ts
 * Core types and interfaces for the RPG combat system.
 * Separated to avoid circular dependencies.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
}),
"[project]/packages/game-core/dist/types/rpg-enums.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * rpg-enums.ts
 * Game enums as string literal union types — no Prisma dependency needed.
 * Replaces imports from @prisma/client so game-core has zero runtime deps.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
}),
"[project]/packages/game-core/dist/types/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __createBinding = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = {
            enumerable: true,
            get: function() {
                return m[k];
            }
        };
    }
    Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __exportStar = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__exportStar || function(m, exports1) {
    for(var p in m)if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports1, p)) __createBinding(exports1, m, p);
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
__exportStar(__turbopack_context__.r("[project]/packages/game-core/dist/types/combat.js [app-route] (ecmascript)"), exports);
__exportStar(__turbopack_context__.r("[project]/packages/game-core/dist/types/rpg-enums.js [app-route] (ecmascript)"), exports);
}),
"[project]/packages/game-core/dist/constants/beasts.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.BEAST_LIBRARY = void 0;
exports.BEAST_LIBRARY = {
    COMMON: [
        "Sói Rừng",
        "Cua Đá",
        "Nấm Độc",
        "Dơi Hang",
        "Chuột Chũi",
        "Chim Sẻ",
        "Rùa Cạn",
        "Bọ Hung"
    ],
    RARE: [
        "Hổ Vằn",
        "Gấu Xám",
        "Cáo Tuyết",
        "Đại Bàng",
        "Rắn Hổ Mang",
        "Khỉ Đột",
        "Nai Sừng Tấm",
        "Cá Sấu"
    ],
    EPIC: [
        "Lân Tinh",
        "Hỏa Ngưu",
        "Băng Long Con",
        "Phượng Hoàng Non",
        "Sư Tử Vàng",
        "Tê Giác Thép",
        "U Minh Miêu"
    ],
    LEGENDARY: [
        "Rồng Thần",
        "Huyền Vũ",
        "Phượng Hoàng Lửa",
        "Bạch Hổ",
        "Kỳ Lân",
        "Thiên Bằng",
        "Tử Thần Khuyển"
    ]
};
}),
"[project]/packages/game-core/dist/constants/config.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DAILY_ITEMS = exports.RARITY_POWER_RANGES = exports.RARITY_BASE_RATES = exports.EVENT_RATES = exports.XP_BAR_SIZE = exports.TAVERN_GOLD_PER_HP = exports.TAVERN_HEAL_INTERVAL_MS = exports.TAVERN_HEAL_HP_PER_MIN = exports.HP_RECOVERY_INTERVAL_MS = exports.CAPTURE_TIMEOUT_MS = exports.DAILY_COOLDOWN_MS = exports.HOSPITAL_COOLDOWN_MS = exports.HUNT_COOLDOWN_MS = void 0;
exports.HUNT_COOLDOWN_MS = 5_000;
exports.HOSPITAL_COOLDOWN_MS = 30 * 60_000;
exports.DAILY_COOLDOWN_MS = 24 * 60 * 60_000;
exports.CAPTURE_TIMEOUT_MS = 30_000;
exports.HP_RECOVERY_INTERVAL_MS = 2 * 60_000;
// Tavern rest: 1 minute heals 4 HP, i.e. 1 HP every 15 seconds.
exports.TAVERN_HEAL_HP_PER_MIN = 30;
exports.TAVERN_HEAL_INTERVAL_MS = 60_000 / exports.TAVERN_HEAL_HP_PER_MIN; // 15_000
// Gold cost scales linearly with the amount of HP you want to recover.
exports.TAVERN_GOLD_PER_HP = 0.2;
exports.XP_BAR_SIZE = 10;
exports.EVENT_RATES = {
    combat: 50,
    catch: 30,
    chest: 15,
    fail: 5
};
exports.RARITY_BASE_RATES = {
    COMMON: 70,
    RARE: 20,
    EPIC: 8,
    LEGENDARY: 2
};
exports.RARITY_POWER_RANGES = {
    COMMON: {
        min: 6,
        max: 12
    },
    RARE: {
        min: 12,
        max: 20
    },
    EPIC: {
        min: 20,
        max: 30
    },
    LEGENDARY: {
        min: 32,
        max: 45
    }
};
// Use local ItemType union — no Prisma dependency
exports.DAILY_ITEMS = [
    {
        name: "Hunter Trap",
        type: "TRAP",
        power: 1
    },
    {
        name: "Lucky Clover",
        type: "LUCK_BUFF",
        power: 1
    }
];
}),
"[project]/packages/game-core/dist/constants/pet-config.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.PET_CONFIGS = void 0;
exports.PET_CONFIGS = {
    // COMMON
    "Sói Rừng": {
        name: "Sói Rừng",
        role: "DPS",
        skillType: "DAMAGE",
        skillPower: 0.1,
        trigger: "ON_ATTACK",
        rarity: "COMMON",
        description: "Cú cắn xé cơ bản tăng sát thương."
    },
    "Cua Đá": {
        name: "Cua Đá",
        role: "TANK",
        skillType: "REDUCE_DAMAGE",
        skillPower: 0.05,
        trigger: "ON_DEFEND",
        rarity: "COMMON",
        description: "Vỏ cứng giúp giảm sát thương nhận vào."
    },
    "Nấm Độc": {
        name: "Nấm Độc",
        role: "SUPPORT",
        skillType: "DOT",
        skillPower: 0.05,
        trigger: "ON_ATTACK",
        rarity: "COMMON",
        description: "Phát tán bào tử gây sát thương theo thời gian."
    },
    "Dơi Hang": {
        name: "Dơi Hang",
        role: "DPS",
        skillType: "HEAL",
        skillPower: 0.03,
        trigger: "ON_ATTACK",
        rarity: "COMMON",
        description: "Hút máu đối thủ để hồi phục nhẹ."
    },
    "Chuột Chũi": {
        name: "Chuột Chũi",
        role: "TANK",
        skillType: "SHIELD",
        skillPower: 0.05,
        trigger: "ON_TURN_START",
        rarity: "COMMON",
        description: "Đào hang tạo lớp chắn bảo vệ."
    },
    "Chim Sẻ": {
        name: "Chim Sẻ",
        role: "SUPPORT",
        skillType: "DODGE",
        skillPower: 0.05,
        trigger: "ON_DEFEND",
        rarity: "COMMON",
        description: "Linh hoạt né tránh đòn tấn công."
    },
    "Rùa Cạn": {
        name: "Rùa Cạn",
        role: "TANK",
        skillType: "REDUCE_DAMAGE",
        skillPower: 0.08,
        trigger: "ON_DEFEND",
        rarity: "COMMON",
        description: "Rúc đầu vào mai để phòng thủ."
    },
    "Bọ Hung": {
        name: "Bọ Hung",
        role: "DPS",
        skillType: "DAMAGE",
        skillPower: 0.12,
        trigger: "ON_ATTACK",
        rarity: "COMMON",
        description: "Húc mạnh vào kẻ địch."
    },
    // RARE
    "Hổ Vằn": {
        name: "Hổ Vằn",
        role: "DPS",
        skillType: "DAMAGE",
        skillPower: 0.15,
        trigger: "ON_ATTACK",
        rarity: "RARE",
        description: "Mãnh hổ vồ mồi với sát thương lớn."
    },
    "Gấu Xám": {
        name: "Gấu Xám",
        role: "TANK",
        skillType: "SHIELD",
        skillPower: 0.1,
        trigger: "ON_TURN_START",
        rarity: "RARE",
        description: "Lớp mỡ và lông dày tạo khiên chắn."
    },
    "Cáo Tuyết": {
        name: "Cáo Tuyết",
        role: "SUPPORT",
        skillType: "DODGE",
        skillPower: 0.1,
        trigger: "ON_DEFEND",
        rarity: "RARE",
        description: "Ảo ảnh tuyết giúp né tránh tốt hơn."
    },
    "Đại Bàng": {
        name: "Đại Bàng",
        role: "DPS",
        skillType: "DAMAGE",
        skillPower: 0.18,
        trigger: "ON_ATTACK",
        rarity: "RARE",
        description: "Cú mổ từ trên cao đầy uy lực."
    },
    "Rắn Hổ Mang": {
        name: "Rắn Hổ Mang",
        role: "SUPPORT",
        skillType: "POISON",
        skillPower: 0.08,
        trigger: "ON_ATTACK",
        rarity: "RARE",
        description: "Nọc độc làm suy yếu kẻ thù."
    },
    "Khỉ Đột": {
        name: "Khỉ Đột",
        role: "TANK",
        skillType: "REDUCE_DAMAGE",
        skillPower: 0.12,
        trigger: "ON_DEFEND",
        rarity: "RARE",
        description: "Sức mạnh cơ bắp chống chọi đòn đánh."
    },
    "Nai Sừng Tấm": {
        name: "Nai Sừng Tấm",
        role: "SUPPORT",
        skillType: "BUFF",
        skillPower: 0.08,
        trigger: "ON_TURN_START",
        rarity: "RARE",
        description: "Tiếng gầm khích lệ tinh thần."
    },
    "Cá Sấu": {
        name: "Cá Sấu",
        role: "DPS",
        skillType: "BURN",
        skillPower: 0.06,
        trigger: "ON_ATTACK",
        rarity: "RARE",
        description: "Cú táp tử thần (hiệu ứng chảy máu)."
    },
    // EPIC
    "Lân Tinh": {
        name: "Lân Tinh",
        role: "SUPPORT",
        skillType: "HEAL",
        skillPower: 0.1,
        trigger: "ON_TURN_START",
        rarity: "EPIC",
        description: "Ánh sáng tiên giới hồi phục vết thương."
    },
    "Hỏa Ngưu": {
        name: "Hỏa Ngưu",
        role: "DPS",
        skillType: "BURN",
        skillPower: 0.1,
        trigger: "ON_ATTACK",
        rarity: "EPIC",
        description: "Húc lửa thiêu đốt kẻ thù."
    },
    "Băng Long Con": {
        name: "Băng Long Con",
        role: "TANK",
        skillType: "SHIELD",
        skillPower: 0.15,
        trigger: "ON_TURN_START",
        rarity: "EPIC",
        description: "Giáp băng cứng cáp bảo vệ chủ nhân."
    },
    "Phượng Hoàng Non": {
        name: "Phượng Hoàng Non",
        role: "SUPPORT",
        skillType: "HEAL",
        skillPower: 0.12,
        trigger: "ON_TURN_START",
        rarity: "EPIC",
        description: "Tái sinh nhẹ nhàng mỗi lượt."
    },
    "Sư Tử Vàng": {
        name: "Sư Tử Vàng",
        role: "DPS",
        skillType: "DAMAGE",
        skillPower: 0.25,
        trigger: "ON_ATTACK",
        rarity: "EPIC",
        description: "Oai phong lẫm liệt, sát thương chí mạng."
    },
    "Tê Giác Thép": {
        name: "Tê Giác Thép",
        role: "TANK",
        skillType: "REDUCE_DAMAGE",
        skillPower: 0.2,
        trigger: "ON_DEFEND",
        rarity: "EPIC",
        description: "Lớp giáp thép bất hoại."
    },
    "U Minh Miêu": {
        name: "U Minh Miêu",
        role: "SUPPORT",
        skillType: "DODGE",
        skillPower: 0.15,
        trigger: "ON_DEFEND",
        rarity: "EPIC",
        description: "Di chuyển giữa các bóng tối để né tránh."
    },
    // LEGENDARY
    "Rồng Thần": {
        name: "Rồng Thần",
        role: "DPS",
        skillType: "DAMAGE",
        skillPower: 0.4,
        trigger: "ON_ATTACK",
        rarity: "LEGENDARY",
        description: "Sức mạnh tối thượng của loài rồng."
    },
    "Huyền Vũ": {
        name: "Huyền Vũ",
        role: "TANK",
        skillType: "REDUCE_DAMAGE",
        skillPower: 0.35,
        trigger: "ON_DEFEND",
        rarity: "LEGENDARY",
        description: "Phòng thủ tuyệt đối không thể lay chuyển."
    },
    "Phượng Hoàng Lửa": {
        name: "Phượng Hoàng Lửa",
        role: "SUPPORT",
        skillType: "HEAL",
        skillPower: 0.2,
        trigger: "ON_TURN_START",
        rarity: "LEGENDARY",
        description: "Ngọn lửa hồi sinh vĩnh cửu."
    },
    "Bạch Hổ": {
        name: "Bạch Hổ",
        role: "DPS",
        skillType: "BURN",
        skillPower: 0.2,
        trigger: "ON_ATTACK",
        rarity: "LEGENDARY",
        description: "Sát khí phương Tây thiêu rụi kẻ địch."
    },
    "Kỳ Lân": {
        name: "Kỳ Lân",
        role: "SUPPORT",
        skillType: "BUFF",
        skillPower: 0.2,
        trigger: "ON_TURN_START",
        rarity: "LEGENDARY",
        description: "Phước lành vạn vật tăng mọi chỉ số."
    },
    "Thiên Bằng": {
        name: "Thiên Bằng",
        role: "DPS",
        skillType: "DAMAGE",
        skillPower: 0.35,
        trigger: "ON_ATTACK",
        rarity: "LEGENDARY",
        description: "Sải cánh che trời, tấn công sấm sét."
    },
    "Tử Thần Khuyển": {
        name: "Tử Thần Khuyển",
        role: "DPS",
        skillType: "DOT",
        skillPower: 0.2,
        trigger: "ON_ATTACK",
        rarity: "LEGENDARY",
        description: "Cú táp mang theo hơi thở của địa ngục."
    },
    // EUROPE (Added by Antigravity)
    "Chó Săn Anh": {
        name: "Chó Săn Anh",
        role: "DPS",
        skillType: "CRIT",
        skillPower: 0.08,
        trigger: "ON_ATTACK",
        rarity: "COMMON",
        description: "Tăng nhẹ tỉ lệ chí mạng."
    },
    "Nhím Châu Âu": {
        name: "Nhím Châu Âu",
        role: "TANK",
        skillType: "REFLECT",
        skillPower: 0.05,
        trigger: "ON_DEFEND",
        rarity: "COMMON",
        description: "Phản lại 5% sát thương nhận vào."
    },
    "Cú Đêm": {
        name: "Cú Đêm",
        role: "SUPPORT",
        skillType: "BUFF",
        skillPower: 0.05,
        trigger: "ON_TURN_START",
        rarity: "COMMON",
        description: "Tăng 5% tỉ lệ chí mạng cho chủ nhân."
    },
    "Sói Bắc Âu": {
        name: "Sói Bắc Âu",
        role: "DPS",
        skillType: "BLEED",
        skillPower: 0.1,
        trigger: "ON_ATTACK",
        rarity: "RARE",
        description: "Vết cắn gây chảy máu, tăng cộng dồn bleeding."
    },
    "Gấu Nâu Châu Âu": {
        name: "Gấu Nâu Châu Âu",
        role: "TANK",
        skillType: "REDUCE_DAMAGE",
        skillPower: 0.12,
        trigger: "ON_DEFEND",
        rarity: "RARE",
        description: "Giảm sát thương gánh chịu."
    },
    "Quạ Đen": {
        name: "Quạ Đen",
        role: "SUPPORT",
        skillType: "DEBUFF",
        skillPower: 0.08,
        trigger: "ON_ATTACK",
        rarity: "RARE",
        description: "Mổ mắt kẻ thù, giảm 10% phòng thủ."
    },
    "Griffin": {
        name: "Griffin",
        role: "DPS",
        skillType: "CRIT",
        skillPower: 0.2,
        trigger: "ON_ATTACK",
        rarity: "EPIC",
        description: "Tăng mạnh sát thương chí mạng."
    },
    "Cerberus": {
        name: "Cerberus",
        role: "DPS",
        skillType: "DOT",
        skillPower: 0.15,
        trigger: "ON_ATTACK",
        rarity: "EPIC",
        description: "Ba đầu phun lửa và độc cùng lúc."
    },
    "Unicorn": {
        name: "Unicorn",
        role: "SUPPORT",
        skillType: "CLEANSE",
        skillPower: 0.12,
        trigger: "ON_TURN_START",
        rarity: "EPIC",
        description: "Hóa giải hiệu ứng xấu và tăng hiệu quả hồi máu."
    },
    "Fenrir": {
        name: "Fenrir",
        role: "DPS",
        skillType: "EXECUTE",
        skillPower: 0.3,
        trigger: "ON_ATTACK",
        rarity: "LEGENDARY",
        description: "Gây thêm sát thương khi kẻ địch dưới 30% HP."
    },
    "European Dragon": {
        name: "European Dragon",
        role: "DPS",
        skillType: "BURN",
        skillPower: 0.25,
        trigger: "ON_ATTACK",
        rarity: "LEGENDARY",
        description: "Phun lửa rồng thiêu rụi mọi thứ."
    },
    "Knight Guardian": {
        name: "Knight Guardian",
        role: "TANK",
        skillType: "SHIELD",
        skillPower: 0.25,
        trigger: "ON_DEFEND",
        rarity: "LEGENDARY",
        description: "Triệu hồi khiên thánh bảo vệ."
    },
    "Archangel": {
        name: "Archangel",
        role: "SUPPORT",
        skillType: "HEAL_BUFF",
        skillPower: 0.2,
        trigger: "ON_TURN_START",
        rarity: "LEGENDARY",
        description: "Hồi máu và ban phước lành tăng sức mạnh."
    }
};
}),
"[project]/packages/game-core/dist/constants/accessory-config.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ACCESSORY_CONFIGS = exports.ACCESSORY_SETS = void 0;
exports.describeAccessoryEffect = describeAccessoryEffect;
exports.describeAccessoryForShop = describeAccessoryForShop;
exports.ACCESSORY_SETS = {
    "Assassin": {
        bonus2: [
            {
                type: "CRIT_CHANCE",
                power: 0.15
            }
        ],
        bonus3: [
            {
                type: "CRIT_DMG",
                power: 0.5
            }
        ]
    },
    "Flame": {
        bonus2: [
            {
                type: "BURN_DMG",
                power: 0.3
            }
        ],
        bonus3: [
            {
                type: "PROC_CHANCE",
                power: 0.01
            }
        ]
    },
    "Venom": {
        bonus2: [
            {
                type: "POISON_DMG",
                power: 0.25
            }
        ],
        bonus3: [
            {
                type: "PROC_CHANCE",
                power: 0.01
            }
        ]
    },
    "Blood": {
        bonus2: [
            {
                type: "LIFESTEAL",
                power: 0.2
            }
        ],
        bonus3: [
            {
                type: "LIFESTEAL",
                power: 1.0
            }
        ]
    },
    "Speed": {
        bonus2: [
            {
                type: "MULTI_HIT",
                power: 0.2
            }
        ],
        bonus3: [
            {
                type: "MULTI_HIT",
                power: 0.5
            }
        ]
    },
    "Guardian": {
        bonus2: [
            {
                type: "REDUCE_DMG",
                power: 0.15
            }
        ],
        bonus3: [
            {
                type: "REDUCE_DMG",
                power: 0.2
            }
        ]
    },
    "Gambler": {
        bonus2: [
            {
                type: "PROC_CHANCE",
                power: 0.15
            }
        ],
        bonus3: [
            {
                type: "PROC_CHANCE",
                power: 0.5
            }
        ]
    },
    "Berserker": {
        bonus2: [
            {
                type: "LOW_HP_DMG",
                power: 0.25
            }
        ],
        bonus3: [
            {
                type: "LIFESTEAL",
                power: 1.0
            }
        ]
    },
    "Beast": {
        bonus2: [
            {
                type: "PET_DMG",
                power: 0.25
            }
        ],
        bonus3: [
            {
                type: "PET_PLAYER_SYN",
                power: 1.0
            }
        ]
    },
    "Elemental": {
        bonus2: [
            {
                type: "HYBRID_BURN_POISON",
                power: 0.25
            }
        ],
        bonus3: [
            {
                type: "HYBRID_BURN_POISON",
                power: 1.0
            }
        ]
    }
};
exports.ACCESSORY_CONFIGS = {
    // Assassin Set
    "Nhẫn Sát Thủ": {
        name: "Nhẫn Sát Thủ",
        rarity: "RARE",
        set: "Assassin",
        effects: [
            {
                type: "CRIT_CHANCE",
                power: 0.1
            }
        ]
    },
    "Dây Chuyền Bóng Tối": {
        name: "Dây Chuyền Bóng Tối",
        rarity: "EPIC",
        set: "Assassin",
        effects: [
            {
                type: "CRIT_DMG",
                power: 0.25
            }
        ]
    },
    "Mặt Nạ Đâm Lén": {
        name: "Mặt Nạ Đâm Lén",
        rarity: "LEGENDARY",
        set: "Assassin",
        effects: [
            {
                type: "UNIQUE_CRIT_EXECUTE",
                power: 0.3
            }
        ]
    },
    // Flame Set
    "Nhẫn Lửa": {
        name: "Nhẫn Lửa",
        rarity: "RARE",
        set: "Flame",
        effects: [
            {
                type: "BURN_DMG",
                power: 0.25
            }
        ]
    },
    "Bùa Tro Tàn": {
        name: "Bùa Tro Tàn",
        rarity: "EPIC",
        set: "Flame",
        effects: [
            {
                type: "BURN_DUR",
                power: 1
            }
        ]
    },
    "Trái Tim Hỏa Ngục": {
        name: "Trái Tim Hỏa Ngục",
        rarity: "LEGENDARY",
        set: "Flame",
        effects: [
            {
                type: "UNIQUE_BURN_INSTANT",
                power: 0.2
            }
        ]
    },
    // Venom Set
    "Trâm Độc": {
        name: "Trâm Độc",
        rarity: "RARE",
        set: "Venom",
        effects: [
            {
                type: "POISON_DMG",
                power: 0.2
            }
        ]
    },
    "Bình Độc Cổ": {
        name: "Bình Độc Cổ",
        rarity: "EPIC",
        set: "Venom",
        effects: [
            {
                type: "POISON_DUR",
                power: 2
            }
        ]
    },
    "Nanh Rắn Vua": {
        name: "Nanh Rắn Vua",
        rarity: "LEGENDARY",
        set: "Venom",
        effects: [
            {
                type: "UNIQUE_POISON_BURST",
                power: 0
            }
        ]
    },
    // Blood Set
    "Nhẫn Huyết": {
        name: "Nhẫn Huyết",
        rarity: "RARE",
        set: "Blood",
        effects: [
            {
                type: "LIFESTEAL",
                power: 0.15
            }
        ]
    },
    "Bùa Hút Sinh Lực": {
        name: "Bùa Hút Sinh Lực",
        rarity: "EPIC",
        set: "Blood",
        effects: [
            {
                type: "LIFESTEAL",
                power: 0.25
            }
        ]
    },
    "Tim Quỷ": {
        name: "Tim Quỷ",
        rarity: "LEGENDARY",
        set: "Blood",
        effects: [
            {
                type: "UNIQUE_LIFE_DOUBLE",
                power: 0.5
            }
        ]
    },
    // Speed Set
    "Nhẫn Tốc Độ": {
        name: "Nhẫn Tốc Độ",
        rarity: "RARE",
        set: "Speed",
        effects: [
            {
                type: "MULTI_HIT",
                power: 0.1
            }
        ]
    },
    "Giày Gió": {
        name: "Giày Gió",
        rarity: "EPIC",
        set: "Speed",
        effects: [
            {
                type: "MULTI_HIT",
                power: 0.3
            }
        ]
    },
    "Linh Hồn Gió": {
        name: "Linh Hồn Gió",
        rarity: "LEGENDARY",
        set: "Speed",
        effects: [
            {
                type: "MULTI_HIT",
                power: 0.15
            }
        ]
    },
    // Guardian Set
    "Khiên Cổ": {
        name: "Khiên Cổ",
        rarity: "RARE",
        set: "Guardian",
        effects: [
            {
                type: "REDUCE_DMG",
                power: 0.1
            }
        ]
    },
    "Dây Chuyền Thép": {
        name: "Dây Chuyền Thép",
        rarity: "EPIC",
        set: "Guardian",
        effects: [
            {
                type: "REDUCE_DMG",
                power: 0.2
            }
        ]
    },
    "Trái Tim Titan": {
        name: "Trái Tim Titan",
        rarity: "LEGENDARY",
        set: "Guardian",
        effects: [
            {
                type: "UNIQUE_BLOCK_HIT",
                power: 1
            }
        ]
    },
    // Gambler Set
    "Xúc Xắc Hỗn Loạn": {
        name: "Xúc Xắc Hỗn Loạn",
        rarity: "RARE",
        set: "Gambler",
        effects: [
            {
                type: "PROC_CHANCE",
                power: 0.1
            }
        ]
    },
    "Đồng Xu May Rủi": {
        name: "Đồng Xu May Rủi",
        rarity: "EPIC",
        set: "Gambler",
        effects: [
            {
                type: "PROC_CHANCE",
                power: 0.2
            }
        ]
    },
    "Mặt Nạ Điên Loạn": {
        name: "Mặt Nạ Điên Loạn",
        rarity: "LEGENDARY",
        set: "Gambler",
        effects: [
            {
                type: "UNIQUE_PROC_TWICE",
                power: 0.2
            }
        ]
    },
    // Berserker Set
    "Nhẫn Tử Chiến": {
        name: "Nhẫn Tử Chiến",
        rarity: "RARE",
        set: "Berserker",
        effects: [
            {
                type: "LOW_HP_DMG",
                power: 0.2
            }
        ]
    },
    "Huyết Ấn": {
        name: "Huyết Ấn",
        rarity: "EPIC",
        set: "Berserker",
        effects: [
            {
                type: "LOW_HP_DMG",
                power: 0.3
            }
        ]
    },
    "Linh Hồn Cuồng Nộ": {
        name: "Linh Hồn Cuồng Nộ",
        rarity: "LEGENDARY",
        set: "Berserker",
        effects: [
            {
                type: "UNIQUE_BERSERK_PERCENT",
                power: 0.01
            }
        ]
    },
    // Beast Set
    "Dây Xích Thú": {
        name: "Dây Xích Thú",
        rarity: "RARE",
        set: "Beast",
        effects: [
            {
                type: "PET_DMG",
                power: 0.2
            }
        ]
    },
    "Ấn Thú": {
        name: "Ấn Thú",
        rarity: "EPIC",
        set: "Beast",
        effects: [
            {
                type: "PET_CHANCE",
                power: 0.15
            }
        ]
    },
    "Trái Tim Hoang Dã": {
        name: "Trái Tim Hoang Dã",
        rarity: "LEGENDARY",
        set: "Beast",
        effects: [
            {
                type: "PET_PLAYER_SYN",
                power: 0.2
            }
        ]
    },
    // Elemental Set
    "Nhẫn Nguyên Tố": {
        name: "Nhẫn Nguyên Tố",
        rarity: "RARE",
        set: "Elemental",
        effects: [
            {
                type: "HYBRID_BURN_POISON",
                power: 0.15
            }
        ]
    },
    "Mặt Dây Nguyên Tố": {
        name: "Mặt Dây Nguyên Tố",
        rarity: "EPIC",
        set: "Elemental",
        effects: [
            {
                type: "HYBRID_BURN_POISON",
                power: 0.3
            }
        ]
    },
    "Lõi Nguyên Tố": {
        name: "Lõi Nguyên Tố",
        rarity: "LEGENDARY",
        set: "Elemental",
        effects: [
            {
                type: "HYBRID_BURN_POISON",
                power: 0.5
            }
        ]
    }
};
const PCT = (x)=>`${(x * 100).toFixed(x >= 0.1 && x < 10 ? 0 : 1)}%`;
function describeAccessoryEffect(eff, upgradeLevel = 0) {
    const scale = 1 + upgradeLevel * 0.05;
    const p = eff.power * scale;
    switch(eff.type){
        case "CRIT_CHANCE":
            return `Tỉ lệ **chí mạng** +${PCT(p)} (cộng vào xác suất crit trong trận)`;
        case "CRIT_DMG":
            return `**Sát thương khi chí mạng** (hệ số nhân) +${PCT(p)} — cộng dồn lên nền 1.5`;
        case "BURN_DMG":
            return `**Sát thương Đốt** (hệ số nhân DOT) +${PCT(p)}`;
        case "BURN_DUR":
            return `**Thời lượng / cường độ đốt** +${eff.power * scale} (theo hệ combat)`;
        case "POISON_DMG":
            return `**Sát thương Độc** (hệ số nhân DOT) +${PCT(p)}`;
        case "POISON_DUR":
            return `**Thời lượng / cường độ độc** +${Math.floor(eff.power * scale)} (theo hệ combat)`;
        case "LIFESTEAL":
            return `**Hút máu** (hệ số nhân) +${PCT(p)} — hồi HP theo % ST gây ra`;
        case "MULTI_HIT":
            return `**Đánh kép / đa đòn** — cơ hội gây thêm đòn (power ${p.toFixed(2)})`;
        case "REDUCE_DMG":
            return `**Giảm sát thương nhận** (hệ số defenseMult) +${PCT(p)}`;
        case "PROC_CHANCE":
            return `**Tỉ lệ kích hoạt skill** (proc) +${PCT(p)}`;
        case "LOW_HP_DMG":
            return `**Sát thương tăng khi máu thấp** (power ${p.toFixed(2)})`;
        case "PET_DMG":
            return `**Sát thương từ pet** +${PCT(p)}`;
        case "PET_CHANCE":
            return `**Tỉ lệ pet kích hoạt** +${PCT(p)}`;
        case "PET_PLAYER_SYN":
            return `**Đồng bộ pet ↔ nhân vật** (synergy, power ${p.toFixed(2)})`;
        case "HYBRID_BURN_POISON":
            return `**Cộng hưởng Đốt + Độc** (hybrid, power ${p.toFixed(2)})`;
        case "UNIQUE_CRIT_EXECUTE":
            return `**Nội tại:** ST chí mạng thêm **+${PCT(p)}** khi kẻ địch dưới **50%** máu (theo combat)`;
        case "UNIQUE_BURN_INSTANT":
            return `**Nội tại:** đốt có thể gây **bùng nổ / tick tức thì** (power ${p.toFixed(2)})`;
        case "UNIQUE_POISON_BURST":
            return `**Nội tại:** cơ chế **nổ độc** / burst poison khi đủ điều kiện`;
        case "UNIQUE_LIFE_DOUBLE":
            return `**Nội tại:** tăng hiệu quả **hút máu** khi máu thấp (power ${p.toFixed(2)})`;
        case "UNIQUE_BLOCK_HIT":
            return `**Nội tại:** có cơ hội **chặn hoàn toàn** một đòn (theo lượt)`;
        case "UNIQUE_PROC_TWICE":
            return `**Nội tại:** skill có thể **kích hoạt kép** / proc nhân (power ${p.toFixed(2)})`;
        case "UNIQUE_BERSERK_PERCENT":
            return `**Nội tại:** ST tăng theo **% máu đã mất** (hệ số ${p.toFixed(3)} × 100 mỗi 1% máu thiếu — xem combat)`;
        default:
            return `${eff.type} (power ${p.toFixed(3)})`;
    }
}
function describeSetBonusEffects(effects, label) {
    if (!effects.length) return "";
    const lines = effects.map((e)=>`  · ${describeAccessoryEffect(e, 0)}`);
    return `**${label}**\n${lines.join("\n")}`;
}
function describeAccessoryForShop(config) {
    const lines = [];
    lines.push(`📦 **Bộ:** ${config.set}`);
    lines.push("");
    lines.push("**Hiệu ứng món này (+0):**");
    for (const e of config.effects){
        lines.push(`• ${describeAccessoryEffect(e, 0)}`);
    }
    const setDef = exports.ACCESSORY_SETS[config.set];
    if (setDef) {
        lines.push("");
        lines.push("**Khi gom đủ bộ (cùng tên bộ, các slot phụ kiện khác nhau):**");
        lines.push(describeSetBonusEffects(setDef.bonus2, "🎯 2 món trở lên"));
        lines.push("");
        lines.push(describeSetBonusEffects(setDef.bonus3, "🎯 3 món (full bộ)"));
    }
    lines.push("");
    lines.push("_Mỗi **+cấp** trên phụ kiện: hiệu ứng số nhân thêm **+5%** (×(1 + 0,05×cấp))._");
    return lines.join("\n");
}
}),
"[project]/packages/game-core/dist/constants/item-pool.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

// item-pool.ts
// Expanded balanced item pool for roguelike Discord bot.
// Every item supports exactly ONE main build (STR / AGI / TANK) with an optional minor secondary stat.
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ALL_ITEMS = exports.ARMOR_POOL = exports.WEAPON_POOL = void 0;
exports.getItemsByRarity = getItemsByRarity;
exports.pickRandomItem = pickRandomItem;
exports.rollItemRarity = rollItemRarity;
exports.rollLootDrop = rollLootDrop;
// ══════════════════════════════════════════════
// STAT BUDGET REFERENCE (per rarity)
//
//  COMMON    : main stat  +2~+5    secondary +0~+2
//  RARE      : main stat  +5~+10   secondary +0~+4
//  EPIC      : main stat  +10~+20  secondary +0~+8
//  LEGENDARY : main stat  +20~+35  secondary +0~+12
//
// Weapon power follows same scale separate from bonuses.
// ══════════════════════════════════════════════
// ──────────────────────────────────────────────
// ⚔️  WEAPON POOL
// ──────────────────────────────────────────────
exports.WEAPON_POOL = [
    // ── 🟢 COMMON ─────────────────────────────
    // STR builds
    {
        id: "rusty_sword",
        name: "Rusty Sword",
        type: "WEAPON",
        rarity: "COMMON",
        build: "STR",
        power: 5,
        bonusStr: 3
    },
    {
        id: "cracked_axe",
        name: "Cracked Axe",
        type: "WEAPON",
        rarity: "COMMON",
        build: "STR",
        power: 6,
        bonusStr: 2
    },
    {
        id: "stone_maul",
        name: "Stone Maul",
        type: "WEAPON",
        rarity: "COMMON",
        build: "STR",
        power: 7,
        bonusStr: 2
    },
    // AGI builds
    {
        id: "training_dagger",
        name: "Training Dagger",
        type: "WEAPON",
        rarity: "COMMON",
        build: "AGI",
        power: 3,
        bonusAgi: 4
    },
    {
        id: "wooden_spear",
        name: "Wooden Spear",
        type: "WEAPON",
        rarity: "COMMON",
        build: "AGI",
        power: 4,
        bonusAgi: 3
    },
    {
        id: "short_bow",
        name: "Short Bow",
        type: "WEAPON",
        rarity: "COMMON",
        build: "AGI",
        power: 4,
        bonusAgi: 4
    },
    // ── 🔵 RARE ───────────────────────────────
    // STR builds
    {
        id: "iron_sword",
        name: "Iron Sword",
        type: "WEAPON",
        rarity: "RARE",
        build: "STR",
        power: 10,
        bonusStr: 8
    },
    {
        id: "battle_axe",
        name: "Battle Axe",
        type: "WEAPON",
        rarity: "RARE",
        build: "STR",
        power: 13,
        bonusStr: 6
    },
    {
        id: "war_club",
        name: "War Club",
        type: "WEAPON",
        rarity: "RARE",
        build: "STR",
        power: 11,
        bonusStr: 7
    },
    // AGI builds
    {
        id: "hunter_bow",
        name: "Hunter Bow",
        type: "WEAPON",
        rarity: "RARE",
        build: "AGI",
        power: 8,
        bonusAgi: 9
    },
    {
        id: "twin_daggers",
        name: "Twin Daggers",
        type: "WEAPON",
        rarity: "RARE",
        build: "AGI",
        power: 7,
        bonusAgi: 10
    },
    {
        id: "swift_lance",
        name: "Swift Lance",
        type: "WEAPON",
        rarity: "RARE",
        build: "AGI",
        power: 9,
        bonusAgi: 8
    },
    // ── 🟣 EPIC ───────────────────────────────
    // STR builds
    {
        id: "knight_blade",
        name: "Knight Blade",
        type: "WEAPON",
        rarity: "EPIC",
        build: "STR",
        power: 18,
        bonusStr: 15
    },
    {
        id: "warhammer",
        name: "Warhammer",
        type: "WEAPON",
        rarity: "EPIC",
        build: "STR",
        power: 22,
        bonusStr: 12
    },
    {
        id: "executioner_axe",
        name: "Executioner Axe",
        type: "WEAPON",
        rarity: "EPIC",
        build: "STR",
        power: 20,
        bonusStr: 14
    },
    // AGI builds
    {
        id: "shadow_dagger",
        name: "Shadow Dagger",
        type: "WEAPON",
        rarity: "EPIC",
        build: "AGI",
        power: 14,
        bonusAgi: 18
    },
    {
        id: "storm_bow",
        name: "Storm Bow",
        type: "WEAPON",
        rarity: "EPIC",
        build: "AGI",
        power: 16,
        bonusAgi: 17
    },
    {
        id: "wind_rapier",
        name: "Wind Rapier",
        type: "WEAPON",
        rarity: "EPIC",
        build: "AGI",
        power: 13,
        bonusAgi: 20
    },
    // ── 🟡 LEGENDARY ──────────────────────────
    // STR builds
    {
        id: "dragon_slayer",
        name: "Dragon Slayer",
        type: "WEAPON",
        rarity: "LEGENDARY",
        build: "STR",
        power: 30,
        bonusStr: 28
    },
    {
        id: "titan_crusher",
        name: "Titan Crusher",
        type: "WEAPON",
        rarity: "LEGENDARY",
        build: "STR",
        power: 35,
        bonusStr: 22
    },
    {
        id: "ruinbringer",
        name: "Ruinbringer",
        type: "WEAPON",
        rarity: "LEGENDARY",
        build: "STR",
        power: 32,
        bonusStr: 25
    },
    // AGI builds
    {
        id: "phantom_blade",
        name: "Phantom Blade",
        type: "WEAPON",
        rarity: "LEGENDARY",
        build: "AGI",
        power: 25,
        bonusAgi: 32
    },
    {
        id: "wind_reaver",
        name: "Wind Reaver",
        type: "WEAPON",
        rarity: "LEGENDARY",
        build: "AGI",
        power: 26,
        bonusAgi: 30
    },
    {
        id: "voidstep",
        name: "Voidstep",
        type: "WEAPON",
        rarity: "LEGENDARY",
        build: "AGI",
        power: 24,
        bonusAgi: 33
    }
];
// ──────────────────────────────────────────────
// 🛡️  ARMOR POOL
// ──────────────────────────────────────────────
exports.ARMOR_POOL = [
    // ── 🟢 COMMON ─────────────────────────────
    // TANK builds
    {
        id: "cloth_armor",
        name: "Cloth Armor",
        type: "ARMOR",
        rarity: "COMMON",
        build: "TANK",
        bonusHp: 20
    },
    {
        id: "leather_armor",
        name: "Leather Armor",
        type: "ARMOR",
        rarity: "COMMON",
        build: "TANK",
        bonusDef: 3
    },
    {
        id: "padded_vest",
        name: "Padded Vest",
        type: "ARMOR",
        rarity: "COMMON",
        build: "TANK",
        bonusDef: 2,
        bonusHp: 10
    },
    // AGI builds
    {
        id: "traveler_coat",
        name: "Traveler Coat",
        type: "ARMOR",
        rarity: "COMMON",
        build: "AGI",
        bonusAgi: 3,
        bonusHp: 8
    },
    {
        id: "scout_garb",
        name: "Scout Garb",
        type: "ARMOR",
        rarity: "COMMON",
        build: "AGI",
        bonusAgi: 4
    },
    // ── 🔵 RARE ───────────────────────────────
    // TANK builds
    {
        id: "chainmail",
        name: "Chainmail",
        type: "ARMOR",
        rarity: "RARE",
        build: "TANK",
        bonusDef: 7,
        bonusHp: 30
    },
    {
        id: "guard_plate",
        name: "Guard Plate",
        type: "ARMOR",
        rarity: "RARE",
        build: "TANK",
        bonusDef: 9
    },
    {
        id: "fortress_vest",
        name: "Fortress Vest",
        type: "ARMOR",
        rarity: "RARE",
        build: "TANK",
        bonusDef: 6,
        bonusHp: 35
    },
    // AGI builds
    {
        id: "hunter_armor",
        name: "Hunter Armor",
        type: "ARMOR",
        rarity: "RARE",
        build: "AGI",
        bonusAgi: 7,
        bonusHp: 15
    },
    {
        id: "rogue_leathers",
        name: "Rogue Leathers",
        type: "ARMOR",
        rarity: "RARE",
        build: "AGI",
        bonusAgi: 9
    },
    // ── 🟣 EPIC ───────────────────────────────
    // TANK builds
    {
        id: "knight_armor",
        name: "Knight Armor",
        type: "ARMOR",
        rarity: "EPIC",
        build: "TANK",
        bonusDef: 14,
        bonusHp: 60
    },
    {
        id: "war_plate",
        name: "War Plate",
        type: "ARMOR",
        rarity: "EPIC",
        build: "TANK",
        bonusDef: 18
    },
    {
        id: "bulwark_mail",
        name: "Bulwark Mail",
        type: "ARMOR",
        rarity: "EPIC",
        build: "TANK",
        bonusDef: 12,
        bonusHp: 80
    },
    // AGI builds
    {
        id: "shadow_cloak",
        name: "Shadow Cloak",
        type: "ARMOR",
        rarity: "EPIC",
        build: "AGI",
        bonusAgi: 16,
        bonusHp: 35
    },
    {
        id: "phantom_wrap",
        name: "Phantom Wrap",
        type: "ARMOR",
        rarity: "EPIC",
        build: "AGI",
        bonusAgi: 18
    },
    // ── 🟡 LEGENDARY ──────────────────────────
    // TANK builds
    {
        id: "dragon_armor",
        name: "Dragon Armor",
        type: "ARMOR",
        rarity: "LEGENDARY",
        build: "TANK",
        bonusDef: 22,
        bonusHp: 100
    },
    {
        id: "titan_armor",
        name: "Titan Armor",
        type: "ARMOR",
        rarity: "LEGENDARY",
        build: "TANK",
        bonusDef: 28
    },
    {
        id: "aegis_plate",
        name: "Aegis Plate",
        type: "ARMOR",
        rarity: "LEGENDARY",
        build: "TANK",
        bonusDef: 20,
        bonusHp: 120
    },
    // AGI builds
    {
        id: "phantom_cloak",
        name: "Phantom Cloak",
        type: "ARMOR",
        rarity: "LEGENDARY",
        build: "AGI",
        bonusAgi: 25,
        bonusHp: 60
    },
    {
        id: "void_mantle",
        name: "Void Mantle",
        type: "ARMOR",
        rarity: "LEGENDARY",
        build: "AGI",
        bonusAgi: 30
    }
];
// ──────────────────────────────────────────────
// 🔧 HELPERS
// ──────────────────────────────────────────────
/** Get all items combined */ exports.ALL_ITEMS = [
    ...exports.WEAPON_POOL,
    ...exports.ARMOR_POOL
];
/** Get items of a specific rarity from a pool */ function getItemsByRarity(pool, rarity) {
    return pool.filter((i)=>i.rarity === rarity);
}
/** Pick a random item from a pool (for dungeon drops etc.) */ function pickRandomItem(pool) {
    if (pool.length === 0) return undefined;
    return pool[Math.floor(Math.random() * pool.length)];
}
/** Rarity drop weights for dungeon floor-based loot:
 *  Lower floors → more COMMON. Higher floors → chance for EPIC/LEGENDARY. */ function rollItemRarity(floor, luckBonus = 0) {
    const r = Math.random() * 100 - luckBonus;
    const epicChance = Math.min(30, floor * 3);
    const legendaryChance = Math.min(10, floor * 0.8);
    const rareChance = Math.min(40, floor * 5);
    if (r < legendaryChance) return "LEGENDARY";
    if (r < legendaryChance + epicChance) return "EPIC";
    if (r < legendaryChance + epicChance + rareChance) return "RARE";
    return "COMMON";
}
/** Roll a random floor-appropriate item drop (weapon or armor 50/50) */ function rollLootDrop(floor, luckBonus = 0) {
    const rarity = rollItemRarity(floor, luckBonus);
    const useWeapon = Math.random() < 0.5;
    const pool = useWeapon ? exports.WEAPON_POOL : exports.ARMOR_POOL;
    const filtered = getItemsByRarity(pool, rarity);
    const target = filtered.length > 0 ? filtered : getItemsByRarity(pool, "COMMON");
    return pickRandomItem(target);
}
}),
"[project]/packages/game-core/dist/constants/relic-pool.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

// relic-pool-full.ts
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.RELIC_POOL = void 0;
exports.getRelicPoolByFloor = getRelicPoolByFloor;
exports.getRandomRelic = getRandomRelic;
exports.RELIC_POOL = [
    /* ================= COMMON ================= */ {
        id: "wooden_sword",
        name: "Wooden Sword",
        type: "DAMAGE_BOOST",
        value: 0.05,
        rarity: "COMMON",
        weight: 50,
        desc: "+5% damage"
    },
    {
        id: "leather_pad",
        name: "Leather Pad",
        type: "REDUCE_DAMAGE",
        value: 0.05,
        rarity: "COMMON",
        weight: 50,
        desc: "-5% damage taken"
    },
    {
        id: "buckler",
        name: "Buckler",
        type: "START_SHIELD",
        value: 10,
        rarity: "COMMON",
        weight: 50,
        desc: "Start with 10 shield"
    },
    {
        id: "leech_seed",
        name: "Leech Seed",
        type: "LIFESTEAL",
        value: 0.05,
        rarity: "COMMON",
        weight: 50,
        desc: "5% lifesteal"
    },
    {
        id: "regen_core",
        name: "Regen Core",
        type: "TURN_HEAL",
        value: 3,
        rarity: "COMMON",
        weight: 50,
        desc: "Heal 3 HP/turn"
    },
    {
        id: "matchstick",
        name: "Matchstick",
        type: "BURN_BOOST",
        value: 0.1,
        rarity: "COMMON",
        weight: 50,
        desc: "+10% burn"
    },
    {
        id: "toxic_vial",
        name: "Toxic Vial",
        type: "POISON_BOOST",
        value: 0.1,
        rarity: "COMMON",
        weight: 50,
        desc: "+10% poison"
    },
    {
        id: "pet_treat",
        name: "Pet Treat",
        type: "PET_BOOST",
        value: 0.1,
        rarity: "COMMON",
        weight: 50,
        desc: "+10% pet power"
    },
    {
        id: "swift_boots",
        name: "Swift Boots",
        type: "SPD_BOOST",
        value: 8,
        rarity: "COMMON",
        weight: 50,
        desc: "+8 speed"
    },
    {
        id: "sharp_stone",
        name: "Sharp Stone",
        type: "CRIT_BOOST",
        value: 0.05,
        rarity: "COMMON",
        weight: 50,
        desc: "+5% crit"
    },
    {
        id: "lucky_penny",
        name: "Lucky Penny",
        type: "GOLD_BOOST",
        value: 0.1,
        rarity: "COMMON",
        weight: 50,
        desc: "+10% gold"
    },
    {
        id: "bleed_dagger",
        name: "Bleed Dagger",
        type: "UTILITY",
        value: 5,
        rarity: "COMMON",
        weight: 50,
        desc: "Apply bleed on hit",
        trigger: "ON_ATTACK"
    },
    /* ================= RARE ================= */ {
        id: "berserker_blade",
        name: "Berserker Blade",
        type: "DAMAGE_BOOST",
        value: 0.15,
        rarity: "RARE",
        weight: 30,
        desc: "+15% damage"
    },
    {
        id: "fragile_dagger",
        name: "Fragile Dagger",
        type: "GLASS_CANNON",
        value: 0.15,
        drawback: 0.1,
        rarity: "RARE",
        weight: 30,
        desc: "+15% dmg, -10% HP"
    },
    {
        id: "survivor_instinct",
        name: "Survivor Instinct",
        type: "LOW_HP_BONUS",
        value: 0.2,
        rarity: "RARE",
        weight: 30,
        desc: "More dmg at low HP"
    },
    {
        id: "knight_shield",
        name: "Knight Shield",
        type: "START_SHIELD",
        value: 30,
        rarity: "RARE",
        weight: 30,
        desc: "Start 30 shield"
    },
    {
        id: "blood_amulet",
        name: "Blood Amulet",
        type: "LIFESTEAL",
        value: 0.1,
        rarity: "RARE",
        weight: 30,
        desc: "10% lifesteal"
    },
    {
        id: "scavenger_kit",
        name: "Scavenger Kit",
        type: "ON_KILL_HEAL",
        value: 10,
        rarity: "RARE",
        weight: 30,
        desc: "Heal on kill",
        trigger: "ON_KILL"
    },
    {
        id: "healing_totem",
        name: "Healing Totem",
        type: "TURN_HEAL",
        value: 10,
        rarity: "RARE",
        weight: 30,
        desc: "Heal 10 HP/turn"
    },
    {
        id: "burning_heart",
        name: "Burning Heart",
        type: "BURN_BOOST",
        value: 0.25,
        rarity: "RARE",
        weight: 30,
        desc: "+25% burn"
    },
    {
        id: "venom_gland",
        name: "Venom Gland",
        type: "POISON_BOOST",
        value: 0.25,
        rarity: "RARE",
        weight: 30,
        desc: "+25% poison"
    },
    {
        id: "wind_feather",
        name: "Wind Feather",
        type: "SPD_BOOST",
        value: 15,
        rarity: "RARE",
        weight: 30,
        desc: "+15 speed"
    },
    {
        id: "lucky_charm",
        name: "Lucky Charm",
        type: "CRIT_BOOST",
        value: 0.1,
        rarity: "RARE",
        weight: 30,
        desc: "+10% crit"
    },
    {
        id: "thief_gloves",
        name: "Thief Gloves",
        type: "GOLD_BOOST",
        value: 0.25,
        rarity: "RARE",
        weight: 30,
        desc: "+25% gold"
    },
    {
        id: "execution_mark",
        name: "Execution Mark",
        type: "UTILITY",
        value: 0.15,
        rarity: "RARE",
        weight: 30,
        desc: "Execute below 15% HP"
    },
    /* ================= EPIC ================= */ {
        id: "glass_cannon",
        name: "Glass Cannon",
        type: "GLASS_CANNON",
        value: 0.25,
        drawback: 0.2,
        rarity: "EPIC",
        weight: 15,
        desc: "+25% dmg, -20% HP"
    },
    {
        id: "executioner",
        name: "Executioner Ring",
        type: "LOW_HP_BONUS",
        value: 0.3,
        rarity: "EPIC",
        weight: 15,
        desc: "More dmg low HP"
    },
    {
        id: "adamantite_plate",
        name: "Adamantite Plate",
        type: "REDUCE_DAMAGE",
        value: 0.2,
        rarity: "EPIC",
        weight: 15,
        desc: "-20% damage"
    },
    {
        id: "dracula_cape",
        name: "Dracula Cape",
        type: "LIFESTEAL",
        value: 0.2,
        rarity: "EPIC",
        weight: 15,
        desc: "20% lifesteal"
    },
    {
        id: "vampire_fang",
        name: "Vampire Fang",
        type: "ON_KILL_HEAL",
        value: 20,
        rarity: "EPIC",
        weight: 15,
        desc: "Heal on kill",
        trigger: "ON_KILL"
    },
    {
        id: "phoenix_feather",
        name: "Phoenix Feather",
        type: "TURN_HEAL",
        value: 15,
        rarity: "EPIC",
        weight: 15,
        desc: "Heal 15 HP/turn"
    },
    {
        id: "hellfire_core",
        name: "Hellfire Core",
        type: "BURN_BOOST",
        value: 0.5,
        rarity: "EPIC",
        weight: 15,
        desc: "+50% burn"
    },
    {
        id: "plague_mask",
        name: "Plague Mask",
        type: "POISON_BOOST",
        value: 0.5,
        rarity: "EPIC",
        weight: 15,
        desc: "+50% poison"
    },
    {
        id: "hermes_sandals",
        name: "Hermes Sandals",
        type: "SPD_BOOST",
        value: 30,
        rarity: "EPIC",
        weight: 15,
        desc: "+30 speed"
    },
    {
        id: "assassin_mark",
        name: "Assassin Mark",
        type: "CRIT_BOOST",
        value: 0.2,
        rarity: "EPIC",
        weight: 15,
        desc: "+20% crit"
    },
    {
        id: "thorn_mail",
        name: "Thorn Mail",
        type: "UTILITY",
        value: 0.2,
        rarity: "EPIC",
        weight: 15,
        desc: "Reflect 20% damage",
        trigger: "ON_HIT"
    },
    {
        id: "time_fragment",
        name: "Time Fragment",
        type: "UTILITY",
        value: 0.2,
        rarity: "EPIC",
        weight: 15,
        desc: "20% chance extra turn",
        trigger: "ON_ATTACK"
    },
    /* ================= LEGENDARY ================= */ {
        id: "dragon_slayer",
        name: "Dragon Slayer",
        type: "DAMAGE_BOOST",
        value: 0.35,
        rarity: "LEGENDARY",
        weight: 5,
        desc: "+35% damage"
    },
    {
        id: "cursed_skull",
        name: "Cursed Skull",
        type: "GLASS_CANNON",
        value: 0.5,
        drawback: 0.3,
        rarity: "LEGENDARY",
        weight: 5,
        desc: "+50% dmg, -30% HP"
    },
    {
        id: "undying_rage",
        name: "Undying Rage",
        type: "LOW_HP_BONUS",
        value: 0.6,
        rarity: "LEGENDARY",
        weight: 5,
        desc: "Huge dmg at low HP"
    },
    {
        id: "aegis",
        name: "Aegis",
        type: "START_SHIELD",
        value: 100,
        rarity: "LEGENDARY",
        weight: 5,
        desc: "Start 100 shield"
    },
    {
        id: "soul_reaper",
        name: "Soul Reaper",
        type: "ON_KILL_HEAL",
        value: 50,
        rarity: "LEGENDARY",
        weight: 5,
        desc: "Heal massive on kill",
        trigger: "ON_KILL"
    },
    {
        id: "beastmaster_whip",
        name: "Beastmaster Whip",
        type: "PET_BOOST",
        value: 0.5,
        rarity: "LEGENDARY",
        weight: 5,
        desc: "+50% pet power"
    },
    {
        id: "chaos_orb",
        name: "Chaos Orb",
        type: "CHAOS",
        value: 1,
        rarity: "LEGENDARY",
        weight: 5,
        desc: "Random effect each turn"
    },
    {
        id: "gamblers_coin",
        name: "Gambler's Coin",
        type: "DOUBLE_OR_NOTHING",
        value: 0.5,
        rarity: "LEGENDARY",
        weight: 5,
        desc: "50% double or miss"
    },
    {
        id: "midas_touch",
        name: "Midas Touch",
        type: "GOLD_BOOST",
        value: 0.5,
        rarity: "LEGENDARY",
        weight: 5,
        desc: "+50% gold"
    },
    {
        id: "reaper_threshold",
        name: "Reaper Threshold",
        type: "UTILITY",
        value: 0.2,
        rarity: "LEGENDARY",
        weight: 5,
        desc: "Execute below 20% HP"
    }
];
function getRelicPoolByFloor(floor) {
    if (floor < 4) return exports.RELIC_POOL.filter((r)=>r.rarity === "COMMON");
    if (floor < 8) return exports.RELIC_POOL.filter((r)=>r.rarity !== "LEGENDARY");
    return exports.RELIC_POOL;
}
function getRandomRelic(floor) {
    const pool = getRelicPoolByFloor(floor);
    const totalWeight = pool.reduce((sum, r)=>sum + r.weight, 0);
    let roll = Math.random() * totalWeight;
    for (const relic of pool){
        if (roll < relic.weight) return relic;
        roll -= relic.weight;
    }
    return pool[0];
}
}),
"[project]/packages/game-core/dist/constants/titles.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TITLES = void 0;
exports.TITLES = [
    /* ========================
       COMMON TITLES
    ======================== */ {
        key: "slayer_1",
        name: "Slayer",
        description: "Defeat 100 enemies",
        rarity: "COMMON",
        effectType: "damage",
        effectValue: 0.05,
        target: 100
    },
    {
        key: "burn_1",
        name: "Flame Adept",
        description: "Apply burn 50 times",
        rarity: "COMMON",
        effectType: "burnDamage",
        effectValue: 0.05,
        target: 50
    },
    {
        key: "poison_1",
        name: "Toxic Initiate",
        description: "Apply poison 50 times",
        rarity: "COMMON",
        effectType: "poisonDamage",
        effectValue: 0.05,
        target: 50
    },
    {
        key: "crit_1",
        name: "Sharp Eye",
        description: "Trigger crit 50 times",
        rarity: "COMMON",
        effectType: "critDamage",
        effectValue: 0.05,
        target: 50
    },
    {
        key: "gold_1",
        name: "Gold Seeker",
        description: "Earn 1000 gold",
        rarity: "COMMON",
        effectType: "goldGain",
        effectValue: 0.05,
        target: 1000
    },
    {
        key: "pet_1",
        name: "Pet Keeper",
        description: "Own 5 pets",
        rarity: "COMMON",
        effectType: "petPower",
        effectValue: 0.05,
        target: 5
    },
    {
        key: "lifesteal_1",
        name: "Blood Drinker",
        description: "Trigger lifesteal 50 times",
        rarity: "COMMON",
        effectType: "lifesteal",
        effectValue: 0.05,
        target: 50
    },
    {
        key: "combo_1",
        name: "Combo Starter",
        description: "Trigger 2 skills in one turn",
        rarity: "COMMON",
        effectType: "damage",
        effectValue: 0.04,
        target: 20
    },
    {
        key: "hunt_1",
        name: "Hunter",
        description: "Complete 50 hunts",
        rarity: "COMMON",
        effectType: "damage",
        effectValue: 0.04,
        target: 50
    },
    {
        key: "survive_1",
        name: "Survivor",
        description: "Win with HP below 20%",
        rarity: "COMMON",
        effectType: "lifesteal",
        effectValue: 0.05,
        target: 10
    },
    /* ========================
       RARE TITLES
    ======================== */ {
        key: "slayer_2",
        name: "Executioner",
        description: "Defeat 500 enemies",
        rarity: "RARE",
        effectType: "damage",
        effectValue: 0.08,
        target: 500
    },
    {
        key: "burn_2",
        name: "Flame Lord",
        description: "Apply burn 200 times",
        rarity: "RARE",
        effectType: "burnDamage",
        effectValue: 0.1,
        target: 200
    },
    {
        key: "poison_2",
        name: "Plague Bringer",
        description: "Apply poison 200 times",
        rarity: "RARE",
        effectType: "poisonDamage",
        effectValue: 0.1,
        target: 200
    },
    {
        key: "crit_2",
        name: "Deadeye",
        description: "Trigger crit 200 times",
        rarity: "RARE",
        effectType: "critDamage",
        effectValue: 0.1,
        target: 200
    },
    {
        key: "gold_2",
        name: "Wealth Collector",
        description: "Earn 10000 gold",
        rarity: "RARE",
        effectType: "goldGain",
        effectValue: 0.1,
        target: 10000
    },
    {
        key: "pet_2",
        name: "Beast Trainer",
        description: "Own 15 pets",
        rarity: "RARE",
        effectType: "petPower",
        effectValue: 0.1,
        target: 15
    },
    {
        key: "combo_2",
        name: "Combo Expert",
        description: "Trigger 3 skills in one turn",
        rarity: "RARE",
        effectType: "damage",
        effectValue: 0.08,
        target: 50
    },
    {
        key: "lifesteal_2",
        name: "Blood Reaver",
        description: "Lifesteal 200 times",
        rarity: "RARE",
        effectType: "lifesteal",
        effectValue: 0.1,
        target: 200
    },
    {
        key: "boss_1",
        name: "Boss Hunter",
        description: "Defeat 10 bosses",
        rarity: "RARE",
        effectType: "damage",
        effectValue: 0.08,
        target: 10
    },
    {
        key: "dungeon_1",
        name: "Dungeon Raider",
        description: "Clear 5 dungeons",
        rarity: "RARE",
        effectType: "damage",
        effectValue: 0.08,
        target: 5
    },
    /* ========================
       EPIC TITLES
    ======================== */ {
        key: "slayer_3",
        name: "Mass Slayer",
        description: "Defeat 2000 enemies",
        rarity: "EPIC",
        effectType: "damage",
        effectValue: 0.12,
        target: 2000
    },
    {
        key: "burn_3",
        name: "Inferno Master",
        description: "Apply burn 500 times",
        rarity: "EPIC",
        effectType: "burnDamage",
        effectValue: 0.15,
        target: 500
    },
    {
        key: "poison_3",
        name: "Toxic Overlord",
        description: "Apply poison 500 times",
        rarity: "EPIC",
        effectType: "poisonDamage",
        effectValue: 0.15,
        target: 500
    },
    {
        key: "crit_3",
        name: "Critical King",
        description: "Trigger crit 500 times",
        rarity: "EPIC",
        effectType: "critDamage",
        effectValue: 0.15,
        target: 500
    },
    {
        key: "combo_3",
        name: "Combo Master",
        description: "Trigger 4 skills in one turn",
        rarity: "EPIC",
        effectType: "damage",
        effectValue: 0.12,
        target: 100
    },
    {
        key: "lifesteal_3",
        name: "Soul Drinker",
        description: "Lifesteal 500 times",
        rarity: "EPIC",
        effectType: "lifesteal",
        effectValue: 0.15,
        target: 500
    },
    {
        key: "petlegendary_1",
        name: "Alpha Master",
        description: "Own 3 legendary pets",
        rarity: "EPIC",
        effectType: "petPower",
        effectValue: 0.15,
        target: 3
    },
    {
        key: "gold_3",
        name: "Gold Tycoon",
        description: "Earn 50000 gold",
        rarity: "EPIC",
        effectType: "goldGain",
        effectValue: 0.15,
        target: 50000
    },
    {
        key: "boss_2",
        name: "Boss Slayer",
        description: "Defeat 50 bosses",
        rarity: "EPIC",
        effectType: "damage",
        effectValue: 0.12,
        target: 50
    },
    {
        key: "dungeon_2",
        name: "Dungeon Conqueror",
        description: "Clear floor 10",
        rarity: "EPIC",
        effectType: "damage",
        effectValue: 0.12,
        target: 1
    },
    /* ========================
       LEGENDARY TITLES
    ======================== */ {
        key: "slayer_4",
        name: "God Slayer",
        description: "Defeat 10000 enemies",
        rarity: "LEGENDARY",
        effectType: "damage",
        effectValue: 0.15,
        target: 10000
    },
    {
        key: "burn_4",
        name: "Flame Emperor",
        description: "Apply burn 1000 times",
        rarity: "LEGENDARY",
        effectType: "burnDamage",
        effectValue: 0.15,
        target: 1000
    },
    {
        key: "poison_4",
        name: "Plague Emperor",
        description: "Apply poison 1000 times",
        rarity: "LEGENDARY",
        effectType: "poisonDamage",
        effectValue: 0.15,
        target: 1000
    },
    {
        key: "crit_4",
        name: "Critical God",
        description: "Trigger crit 1000 times",
        rarity: "LEGENDARY",
        effectType: "critDamage",
        effectValue: 0.15,
        target: 1000
    },
    {
        key: "combo_4",
        name: "Combo God",
        description: "Trigger 5 skills in one turn",
        rarity: "LEGENDARY",
        effectType: "damage",
        effectValue: 0.15,
        target: 200
    },
    {
        key: "lifesteal_4",
        name: "Immortal Reaper",
        description: "Lifesteal 1000 times",
        rarity: "LEGENDARY",
        effectType: "lifesteal",
        effectValue: 0.15,
        target: 1000
    },
    {
        key: "petlegendary_2",
        name: "Beast God",
        description: "Own 5 legendary pets",
        rarity: "LEGENDARY",
        effectType: "petPower",
        effectValue: 0.15,
        target: 5
    },
    {
        key: "gold_4",
        name: "King of Gold",
        description: "Earn 100000 gold",
        rarity: "LEGENDARY",
        effectType: "goldGain",
        effectValue: 0.15,
        target: 100000
    },
    {
        key: "boss_3",
        name: "God Hunter",
        description: "Defeat 200 bosses",
        rarity: "LEGENDARY",
        effectType: "damage",
        effectValue: 0.15,
        target: 200
    },
    {
        key: "ultimate_1",
        name: "Ascended One",
        description: "Reach max level and clear dungeon 10",
        rarity: "LEGENDARY",
        effectType: "damage",
        effectValue: 0.15,
        target: 1
    },
    /* ========================
       LEGACY TITLES
    ======================== */ {
        key: "slayer_legacy",
        name: "Thợ Săn Huyền Thoại (Legacy)",
        description: "Thành tựu của những thợ săn đầu tiên",
        rarity: "LEGENDARY",
        effectType: "damage",
        effectValue: 0.15,
        target: 0
    }
];
}),
"[project]/packages/game-core/dist/constants/synergy-hints.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.REQ_HINTS = exports.SKILL_TO_SYNERGY_FLAGS = exports.PET_FLAG_HINTS = void 0;
exports.examplePetsForFlag = examplePetsForFlag;
exports.flagsFromPlayerSkillNames = flagsFromPlayerSkillNames;
exports.flagsFromEquippedPets = flagsFromEquippedPets;
exports.ownedPetNamesByFlag = ownedPetNamesByFlag;
const pet_config_1 = __turbopack_context__.r("[project]/packages/game-core/dist/constants/pet-config.js [app-route] (ecmascript)");
exports.PET_FLAG_HINTS = {
    petCrit: {
        label: "Pet skill CRIT (khi pet đánh, pha ON_ATTACK)",
        skillTypes: [
            "CRIT"
        ]
    },
    petBurn: {
        label: "Pet gây burn (skill BURN hoặc Cerberus)",
        skillTypes: [
            "BURN"
        ]
    },
    petPoison: {
        label: "Pet gây độc (POISON / DOT / Cerberus)",
        skillTypes: [
            "POISON",
            "DOT"
        ]
    },
    petShield: {
        label: "Pet lá chắn (SHIELD)",
        skillTypes: [
            "SHIELD"
        ]
    },
    petHeal: {
        label: "Pet hồi máu (HEAL / HEAL_BUFF)",
        skillTypes: [
            "HEAL",
            "HEAL_BUFF"
        ]
    },
    petDebuff: {
        label: "Pet giảm giáp (DEBUFF)",
        skillTypes: [
            "DEBUFF"
        ]
    }
};
function examplePetsForFlag(flag) {
    const out = new Set();
    const types = exports.PET_FLAG_HINTS[flag].skillTypes;
    for (const [name, cfg] of Object.entries(pet_config_1.PET_CONFIGS)){
        if (types.includes(cfg.skillType)) out.add(name);
    }
    if (flag === "petBurn" || flag === "petPoison") out.add("Cerberus");
    return [
        ...out
    ].sort().slice(0, 12);
}
exports.SKILL_TO_SYNERGY_FLAGS = {
    "Critical Strike": [
        "didCrit"
    ],
    "Savage Strike": [
        "didCrit"
    ],
    "Phantom Step": [
        "didCrit",
        "didDodge"
    ],
    "Heavy Blow": [
        "didHeavy"
    ],
    "Brutal Force": [
        "didHeavy"
    ],
    Bleed: [
        "didBleed"
    ],
    "Deep Wound": [
        "didBleed"
    ],
    "Toxic Bleed": [
        "didBleed"
    ],
    "Hemorrhagic Burst": [
        "didBleed"
    ],
    "Open Veins": [
        "didBleed"
    ],
    "Double Strike": [
        "didMultiHit"
    ],
    Flurry: [
        "didMultiHit"
    ],
    "Blade Rush": [
        "didMultiHit"
    ],
    "Hunter Instinct": [
        "didMultiHit"
    ],
    "Sweeping Strike": [
        "didMultiHit"
    ],
    "Rapid Jabs": [
        "didMultiHit"
    ],
    Lifesteal: [
        "didLifesteal"
    ],
    "Blood Feast": [
        "didLifesteal"
    ],
    "Soul Siphon": [
        "didLifesteal"
    ],
    "Iron Skin": [
        "didDamageReduction"
    ],
    "Stone Skin": [
        "didDamageReduction"
    ],
    Resilience: [
        "didDamageReduction"
    ],
    "Flashbang": [
        "didDamageReduction"
    ],
    "Tough Hide": [
        "didDamageReduction"
    ],
    "Spiked Armor": [
        "didDamageReduction"
    ],
    "Quick Reflex": [
        "didDodge"
    ],
    "Evasion Mastery": [
        "didDodge"
    ],
    "Mirror Image": [
        "didDodge"
    ],
    Blur: [
        "didDodge"
    ],
    Retaliation: [
        "didCounter"
    ],
    "Counter Block": [
        "didCounter"
    ],
    Precision: [
        "ignoreDef"
    ],
    Overpower: [
        "ignoreDef"
    ],
    "Crushing Blow": [
        "ignoreDef"
    ],
    "Guard Break": [
        "ignoreDef"
    ],
    Feint: [
        "ignoreDef"
    ],
    Fireball: [
        "didBurn"
    ],
    "Fire Blade": [
        "didBurn"
    ],
    "Poison Sting": [
        "didPoison"
    ],
    "Poison Strike": [
        "didPoison"
    ],
    "Toxic Edge": [
        "didPoison"
    ],
    "Venomous Touch": [
        "didPoison"
    ],
    "Chaos Surge": [
        "chaosTriggered"
    ],
    "Wild Surge": [
        "chaosTriggered"
    ],
    "Entropy Field": [
        "chaosTriggered"
    ],
    "Twist Fate": [
        "chaosTriggered"
    ],
    "Miracle Proc": [
        "chaosTriggered"
    ],
    Berserk: [
        "lowHp"
    ],
    "Death Wish": [
        "lowHp"
    ],
    "Last Stand": [
        "lowHp"
    ],
    Adrenaline: [
        "lowHp"
    ]
};
exports.REQ_HINTS = {
    didCrit: {
        label: "Chí mạng từ skill (pha hiện tại)",
        playerSkills: [
            "Critical Strike",
            "Savage Strike"
        ],
        note: "Thêm: **Phantom Step** (ON_DEFEND) cũng gán chí mạng khi proc ở pha thủ. **Chí mạng tự nhiên** (Luck, xem `/stats`) nếu nổ đúng lượt vẫn tính — không cần skill."
    },
    didHeavy: {
        label: "Đòn Heavy Blow–style",
        playerSkills: [
            "Heavy Blow",
            "Brutal Force"
        ]
    },
    didBleed: {
        label: "Chảy máu (Bleed / DOT bleed)",
        playerSkills: [
            "Bleed",
            "Deep Wound",
            "Toxic Bleed",
            "Hemorrhagic Burst",
            "Open Veins"
        ]
    },
    didMultiHit: {
        label: "Đánh nhiều nhát / bồi",
        playerSkills: [
            "Double Strike",
            "Flurry",
            "Blade Rush",
            "Hunter Instinct",
            "Sweeping Strike",
            "Rapid Jabs"
        ]
    },
    didLifesteal: {
        label: "Hút máu (Lifesteal)",
        playerSkills: [
            "Lifesteal",
            "Blood Feast",
            "Soul Siphon"
        ]
    },
    didDamageReduction: {
        label: "Giảm sát thương nhận vào",
        playerSkills: [
            "Iron Skin",
            "Stone Skin",
            "Resilience",
            "Flashbang",
            "Tough Hide",
            "Spiked Armor"
        ]
    },
    didDodge: {
        label: "Né đòn",
        playerSkills: [
            "Quick Reflex",
            "Evasion Mastery",
            "Mirror Image",
            "Blur",
            "Phantom Step"
        ]
    },
    didCounter: {
        label: "Phản công / counter",
        playerSkills: [
            "Retaliation",
            "Counter Block"
        ],
        note: "Một số skill giảm thương có thể kèm phản damage; trong DB hiện có **Retaliation**, **Counter Block**."
    },
    ignoreDef: {
        label: "Xuyên giáp (ignore DEF)",
        playerSkills: [
            "Precision",
            "Overpower",
            "Crushing Blow",
            "Guard Break",
            "Feint"
        ]
    },
    didBurn: {
        label: "Thiêu đốt (Burn)",
        playerSkills: [
            "Fireball",
            "Fire Blade"
        ]
    },
    didPoison: {
        label: "Độc (Poison)",
        playerSkills: [
            "Poison Sting",
            "Poison Strike",
            "Toxic Edge",
            "Venomous Touch"
        ]
    },
    chaosTriggered: {
        label: "Hỗn mang (Chaos proc)",
        playerSkills: [
            "Chaos Surge",
            "Wild Surge",
            "Entropy Field",
            "Twist Fate",
            "Miracle Proc"
        ]
    },
    lowHp: {
        label: "Trạng thái / skill máu thấp",
        playerSkills: [
            "Berserk",
            "Death Wish",
            "Last Stand",
            "Adrenaline"
        ],
        note: "Trong trận, **HP bạn < 30%** cũng được tính là lowHp cho một số hiệu ứng."
    },
    petCrit: {
        label: "Pet CRIT (khi pet proc ON_ATTACK)",
        playerSkills: []
    },
    petBurn: {
        label: "Pet Burn",
        playerSkills: []
    },
    petPoison: {
        label: "Pet Poison",
        playerSkills: []
    },
    petShield: {
        label: "Pet Shield",
        playerSkills: []
    },
    petHeal: {
        label: "Pet hồi máu",
        playerSkills: []
    },
    petDebuff: {
        label: "Pet Debuff (giảm giáp địch)",
        playerSkills: []
    }
};
function flagsFromPlayerSkillNames(skillNames) {
    const s = new Set();
    for (const name of skillNames){
        const fs = exports.SKILL_TO_SYNERGY_FLAGS[name];
        if (fs) fs.forEach((f)=>s.add(f));
    }
    return s;
}
function flagsFromEquippedPets(pets) {
    const s = new Set();
    for (const p of pets){
        if (!p.isEquipped) continue;
        if (p.name === "Cerberus") {
            s.add("petBurn");
            s.add("petPoison");
            continue;
        }
        const cfg = pet_config_1.PET_CONFIGS[p.name];
        if (!cfg) continue;
        const t = cfg.skillType;
        if (t === "CRIT") s.add("petCrit");
        if (t === "BURN") s.add("petBurn");
        if (t === "POISON" || t === "DOT") s.add("petPoison");
        if (t === "SHIELD") s.add("petShield");
        if (t === "HEAL" || t === "HEAL_BUFF") s.add("petHeal");
        if (t === "DEBUFF") s.add("petDebuff");
    }
    return s;
}
function ownedPetNamesByFlag(allPets) {
    const map = new Map();
    const add = (flag, name, equipped)=>{
        if (!map.has(flag)) map.set(flag, {
            equipped: [],
            inventory: []
        });
        const b = map.get(flag);
        (equipped ? b.equipped : b.inventory).push(name);
    };
    for (const p of allPets){
        if (p.name === "Cerberus") {
            add("petBurn", p.name, !!p.isEquipped);
            add("petPoison", p.name, !!p.isEquipped);
            continue;
        }
        const cfg = pet_config_1.PET_CONFIGS[p.name];
        if (!cfg) continue;
        const t = cfg.skillType;
        if (t === "CRIT") add("petCrit", p.name, !!p.isEquipped);
        if (t === "BURN") add("petBurn", p.name, !!p.isEquipped);
        if (t === "POISON" || t === "DOT") add("petPoison", p.name, !!p.isEquipped);
        if (t === "SHIELD") add("petShield", p.name, !!p.isEquipped);
        if (t === "HEAL" || t === "HEAL_BUFF") add("petHeal", p.name, !!p.isEquipped);
        if (t === "DEBUFF") add("petDebuff", p.name, !!p.isEquipped);
    }
    return map;
}
}),
"[project]/packages/game-core/dist/constants/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __createBinding = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = {
            enumerable: true,
            get: function() {
                return m[k];
            }
        };
    }
    Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __exportStar = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__exportStar || function(m, exports1) {
    for(var p in m)if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports1, p)) __createBinding(exports1, m, p);
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
__exportStar(__turbopack_context__.r("[project]/packages/game-core/dist/constants/beasts.js [app-route] (ecmascript)"), exports);
__exportStar(__turbopack_context__.r("[project]/packages/game-core/dist/constants/config.js [app-route] (ecmascript)"), exports);
__exportStar(__turbopack_context__.r("[project]/packages/game-core/dist/constants/pet-config.js [app-route] (ecmascript)"), exports);
__exportStar(__turbopack_context__.r("[project]/packages/game-core/dist/constants/accessory-config.js [app-route] (ecmascript)"), exports);
__exportStar(__turbopack_context__.r("[project]/packages/game-core/dist/constants/item-pool.js [app-route] (ecmascript)"), exports);
__exportStar(__turbopack_context__.r("[project]/packages/game-core/dist/constants/relic-pool.js [app-route] (ecmascript)"), exports);
__exportStar(__turbopack_context__.r("[project]/packages/game-core/dist/constants/titles.js [app-route] (ecmascript)"), exports);
__exportStar(__turbopack_context__.r("[project]/packages/game-core/dist/constants/synergy-hints.js [app-route] (ecmascript)"), exports);
}),
"[project]/packages/game-core/dist/services/rng.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.clamp = clamp;
exports.randomInt = randomInt;
exports.rollPercent = rollPercent;
exports.pickRandom = pickRandom;
exports.weightedPick = weightedPick;
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
function randomInt(min, max) {
    const lower = Math.ceil(Math.min(min, max));
    const upper = Math.floor(Math.max(min, max));
    return Math.floor(Math.random() * (upper - lower + 1)) + lower;
}
function rollPercent(chance) {
    return Math.random() * 100 < chance;
}
function pickRandom(items) {
    return items[randomInt(0, items.length - 1)];
}
function weightedPick(weights) {
    const total = Object.values(weights).reduce((sum, value)=>sum + value, 0);
    let roll = Math.random() * total;
    for (const [key, value] of Object.entries(weights)){
        roll -= value;
        if (roll <= 0) {
            return key;
        }
    }
    return Object.keys(weights)[0];
}
}),
"[project]/packages/game-core/dist/services/combat-utils.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * combat-utils.ts
 * Pure combat logic utilities.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.calculateDamage = calculateDamage;
exports.getBuffDamageReduction = getBuffDamageReduction;
exports.applyDamage = applyDamage;
exports.addEffect = addEffect;
exports.resolveTurnEffects = resolveTurnEffects;
exports.cleanupEffects = cleanupEffects;
/**
 * Scalable Damage Formula
 * rawDmg = atk
 * finalDamage = rawDamage * (1 - damageReduction)
 */ function calculateDamage(attackerFinalAtk, defenderFinalDef) {
    const reduction = defenderFinalDef / (defenderFinalDef + 100);
    const cappedReduction = Math.min(0.75, Math.max(0, reduction));
    const dmg = Math.floor(attackerFinalAtk * (1 - cappedReduction));
    return Math.max(1, dmg);
}
/**
 * Buff-based mitigation (Extra flat % reduction, kept isolated from raw defense formula)
 */ function getBuffDamageReduction(effects) {
    const reductionBuffs = effects.filter((e)=>e.type === "buff" && e.stat === "reduce_damage");
    const totalReduction = reductionBuffs.reduce((acc, curr)=>acc + (curr.value || 0), 0);
    return totalReduction;
}
/**
 * Core Damage Application
 * Damage is absorbed by shield first. Remaining damage reduces HP.
 */ function applyDamage(target, damage, events) {
    if (target.shield > 0) {
        const absorbed = Math.min(target.shield, damage);
        target.shield -= absorbed;
        const remainingDmg = damage - absorbed;
        events.push(`🛡️ **Giáp ảo** hấp thụ **${absorbed}**! (Còn lại: ${Math.floor(target.shield)})`);
        if (remainingDmg > 0) {
            target.hp -= remainingDmg;
            events.push(`🩸 **${target.name}** chịu thêm **${Math.floor(remainingDmg)}** sát thương vào HP.`);
        }
    } else {
        target.hp -= damage;
        events.push(`🩸 **${target.name}** chịu **${Math.floor(damage)}** sát thương.`);
    }
    if (target.hp < 0) target.hp = 0;
}
/**
 * Advanced Effect Stacking
 * Strategy: Increase stacks up to limit, and REFRESH duration to the new value if it's higher.
 */ function addEffect(effects, newEffect, maxStacks = 5) {
    const existing = effects.find((e)=>e.name === newEffect.name && e.type === newEffect.type);
    if (existing) {
        existing.stacks = Math.min(maxStacks, existing.stacks + 1);
        existing.turns = Math.max(existing.turns, newEffect.turns);
    } else {
        effects.push({
            ...newEffect,
            stacks: 1
        });
    }
}
/**
 * Turn-Start Effect Resolution
 */ function resolveTurnEffects(target, effects, events) {
    if (!effects) return;
    for (const e of effects){
        if (e.turns <= 0) continue;
        switch(e.type){
            case "hot":
                const heal = (e.value || 0) * (e.stacks || 1);
                target.hp = Math.min(target.maxHp, target.hp + heal);
                events.push(`🟢 **${e.name}** hồi phục **${Math.floor(heal)}** HP.`);
                break;
            case "dot":
                const dotDmg = (e.value || 0) * (e.stacks || 1);
                applyDamage(target, dotDmg, events);
                break;
            case "poison":
                const poisonDmg = (e.value || 0) * (e.stacks || 1);
                applyDamage(target, poisonDmg, events);
                events.push(`🤢 **Độc tố** (x${e.stacks}) gây thêm áp lực.`);
                break;
            case "burn":
                const burnDmg = Math.floor(target.maxHp * ((e.value || 0) / 100)) * (e.stacks || 1);
                applyDamage(target, burnDmg, events);
                events.push(`🌋 **Vết bỏng** gây sát thương % Máu.`);
                break;
        }
    }
}
/**
 * Post-Turn Cleanup
 * Reduce duration and remove expired.
 */ function cleanupEffects(effects, events) {
    if (!effects) return;
    for(let i = effects.length - 1; i >= 0; i--){
        const e = effects[i];
        if (!e) continue;
        e.turns--;
        if (e.turns <= 0) {
            events.push(`⏳ Hiệu ứng **${e.name}** đã hết tác dụng.`);
            effects.splice(i, 1);
        }
    }
}
}),
"[project]/packages/game-core/dist/services/leveling.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.requiredExpForLevel = requiredExpForLevel;
exports.applyLevelUps = applyLevelUps;
function requiredExpForLevel(level) {
    return Math.floor(100 * Math.pow(level, 1.5));
}
function applyLevelUps(stats) {
    const updated = {
        ...stats
    };
    const summaries = [];
    let levelsGained = 0;
    while(updated.exp >= requiredExpForLevel(updated.level)){
        const needed = requiredExpForLevel(updated.level);
        updated.exp -= needed;
        updated.level += 1;
        levelsGained += 1;
        const strGain = randomInt(1, 3);
        const agiGain = randomInt(1, 3);
        const gainedLuck = rollPercent(10) ? 1 : 0;
        updated.str += strGain;
        updated.agi += agiGain;
        updated.luck += gainedLuck;
        const hpGain = randomInt(5, 15);
        updated.maxHp += hpGain;
        updated.currentHp = updated.maxHp;
        summaries.push(`Level ${updated.level}: STR +${strGain}, AGI +${agiGain}${gainedLuck > 0 ? ", LUCK +1" : ""}, MAX HP +${hpGain}`);
    }
    return {
        updated,
        levelsGained,
        summaries
    };
}
function randomInt(min, max) {
    const lower = Math.ceil(Math.min(min, max));
    const upper = Math.floor(Math.max(min, max));
    return Math.floor(Math.random() * (upper - lower + 1)) + lower;
}
function rollPercent(chance) {
    return Math.random() * 100 < chance;
}
}),
"[project]/packages/game-core/dist/services/hunt-service.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.rollRarity = rollRarity;
exports.createWildBeast = createWildBeast;
const beasts_1 = __turbopack_context__.r("[project]/packages/game-core/dist/constants/beasts.js [app-route] (ecmascript)");
const pet_config_1 = __turbopack_context__.r("[project]/packages/game-core/dist/constants/pet-config.js [app-route] (ecmascript)");
const config_1 = __turbopack_context__.r("[project]/packages/game-core/dist/constants/config.js [app-route] (ecmascript)");
const rng_1 = __turbopack_context__.r("[project]/packages/game-core/dist/services/rng.js [app-route] (ecmascript)");
function rollRarity(luck) {
    const commonReduction = (0, rng_1.clamp)(luck * 0.5, 0, 30);
    const rareBonus = commonReduction * 0.6;
    const epicBonus = commonReduction * 0.3;
    const legendaryBonus = commonReduction * 0.1;
    const legendaryRate = (0, rng_1.clamp)(config_1.RARITY_BASE_RATES["LEGENDARY"] + legendaryBonus, 0, 10);
    const commonRate = (0, rng_1.clamp)(config_1.RARITY_BASE_RATES["COMMON"] - commonReduction, 5, 100);
    let rareRate = config_1.RARITY_BASE_RATES["RARE"] + rareBonus;
    let epicRate = config_1.RARITY_BASE_RATES["EPIC"] + epicBonus;
    const totalBeforeNormalize = commonRate + rareRate + epicRate + legendaryRate;
    const diff = 100 - totalBeforeNormalize;
    rareRate += diff * 0.67;
    epicRate += diff * 0.33;
    return (0, rng_1.weightedPick)({
        COMMON: commonRate,
        RARE: rareRate,
        EPIC: epicRate,
        LEGENDARY: legendaryRate
    });
}
function createWildBeast(level, luck) {
    const rarity = rollRarity(luck);
    const name = (0, rng_1.pickRandom)(beasts_1.BEAST_LIBRARY[rarity]);
    const config = pet_config_1.PET_CONFIGS[name];
    const powerRange = config_1.RARITY_POWER_RANGES[rarity];
    const levelBonus = Math.max(0, Math.floor(level / 2));
    const power = (0, rng_1.randomInt)(powerRange.min, powerRange.max) + levelBonus;
    return {
        name,
        rarity,
        power,
        role: config?.role,
        skillType: config?.skillType,
        skillPower: config?.skillPower,
        trigger: config?.trigger
    };
}
}),
"[project]/packages/game-core/dist/services/pet-utils.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.enrichBeast = enrichBeast;
exports.calculatePetStatBonus = calculatePetStatBonus;
exports.calculatePetStatBonusDetailed = calculatePetStatBonusDetailed;
const pet_config_1 = __turbopack_context__.r("[project]/packages/game-core/dist/constants/pet-config.js [app-route] (ecmascript)");
function enrichBeast(beast) {
    let config = pet_config_1.PET_CONFIGS[beast.name];
    if (!config) {
        const isDps = beast.id.charCodeAt(0) % 3 === 0;
        const isTank = beast.id.charCodeAt(0) % 3 === 1;
        config = {
            name: beast.name,
            role: isDps ? "DPS" : isTank ? "TANK" : "SUPPORT",
            skillType: isDps ? "DAMAGE" : isTank ? "REDUCE_DAMAGE" : "HEAL",
            skillPower: beast.rarity === "LEGENDARY" ? 0.3 : beast.rarity === "EPIC" ? 0.15 : 0.05,
            trigger: isDps ? "ON_ATTACK" : isTank ? "ON_DEFEND" : "ON_TURN_START",
            rarity: beast.rarity,
            description: "Một sinh vật hoang dã bí ẩn chưa được phân loại."
        };
    }
    return {
        ...beast,
        role: beast.role ?? config.role,
        skillType: beast.skillType ?? config.skillType,
        skillPower: beast.skillPower ?? config.skillPower,
        trigger: beast.trigger ?? config.trigger,
        config
    };
}
function calculatePetStatBonus(pets, customMultipliers) {
    let bonusAtk = 0;
    let bonusDef = 0;
    const sortedPets = [
        ...pets
    ].sort((a, b)=>b.power - a.power);
    const multipliers = customMultipliers || [
        1.0,
        0.7,
        0.5
    ];
    sortedPets.forEach((pet, index)=>{
        if (index >= multipliers.length) return;
        const mult = multipliers[index];
        const enriched = enrichBeast(pet);
        bonusAtk += pet.power * 0.3 * mult;
        bonusDef += pet.power * 0.2 * mult;
        if (enriched.role === "DPS") bonusAtk += pet.power * 0.1 * mult;
        if (enriched.role === "TANK") bonusDef += pet.power * 0.1 * mult;
    });
    return {
        bonusAtk,
        bonusDef
    };
}
function calculatePetStatBonusDetailed(pets, customMultipliers) {
    const sortedPets = [
        ...pets
    ].sort((a, b)=>b.power - a.power);
    const multipliers = customMultipliers || [
        1.0,
        0.7,
        0.5
    ];
    const contributions = [];
    let bonusAtk = 0;
    let bonusDef = 0;
    sortedPets.forEach((pet, index)=>{
        if (index >= multipliers.length) return;
        const mult = multipliers[index];
        const enriched = enrichBeast(pet);
        let atk = pet.power * 0.3 * mult;
        let def = pet.power * 0.2 * mult;
        if (enriched.role === "DPS") atk += pet.power * 0.1 * mult;
        if (enriched.role === "TANK") def += pet.power * 0.1 * mult;
        bonusAtk += atk;
        bonusDef += def;
        contributions.push({
            name: pet.name,
            role: enriched.role || "?",
            power: pet.power,
            slotMult: mult,
            atk,
            def
        });
    });
    return {
        contributions,
        totalAtk: bonusAtk,
        totalDef: bonusDef
    };
}
}),
"[project]/packages/game-core/dist/services/skill-system.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SYNERGY_LIST = exports.SKILL_HANDLERS = exports.SKILL_EMOJIS = void 0;
exports.applySkills = applySkills;
exports.getSkillDescription = getSkillDescription;
const combat_utils_1 = __turbopack_context__.r("[project]/packages/game-core/dist/services/combat-utils.js [app-route] (ecmascript)");
exports.SKILL_EMOJIS = {
    DAMAGE: "💥",
    DOT: "🔥",
    DODGE: "💨",
    HEAL: "💚",
    GOLD: "💰",
    REDUCE_DAMAGE: "🛡️",
    CHAOS: "🌀",
    TAME: "🐾",
    POISON: "🤢",
    BURN: "🌋",
    SHIELD: "🔮",
    COUNTER: "⚔️",
    BUFF: "✨",
    LIFESTEAL: "🩸"
};
exports.SKILL_HANDLERS = {
    DAMAGE: (ctx, skill, flags = {})=>{
        let addon = skill.multiplier;
        if (skill.scaleWithHp) addon += 1 - ctx.player.hp / ctx.player.maxHp;
        if (skill.scaleWithPet) addon += ctx.player.petPower * 0.01;
        if (skill.name === "Critical Strike" || skill.name === "Savage Strike") flags.didCrit = true;
        if (skill.name === "Heavy Blow" || skill.name === "Brutal Force") flags.didHeavy = true;
        if (skill.hpAboveThreshold && ctx.player.hp / ctx.player.maxHp < skill.hpAboveThreshold) addon = 0;
        if (skill.targetHpBelowThreshold && ctx.enemy.hp / ctx.enemy.maxHp > skill.targetHpBelowThreshold) addon = 0;
        ctx.player.multipliers.damage += addon;
        if (skill.ignoreDef || flags.ignoreDef) ctx.flags.player.ignoreDef = true;
        if (skill.extraHit) flags.didMultiHit = true;
    },
    DOT: (ctx, skill, flags = {})=>{
        const val = Math.max(1, Math.floor(ctx.player.atk * skill.multiplier));
        const turns = 3 + (skill.durationBonus || 0);
        (0, combat_utils_1.addEffect)(ctx.effects.enemy, {
            type: "dot",
            value: val,
            turns,
            name: skill.name,
            stacks: 1
        });
        flags.didBleed = true;
    },
    POISON: (ctx, skill, flags = {})=>{
        const baseMult = skill.dotMultiplier || skill.multiplier || 0.15;
        const val = Math.max(1, Math.floor(ctx.player.atk * baseMult));
        const duration = skill.duration || 3;
        (0, combat_utils_1.addEffect)(ctx.effects.enemy, {
            type: "poison",
            value: val,
            turns: duration,
            name: skill.name,
            stacks: 1
        }, 5);
        flags.didPoison = true;
    },
    BURN: (ctx, skill, flags = {})=>{
        const baseMult = skill.dotMultiplier || skill.multiplier || 0.15;
        const val = Math.max(1, Math.floor(ctx.player.atk * baseMult));
        const duration = skill.duration || 2;
        (0, combat_utils_1.addEffect)(ctx.effects.enemy, {
            type: "burn",
            value: val,
            turns: duration,
            name: skill.name,
            stacks: 1
        }, 1);
        flags.didBurn = true;
        if (skill.multiplier > 0) {
            ctx.player.multipliers.damage += skill.multiplier;
        }
    },
    SHIELD: (ctx, skill)=>{
        const value = Math.floor(ctx.player.atk * skill.multiplier);
        ctx.player.shield += value;
    },
    DODGE: (ctx, skill, flags = {})=>{
        ctx.flags.player.dodged = true;
        flags.didDodge = true;
    },
    HEAL: (ctx, skill)=>{
        const healAmount = Math.floor(ctx.player.atk * skill.multiplier);
        ctx.player.hp = Math.min(ctx.player.maxHp, ctx.player.hp + healAmount);
        ctx.extra.player.instantHeal += healAmount;
    },
    LIFESTEAL: (ctx, skill, flags = {})=>{
        flags.didLifesteal = true;
    },
    GOLD: (ctx, skill)=>{
        ctx.player.multipliers.gold += skill.multiplier;
    },
    REDUCE_DAMAGE: (ctx, skill, flags = {})=>{
        (0, combat_utils_1.addEffect)(ctx.effects.player, {
            type: "buff",
            stat: "reduce_damage",
            value: skill.multiplier,
            turns: 3,
            name: skill.name,
            stacks: 1
        });
        flags.didDamageReduction = true;
    },
    COUNTER: (ctx, skill, flags = {})=>{
        flags.didCounter = true;
    },
    BUFF: (ctx, skill)=>{
        if (skill.bonusSpeed) ctx.player.spd += skill.bonusSpeed;
        if (skill.statBonus) ctx.player.atk *= 1 + skill.statBonus;
    },
    CHAOS: (ctx, skill, flags = {})=>{
        flags.chaosTriggered = true;
        const roll = Math.random();
        if (roll < 0.33) {
            ctx.player.multipliers.damage += 0.5;
        } else if (roll < 0.66) {
            const heal = Math.floor(ctx.player.maxHp * 0.2);
            ctx.player.hp = Math.min(ctx.player.maxHp, ctx.player.hp + heal);
            ctx.extra.player.instantHeal += heal;
        } else {
            ctx.extra.player.bonusDamage += ctx.player.atk;
        }
    },
    REFLECT: ()=>{},
    BLEED: (ctx, skill, flags = {})=>{
        const val = Math.max(1, Math.floor(ctx.player.atk * skill.multiplier));
        (0, combat_utils_1.addEffect)(ctx.effects.enemy, {
            type: "dot",
            value: val,
            turns: 3,
            name: "Chảy máu",
            stacks: 1
        });
        flags.didBleed = true;
    },
    DEBUFF: (ctx, skill, flags = {})=>{
        (0, combat_utils_1.addEffect)(ctx.effects.enemy, {
            type: "debuff",
            stat: "def",
            value: skill.multiplier,
            turns: 3,
            name: "Giảm giáp",
            stacks: 1
        });
        flags.petDebuff = true;
    },
    CLEANSE: (ctx)=>{
        ctx.effects.player = ctx.effects.player.filter((e)=>e.type !== "debuff" && e.type !== "poison" && e.type !== "burn" && e.type !== "dot");
        ctx.player.hp = Math.min(ctx.player.maxHp, ctx.player.hp + ctx.player.maxHp * 0.05);
    },
    EXECUTE: (ctx, skill)=>{
        if (ctx.enemy.hp / ctx.enemy.maxHp < 0.3) {
            ctx.extra.player.bonusDamage += ctx.player.atk * skill.multiplier;
        }
    },
    HEAL_BUFF: (ctx, skill)=>{
        const heal = Math.floor(ctx.player.maxHp * skill.multiplier);
        ctx.player.hp = Math.min(ctx.player.maxHp, ctx.player.hp + heal);
        ctx.player.atk *= 1.1;
        ctx.player.def *= 1.1;
    },
    CRIT: (ctx, skill, flags = {})=>{
        if (skill.name === "Griffin") {
            ctx.player.multipliers.damage += skill.multiplier;
        } else {
            ctx.player.critRate += skill.multiplier;
        }
        flags.petCrit = true;
    },
    TAME: ()=>{}
};
function applySkills(userSkills, trigger, ctx) {
    const triggeredSkills = [];
    const triggeredSynergies = [];
    const flags = {
        didCrit: false,
        didHeavy: false,
        didBleed: false,
        didDodge: false,
        didMultiHit: false,
        didLifesteal: false,
        didDamageReduction: false,
        didCounter: false,
        didBurn: false,
        didPoison: false,
        ignoreDef: false,
        lowHp: ctx.player.hp / ctx.player.maxHp < 0.3,
        chaosTriggered: false
    };
    if (!userSkills || userSkills.length === 0) {
        return {
            triggeredSkills,
            triggeredSynergies,
            totalDamage: 0,
            healAmount: 0,
            flags,
            burnStacks: 0,
            poisonStacks: 0
        };
    }
    const rolled = [];
    for (const us of userSkills){
        const skill = us.skill || us;
        if (skill.name === "Berserk") {
            rolled.push(skill);
            continue;
        }
        if (skill.trigger !== trigger) continue;
        let chance = skill.chance || 0.1;
        if (skill.name === "Death Wish" && flags.lowHp) chance = 1.0;
        if (Math.random() <= chance) {
            rolled.push(skill);
        } else if (skill.rerollFailedProc && Math.random() <= 0.5) {
            rolled.push(skill);
        }
    }
    for (const skill of rolled){
        const handler = exports.SKILL_HANDLERS[skill.type];
        if (handler) {
            if (skill.type === "DODGE" && ctx.flags.player.dodged) continue;
            handler(ctx, skill, flags);
            const emoji = exports.SKILL_EMOJIS[skill.type] || "✨";
            triggeredSkills.push(`${emoji} **${skill.name}**`);
        }
        if (skill.name === "Relentless") {
            ctx.player.multipliers.damage += rolled.length * 0.05;
        }
        if (skill.name === "Precision") flags.ignoreDef = true;
        if (skill.isCritGuaranteed) flags.didCrit = true;
    }
    applySynergy(ctx, flags, triggeredSynergies, triggeredSkills.length);
    const burnStacks = ctx.effects.enemy.filter((e)=>e.type === "burn").reduce((acc, curr)=>acc + (curr.stacks || 0), 0);
    const poisonStacks = ctx.effects.enemy.filter((e)=>e.type === "poison").reduce((acc, curr)=>acc + (curr.stacks || 0), 0);
    return {
        triggeredSkills,
        triggeredSynergies,
        totalDamage: ctx.extra.player.bonusDamage,
        healAmount: ctx.extra.player.instantHeal,
        flags,
        burnStacks,
        poisonStacks
    };
}
exports.SYNERGY_LIST = [
    {
        name: "⚡ Sát Thương Thần Thánh",
        desc: "Crit + Heavy Blow",
        bonus: "+50% sát thương đòn đánh",
        req: [
            "didCrit",
            "didHeavy"
        ],
        tips: "Cần: Critical Strike, Savage Strike + Heavy Blow, Brutal Force"
    },
    {
        name: "⚔️ Liên Hoàn Chí Mạng",
        desc: "Crit + Multi-Hit",
        bonus: "+20% sát thương bồi thêm",
        req: [
            "didCrit",
            "didMultiHit"
        ],
        tips: "Cần: Critical Strike, Savage Strike + Double Strike, Flurry"
    },
    {
        name: "🍷 Yến Tiệc Máu",
        desc: "Bleed + Lifesteal",
        bonus: "Hồi máu tăng thêm +50%",
        req: [
            "didBleed",
            "didLifesteal"
        ],
        tips: "Cần: Bleed, Toxic Bleed + Lifesteal, Blood Feast"
    },
    {
        name: "🎯 Đột Phá Giáp",
        desc: "Multi-Hit + Xuyên Giáp",
        bonus: "Tất cả các đòn đánh bồi đều xuyên 100% thủ",
        req: [
            "didMultiHit",
            "ignoreDef"
        ],
        tips: "Cần: Double Strike, Flurry + Precision, Overpower"
    },
    {
        name: "🔄 Phản Công Nhanh",
        desc: "Dodge + Counter",
        bonus: "+50% sát thương đòn phản công",
        req: [
            "didDodge",
            "didCounter"
        ],
        tips: "Cần: Quick Reflex, Evasion Mastery + Retaliation, Spiked Armor"
    },
    {
        name: "🔥 Hỏa Ngục",
        desc: "Burn + Crit/Multi/Heavy",
        bonus: "Tăng sát thương thiêu đốt và sát hưởng nổ",
        req: [
            "didBurn"
        ],
        tips: "Cần: Fireball, Fire Blade + Các kỹ năng Crit/Multi-hit/Heavy"
    },
    {
        name: "☠️ Thiên Diệp Độc",
        desc: "Poison + Crit/Multi-Hit",
        bonus: "Kích nổ sát thương độc hoặc tích tầng cực nhanh",
        req: [
            "didPoison"
        ],
        tips: "Cần: Poison Strike, Toxic Edge + Multi-hit"
    },
    {
        name: "⚛️ Hợp Kích Nguyên Tố",
        desc: "Burn + Poison",
        bonus: "Gây sát thương nổ hỗn hợp 30-50%",
        req: [
            "didBurn",
            "didPoison"
        ],
        tips: "Kích hoạt đồng thời cả Lửa và Độc"
    },
    {
        name: "🩸 Hút Máu Nguyên Tố",
        desc: "Burn/Poison + Lifesteal",
        bonus: "Tăng 30-50% lượng máu hút được",
        req: [
            "didLifesteal"
        ],
        tips: "Cần kỹ năng Hút máu trên mục tiêu đang bị Lửa hoặc Độc"
    },
    {
        name: "☣️ Tuyệt Diệt",
        desc: "Poison + Mục tiêu thấp máu",
        bonus: "Cộng thêm 60% sát thương cơ bản",
        req: [
            "didPoison"
        ],
        tips: "Hành quyết đối thủ khi chúng đang bị nhiễm độc"
    },
    {
        name: "🐾 Cộng hưởng Pet (Chí Mạng)",
        desc: "Player Crit + Pet Crit",
        bonus: "+20% sát thương đòn đánh",
        req: [
            "didCrit",
            "petCrit"
        ],
        tips: "Pet và Player cùng gây chí mạng"
    },
    {
        name: "🌋 Cộng hưởng Pet (Hỏa Hiện)",
        desc: "Player Burn + Pet Burn",
        bonus: "+50% sát thương thiêu đốt",
        req: [
            "didBurn",
            "petBurn"
        ],
        tips: "Pet và Player cùng thiêu cháy mục tiêu"
    },
    {
        name: "🤢 Cộng hưởng Pet (Độc Tố)",
        desc: "Player Poison + Pet Poison",
        bonus: "Tăng thêm 1 tầng độc tích tụ",
        req: [
            "didPoison",
            "petPoison"
        ],
        tips: "Pet và Player cùng đầu độc mục tiêu"
    },
    {
        name: "⚛️ Cộng hưởng Pet (Nguyên Tố)",
        desc: "Pet Burn + Pet Poison",
        bonus: "+25% tổng sát thương",
        req: [
            "petBurn",
            "petPoison"
        ],
        tips: "Pet kích hoạt cả hiệu ứng Lửa và Độc"
    },
    {
        name: "🛡️ Cộng hưởng Pet (Phòng Thủ)",
        desc: "Player Reduce + Pet Shield",
        bonus: "+20% chỉ số giảm thương",
        req: [
            "didDamageReduction",
            "petShield"
        ],
        tips: "Kết hợp lá chắn pet và kỹ năng giảm thương"
    },
    {
        name: "🩸 Cộng hưởng Pet (Hút Máu)",
        desc: "Player Lifesteal + Pet Heal",
        bonus: "+50% lượng máu hút được",
        req: [
            "didLifesteal",
            "petHeal"
        ],
        tips: "Pet hồi máu khi Player đang hút máu"
    },
    {
        name: "🎯 Cộng hưởng Pet (Xuyên Giáp)",
        desc: "Player Crit + Pet Debuff",
        bonus: "Đòn chí mạng xuyên 100% thủ",
        req: [
            "didCrit",
            "petDebuff"
        ],
        tips: "Pet giảm giáp giúp đòn chí mạng xuyên thấu"
    },
    {
        name: "💀 Cộng hưởng Pet (Hành Quyết)",
        desc: "Pet Crit + Mục tiêu <30% HP",
        bonus: "+30% sát thương đòn kết liễu",
        req: [
            "petCrit"
        ],
        tips: "Pet tung chí mạng khi kẻ thù yếu máu"
    }
];
function applySynergy(ctx, flags, synergies, totalProcs) {
    const baseDamage = ctx.player.atk;
    const targetHasBurn = ctx.effects.enemy.some((e)=>e.type === "burn");
    const targetHasPoison = ctx.effects.enemy.some((e)=>e.type === "poison");
    const burnStacks = ctx.effects.enemy.filter((e)=>e.type === "burn").reduce((acc, curr)=>acc + (curr.stacks || 0), 0);
    const poisonStacks = ctx.effects.enemy.filter((e)=>e.type === "poison").reduce((acc, curr)=>acc + (curr.stacks || 0), 0);
    if (flags.didBurn) {
        if (flags.didCrit) {
            const effect = ctx.effects.enemy.find((e)=>e.type === "burn");
            if (effect) effect.value *= 1.5;
            if (!synergies.includes("🔥 Hỏa Ngục")) synergies.push("🔥 Hỏa Ngục");
        }
        if (flags.didMultiHit) {
            const effect = ctx.effects.enemy.find((e)=>e.type === "burn");
            if (effect) effect.stacks = (effect.stacks || 1) + 1;
            if (!synergies.includes("🔥 Hỏa Ngục")) synergies.push("🔥 Hỏa Ngục");
        }
        if (burnStacks >= 2) {
            ctx.extra.player.bonusDamage += baseDamage * 0.4;
            synergies.push("🔥 Hỏa Ngục");
        }
        if (flags.didHeavy) {
            ctx.extra.player.bonusDamage += baseDamage * 0.5;
            if (!synergies.includes("🔥 Hỏa Ngục")) synergies.push("🔥 Hỏa Ngục");
        }
    }
    if (flags.didPoison) {
        if (flags.didCrit) {
            const effect = ctx.effects.enemy.find((e)=>e.type === "poison");
            if (effect) effect.value *= 1.4;
            if (!synergies.includes("☠️ Thiên Diệp Độc")) synergies.push("☠️ Thiên Diệp Độc");
        }
        if (flags.didMultiHit) {
            const effect = ctx.effects.enemy.find((e)=>e.type === "poison");
            if (effect) effect.stacks = (effect.stacks || 1) + 1;
            if (!synergies.includes("☠️ Thiên Diệp Độc")) synergies.push("☠️ Thiên Diệp Độc");
        }
        if (poisonStacks >= 3) {
            ctx.extra.player.bonusDamage += baseDamage * 0.5;
            synergies.push("☠️ Thiên Diệp Độc");
        }
    }
    if (targetHasBurn && targetHasPoison) {
        ctx.extra.player.bonusDamage += baseDamage * 0.3;
        synergies.push("⚛️ Hợp Kích Nguyên Tố");
    }
    if (flags.didBurn && flags.didPoison) {
        ctx.player.multipliers.damage += 0.2;
        if (!synergies.includes("⚛️ Hợp Kích Nguyên Tố")) synergies.push("⚛️ Hợp Kích Nguyên Tố");
    }
    if (flags.didLifesteal) {
        if (targetHasBurn) {
            ctx.extra.player.instantHeal += ctx.extra.player.instantHeal * 0.5;
            synergies.push("🩸 Hút Máu Nguyên Tố");
        } else if (targetHasPoison) {
            ctx.extra.player.instantHeal += ctx.extra.player.instantHeal * 0.3;
            synergies.push("🩸 Hút Máu Nguyên Tố");
        }
    }
    if (flags.lowHp && flags.didBurn) {
        ctx.player.multipliers.damage += 0.3;
        if (!synergies.includes("🔥 Hỏa Ngục")) synergies.push("🔥 Hỏa Ngục");
    }
    if (targetHasPoison && ctx.enemy.hp / ctx.enemy.maxHp < 0.3) {
        ctx.extra.player.bonusDamage += baseDamage * 0.6;
        synergies.push("☣️ Tuyệt Diệt");
    }
    if (flags.chaosTriggered && (flags.didBurn || flags.didPoison)) {
        const randomMultiplier = 1.5 + Math.random() * 1.0;
        ctx.player.multipliers.damage *= randomMultiplier;
        synergies.push("🌀 Hỗn Mang Bùng Nổ");
    }
    if (flags.didCrit && flags.didHeavy) {
        ctx.player.multipliers.damage += 0.5;
        synergies.push("⚡ Sát Thương Thần Thánh");
    }
    if (flags.didCrit && flags.didMultiHit) {
        ctx.player.multipliers.damage += 0.2;
        synergies.push("⚔️ Liên Hoàn Chí Mạng");
    }
}
function getSkillDescription(skill) {
    const chance = `${Math.round((skill.chance || 0.1) * 100)}%`;
    let trigger = "";
    switch(skill.trigger){
        case "ON_ATTACK":
            trigger = "Khi tấn công";
            break;
        case "ON_DEFEND":
            trigger = "Khi phòng thủ";
            break;
        case "ON_TURN_START":
            trigger = "Đầu mỗi lượt";
            break;
        default:
            trigger = "Khi kích hoạt";
    }
    let effect = "";
    switch(skill.type){
        case "DAMAGE":
            effect = `tăng ${Math.round(skill.multiplier * 100)}% sát thương`;
            if (skill.ignoreDef) effect += ", xuyên giáp";
            if (skill.extraHit) effect += ", đánh bồi";
            if (skill.scaleWithHp) effect += ", mạnh hơn khi thấp máu";
            break;
        case "DOT":
            effect = `gây sát thương duy trì (${Math.round(skill.multiplier * 100)}% ATK)`;
            break;
        case "HEAL":
            effect = `hồi phục ${Math.round(skill.multiplier * 100)}% ATK lượng máu`;
            break;
        case "REDUCE_DAMAGE":
            effect = `giảm sát thương nhận vào ${Math.round(skill.multiplier * 100)}%`;
            break;
        case "DODGE":
            effect = "né tránh đòn tấn công";
            break;
        case "SHIELD":
            effect = `tạo khiên ${Math.round(skill.multiplier * 100)}% ATK`;
            break;
        default:
            effect = "hiệu ứng đặc biệt";
    }
    return `*${trigger}, tỉ lệ ${chance}: ${effect}.*`;
}
}),
"[project]/packages/game-core/dist/services/pet-system.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.applyPetEffects = applyPetEffects;
const skill_system_1 = __turbopack_context__.r("[project]/packages/game-core/dist/services/skill-system.js [app-route] (ecmascript)");
const pet_utils_1 = __turbopack_context__.r("[project]/packages/game-core/dist/services/pet-utils.js [app-route] (ecmascript)");
function applyPetEffects(ctx, pets, trigger, flags) {
    const triggered = [];
    const triggeredPetIds = [];
    if (!pets || pets.length === 0) return {
        triggered,
        triggeredPetIds
    };
    for (const pet of pets){
        const enriched = (0, pet_utils_1.enrichBeast)(pet);
        if (enriched.trigger !== trigger) continue;
        const baseChance = 0.2;
        const powerModifier = pet.power * 0.001;
        const levelModifier = (pet.level - 1) * 0.01;
        const finalChance = Math.min(0.8, baseChance + powerModifier + levelModifier);
        if (Math.random() <= finalChance) {
            if (flags) {
                if (enriched.skillType === "CRIT") flags.petCrit = true;
                if (enriched.skillType === "BURN") flags.petBurn = true;
                if (enriched.skillType === "DOT" && enriched.name === "Cerberus") {
                    flags.petBurn = true;
                    flags.petPoison = true;
                } else if (enriched.skillType === "DOT" || enriched.skillType === "POISON") {
                    flags.petPoison = true;
                }
                if (enriched.skillType === "SHIELD") flags.petShield = true;
                if (enriched.skillType === "HEAL" || enriched.skillType === "HEAL_BUFF") flags.petHeal = true;
                if (enriched.skillType === "DEBUFF") flags.petDebuff = true;
            }
            const handler = skill_system_1.SKILL_HANDLERS[enriched.skillType];
            if (handler) {
                const skillObj = {
                    name: pet.name,
                    type: enriched.skillType,
                    multiplier: enriched.skillPower,
                    chance: finalChance,
                    trigger: enriched.trigger
                };
                if (enriched.name === "Cerberus") {
                    if (skill_system_1.SKILL_HANDLERS["BURN"]) skill_system_1.SKILL_HANDLERS["BURN"](ctx, skillObj, flags);
                    if (skill_system_1.SKILL_HANDLERS["POISON"]) skill_system_1.SKILL_HANDLERS["POISON"](ctx, skillObj, flags);
                } else {
                    handler(ctx, skillObj, flags);
                }
                const emoji = skill_system_1.SKILL_EMOJIS[enriched.skillType] || "🐾";
                const logMsg = `${emoji} **${pet.name}** thi triển kỹ năng: **${enriched.skillType}**`;
                triggered.push(logMsg);
                triggeredPetIds.push(pet.id);
            }
        }
    }
    return {
        triggered,
        triggeredPetIds
    };
}
}),
"[project]/packages/game-core/dist/services/pet-synergy.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.PET_PLAYER_SYNERGY_NAMES = void 0;
exports.getActiveSynergies = getActiveSynergies;
exports.calculateSynergyMultipliers = calculateSynergyMultipliers;
exports.applyPetSynergy = applyPetSynergy;
exports.applyPetPlayerSynergy = applyPetPlayerSynergy;
const pet_utils_1 = __turbopack_context__.r("[project]/packages/game-core/dist/services/pet-utils.js [app-route] (ecmascript)");
exports.PET_PLAYER_SYNERGY_NAMES = {
    critBoth: "🐾 Cộng hưởng Pet (Chí Mạng)",
    burnBoth: "🌋 Cộng hưởng Pet (Hỏa Hiện)",
    poisonBoth: "🤢 Cộng hưởng Pet (Độc Tố)",
    elementPet: "⚛️ Cộng hưởng Pet (Nguyên Tố)",
    defenseBoth: "🛡️ Cộng hưởng Pet (Phòng Thủ)",
    lifestealHeal: "🩸 Cộng hưởng Pet (Hút Máu)",
    critDebuff: "🎯 Cộng hưởng Pet (Xuyên Giáp)",
    executeLowHp: "💀 Cộng hưởng Pet (Hành Quyết)"
};
function getActiveSynergies(pets) {
    if (pets.length < 2) return [];
    const synergies = [];
    const enrichedPets = pets.map((p)=>(0, pet_utils_1.enrichBeast)(p));
    const roles = enrichedPets.map((p)=>p.role);
    const rarities = enrichedPets.map((p)=>p.rarity);
    const dpsCount = roles.filter((r)=>r === "DPS").length;
    const tankCount = roles.filter((r)=>r === "TANK").length;
    const supportCount = roles.filter((r)=>r === "SUPPORT").length;
    if (dpsCount >= 2) {
        synergies.push({
            icon: "🔥",
            name: "Double DPS",
            description: "+15% Sát thương"
        });
    }
    if (tankCount >= 1 && supportCount >= 1) {
        synergies.push({
            icon: "🛡️",
            name: "Kiên Định",
            description: "+15% Giảm sát thương & +15% Hồi máu"
        });
    }
    if (pets.length === 3) {
        if (rarities.every((r)=>r === rarities[0])) {
            const rarity = rarities[0];
            synergies.push({
                icon: "✨",
                name: `Three Body Problem (${rarity})`,
                description: `+10% Toàn bộ chỉ số`
            });
        }
    }
    if (pets.length === 3 && dpsCount === 1 && tankCount === 1 && supportCount === 1) {
        synergies.push({
            icon: "☯️",
            name: "All Balance",
            description: "+12% Công và Thủ"
        });
    }
    return synergies;
}
function calculateSynergyMultipliers(pets) {
    const active = getActiveSynergies(pets);
    let damage = 1.0;
    let defense = 1.0;
    let heal = 1.0;
    active.forEach((syn)=>{
        if (syn.name === "Double DPS") damage += 0.15;
        if (syn.name === "Kiên Định") {
            defense += 0.15;
            heal += 0.15;
        }
        if (syn.name.startsWith("Three Body Problem")) {
            const bonus = 0.1;
            damage += bonus;
            defense += bonus;
        }
        if (syn.name === "All Balance") {
            damage += 0.12;
            defense += 0.12;
        }
    });
    return {
        damage,
        defense,
        heal
    };
}
function applyPetSynergy(ctx, pets) {
    const mults = calculateSynergyMultipliers(pets);
    const active = getActiveSynergies(pets);
    ctx.player.multipliers.damage = mults.damage;
    ctx.player.multipliers.defense = mults.defense;
    if (!ctx.player.multipliers.heal) ctx.player.multipliers.heal = 1.0;
    ctx.player.multipliers.heal *= mults.heal;
    if (active.length === 0) return [];
    return active.map((syn)=>`${syn.icon} **${syn.name}** — ${syn.description}`);
}
function applyPetPlayerSynergy(ctx, flags) {
    const { didCrit, didBurn, didPoison, didMultiHit, didLifesteal, didDamageReduction, petCrit, petBurn, petPoison, petShield, petHeal, petDebuff } = flags;
    const logs = [];
    const names = [];
    const N = exports.PET_PLAYER_SYNERGY_NAMES;
    const add = (title, line)=>{
        names.push(title);
        logs.push(`🔗 **${title}** — ${line}`);
    };
    if (petCrit && didCrit) {
        ctx.player.multipliers.damage *= 1.2;
        add(N.critBoth, "Tăng 20% sát thương.");
    }
    if (petBurn && didBurn) {
        const burn = ctx.effects.enemy.find((e)=>e.type === "burn");
        if (burn) {
            burn.value *= 1.5;
            add(N.burnBoth, "Tăng 50% sát thương thiêu đốt.");
        }
    }
    if (petPoison && didPoison) {
        const poison = ctx.effects.enemy.find((e)=>e.type === "poison");
        if (poison) {
            poison.stacks = (poison.stacks || 1) + 1;
            add(N.poisonBoth, "Tăng thêm 1 tầng độc.");
        }
    }
    if (petBurn && petPoison) {
        ctx.player.multipliers.damage *= 1.25;
        add(N.elementPet, "Tăng 25% tổng sát thương.");
    }
    if (petShield && didDamageReduction) {
        ctx.extra.player.reduceDamage += (ctx.extra.player.reduceDamage || 0) * 0.2;
        ctx.player.multipliers.defense += 0.2;
        add(N.defenseBoth, "Tăng 20% giảm sát thương.");
    }
    if (petHeal && didLifesteal) {
        const healAmount = ctx.extra.player.instantHeal || 0;
        ctx.extra.player.instantHeal += healAmount * 0.5;
        add(N.lifestealHeal, "Tăng 50% lượng hồi máu (hút máu).");
    }
    if (petDebuff && didCrit) {
        ctx.flags.player.ignoreDef = true;
        add(N.critDebuff, "Đòn chí mạng xuyên 100% giáp.");
    }
    const targetHpRatio = ctx.enemy.hp / ctx.enemy.maxHp;
    if (petCrit && targetHpRatio < 0.3) {
        ctx.player.multipliers.damage *= 1.3;
        add(N.executeLowHp, "Tăng 30% sát thương lên kẻ địch thấp máu.");
    }
    return {
        logs,
        names
    };
}
}),
"[project]/packages/game-core/dist/services/stats-service.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.computeCombatStats = computeCombatStats;
exports.calculatePipelineDamage = calculatePipelineDamage;
const pet_synergy_1 = __turbopack_context__.r("[project]/packages/game-core/dist/services/pet-synergy.js [app-route] (ecmascript)");
const pet_utils_1 = __turbopack_context__.r("[project]/packages/game-core/dist/services/pet-utils.js [app-route] (ecmascript)");
const accessory_config_1 = __turbopack_context__.r("[project]/packages/game-core/dist/constants/accessory-config.js [app-route] (ecmascript)");
const titles_1 = __turbopack_context__.r("[project]/packages/game-core/dist/constants/titles.js [app-route] (ecmascript)");
function computeCombatStats(user, items, pets = [], buffs = [], petMultipliers) {
    const base = {
        str: user.str,
        agi: user.agi,
        hp: user.maxHp,
        luck: user.luck || 0
    };
    const flat = {
        str: 0,
        agi: 0,
        def: 0,
        hp: 0,
        weaponPower: 0,
        petAtk: 0,
        petDef: 0
    };
    const itemsWithLevel = items;
    const equipped = itemsWithLevel.filter((i)=>i.isEquipped !== false);
    const accessories = [];
    const activeUniqueEffects = [];
    const gearFlatLines = [];
    const damageMultDeltas = [];
    const defenseMultDeltas = [];
    const hpMultDeltas = [];
    const accessoryEffectLines = [];
    const buffLines = [];
    for (const item of equipped){
        const upgradeLevel = item.upgradeLevel || 0;
        const scale = 1 + upgradeLevel * 0.1;
        const bStr = Math.floor((item.bonusStr || 0) * scale);
        const bAgi = Math.floor((item.bonusAgi || 0) * scale);
        const bDef = Math.floor((item.bonusDef || 0) * scale);
        const bHp = Math.floor((item.bonusHp || 0) * scale);
        flat.str += bStr;
        flat.agi += bAgi;
        flat.def += bDef;
        flat.hp += bHp;
        let wPow = 0;
        const isAccessory = item.type === "ACCESSORY" || item.type === "ACCESSORY";
        const isWeapon = item.type === "WEAPON" || item.type === "WEAPON";
        if (isWeapon) {
            wPow = Math.floor((item.power || 0) * scale);
            flat.weaponPower += wPow;
        }
        accessories.push({
            ...item,
            upgradeLevel
        });
        const tag = isWeapon ? "⚔️" : isAccessory ? "💍" : "🛡️";
        const bits = [
            wPow ? `WP ${wPow}` : null,
            bStr ? `STR+${bStr}` : null,
            bAgi ? `AGI+${bAgi}` : null,
            bDef ? `DEF+${bDef}` : null,
            bHp ? `HP+${bHp}` : null
        ].filter(Boolean);
        gearFlatLines.push(`${tag} **${item.name}** [+${upgradeLevel}] — ${bits.length ? bits.join(", ") : "không cộng chỉ số phẳng"}`);
    }
    const petDetail = (0, pet_utils_1.calculatePetStatBonusDetailed)(pets, petMultipliers);
    flat.petAtk = petDetail.totalAtk;
    flat.petDef = petDetail.totalDef;
    const multiplier = {
        damageMult: 1.0,
        defenseMult: 1.0,
        hpMult: 1.0,
        critDamage: 1.5,
        burnDamage: 1.0,
        poisonDamage: 1.0,
        lifesteal: 1.0,
        procChance: 1.0,
        critRateBonus: 0,
        uniquePowers: {},
        activeSets: []
    };
    let petTitlePowerMult = 1.0;
    if (user.title) {
        let equippedKeys = [];
        try {
            if (user.title.startsWith("[")) {
                equippedKeys = JSON.parse(user.title);
            } else {
                equippedKeys = [
                    user.title
                ];
            }
        } catch (e) {}
        for (const key of equippedKeys){
            const def = titles_1.TITLES.find((t)=>t.key === key);
            if (!def) continue;
            const tag = `Danh hiệu «${def.name}»`;
            if (def.effectType === "damage") {
                multiplier.damageMult += def.effectValue;
                damageMultDeltas.push({
                    source: tag,
                    delta: def.effectValue
                });
            } else if (def.effectType === "critDamage") {
                multiplier.critDamage += def.effectValue;
                accessoryEffectLines.push(`${tag}: hệ số ST chí mạng +${(def.effectValue * 100).toFixed(0)}% (nền 1.5)`);
            } else if (def.effectType === "burnDamage") {
                multiplier.burnDamage += def.effectValue;
                accessoryEffectLines.push(`${tag}: ST đốt +${(def.effectValue * 100).toFixed(0)}%`);
            } else if (def.effectType === "poisonDamage") {
                multiplier.poisonDamage += def.effectValue;
                accessoryEffectLines.push(`${tag}: ST độc +${(def.effectValue * 100).toFixed(0)}%`);
            } else if (def.effectType === "lifesteal") {
                multiplier.lifesteal += def.effectValue;
                accessoryEffectLines.push(`${tag}: hút máu +${(def.effectValue * 100).toFixed(0)}%`);
            } else if (def.effectType === "procChance") {
                multiplier.procChance += def.effectValue;
                accessoryEffectLines.push(`${tag}: tỉ lệ proc skill +${(def.effectValue * 100).toFixed(0)}%`);
            } else if (def.effectType === "goldGain") {
                accessoryEffectLines.push(`${tag}: vàng nhận +${(def.effectValue * 100).toFixed(0)}% (ngoài combat)`);
            } else if (def.effectType === "petPower") {
                petTitlePowerMult += def.effectValue;
                accessoryEffectLines.push(`${tag}: +${(def.effectValue * 100).toFixed(0)}% vào hệ số sức pet (ATK/DEF pet)`);
            }
        }
        flat.petAtk *= petTitlePowerMult;
        flat.petDef *= petTitlePowerMult;
    }
    const totalStr = base.str + flat.str;
    const totalAgi = base.agi + flat.agi;
    const attack = totalStr * 0.5 + flat.weaponPower + totalAgi * 0.3 + flat.petAtk;
    const defense = flat.def + flat.petDef;
    const maxHp = base.hp + flat.hp;
    const speed = totalAgi;
    const derived = {
        attack,
        defense,
        maxHp,
        speed
    };
    const activeSynergies = (0, pet_synergy_1.getActiveSynergies)(pets);
    for (const syn of activeSynergies){
        const src = `Pet · ${syn.name}`;
        if (syn.name === "Double DPS") {
            multiplier.damageMult += 0.15;
            damageMultDeltas.push({
                source: src,
                delta: 0.15
            });
        }
        if (syn.name === "Kiên Định") {
            multiplier.defenseMult += 0.15;
            defenseMultDeltas.push({
                source: src,
                delta: 0.15
            });
        }
        if (syn.name.startsWith("Three Body Problem")) {
            multiplier.damageMult += 0.1;
            multiplier.defenseMult += 0.1;
            damageMultDeltas.push({
                source: src,
                delta: 0.1
            });
            defenseMultDeltas.push({
                source: src,
                delta: 0.1
            });
        }
        if (syn.name === "All Balance") {
            multiplier.damageMult += 0.12;
            multiplier.defenseMult += 0.12;
            damageMultDeltas.push({
                source: src,
                delta: 0.12
            });
            defenseMultDeltas.push({
                source: src,
                delta: 0.12
            });
        }
    }
    if (user.talentDps) {
        const d = user.talentDps * 0.01;
        multiplier.damageMult += d;
        damageMultDeltas.push({
            source: `Thiên phú DPS (${user.talentDps} điểm → +${user.talentDps}% ST)`,
            delta: d
        });
    }
    if (user.talentTank) {
        const d = user.talentTank * 0.01;
        multiplier.defenseMult += d;
        defenseMultDeltas.push({
            source: `Thiên phú Tank (${user.talentTank} điểm)`,
            delta: d
        });
    }
    if (user.talentSupport) {
        const d = user.talentSupport * 0.01;
        multiplier.hpMult += d;
        hpMultDeltas.push({
            source: `Thiên phú Support (${user.talentSupport} điểm → +${user.talentSupport}% HP)`,
            delta: d
        });
    }
    if (user.talentBurn) {
        const d = user.talentBurn * 0.02;
        multiplier.burnDamage += d;
        accessoryEffectLines.push(`Thiên phú Burn (${user.talentBurn}): ST đốt +${(d * 100).toFixed(0)}%`);
    }
    if (user.talentPoison) {
        const d = user.talentPoison * 0.02;
        multiplier.poisonDamage += d;
        accessoryEffectLines.push(`Thiên phú Poison (${user.talentPoison}): ST độc +${(d * 100).toFixed(0)}%`);
    }
    const setCounts = {};
    const applyAccEffect = (eff, upgradeLevel, sourceLabel)=>{
        const scale = 1 + upgradeLevel * 0.05;
        const power = eff.power * scale;
        const pct = (x)=>`${(x * 100).toFixed(1)}%`;
        if (eff.type === "CRIT_CHANCE") {
            multiplier.critRateBonus += power;
            accessoryEffectLines.push(`${sourceLabel}: tỉ lệ chí mạng +${pct(power)}`);
        } else if (eff.type === "CRIT_DMG") {
            multiplier.critDamage += power;
            accessoryEffectLines.push(`${sourceLabel}: ST chí mạng (hệ số) +${pct(power)}`);
        } else if (eff.type === "BURN_DMG") {
            multiplier.burnDamage += power;
            accessoryEffectLines.push(`${sourceLabel}: ST đốt +${pct(power)}`);
        } else if (eff.type === "POISON_DMG") {
            multiplier.poisonDamage += power;
            accessoryEffectLines.push(`${sourceLabel}: ST độc +${pct(power)}`);
        } else if (eff.type === "LIFESTEAL") {
            multiplier.lifesteal += power;
            accessoryEffectLines.push(`${sourceLabel}: hút máu +${pct(power)}`);
        } else if (eff.type === "REDUCE_DMG") {
            multiplier.defenseMult += power;
            defenseMultDeltas.push({
                source: `${sourceLabel} (giảm ST nhận)`,
                delta: power
            });
        } else if (eff.type === "PROC_CHANCE") {
            multiplier.procChance += power;
            accessoryEffectLines.push(`${sourceLabel}: tỉ lệ kích hoạt skill +${pct(power)}`);
        } else if (eff.type.startsWith("UNIQUE_")) {
            activeUniqueEffects.push(eff.type);
            multiplier.uniquePowers[eff.type] = Math.max(multiplier.uniquePowers[eff.type] || 0, power);
            accessoryEffectLines.push(`${sourceLabel}: \`${eff.type}\` (power ${power.toFixed(2)})`);
        } else {
            accessoryEffectLines.push(`${sourceLabel}: ${eff.type} (${power.toFixed(3)})`);
        }
    };
    for (const acc of accessories){
        const config = accessory_config_1.ACCESSORY_CONFIGS[acc.name];
        if (config) {
            const ul = acc.upgradeLevel || 0;
            const label = `💍 ${acc.name} [+${ul}]`;
            config.effects.forEach((e)=>applyAccEffect(e, ul, label));
            if (config.set) setCounts[config.set] = (setCounts[config.set] || 0) + 1;
        } else {
            accessoryEffectLines.push(`💍 ${acc.name}: chưa có trong ACCESSORY_CONFIGS`);
        }
    }
    for (const [setName, count] of Object.entries(setCounts)){
        const setBonus = accessory_config_1.ACCESSORY_SETS[setName];
        if (!setBonus) continue;
        if (count >= 2) {
            setBonus.bonus2.forEach((e)=>applyAccEffect(e, 0, `📦 Bộ ${setName} (≥2 món)`));
            multiplier.activeSets.push(setName);
        }
        if (count >= 3) {
            setBonus.bonus3.forEach((e)=>applyAccEffect(e, 0, `📦 Bộ ${setName} (≥3 món)`));
        }
    }
    for (const buff of buffs){
        if (buff.type === "STR_PERCENT_BUFF" && buff.power != null) {
            const d = buff.power / 100;
            multiplier.damageMult += d;
            damageMultDeltas.push({
                source: "Buff tạm (STR%)",
                delta: d
            });
            buffLines.push(`Buff STR +${buff.power}% ST`);
        }
        if (buff.type === "HP_PERCENT_BUFF" && buff.power != null) {
            const d = buff.power / 100;
            multiplier.hpMult += d;
            hpMultDeltas.push({
                source: "Buff tạm (HP%)",
                delta: d
            });
            buffLines.push(`Buff HP +${buff.power}% máu tối đa`);
        }
    }
    const attackParts = [
        {
            source: `STR nhân vật (${base.str}) × 0.5`,
            value: base.str * 0.5
        },
        {
            source: `STR trang bị (+${flat.str}) × 0.5`,
            value: flat.str * 0.5
        },
        {
            source: `AGI nhân vật (${base.agi}) × 0.3`,
            value: base.agi * 0.3
        },
        {
            source: `AGI trang bị (+${flat.agi}) × 0.3`,
            value: flat.agi * 0.3
        },
        {
            source: "Sức vũ khí (Power, đã nhân cấp +)",
            value: flat.weaponPower
        },
        {
            source: `Pet (sau danh hiệu pet ×${petTitlePowerMult.toFixed(2)})`,
            value: flat.petAtk
        }
    ];
    const defenseParts = [
        {
            source: "DEF từ vũ khí/giáp",
            value: flat.def
        },
        {
            source: `DEF từ pet (sau ×${petTitlePowerMult.toFixed(2)})`,
            value: flat.petDef
        }
    ];
    const hpParts = [
        {
            source: "HP gốc nhân vật",
            value: base.hp
        },
        {
            source: "HP từ trang bị",
            value: flat.hp
        }
    ];
    const speedParts = [
        {
            source: `SPD = AGI tổng (${totalAgi})`,
            value: speed
        }
    ];
    const critChanceParts = [
        {
            source: `LUCK (${base.luck}) × 0.005 (công thức combat)`,
            value: base.luck * 0.005
        },
        {
            source: "Cộng từ phụ kiện / bộ (crit chance)",
            value: multiplier.critRateBonus
        }
    ];
    const breakdown = {
        attackParts,
        defenseParts,
        hpParts,
        speedParts,
        critChanceParts,
        damageMultDeltas,
        defenseMultDeltas,
        hpMultDeltas,
        gearFlatLines,
        petContributions: petDetail.contributions,
        petTitlePowerMult,
        accessoryEffectLines,
        buffLines
    };
    const final = {
        attack: Math.floor(derived.attack * multiplier.damageMult),
        defense: Math.floor(derived.defense * multiplier.defenseMult),
        maxHp: Math.floor(derived.maxHp * multiplier.hpMult),
        speed: derived.speed
    };
    return {
        base,
        flat,
        derived,
        multiplier,
        final,
        breakdown,
        extra: {
            activeUniqueEffects,
            uniquePowers: multiplier.uniquePowers,
            activeSets: multiplier.activeSets,
            critRateBonus: multiplier.critRateBonus
        }
    };
}
function calculatePipelineDamage(attackerFinalAttack, defenderFinalDefense) {
    const damageReduction = defenderFinalDefense / (defenderFinalDefense + 100);
    const clampedReduction = Math.min(0.75, Math.max(0, damageReduction));
    const finalDamage = Math.floor(attackerFinalAttack * (1 - clampedReduction));
    return Math.max(1, finalDamage);
}
}),
"[project]/packages/game-core/dist/services/relic-system.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.applyRelicsBeforeCombat = applyRelicsBeforeCombat;
exports.applyRelicsOnTurn = applyRelicsOnTurn;
exports.applyRelicsOnKill = applyRelicsOnKill;
function applyRelicsBeforeCombat(ctx, relics) {
    let totalDamageBoost = 0;
    let totalDamageReduction = 0;
    for (const r of relics){
        switch(r.type){
            case "DAMAGE_BOOST":
                totalDamageBoost += r.value;
                break;
            case "GLASS_CANNON":
                totalDamageBoost += r.value;
                ctx.player.maxHp = Math.floor(ctx.player.maxHp * (1 - (r.drawback || 0)));
                ctx.player.hp = Math.min(ctx.player.hp, ctx.player.maxHp);
                break;
            case "REDUCE_DAMAGE":
                totalDamageReduction += r.value;
                break;
            case "SPD_BOOST":
                ctx.player.spd += r.value;
                break;
            case "CRIT_BOOST":
                ctx.player.critRate += r.value;
                break;
            case "START_SHIELD":
                ctx.player.shield += r.value;
                break;
            case "PET_BOOST":
                ctx.player.petPower += r.value;
                break;
        }
    }
    totalDamageBoost = Math.min(0.5, totalDamageBoost);
    totalDamageReduction = Math.min(0.9, totalDamageReduction);
    ctx.player.atk = Math.floor(ctx.player.atk * (1 + totalDamageBoost));
    ctx.extra.player.reduceDamage = totalDamageReduction;
}
function applyRelicsOnTurn(ctx, relics, turnEvents) {
    for (const r of relics){
        if (r.type === "TURN_HEAL") {
            const heal = r.value;
            ctx.player.hp = Math.min(ctx.player.maxHp, ctx.player.hp + heal);
            turnEvents.push(`✨ [Thánh tích] ${r.name} hồi phục ${heal} HP.`);
        } else if (r.type === "CHAOS") {
            const roll = Math.random();
            if (roll < 0.33) {
                ctx.extra.player.bonusDamage += 25;
                turnEvents.push(`🔮 [Chaos Orb] Bộc phát năng lượng! (+25 sát thương thêm)`);
            } else if (roll < 0.66) {
                const heal = 15;
                ctx.player.hp = Math.min(ctx.player.maxHp, ctx.player.hp + heal);
                turnEvents.push(`🔮 [Chaos Orb] Luồng sáng bí ẩn! (Hồi ${heal} HP)`);
            } else {
                turnEvents.push(`🔮 [Chaos Orb] Quả cầu im lặng.`);
            }
        } else if (r.type === "DOUBLE_OR_NOTHING") {
            const roll = Math.random();
            if (roll < r.value) {
                ctx.player.multipliers.damage *= 2;
                turnEvents.push(`🎲 [Gambler's Coin] Mặt ngửa! Sát thương nhân đôi!`);
            } else {
                ctx.player.multipliers.damage = 0;
                turnEvents.push(`🎲 [Gambler's Coin] Mặt sấp... Đòn tấn công trượt!`);
            }
        } else if (r.type === "LOW_HP_BONUS") {
            if (ctx.player.hp / ctx.player.maxHp < 0.3) {
                ctx.player.multipliers.damage *= 1 + r.value;
                turnEvents.push(`🩸 [Executioner Ring] Bạo kích khi nguy kịch!`);
            }
        }
    }
}
function applyRelicsOnKill(state, relics, maxHp) {
    for (const r of relics){
        if (r.type === "ON_KILL_HEAL") {
            state.hp = Math.min(maxHp, state.hp + r.value);
            state.floorLogs.push(`🧛 [${r.name}] Hấp thụ sinh khí, hồi ${r.value} HP! (HP: ${state.hp}/${maxHp})`);
        }
    }
}
}),
"[project]/packages/game-core/dist/services/relic-engine.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.dealDamage = dealDamage;
exports.processDamage = processDamage;
exports.applyBleed = applyBleed;
exports.healUnit = healUnit;
exports.reflectDamage = reflectDamage;
exports.grantExtraTurn = grantExtraTurn;
exports.executeUnit = executeUnit;
exports.applyRelicEffect = applyRelicEffect;
exports.handleRelicTrigger = handleRelicTrigger;
function dealDamage(target, amount) {
    if (target.hp <= 0 || amount <= 0) return 0;
    let remainingDamage = amount;
    if (target.shield > 0) {
        if (target.shield >= remainingDamage) {
            target.shield -= remainingDamage;
            return 0;
        } else {
            remainingDamage -= target.shield;
            target.shield = 0;
        }
    }
    const previousHp = target.hp;
    target.hp = Math.max(0, target.hp - remainingDamage);
    const hpLost = previousHp - target.hp;
    return hpLost;
}
function processDamage(attacker, defender, baseDamage) {
    if (attacker.hp <= 0 || defender.hp <= 0) return 0;
    if (attacker === defender) return 0;
    const mult = attacker.damageMultiplier || 1;
    const finalIncoming = baseDamage * mult;
    const hpLost = dealDamage(defender, finalIncoming);
    return hpLost;
}
function applyBleed(target, stacks) {
    if (target.hp <= 0 || stacks <= 0) return;
    target.statusEffects = target.statusEffects || {};
    target.statusEffects.bleed = target.statusEffects.bleed || {
        stacks: 0
    };
    target.statusEffects.bleed.stacks += stacks;
}
function healUnit(unit, amount) {
    if (unit.hp <= 0 || amount <= 0) return;
    const healCapacity = unit.maxHp - unit.hp;
    const actualHeal = Math.min(amount, healCapacity);
    if (actualHeal > 0) {
        unit.hp += actualHeal;
    }
}
function reflectDamage(attacker, defender, reflectionAmount) {
    if (reflectionAmount <= 0) return;
    dealDamage(attacker, reflectionAmount);
}
function grantExtraTurn(unit) {
    if (unit.hp <= 0 || unit.extraTurnGranted) return;
    unit.extraTurnGranted = true;
}
function executeUnit(target) {
    if (target.hp <= 0 || target.isExecuted) return;
    target.hp = 0;
    target.shield = 0;
    target.isExecuted = true;
}
function applyRelicEffect(unit, relic, context) {
    if (unit.hp <= 0) return;
    switch(relic.id){
        case "bleed_dagger":
            if (context.defender && context.defender.hp > 0 && context.defender !== unit) {
                applyBleed(context.defender, relic.value);
            }
            break;
        case "time_fragment":
            if (context.defender && !unit.extraTurnGranted) {
                if (Math.random() < relic.value) {
                    grantExtraTurn(unit);
                }
            }
            break;
        case "execution_mark":
        case "reaper_threshold":
            if (context.defender && context.defender.hp > 0 && context.defender !== unit) {
                const healthPercentage = context.defender.hp / context.defender.maxHp;
                if (healthPercentage <= relic.value) {
                    executeUnit(context.defender);
                }
            }
            break;
        case "scavenger_kit":
        case "vampire_fang":
        case "soul_reaper":
            if (context.defender && context.defender.hp <= 0) {
                healUnit(unit, relic.value);
            }
            break;
        case "thorn_mail":
            if (context.attacker && context.damage && context.attacker !== unit) {
                if (context.attacker.hp > 0) {
                    const reflected = Math.floor(context.damage * relic.value);
                    if (reflected > 0) {
                        reflectDamage(context.attacker, unit, reflected);
                    }
                }
            }
            break;
        default:
            break;
    }
}
function handleRelicTrigger(unit, event, context) {
    if (unit.hp <= 0) return;
    if (!unit.relics || unit.relics.length === 0) return;
    for (const relic of unit.relics){
        if (relic.trigger === event) {
            applyRelicEffect(unit, relic, context);
        }
    }
}
}),
"[project]/packages/game-core/dist/services/relic-synergy.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SYNERGY_POOL = void 0;
exports.getActiveSynergies = getActiveSynergies;
exports.applySynergyEffects = applySynergyEffects;
exports.SYNERGY_POOL = [
    {
        id: "syn_toxic_inferno",
        name: "Toxic Inferno",
        desc: "Combines Burn and Poison. Attacks apply devastating bleed stacks.",
        requirement: {
            types: [
                "BURN_BOOST",
                "POISON_BOOST"
            ]
        },
        trigger: "ON_ATTACK",
        effect: (unit, context)=>{
            if (context.defender) {
                context.defender.statusEffects = context.defender.statusEffects || {};
                context.defender.statusEffects.bleed = {
                    stacks: (context.defender.statusEffects.bleed?.stacks || 0) + 10
                };
            }
        }
    },
    {
        id: "syn_blood_shield",
        name: "Blood Shielding",
        desc: "Overheals from Lifesteal are converted to Shields.",
        requirement: {
            types: [
                "LIFESTEAL",
                "GLASS_CANNON"
            ]
        },
        trigger: "ON_ATTACK",
        effect: (unit)=>{
            if (unit.hp >= unit.maxHp) {
                unit.shield += 5;
            }
        }
    },
    {
        id: "syn_first_strike",
        name: "First Strike",
        desc: "Guaranteed critical hit on your very first turn.",
        requirement: {
            types: [
                "SPD_BOOST",
                "CRIT_BOOST"
            ]
        },
        trigger: "TURN_START",
        effect: (unit, context)=>{
            if (context.turn === 1) {
                console.log(`[Synergy: First Strike] ${unit.id}'s first attack will critically strike!`);
            }
        }
    },
    {
        id: "syn_desperation_surge",
        name: "Desperation Surge",
        desc: "Double damage modifier when below 30% HP.",
        requirement: {
            types: [
                "DAMAGE_BOOST",
                "LOW_HP_BONUS"
            ]
        },
        trigger: "ON_ATTACK",
        effect: (unit, context)=>{
            const healthPercentage = unit.hp / unit.maxHp;
            if (healthPercentage <= 0.3) {
                if (context.damage) {
                    context.damage *= 2;
                }
            }
        }
    },
    {
        id: "syn_plague_bearer",
        name: "Plague Bearer",
        desc: "Killing an enemy grants you max HP up to a limit.",
        requirement: {
            types: [
                "POISON_BOOST",
                "ON_KILL_HEAL"
            ]
        },
        trigger: "ON_KILL",
        effect: (unit)=>{
            unit.maxHp += 10;
            unit.hp += 10;
        }
    },
    {
        id: "syn_time_lord",
        name: "Time Lord",
        desc: "Specific combo: Time Fragment + Hermes Sandals randomly gives immense shields.",
        requirement: {
            ids: [
                "time_fragment",
                "hermes_sandals"
            ]
        },
        trigger: "TURN_START",
        effect: (unit)=>{
            if (Math.random() < 0.25) {
                unit.shield += 50;
            }
        }
    }
];
function getActiveSynergies(unit) {
    if (!unit.relics || unit.relics.length === 0) return [];
    const activeSynergies = [];
    const relicIdSet = new Set(unit.relics.map((r)=>r.id));
    const relicTypeSet = new Set(unit.relics.map((r)=>r.type));
    for (const synergy of exports.SYNERGY_POOL){
        let reqIdsMet = true;
        let reqTypesMet = true;
        let hasAnyRequirement = false;
        if (synergy.requirement.ids && synergy.requirement.ids.length > 0) {
            hasAnyRequirement = true;
            for (const reqId of synergy.requirement.ids){
                if (!relicIdSet.has(reqId)) {
                    reqIdsMet = false;
                    break;
                }
            }
        }
        if (synergy.requirement.types && synergy.requirement.types.length > 0) {
            hasAnyRequirement = true;
            for (const reqType of synergy.requirement.types){
                if (!relicTypeSet.has(reqType)) {
                    reqTypesMet = false;
                    break;
                }
            }
        }
        if (hasAnyRequirement && reqIdsMet && reqTypesMet) {
            activeSynergies.push(synergy);
        }
    }
    return activeSynergies;
}
function applySynergyEffects(unit, event, context, cachedSynergies) {
    const synergies = cachedSynergies || getActiveSynergies(unit);
    if (synergies.length === 0) return;
    for (const synergy of synergies){
        if (synergy.trigger === event) {
            synergy.effect(unit, context);
        }
    }
}
}),
"[project]/packages/game-core/dist/services/combat-engine.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * combat-engine.ts
 * Pure combat engine - UI agnostic.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.simulateCombat = simulateCombat;
const skill_system_1 = __turbopack_context__.r("[project]/packages/game-core/dist/services/skill-system.js [app-route] (ecmascript)");
const combat_utils_1 = __turbopack_context__.r("[project]/packages/game-core/dist/services/combat-utils.js [app-route] (ecmascript)");
const pet_system_1 = __turbopack_context__.r("[project]/packages/game-core/dist/services/pet-system.js [app-route] (ecmascript)");
const pet_synergy_1 = __turbopack_context__.r("[project]/packages/game-core/dist/services/pet-synergy.js [app-route] (ecmascript)");
const titles_1 = __turbopack_context__.r("[project]/packages/game-core/dist/constants/titles.js [app-route] (ecmascript)");
const relic_system_1 = __turbopack_context__.r("[project]/packages/game-core/dist/services/relic-system.js [app-route] (ecmascript)");
async function simulateCombat(options) {
    const { player, enemy, maxTurns = 30, onTurnUpdate } = options;
    const ctx = {
        player: {
            name: "Bạn",
            atk: player.atk,
            def: player.def,
            spd: player.spd,
            hp: player.hp,
            maxHp: player.maxHp,
            critRate: player.critRate,
            petPower: 0,
            shield: 0,
            multipliers: {
                damage: 1,
                gold: 1,
                exp: 1,
                defense: 1,
                critDamage: 1.5,
                burnDamage: 1,
                poisonDamage: 1,
                lifesteal: 1,
                procChance: 1,
                critRateBonus: 0,
                uniquePowers: {},
                activeSets: [],
                heal: 1
            }
        },
        enemy: {
            name: enemy.name,
            atk: enemy.atk,
            def: enemy.def,
            spd: enemy.spd,
            hp: enemy.hp,
            maxHp: enemy.maxHp,
            petPower: 0,
            critRate: 0,
            shield: 0,
            multipliers: {
                damage: 1,
                gold: 1,
                exp: 1,
                defense: 1,
                critDamage: 1.5,
                burnDamage: 1,
                poisonDamage: 1,
                lifesteal: 1,
                procChance: 1,
                critRateBonus: 0,
                uniquePowers: {},
                activeSets: [],
                heal: 1
            }
        },
        effects: {
            player: [],
            enemy: []
        },
        flags: {
            player: {
                dodged: false,
                ignoreDef: false,
                extraHit: false
            },
            enemy: {
                dodged: false,
                ignoreDef: false,
                bossPhaseTriggered: false,
                isBoss: enemy.isBoss ?? false
            }
        },
        extra: {
            player: {
                instantHeal: 0,
                bonusDamage: 0,
                reduceDamage: 0
            }
        },
        accessories: {
            effects: options.accessories?.effects || [],
            uniquePowers: options.accessories?.uniquePowers || {},
            sets: options.accessories?.sets || []
        },
        fullLogs: []
    };
    const fullLogs = [];
    if (options.player.title) {
        const titleDef = titles_1.TITLES.find((t)=>t.key === options.player.title);
        if (titleDef) {
            const type = titleDef.effectType;
            const val = titleDef.effectValue;
            if (type === "damage") ctx.player.multipliers.damage += val;
            else if (type === "critDamage") ctx.player.multipliers.critDamage += val;
            else if (type === "burnDamage") ctx.player.multipliers.burnDamage += val;
            else if (type === "poisonDamage") ctx.player.multipliers.poisonDamage += val;
            else if (type === "lifesteal") ctx.player.multipliers.lifesteal += val;
            else if (type === "goldGain") ctx.player.multipliers.gold += val;
            else if (type === "procChance") ctx.player.multipliers.procChance += val;
            else if (type === "petPower") ctx.player.petPower += val;
        }
    }
    const achievementTracking = {
        crits: 0,
        burns: 0,
        poisons: 0,
        lifesteals: 0,
        combos: 0
    };
    const uiAccum = {
        skillCounts: {},
        synergies: [],
        comboCount: 0,
        maxTurnDamage: 0,
        totalDamageDealt: 0,
        petExpPool: new Map()
    };
    const petPartySynLines = (0, pet_synergy_1.applyPetSynergy)(ctx, player.pets);
    for (const syn of (0, pet_synergy_1.getActiveSynergies)(player.pets)){
        if (!uiAccum.synergies.includes(syn.name)) uiAccum.synergies.push(syn.name);
    }
    if (options.relics && options.relics.length > 0) {
        (0, relic_system_1.applyRelicsBeforeCombat)(ctx, options.relics);
    }
    let turn = 1;
    const order = ctx.player.spd >= ctx.enemy.spd ? [
        {
            side: 'user'
        },
        {
            side: 'enemy'
        }
    ] : [
        {
            side: 'enemy'
        },
        {
            side: 'user'
        }
    ];
    const firstAttacker = order[0].side === "user" ? "Bạn" : ctx.enemy.name;
    const startLog = `👟 **Tốc độ:** Bạn (**${ctx.player.spd}**) vs ${ctx.enemy.name} (**${ctx.enemy.spd}**). **${firstAttacker}** ra đòn trước!`;
    if (onTurnUpdate) {
        const openLogs = [
            startLog
        ];
        if (petPartySynLines.length > 0) {
            openLogs.push("📌 **Cộng hưởng đội pet (passive):**", ...petPartySynLines);
        }
        onTurnUpdate({
            playerHp: Math.floor(ctx.player.hp),
            enemyHp: Math.floor(ctx.enemy.hp),
            logs: openLogs
        });
    }
    while(turn <= maxTurns && ctx.player.hp > 0 && ctx.enemy.hp > 0){
        const turnEvents = [];
        if (turn === 1) {
            turnEvents.push(startLog);
            if (petPartySynLines.length > 0) {
                turnEvents.push("📌 **Cộng hưởng đội pet (passive):**", ...petPartySynLines);
            }
        }
        turnEvents.push(`\n**[Lượt ${turn}]**`);
        (0, combat_utils_1.resolveTurnEffects)(ctx.player, ctx.effects.player, turnEvents);
        (0, combat_utils_1.resolveTurnEffects)(ctx.enemy, ctx.effects.enemy, turnEvents);
        if (options.relics && options.relics.length > 0) {
            (0, relic_system_1.applyRelicsOnTurn)(ctx, options.relics, turnEvents);
        }
        if (ctx.enemy.hp <= 0 || ctx.player.hp <= 0) break;
        const turnStartFlags = {};
        const petStartResult = (0, pet_system_1.applyPetEffects)(ctx, player.pets, "ON_TURN_START", turnStartFlags);
        if (petStartResult.triggered.length > 0) {
            turnEvents.push(...petStartResult.triggered);
            for (const pid of petStartResult.triggeredPetIds){
                uiAccum.petExpPool.set(pid, (uiAccum.petExpPool.get(pid) || 0) + 1);
            }
        }
        const turnStartRes = (0, skill_system_1.applySkills)(player.skills, "ON_TURN_START", ctx);
        const mergeTurnStartFlags = {
            ...turnStartRes.flags,
            ...turnStartFlags
        };
        const turnStartPetSyn = (0, pet_synergy_1.applyPetPlayerSynergy)(ctx, mergeTurnStartFlags);
        if (turnStartRes.triggeredSkills.length > 0) {
            turnEvents.push(`✨ **Niệm chú:** ${turnStartRes.triggeredSkills.join(", ")}...`);
            if (ctx.extra.player.instantHeal > 0) {
                const totalHeal = Math.floor(ctx.extra.player.instantHeal * (ctx.player.multipliers.heal || 1));
                ctx.player.hp = Math.min(ctx.player.maxHp, ctx.player.hp + totalHeal);
                turnEvents.push(`💚 Hồi phục thêm **${totalHeal}** HP.`);
                ctx.extra.player.instantHeal = 0;
            }
            if (ctx.extra.player.bonusDamage > 0) {
                (0, combat_utils_1.applyDamage)(ctx.enemy, ctx.extra.player.bonusDamage, turnEvents);
                ctx.extra.player.bonusDamage = 0;
            }
        }
        if (turnStartRes.triggeredSynergies.length > 0) {
            turnEvents.push(`🔗 **Cộng hưởng (kỹ năng):** ${turnStartRes.triggeredSynergies.join(" · ")}`);
            for (const sy of turnStartRes.triggeredSynergies){
                if (!uiAccum.synergies.includes(sy)) uiAccum.synergies.push(sy);
            }
        }
        if (turnStartPetSyn.logs.length > 0) {
            turnEvents.push(...turnStartPetSyn.logs);
            for (const n of turnStartPetSyn.names){
                if (!uiAccum.synergies.includes(n)) uiAccum.synergies.push(n);
            }
        }
        if (ctx.enemy.hp <= 0) break;
        if (!ctx.flags.enemy.bossPhaseTriggered && ctx.enemy.hp <= ctx.enemy.maxHp * 0.5) {
            ctx.flags.enemy.bossPhaseTriggered = true;
            const isBoss = ctx.flags.enemy.isBoss;
            const boostPercent = isBoss ? 50 : 10;
            const boostMult = isBoss ? 1.5 : 1.1;
            turnEvents.push(`⚡ **CUỒNG NỘ:** ${ctx.enemy.name} gồng mình (Tăng ${boostPercent}% ATK)!`);
            ctx.enemy.atk *= boostMult;
        }
        for (const p of order){
            if (ctx.player.hp <= 0 || ctx.enemy.hp <= 0) break;
            ctx.flags.player.dodged = false;
            ctx.flags.player.ignoreDef = false;
            ctx.flags.player.extraHit = false;
            ctx.player.multipliers.damage = 1;
            if (p.side === 'user') {
                const attackFlags = {};
                const petAttackResult = (0, pet_system_1.applyPetEffects)(ctx, player.pets, "ON_ATTACK", attackFlags);
                if (petAttackResult.triggered.length > 0) {
                    turnEvents.push(...petAttackResult.triggered);
                    for (const pid of petAttackResult.triggeredPetIds){
                        uiAccum.petExpPool.set(pid, (uiAccum.petExpPool.get(pid) || 0) + 1);
                    }
                }
                const attackRes = (0, skill_system_1.applySkills)(player.skills, "ON_ATTACK", ctx);
                if (attackRes.triggeredSkills.length > 0) {
                    turnEvents.push(`⚔️ **Thi triển:** ${attackRes.triggeredSkills.join(", ")}!`);
                }
                if (attackRes.triggeredSynergies.length > 0) {
                    turnEvents.push(`🔗 **Cộng hưởng (kỹ năng):** ${attackRes.triggeredSynergies.join(" · ")}`);
                }
                if (attackRes.triggeredSkills.length + attackRes.triggeredSynergies.length >= 2) {
                    achievementTracking.combos++;
                    uiAccum.comboCount++;
                }
                for (const sk of attackRes.triggeredSkills){
                    uiAccum.skillCounts[sk] = (uiAccum.skillCounts[sk] || 0) + 1;
                }
                for (const sy of attackRes.triggeredSynergies){
                    if (!uiAccum.synergies.includes(sy)) uiAccum.synergies.push(sy);
                }
                const mergeAttackFlags = {
                    ...attackRes.flags,
                    ...attackFlags
                };
                const naturalCrit = Math.random() < ctx.player.critRate;
                if (naturalCrit) mergeAttackFlags.didCrit = true;
                if (attackRes.flags.didBurn || attackFlags.petBurn) achievementTracking.burns++;
                if (attackRes.flags.didPoison || attackFlags.petPoison) achievementTracking.poisons++;
                const attackPetSyn = (0, pet_synergy_1.applyPetPlayerSynergy)(ctx, mergeAttackFlags);
                if (attackPetSyn.logs.length > 0) turnEvents.push(...attackPetSyn.logs);
                for (const n of attackPetSyn.names){
                    if (!uiAccum.synergies.includes(n)) uiAccum.synergies.push(n);
                }
                const isCrit = naturalCrit || attackRes.flags.didCrit || attackFlags.petCrit;
                if (isCrit) {
                    achievementTracking.crits++;
                }
                let rawAtk = ctx.player.atk * ctx.player.multipliers.damage;
                if (ctx.accessories.effects.includes("UNIQUE_BERSERK_PERCENT")) {
                    const missingHpPct = 1 - ctx.player.hp / ctx.player.maxHp;
                    const pwr = ctx.accessories.uniquePowers["UNIQUE_BERSERK_PERCENT"] || 0.01;
                    rawAtk *= 1 + missingHpPct * (pwr * 100);
                }
                const enemyDef = ctx.flags.player.ignoreDef ? 0 : ctx.enemy.def;
                let baseDmg = (0, combat_utils_1.calculateDamage)(rawAtk, enemyDef);
                if (isCrit) {
                    baseDmg *= ctx.player.multipliers.critDamage;
                    if (ctx.accessories.effects.includes("UNIQUE_CRIT_EXECUTE") && ctx.enemy.hp / ctx.enemy.maxHp < 0.5) {
                        baseDmg *= 1.3;
                    }
                }
                const extraHits = ctx.flags.player.extraHit || attackRes.flags.didMultiHit ? 2 : 1;
                const totalBaseDmg = Math.floor(baseDmg * extraHits);
                const critText = isCrit ? "💥 **CHÍ MẠNG!** " : "";
                const bonusText = ctx.flags.player.extraHit || attackRes.flags.didMultiHit ? " (Đánh bồi!)" : "";
                const skillName = attackRes.triggeredSkills.length > 0 ? attackRes.triggeredSkills[0] : "Chém trúng mục tiêu";
                (0, combat_utils_1.applyDamage)(ctx.enemy, totalBaseDmg, turnEvents);
                turnEvents.push(`🔹 ${skillName}, gây ${critText}**${totalBaseDmg}** sát thương${bonusText}.`);
                uiAccum.totalDamageDealt += totalBaseDmg;
                if (ctx.extra.player.bonusDamage > 0) {
                    const bonus = Math.floor(ctx.extra.player.bonusDamage);
                    (0, combat_utils_1.applyDamage)(ctx.enemy, bonus, turnEvents);
                    turnEvents.push(`✨ **Sát thương kỹ năng cộng thêm:** +**${bonus}**`);
                    uiAccum.totalDamageDealt += bonus;
                }
                const totalTurnDmg = totalBaseDmg + ctx.extra.player.bonusDamage;
                if (totalTurnDmg > uiAccum.maxTurnDamage) uiAccum.maxTurnDamage = totalTurnDmg;
                const baseLifesteal = (ctx.player.multipliers.lifesteal || 1.0) - 1.0;
                const skillLifesteal = attackRes.flags.didLifesteal ? 0.3 : 0;
                const totalLifestealPct = baseLifesteal + skillLifesteal;
                if (totalLifestealPct > 0 && totalTurnDmg > 0) {
                    achievementTracking.lifesteals++;
                    let heal = Math.floor(totalTurnDmg * totalLifestealPct);
                    heal = Math.floor(heal * (ctx.player.multipliers.heal || 1.0));
                    if (heal > 0) {
                        ctx.player.hp = Math.min(ctx.player.maxHp, ctx.player.hp + heal);
                        turnEvents.push(`🩸 **Hút máu:** +**${heal}** HP! (${Math.round(totalLifestealPct * 100)}%)`);
                    }
                }
                ctx.extra.player.bonusDamage = 0;
                turnEvents.push("───");
            } else {
                const defendFlags = {};
                const petDefendResult = (0, pet_system_1.applyPetEffects)(ctx, player.pets, "ON_DEFEND", defendFlags);
                if (petDefendResult.triggered.length > 0) {
                    turnEvents.push(...petDefendResult.triggered);
                    for (const pid of petDefendResult.triggeredPetIds){
                        uiAccum.petExpPool.set(pid, (uiAccum.petExpPool.get(pid) || 0) + 1);
                    }
                }
                const defendRes = (0, skill_system_1.applySkills)(player.skills, "ON_DEFEND", ctx);
                const mergeDefendFlags = {
                    ...defendRes.flags,
                    ...defendFlags
                };
                const defendPetSyn = (0, pet_synergy_1.applyPetPlayerSynergy)(ctx, mergeDefendFlags);
                if (defendRes.triggeredSkills.length > 0) {
                    turnEvents.push(`🛡️ **Phòng thủ:** ${defendRes.triggeredSkills.join(", ")}...`);
                }
                if (defendRes.triggeredSynergies.length > 0) {
                    turnEvents.push(`🔗 **Cộng hưởng (kỹ năng):** ${defendRes.triggeredSynergies.join(" · ")}`);
                    for (const sy of defendRes.triggeredSynergies){
                        if (!uiAccum.synergies.includes(sy)) uiAccum.synergies.push(sy);
                    }
                }
                if (defendPetSyn.logs.length > 0) turnEvents.push(...defendPetSyn.logs);
                for (const n of defendPetSyn.names){
                    if (!uiAccum.synergies.includes(n)) uiAccum.synergies.push(n);
                }
                if (ctx.flags.player.dodged || defendRes.flags.didDodge) {
                    turnEvents.push(`> 💨 **${enemy.name}** ra chiêu nhưng bạn đã né được!`);
                } else {
                    const rawAtk = ctx.enemy.atk;
                    const playerDef = ctx.player.def;
                    const dmgBeforeReduction = (0, combat_utils_1.calculateDamage)(rawAtk, playerDef);
                    const buffReduction = (0, combat_utils_1.getBuffDamageReduction)(ctx.effects.player);
                    const synergyBonus = (ctx.player.multipliers.defense || 1) - 1;
                    const totalExtraReduction = Math.min(0.9, buffReduction + synergyBonus);
                    let finalDmg = Math.floor(dmgBeforeReduction * (1 - totalExtraReduction));
                    if (ctx.accessories.effects.includes("UNIQUE_BLOCK_HIT") && turn % 3 === 1) {
                        finalDmg = 0;
                        turnEvents.push(`> 🛡️ **Thánh Vật:** Chặn đứng đòn tấn công!`);
                    }
                    if (ctx.extra.player.reduceDamage > 0) {
                        finalDmg = Math.max(1, finalDmg - ctx.extra.player.reduceDamage);
                    }
                    (0, combat_utils_1.applyDamage)(ctx.player, finalDmg, turnEvents);
                    turnEvents.push(`> 🔸 **${enemy.name}** tấn công, gây **${finalDmg}** sát thương.`);
                    const hasReflect = player.pets.some((p)=>p.name === "Nhím Châu Âu" || p.skillType === "REFLECT");
                    if (hasReflect) {
                        const reflected = Math.floor(finalDmg * 0.05);
                        if (reflected > 0) {
                            (0, combat_utils_1.applyDamage)(ctx.enemy, reflected, turnEvents);
                            turnEvents.push(`> 🦔 **Nhím Châu Âu** phản lại **${reflected}** sát thương!`);
                        }
                    }
                }
                turnEvents.push("───");
            }
        }
        (0, combat_utils_1.cleanupEffects)(ctx.effects.player, turnEvents);
        (0, combat_utils_1.cleanupEffects)(ctx.effects.enemy, turnEvents);
        fullLogs.push({
            turn,
            events: turnEvents
        });
        if (onTurnUpdate) {
            await onTurnUpdate({
                turn,
                playerHp: Math.max(0, Math.floor(ctx.player.hp)),
                enemyHp: Math.max(0, Math.floor(ctx.enemy.hp)),
                logs: turnEvents
            }, ctx);
        }
        if (ctx.enemy.hp <= 0 || ctx.player.hp <= 0) break;
        turn++;
    }
    return {
        isWin: ctx.enemy.hp <= 0,
        enemyName: enemy.name,
        fullLogs,
        finalHp: Math.max(0, Math.floor(ctx.player.hp)),
        finalEnemyHp: Math.max(0, Math.floor(ctx.enemy.hp)),
        enemyMaxHp: Math.floor(ctx.enemy.maxHp),
        isBossKill: ctx.flags.enemy.isBoss && ctx.enemy.hp <= 0,
        achievementTracking,
        combatSummary: {
            skillCounts: uiAccum.skillCounts,
            synergies: uiAccum.synergies,
            comboCount: uiAccum.comboCount,
            maxTurnDamage: Math.floor(uiAccum.maxTurnDamage),
            totalDamageDealt: Math.floor(uiAccum.totalDamageDealt),
            petExpPool: uiAccum.petExpPool
        }
    };
}
}),
"[project]/packages/game-core/dist/services/upgrade-service.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * upgrade-service.ts — pure upgrade/scrap logic, no Prisma dependency.
 * Use in web API routes with @/lib/prisma for DB operations.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.GEAR_TYPES = exports.MAX_UPGRADE_LEVEL = exports.SCRAP_VALUE_IN_GOLD = void 0;
exports.getRarityMultiplier = getRarityMultiplier;
exports.rarityRank = rarityRank;
exports.getUpgradeCost = getUpgradeCost;
exports.getBaseSuccessRate = getBaseSuccessRate;
exports.getUpgradeSuccessRate = getUpgradeSuccessRate;
exports.getEffectiveSuccessRate = getEffectiveSuccessRate;
exports.previewUpgradePayment = previewUpgradePayment;
exports.calculateScrapValue = calculateScrapValue;
exports.sortGearKeepBestFirst = sortGearKeepBestFirst;
exports.SCRAP_VALUE_IN_GOLD = 5;
exports.MAX_UPGRADE_LEVEL = 100;
const FAIL_BONUS_RATE = 0.1;
const MAX_FAILS_FOR_PITY = 5;
exports.GEAR_TYPES = [
    "WEAPON",
    "ARMOR",
    "ACCESSORY"
];
function getRarityMultiplier(rarity) {
    if (rarity === "LEGENDARY") return 15.0;
    if (rarity === "EPIC") return 6.0;
    if (rarity === "RARE") return 2.5;
    return 1.0;
}
function rarityRank(rarity) {
    if (rarity === "LEGENDARY") return 4;
    if (rarity === "EPIC") return 3;
    if (rarity === "RARE") return 2;
    return 1;
}
/** Gold equivalent before scrap offset: `(level + 1) * 300 * rarityMultiplier` */ function getUpgradeCost(currentLevel, rarity) {
    return Math.floor((currentLevel + 1) * 300 * getRarityMultiplier(rarity));
}
/** Base success rate — no pity / fail streak. */ function getBaseSuccessRate(currentLevel) {
    if (currentLevel < 3) return 1.0;
    if (currentLevel < 5) return 0.8;
    if (currentLevel < 7) return 0.6;
    if (currentLevel < 9) return 0.4;
    return 0.2;
}
function getUpgradeSuccessRate(currentLevel) {
    return getBaseSuccessRate(currentLevel);
}
function getEffectiveSuccessRate(currentLevel, failCount) {
    let baseRate = getBaseSuccessRate(currentLevel);
    let totalRate = baseRate + failCount * FAIL_BONUS_RATE;
    if (failCount >= MAX_FAILS_FOR_PITY) return 1.0;
    return Math.min(1.0, totalRate);
}
function previewUpgradePayment(userScrap, currentLevel, rarity) {
    const baseGoldCost = getUpgradeCost(currentLevel, rarity);
    let remainingGoldCost = baseGoldCost;
    let scrapToUse = 0;
    let goldToUse = 0;
    const totalScrapValue = userScrap * exports.SCRAP_VALUE_IN_GOLD;
    if (totalScrapValue >= remainingGoldCost) {
        scrapToUse = Math.ceil(remainingGoldCost / exports.SCRAP_VALUE_IN_GOLD);
        remainingGoldCost = 0;
    } else {
        scrapToUse = userScrap;
        remainingGoldCost -= scrapToUse * exports.SCRAP_VALUE_IN_GOLD;
        goldToUse = Math.ceil(remainingGoldCost);
    }
    return {
        baseGoldCost,
        scrapToUse,
        goldToUse
    };
}
function calculateScrapValue(item) {
    const statScore = item.power + item.bonusStr + item.bonusAgi + item.bonusDef * 1.5 + item.bonusHp * 0.25;
    return Math.floor(statScore * getRarityMultiplier(item.rarity));
}
function sortGearKeepBestFirst(a, b) {
    if (b.upgradeLevel !== a.upgradeLevel) return b.upgradeLevel - a.upgradeLevel;
    const rr = rarityRank(b.rarity) - rarityRank(a.rarity);
    if (rr !== 0) return rr;
    if (b.power !== a.power) return b.power - a.power;
    return a.id.localeCompare(b.id);
}
}),
"[project]/packages/game-core/dist/services/shop-service.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * shop-service.ts — pure shop catalog data and random logic (no Prisma).
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.PET_SHOP_PRICES = exports.SHOP_REFRESH_GOLD = exports.DUNGEON_BUFF_ITEMS = exports.CHEST_CATALOG = exports.SHOP_CATALOG = void 0;
exports.getCatalogEntry = getCatalogEntry;
exports.getChestEntry = getChestEntry;
exports.rollEquipmentRarityFn = rollEquipmentRarityFn;
exports.getEqPrice = getEqPrice;
exports.getAccessoryPrice = getAccessoryPrice;
exports.getDailySkills = getDailySkills;
exports.SHOP_CATALOG = [
    // Tier 1
    {
        key: "trap_basic",
        name: "Hunter Trap",
        description: "Tăng cơ hội bắt giữ +1.",
        type: "TRAP",
        power: 1,
        price: 80,
        tier: 1,
        emoji: "🪤"
    },
    {
        key: "clover_basic",
        name: "Lucky Clover",
        description: "Tăng May Mắn +1.",
        type: "LUCK_BUFF",
        power: 1,
        price: 80,
        tier: 1,
        emoji: "🍀"
    },
    {
        key: "potion_basic",
        name: "Basic Potion",
        description: "Hồi phục ngay 10 HP.",
        type: "POTION",
        power: 10,
        price: 60,
        tier: 1,
        emoji: "🧪"
    },
    {
        key: "scout_lens",
        name: "Scout Lens",
        description: "Tiết lộ sự kiện đi săn tiếp theo.",
        type: "UTILITY",
        power: 0,
        price: 120,
        tier: 1,
        emoji: "🔍"
    },
    {
        key: "risk_coin",
        name: "Risk Coin",
        description: "Nhân phần thưởng vàng (0x, 1.5x, 2x, 5x).",
        type: "GAMBLE",
        power: 2,
        price: 100,
        tier: 1,
        emoji: "🪙"
    },
    {
        key: "blood_vial",
        name: "Blood Vial",
        description: "Mất 10 HP để nhận +5 STR cho lượt đi săn kế.",
        type: "BUFF",
        power: 5,
        price: 90,
        tier: 1,
        emoji: "🩸"
    },
    // Tier 2
    {
        key: "trap_rare",
        name: "Rare Trap",
        description: "Tăng cơ hội bắt giữ +5.",
        type: "TRAP",
        power: 5,
        price: 350,
        tier: 2,
        emoji: "🔱"
    },
    {
        key: "clover_4leaf",
        name: "Four-Leaf Clover",
        description: "Tăng May Mắn +5.",
        type: "LUCK_BUFF",
        power: 5,
        price: 350,
        tier: 2,
        emoji: "🌿"
    },
    {
        key: "potion_mid",
        name: "Potion",
        description: "Hồi phục ngay 25 HP.",
        type: "POTION",
        power: 25,
        price: 200,
        tier: 2,
        emoji: "⚗️"
    },
    {
        key: "hunters_mark",
        name: "Hunter's Mark",
        description: "Tăng sát thương +30% cho lượt đi săn kế.",
        type: "SITUATIONAL",
        power: 30,
        price: 300,
        tier: 2,
        emoji: "🎯"
    },
    {
        key: "bag_upgrade",
        name: "Reinforced Bag",
        description: "Tăng giới hạn hành trang +5.",
        type: "PERMANENT",
        power: 5,
        price: 500,
        tier: 2,
        emoji: "🎒"
    },
    {
        key: "beast_bait",
        name: "Beast Bait",
        description: "Tăng cơ hội gặp quái hiếm.",
        type: "ENCOUNTER",
        power: 1,
        price: 250,
        tier: 2,
        emoji: "🍖"
    },
    // Tier 3
    {
        key: "golden_contract",
        name: "Golden Contract",
        description: "+200% phần thưởng nhưng kẻ địch mạnh gấp đôi.",
        type: "RISK",
        power: 2,
        price: 800,
        tier: 3,
        emoji: "📜"
    },
    {
        key: "chaos_orb",
        name: "Chaos Orb",
        description: "Ngẫu nhiên +/-10 vào tất cả chỉ số.",
        type: "CHAOS",
        power: 10,
        price: 600,
        tier: 3,
        emoji: "🔮"
    },
    {
        key: "spirit_bond",
        name: "Spirit Bond",
        description: "Tăng phần thưởng pet mạnh nhất +80% trong 3 lượt.",
        type: "PET_BUFF",
        power: 30,
        price: 700,
        tier: 3,
        emoji: "🐾"
    }
];
exports.CHEST_CATALOG = [
    {
        key: "chest_common",
        name: "Rương Gỗ",
        description: "70% Tiêu hao, 25% Common, 5% Rare.",
        type: "GAMBLE",
        power: 0,
        price: 500,
        tier: 1,
        emoji: "📦"
    },
    {
        key: "chest_rare",
        name: "Rương Bạc",
        description: "50% Common, 45% Rare, 5% Epic.",
        type: "GAMBLE",
        power: 0,
        price: 2000,
        tier: 2,
        emoji: "🥈"
    },
    {
        key: "chest_epic",
        name: "Rương Vàng",
        description: "50% Rare, 40% Epic, 10% Jackpot!",
        type: "GAMBLE",
        power: 0,
        price: 5000,
        tier: 3,
        emoji: "🥇"
    }
];
exports.DUNGEON_BUFF_ITEMS = [
    {
        key: "hunters_mark_dungeon",
        name: "Hunter's Mark",
        description: "+30% sát thương trong Dungeon.",
        type: "CONSUMABLE",
        power: 30,
        price: 300,
        tier: 1,
        emoji: "🎯"
    },
    {
        key: "blood_vial_dungeon",
        name: "Blood Vial",
        description: "+5 STR nhưng -10 HP khi vào.",
        type: "CONSUMABLE",
        power: 5,
        price: 200,
        tier: 1,
        emoji: "🩸"
    },
    {
        key: "steel_skin",
        name: "Steel Skin",
        description: "+15 DEF trong Dungeon.",
        type: "CONSUMABLE",
        power: 15,
        price: 350,
        tier: 1,
        emoji: "🛡️"
    },
    {
        key: "agility_tonic",
        name: "Swift Tonic",
        description: "+15 AGI trong Dungeon.",
        type: "CONSUMABLE",
        power: 15,
        price: 350,
        tier: 1,
        emoji: "🍃"
    },
    {
        key: "chaos_orb_dungeon",
        name: "Chaos Orb",
        description: "+/-10 ngẫu nhiên vào tất cả chỉ số.",
        type: "CHAOS",
        power: 10,
        price: 450,
        tier: 2,
        emoji: "🔮"
    },
    {
        key: "lucky_charm_dungeon",
        name: "Lucky Charm",
        description: "+10% cơ hội nhận item hiếm trong Dungeon.",
        type: "CONSUMABLE",
        power: 10,
        price: 300,
        tier: 2,
        emoji: "🍀"
    },
    {
        key: "berserker_brew",
        name: "Berserker Brew",
        description: "+20% ATK nhưng -10% DEF.",
        type: "CONSUMABLE",
        power: 20,
        price: 400,
        tier: 2,
        emoji: "🍷"
    },
    {
        key: "guardian_elixir",
        name: "Guardian Elixir",
        description: "+20% DEF nhưng -10% AGI.",
        type: "CONSUMABLE",
        power: 20,
        price: 400,
        tier: 2,
        emoji: "🛡️"
    },
    {
        key: "luck_potion",
        name: "Luck Potion",
        description: "+20 Luck trong Dungeon.",
        type: "CONSUMABLE",
        power: 20,
        price: 400,
        tier: 2,
        emoji: "🍀"
    }
];
exports.SHOP_REFRESH_GOLD = 500;
const SHOP_SLOTS = 5;
// ─── Rolling helpers ─────────────────────────────────────────────────────────
function pickFromPool(pool) {
    if (pool.length === 0) return undefined;
    return pool[Math.floor(Math.random() * pool.length)];
}
function rollShopItemsFn(excludeKeys = new Set()) {
    const tier1 = exports.SHOP_CATALOG.filter((e)=>e.tier === 1 && !excludeKeys.has(e.key));
    const tier2 = exports.SHOP_CATALOG.filter((e)=>e.tier === 2 && !excludeKeys.has(e.key));
    const tier3 = exports.SHOP_CATALOG.filter((e)=>e.tier === 3 && !excludeKeys.has(e.key));
    const pools = [
        tier1.length > 0 ? tier1 : exports.SHOP_CATALOG.filter((e)=>e.tier === 1),
        tier2.length > 0 ? tier2 : exports.SHOP_CATALOG.filter((e)=>e.tier === 2),
        tier3.length > 0 ? tier3 : exports.SHOP_CATALOG.filter((e)=>e.tier === 3)
    ];
    const picks = [];
    const usedKeys = new Set();
    for(let slot = 0; slot < SHOP_SLOTS; slot++){
        const r = Math.random();
        let pool = pools[0] ?? [];
        if (r < 0.25) pool = pools[1] ?? [];
        if (r < 0.12) pool = pools[2] ?? [];
        let chosen;
        for(let tries = 0; tries < 5; tries++){
            chosen = pickFromPool(pool);
            if (!chosen || !usedKeys.has(chosen.key)) break;
        }
        if (!chosen) chosen = pickFromPool(pools.flat());
        if (!chosen) continue;
        picks.push(chosen);
        usedKeys.add(chosen.key);
    }
    return picks.sort(()=>Math.random() - 0.5);
}
function getCatalogEntry(key) {
    return exports.SHOP_CATALOG.find((e)=>e.key === key);
}
function getChestEntry(key) {
    return exports.CHEST_CATALOG.find((e)=>e.key === key);
}
function rollEquipmentRarityFn(level) {
    const r = Math.random();
    if (level <= 5) return "COMMON";
    if (level <= 10) return r < 0.3 ? "RARE" : "COMMON";
    if (level <= 20) {
        if (r < 0.15) return "EPIC";
        if (r < 0.50) return "RARE";
        return "COMMON";
    }
    if (r < 0.25) return "EPIC";
    if (r < 0.60) return "RARE";
    return "COMMON";
}
function getEqPrice(rarity) {
    switch(rarity){
        case "COMMON":
            return 150 + Math.floor(Math.random() * 50);
        case "RARE":
            return 400 + Math.floor(Math.random() * 150);
        case "EPIC":
            return 1200 + Math.floor(Math.random() * 400);
        case "LEGENDARY":
            return 3000 + Math.floor(Math.random() * 1000);
    }
}
// ─── Accessory Prices ────────────────────────────────────────────────────────
function getAccessoryPrice(rarity) {
    switch(rarity){
        case "COMMON":
            return 150;
        case "RARE":
            return 450;
        case "EPIC":
            return 1200;
        case "LEGENDARY":
            return 3000;
    }
}
// ─── Pet Shop Prices ─────────────────────────────────────────────────────────
exports.PET_SHOP_PRICES = {
    COMMON: 100,
    RARE: 1000,
    EPIC: 5000,
    LEGENDARY: 15000
};
// ─── Seeded Daily Skill Shuffle ────────────────────────────────────────────────
/** Returns 5 daily skills deterministically based on userId + VN date. */ function getDailySkills(userId, skills, getVnDayString) {
    const seedString = `${userId}-${getVnDayString()}`;
    let hash = 0;
    for(let i = 0; i < seedString.length; i++){
        hash = (hash << 5) - hash + seedString.charCodeAt(i);
        hash |= 0;
    }
    const seededRandom = ()=>{
        const x = Math.sin(hash++) * 10000;
        return x - Math.floor(x);
    };
    const pool = [
        ...skills
    ];
    const result = [];
    for(let i = 0; i < 5 && pool.length > 0; i++){
        const index = Math.floor(seededRandom() * pool.length);
        const chosen = pool.splice(index, 1)[0];
        if (chosen !== undefined) result.push(chosen);
    }
    return result;
}
}),
"[project]/packages/game-core/dist/services/quest-service.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * quest-service.ts — pure quest definitions and helpers, no Prisma.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.QUESTS = void 0;
exports.getQuest = getQuest;
exports.getQuestsByType = getQuestsByType;
exports.QUESTS = [
    // DAILY
    {
        key: "hunt_count",
        description: "Hunt 5 times",
        type: "DAILY",
        target: 5,
        goldReward: 50,
        emoji: "⚔️"
    },
    {
        key: "catch_pet",
        description: "Tame 2 pets",
        type: "DAILY",
        target: 2,
        goldReward: 100,
        emoji: "🐾"
    },
    {
        key: "win_pvp",
        description: "Win 1 PvP match",
        type: "DAILY",
        target: 1,
        goldReward: 200,
        emoji: "🏟️"
    },
    {
        key: "use_item",
        description: "Use 3 items",
        type: "DAILY",
        target: 3,
        goldReward: 30,
        emoji: "📦"
    },
    {
        key: "earn_gold",
        description: "Earn 1000 gold",
        type: "DAILY",
        target: 1000,
        goldReward: 75,
        emoji: "💰"
    },
    // WEEKLY
    {
        key: "open_chest",
        description: "Open 5 chests",
        type: "WEEKLY",
        target: 5,
        goldReward: 500,
        emoji: "📦"
    },
    {
        key: "kill_beast",
        description: "Kill 20 beasts for meat",
        type: "WEEKLY",
        target: 20,
        goldReward: 1000,
        emoji: "🍖"
    },
    {
        key: "hunt_50",
        description: "Hunt 50 times",
        type: "WEEKLY",
        target: 50,
        goldReward: 800,
        emoji: "⚔️"
    },
    // ACHIEVEMENT (never resets)
    {
        key: "first_hunt",
        description: "Complete your first hunt",
        type: "ACHIEVEMENT",
        target: 1,
        goldReward: 0,
        emoji: "🎯"
    },
    {
        key: "reach_level_10",
        description: "Reach level 10",
        type: "ACHIEVEMENT",
        target: 10,
        goldReward: 0,
        emoji: "⭐"
    },
    {
        key: "own_5_pets",
        description: "Own 5 pets",
        type: "ACHIEVEMENT",
        target: 5,
        goldReward: 0,
        emoji: "🐾"
    }
];
function getQuest(key) {
    return exports.QUESTS.find((q)=>q.key === key);
}
function getQuestsByType(type) {
    return exports.QUESTS.filter((q)=>q.type === type);
}
}),
"[project]/packages/game-core/dist/utils/time.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * time.ts — Centralized time utilities for UTC+7 (Vietnam Time).
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getVnDate = getVnDate;
exports.getVnDayString = getVnDayString;
exports.msUntilNextVnMidnight = msUntilNextVnMidnight;
exports.isDifferentVnDay = isDifferentVnDay;
exports.msUntilNextVnMidnightFrom = msUntilNextVnMidnightFrom;
function getVnDate(date = new Date()) {
    const vnOffset = 7 * 60 * 60 * 1000;
    return new Date(date.getTime() + vnOffset);
}
function getVnDayString(date = new Date()) {
    return getVnDate(date).toISOString().split("T")[0] ?? "";
}
function msUntilNextVnMidnight() {
    const now = new Date();
    const nowVN = getVnDate(now);
    const nextVN = new Date(Date.UTC(nowVN.getUTCFullYear(), nowVN.getUTCMonth(), nowVN.getUTCDate() + 1, 0, 0, 0));
    const nextUTC = new Date(nextVN.getTime() - 7 * 60 * 60 * 1000);
    return nextUTC.getTime() - now.getTime();
}
function isDifferentVnDay(lastDate) {
    if (!lastDate) return true;
    return getVnDayString(new Date()) !== getVnDayString(lastDate);
}
function msUntilNextVnMidnightFrom(date) {
    const nowVN = getVnDate(date);
    const nextVN = new Date(Date.UTC(nowVN.getUTCFullYear(), nowVN.getUTCMonth(), nowVN.getUTCDate() + 1, 0, 0, 0));
    const nextUTC = new Date(nextVN.getTime() - 7 * 60 * 60 * 1000);
    return nextUTC.getTime() - date.getTime();
}
}),
"[project]/packages/game-core/dist/services/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getRarityMultiplier = exports.GEAR_TYPES = exports.MAX_UPGRADE_LEVEL = exports.SCRAP_VALUE_IN_GOLD = exports.simulateCombat = exports.applySynergyEffects = exports.getActiveRelicSynergies = exports.SYNERGY_POOL = exports.handleRelicTrigger = exports.applyRelicEffect = exports.executeUnit = exports.grantExtraTurn = exports.reflectDamage = exports.healUnit = exports.applyBleed = exports.processDamage = exports.dealDamage = exports.applyRelicsOnKill = exports.applyRelicsOnTurn = exports.applyRelicsBeforeCombat = exports.calculatePipelineDamage = exports.computeCombatStats = exports.SYNERGY_LIST = exports.getSkillDescription = exports.applySkills = exports.SKILL_HANDLERS = exports.SKILL_EMOJIS = exports.applyPetPlayerSynergy = exports.applyPetSynergy = exports.calculateSynergyMultipliers = exports.getActiveSynergies = exports.applyPetEffects = exports.calculatePetStatBonusDetailed = exports.calculatePetStatBonus = exports.enrichBeast = exports.createWildBeast = exports.rollRarity = exports.applyLevelUps = exports.requiredExpForLevel = exports.getBuffDamageReduction = exports.cleanupEffects = exports.resolveTurnEffects = exports.addEffect = exports.applyDamage = exports.calculateDamage = exports.weightedPick = exports.pickRandom = exports.rollPercent = exports.randomInt = exports.clamp = void 0;
exports.msUntilNextVnMidnightFrom = exports.isDifferentVnDay = exports.msUntilNextVnMidnight = exports.getVnDayString = exports.getQuestsByType = exports.getQuest = exports.QUESTS = exports.getDailySkills = exports.PET_SHOP_PRICES = exports.getAccessoryPrice = exports.getEqPrice = exports.rollEquipmentRarityFn = exports.getChestEntry = exports.getCatalogEntry = exports.SHOP_REFRESH_GOLD = exports.DUNGEON_BUFF_ITEMS = exports.CHEST_CATALOG = exports.SHOP_CATALOG = exports.sortGearKeepBestFirst = exports.calculateScrapValue = exports.previewUpgradePayment = exports.getEffectiveSuccessRate = exports.getUpgradeSuccessRate = exports.getBaseSuccessRate = exports.getUpgradeCost = void 0;
var rng_1 = __turbopack_context__.r("[project]/packages/game-core/dist/services/rng.js [app-route] (ecmascript)");
Object.defineProperty(exports, "clamp", {
    enumerable: true,
    get: function() {
        return rng_1.clamp;
    }
});
Object.defineProperty(exports, "randomInt", {
    enumerable: true,
    get: function() {
        return rng_1.randomInt;
    }
});
Object.defineProperty(exports, "rollPercent", {
    enumerable: true,
    get: function() {
        return rng_1.rollPercent;
    }
});
Object.defineProperty(exports, "pickRandom", {
    enumerable: true,
    get: function() {
        return rng_1.pickRandom;
    }
});
Object.defineProperty(exports, "weightedPick", {
    enumerable: true,
    get: function() {
        return rng_1.weightedPick;
    }
});
var combat_utils_1 = __turbopack_context__.r("[project]/packages/game-core/dist/services/combat-utils.js [app-route] (ecmascript)");
Object.defineProperty(exports, "calculateDamage", {
    enumerable: true,
    get: function() {
        return combat_utils_1.calculateDamage;
    }
});
Object.defineProperty(exports, "applyDamage", {
    enumerable: true,
    get: function() {
        return combat_utils_1.applyDamage;
    }
});
Object.defineProperty(exports, "addEffect", {
    enumerable: true,
    get: function() {
        return combat_utils_1.addEffect;
    }
});
Object.defineProperty(exports, "resolveTurnEffects", {
    enumerable: true,
    get: function() {
        return combat_utils_1.resolveTurnEffects;
    }
});
Object.defineProperty(exports, "cleanupEffects", {
    enumerable: true,
    get: function() {
        return combat_utils_1.cleanupEffects;
    }
});
Object.defineProperty(exports, "getBuffDamageReduction", {
    enumerable: true,
    get: function() {
        return combat_utils_1.getBuffDamageReduction;
    }
});
var leveling_1 = __turbopack_context__.r("[project]/packages/game-core/dist/services/leveling.js [app-route] (ecmascript)");
Object.defineProperty(exports, "requiredExpForLevel", {
    enumerable: true,
    get: function() {
        return leveling_1.requiredExpForLevel;
    }
});
Object.defineProperty(exports, "applyLevelUps", {
    enumerable: true,
    get: function() {
        return leveling_1.applyLevelUps;
    }
});
var hunt_service_1 = __turbopack_context__.r("[project]/packages/game-core/dist/services/hunt-service.js [app-route] (ecmascript)");
Object.defineProperty(exports, "rollRarity", {
    enumerable: true,
    get: function() {
        return hunt_service_1.rollRarity;
    }
});
Object.defineProperty(exports, "createWildBeast", {
    enumerable: true,
    get: function() {
        return hunt_service_1.createWildBeast;
    }
});
var pet_utils_1 = __turbopack_context__.r("[project]/packages/game-core/dist/services/pet-utils.js [app-route] (ecmascript)");
Object.defineProperty(exports, "enrichBeast", {
    enumerable: true,
    get: function() {
        return pet_utils_1.enrichBeast;
    }
});
Object.defineProperty(exports, "calculatePetStatBonus", {
    enumerable: true,
    get: function() {
        return pet_utils_1.calculatePetStatBonus;
    }
});
Object.defineProperty(exports, "calculatePetStatBonusDetailed", {
    enumerable: true,
    get: function() {
        return pet_utils_1.calculatePetStatBonusDetailed;
    }
});
var pet_system_1 = __turbopack_context__.r("[project]/packages/game-core/dist/services/pet-system.js [app-route] (ecmascript)");
Object.defineProperty(exports, "applyPetEffects", {
    enumerable: true,
    get: function() {
        return pet_system_1.applyPetEffects;
    }
});
var pet_synergy_1 = __turbopack_context__.r("[project]/packages/game-core/dist/services/pet-synergy.js [app-route] (ecmascript)");
Object.defineProperty(exports, "getActiveSynergies", {
    enumerable: true,
    get: function() {
        return pet_synergy_1.getActiveSynergies;
    }
});
Object.defineProperty(exports, "calculateSynergyMultipliers", {
    enumerable: true,
    get: function() {
        return pet_synergy_1.calculateSynergyMultipliers;
    }
});
Object.defineProperty(exports, "applyPetSynergy", {
    enumerable: true,
    get: function() {
        return pet_synergy_1.applyPetSynergy;
    }
});
Object.defineProperty(exports, "applyPetPlayerSynergy", {
    enumerable: true,
    get: function() {
        return pet_synergy_1.applyPetPlayerSynergy;
    }
});
var skill_system_1 = __turbopack_context__.r("[project]/packages/game-core/dist/services/skill-system.js [app-route] (ecmascript)");
Object.defineProperty(exports, "SKILL_EMOJIS", {
    enumerable: true,
    get: function() {
        return skill_system_1.SKILL_EMOJIS;
    }
});
Object.defineProperty(exports, "SKILL_HANDLERS", {
    enumerable: true,
    get: function() {
        return skill_system_1.SKILL_HANDLERS;
    }
});
Object.defineProperty(exports, "applySkills", {
    enumerable: true,
    get: function() {
        return skill_system_1.applySkills;
    }
});
Object.defineProperty(exports, "getSkillDescription", {
    enumerable: true,
    get: function() {
        return skill_system_1.getSkillDescription;
    }
});
Object.defineProperty(exports, "SYNERGY_LIST", {
    enumerable: true,
    get: function() {
        return skill_system_1.SYNERGY_LIST;
    }
});
var stats_service_1 = __turbopack_context__.r("[project]/packages/game-core/dist/services/stats-service.js [app-route] (ecmascript)");
Object.defineProperty(exports, "computeCombatStats", {
    enumerable: true,
    get: function() {
        return stats_service_1.computeCombatStats;
    }
});
Object.defineProperty(exports, "calculatePipelineDamage", {
    enumerable: true,
    get: function() {
        return stats_service_1.calculatePipelineDamage;
    }
});
var relic_system_1 = __turbopack_context__.r("[project]/packages/game-core/dist/services/relic-system.js [app-route] (ecmascript)");
Object.defineProperty(exports, "applyRelicsBeforeCombat", {
    enumerable: true,
    get: function() {
        return relic_system_1.applyRelicsBeforeCombat;
    }
});
Object.defineProperty(exports, "applyRelicsOnTurn", {
    enumerable: true,
    get: function() {
        return relic_system_1.applyRelicsOnTurn;
    }
});
Object.defineProperty(exports, "applyRelicsOnKill", {
    enumerable: true,
    get: function() {
        return relic_system_1.applyRelicsOnKill;
    }
});
var relic_engine_1 = __turbopack_context__.r("[project]/packages/game-core/dist/services/relic-engine.js [app-route] (ecmascript)");
Object.defineProperty(exports, "dealDamage", {
    enumerable: true,
    get: function() {
        return relic_engine_1.dealDamage;
    }
});
Object.defineProperty(exports, "processDamage", {
    enumerable: true,
    get: function() {
        return relic_engine_1.processDamage;
    }
});
Object.defineProperty(exports, "applyBleed", {
    enumerable: true,
    get: function() {
        return relic_engine_1.applyBleed;
    }
});
Object.defineProperty(exports, "healUnit", {
    enumerable: true,
    get: function() {
        return relic_engine_1.healUnit;
    }
});
Object.defineProperty(exports, "reflectDamage", {
    enumerable: true,
    get: function() {
        return relic_engine_1.reflectDamage;
    }
});
Object.defineProperty(exports, "grantExtraTurn", {
    enumerable: true,
    get: function() {
        return relic_engine_1.grantExtraTurn;
    }
});
Object.defineProperty(exports, "executeUnit", {
    enumerable: true,
    get: function() {
        return relic_engine_1.executeUnit;
    }
});
Object.defineProperty(exports, "applyRelicEffect", {
    enumerable: true,
    get: function() {
        return relic_engine_1.applyRelicEffect;
    }
});
Object.defineProperty(exports, "handleRelicTrigger", {
    enumerable: true,
    get: function() {
        return relic_engine_1.handleRelicTrigger;
    }
});
var relic_synergy_1 = __turbopack_context__.r("[project]/packages/game-core/dist/services/relic-synergy.js [app-route] (ecmascript)");
Object.defineProperty(exports, "SYNERGY_POOL", {
    enumerable: true,
    get: function() {
        return relic_synergy_1.SYNERGY_POOL;
    }
});
Object.defineProperty(exports, "getActiveRelicSynergies", {
    enumerable: true,
    get: function() {
        return relic_synergy_1.getActiveSynergies;
    }
});
Object.defineProperty(exports, "applySynergyEffects", {
    enumerable: true,
    get: function() {
        return relic_synergy_1.applySynergyEffects;
    }
});
var combat_engine_1 = __turbopack_context__.r("[project]/packages/game-core/dist/services/combat-engine.js [app-route] (ecmascript)");
Object.defineProperty(exports, "simulateCombat", {
    enumerable: true,
    get: function() {
        return combat_engine_1.simulateCombat;
    }
});
var upgrade_service_1 = __turbopack_context__.r("[project]/packages/game-core/dist/services/upgrade-service.js [app-route] (ecmascript)");
Object.defineProperty(exports, "SCRAP_VALUE_IN_GOLD", {
    enumerable: true,
    get: function() {
        return upgrade_service_1.SCRAP_VALUE_IN_GOLD;
    }
});
Object.defineProperty(exports, "MAX_UPGRADE_LEVEL", {
    enumerable: true,
    get: function() {
        return upgrade_service_1.MAX_UPGRADE_LEVEL;
    }
});
Object.defineProperty(exports, "GEAR_TYPES", {
    enumerable: true,
    get: function() {
        return upgrade_service_1.GEAR_TYPES;
    }
});
Object.defineProperty(exports, "getRarityMultiplier", {
    enumerable: true,
    get: function() {
        return upgrade_service_1.getRarityMultiplier;
    }
});
Object.defineProperty(exports, "getUpgradeCost", {
    enumerable: true,
    get: function() {
        return upgrade_service_1.getUpgradeCost;
    }
});
Object.defineProperty(exports, "getBaseSuccessRate", {
    enumerable: true,
    get: function() {
        return upgrade_service_1.getBaseSuccessRate;
    }
});
Object.defineProperty(exports, "getUpgradeSuccessRate", {
    enumerable: true,
    get: function() {
        return upgrade_service_1.getUpgradeSuccessRate;
    }
});
Object.defineProperty(exports, "getEffectiveSuccessRate", {
    enumerable: true,
    get: function() {
        return upgrade_service_1.getEffectiveSuccessRate;
    }
});
Object.defineProperty(exports, "previewUpgradePayment", {
    enumerable: true,
    get: function() {
        return upgrade_service_1.previewUpgradePayment;
    }
});
Object.defineProperty(exports, "calculateScrapValue", {
    enumerable: true,
    get: function() {
        return upgrade_service_1.calculateScrapValue;
    }
});
Object.defineProperty(exports, "sortGearKeepBestFirst", {
    enumerable: true,
    get: function() {
        return upgrade_service_1.sortGearKeepBestFirst;
    }
});
var shop_service_1 = __turbopack_context__.r("[project]/packages/game-core/dist/services/shop-service.js [app-route] (ecmascript)");
Object.defineProperty(exports, "SHOP_CATALOG", {
    enumerable: true,
    get: function() {
        return shop_service_1.SHOP_CATALOG;
    }
});
Object.defineProperty(exports, "CHEST_CATALOG", {
    enumerable: true,
    get: function() {
        return shop_service_1.CHEST_CATALOG;
    }
});
Object.defineProperty(exports, "DUNGEON_BUFF_ITEMS", {
    enumerable: true,
    get: function() {
        return shop_service_1.DUNGEON_BUFF_ITEMS;
    }
});
Object.defineProperty(exports, "SHOP_REFRESH_GOLD", {
    enumerable: true,
    get: function() {
        return shop_service_1.SHOP_REFRESH_GOLD;
    }
});
Object.defineProperty(exports, "getCatalogEntry", {
    enumerable: true,
    get: function() {
        return shop_service_1.getCatalogEntry;
    }
});
Object.defineProperty(exports, "getChestEntry", {
    enumerable: true,
    get: function() {
        return shop_service_1.getChestEntry;
    }
});
Object.defineProperty(exports, "rollEquipmentRarityFn", {
    enumerable: true,
    get: function() {
        return shop_service_1.rollEquipmentRarityFn;
    }
});
Object.defineProperty(exports, "getEqPrice", {
    enumerable: true,
    get: function() {
        return shop_service_1.getEqPrice;
    }
});
Object.defineProperty(exports, "getAccessoryPrice", {
    enumerable: true,
    get: function() {
        return shop_service_1.getAccessoryPrice;
    }
});
Object.defineProperty(exports, "PET_SHOP_PRICES", {
    enumerable: true,
    get: function() {
        return shop_service_1.PET_SHOP_PRICES;
    }
});
Object.defineProperty(exports, "getDailySkills", {
    enumerable: true,
    get: function() {
        return shop_service_1.getDailySkills;
    }
});
var quest_service_1 = __turbopack_context__.r("[project]/packages/game-core/dist/services/quest-service.js [app-route] (ecmascript)");
Object.defineProperty(exports, "QUESTS", {
    enumerable: true,
    get: function() {
        return quest_service_1.QUESTS;
    }
});
Object.defineProperty(exports, "getQuest", {
    enumerable: true,
    get: function() {
        return quest_service_1.getQuest;
    }
});
Object.defineProperty(exports, "getQuestsByType", {
    enumerable: true,
    get: function() {
        return quest_service_1.getQuestsByType;
    }
});
var time_1 = __turbopack_context__.r("[project]/packages/game-core/dist/utils/time.js [app-route] (ecmascript)");
Object.defineProperty(exports, "getVnDayString", {
    enumerable: true,
    get: function() {
        return time_1.getVnDayString;
    }
});
Object.defineProperty(exports, "msUntilNextVnMidnight", {
    enumerable: true,
    get: function() {
        return time_1.msUntilNextVnMidnight;
    }
});
Object.defineProperty(exports, "isDifferentVnDay", {
    enumerable: true,
    get: function() {
        return time_1.isDifferentVnDay;
    }
});
Object.defineProperty(exports, "msUntilNextVnMidnightFrom", {
    enumerable: true,
    get: function() {
        return time_1.msUntilNextVnMidnightFrom;
    }
});
}),
"[project]/packages/game-core/dist/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __createBinding = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = {
            enumerable: true,
            get: function() {
                return m[k];
            }
        };
    }
    Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __exportStar = /*TURBOPACK member replacement*/ __turbopack_context__.e && /*TURBOPACK member replacement*/ __turbopack_context__.e.__exportStar || function(m, exports1) {
    for(var p in m)if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports1, p)) __createBinding(exports1, m, p);
};
Object.defineProperty(exports, "__esModule", {
    value: true
});
// game-core public API
__exportStar(__turbopack_context__.r("[project]/packages/game-core/dist/types/index.js [app-route] (ecmascript)"), exports);
__exportStar(__turbopack_context__.r("[project]/packages/game-core/dist/constants/index.js [app-route] (ecmascript)"), exports);
__exportStar(__turbopack_context__.r("[project]/packages/game-core/dist/services/index.js [app-route] (ecmascript)"), exports);
}),
"[project]/apps/web/src/app/api/item/open-chest/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$15_react$2d$dom$40$19$2e$2$2e$5_react$40$19$2e$2$2e$5_$5f$react$40$19$2e$2$2e$5$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.5.15_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/game-core/dist/index.js [app-route] (ecmascript)");
;
;
;
function rollChestReward(tier) {
    const r = Math.random();
    if (tier === 1) {
        // 70% consume, 25% common gear, 5% rare gear
        if (r < 0.70) {
            const consumables = __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SHOP_CATALOG"].filter((e)=>e.type === "CONSUMABLE" || e.type === "POTION" || e.type === "MEAT" || e.type === "LUCK_BUFF");
            const pick = consumables[Math.floor(Math.random() * consumables.length)];
            if (!pick) return null;
            return {
                name: pick.name,
                type: pick.type,
                rarity: pick.tier === 1 ? "COMMON" : "RARE",
                power: pick.power ?? 0,
                bonusStr: 0,
                bonusAgi: 0,
                bonusDef: 0,
                bonusHp: 0,
                emoji: pick.emoji ?? "🧪"
            };
        } else if (r < 0.95) {
            const pool = [
                ...__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["WEAPON_POOL"],
                ...__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ARMOR_POOL"]
            ].filter((e)=>e.rarity === "COMMON");
            const pick = pool[Math.floor(Math.random() * pool.length)];
            if (!pick) return null;
            return {
                name: pick.name,
                type: pick.type,
                rarity: "COMMON",
                power: pick.power ?? 0,
                bonusStr: pick.bonusStr ?? 0,
                bonusAgi: pick.bonusAgi ?? 0,
                bonusDef: pick.bonusDef ?? 0,
                bonusHp: pick.bonusHp ?? 0,
                emoji: pick.type === "WEAPON" ? "⚔️" : "🛡️"
            };
        } else {
            const pool = [
                ...__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["WEAPON_POOL"],
                ...__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ARMOR_POOL"]
            ].filter((e)=>e.rarity === "RARE");
            const pick = pool[Math.floor(Math.random() * pool.length)];
            if (!pick) return null;
            return {
                name: pick.name,
                type: pick.type,
                rarity: "RARE",
                power: pick.power ?? 0,
                bonusStr: pick.bonusStr ?? 0,
                bonusAgi: pick.bonusAgi ?? 0,
                bonusDef: pick.bonusDef ?? 0,
                bonusHp: pick.bonusHp ?? 0,
                emoji: pick.type === "WEAPON" ? "⚔️" : "🛡️"
            };
        }
    }
    if (tier === 2) {
        // 50% common gear, 45% rare gear, 5% epic gear
        if (r < 0.50) {
            const pool = [
                ...__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["WEAPON_POOL"],
                ...__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ARMOR_POOL"]
            ].filter((e)=>e.rarity === "COMMON");
            const pick = pool[Math.floor(Math.random() * pool.length)];
            if (!pick) return null;
            return {
                name: pick.name,
                type: pick.type,
                rarity: "COMMON",
                power: pick.power ?? 0,
                bonusStr: pick.bonusStr ?? 0,
                bonusAgi: pick.bonusAgi ?? 0,
                bonusDef: pick.bonusDef ?? 0,
                bonusHp: pick.bonusHp ?? 0,
                emoji: pick.type === "WEAPON" ? "⚔️" : "🛡️"
            };
        } else if (r < 0.95) {
            const pool = [
                ...__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["WEAPON_POOL"],
                ...__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ARMOR_POOL"]
            ].filter((e)=>e.rarity === "RARE");
            const pick = pool[Math.floor(Math.random() * pool.length)];
            if (!pick) return null;
            return {
                name: pick.name,
                type: pick.type,
                rarity: "RARE",
                power: pick.power ?? 0,
                bonusStr: pick.bonusStr ?? 0,
                bonusAgi: pick.bonusAgi ?? 0,
                bonusDef: pick.bonusDef ?? 0,
                bonusHp: pick.bonusHp ?? 0,
                emoji: pick.type === "WEAPON" ? "⚔️" : "🛡️"
            };
        } else {
            const pool = [
                ...__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["WEAPON_POOL"],
                ...__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ARMOR_POOL"]
            ].filter((e)=>e.rarity === "EPIC");
            const pick = pool[Math.floor(Math.random() * pool.length)];
            if (!pick) return null;
            return {
                name: pick.name,
                type: pick.type,
                rarity: "EPIC",
                power: pick.power ?? 0,
                bonusStr: pick.bonusStr ?? 0,
                bonusAgi: pick.bonusAgi ?? 0,
                bonusDef: pick.bonusDef ?? 0,
                bonusHp: pick.bonusHp ?? 0,
                emoji: pick.type === "WEAPON" ? "⚔️" : "🛡️"
            };
        }
    }
    // tier 3: 50% rare gear, 40% epic gear, 10% jackpot (legendary)
    if (r < 0.50) {
        const pool = [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["WEAPON_POOL"],
            ...__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ARMOR_POOL"]
        ].filter((e)=>e.rarity === "RARE");
        const pick = pool[Math.floor(Math.random() * pool.length)];
        if (!pick) return null;
        return {
            name: pick.name,
            type: pick.type,
            rarity: "RARE",
            power: pick.power ?? 0,
            bonusStr: pick.bonusStr ?? 0,
            bonusAgi: pick.bonusAgi ?? 0,
            bonusDef: pick.bonusDef ?? 0,
            bonusHp: pick.bonusHp ?? 0,
            emoji: pick.type === "WEAPON" ? "⚔️" : "🛡️"
        };
    } else if (r < 0.90) {
        const pool = [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["WEAPON_POOL"],
            ...__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ARMOR_POOL"]
        ].filter((e)=>e.rarity === "EPIC");
        const pick = pool[Math.floor(Math.random() * pool.length)];
        if (!pick) return null;
        return {
            name: pick.name,
            type: pick.type,
            rarity: "EPIC",
            power: pick.power ?? 0,
            bonusStr: pick.bonusStr ?? 0,
            bonusAgi: pick.bonusAgi ?? 0,
            bonusDef: pick.bonusDef ?? 0,
            bonusHp: pick.bonusHp ?? 0,
            emoji: pick.type === "WEAPON" ? "⚔️" : "🛡️"
        };
    } else {
        // Jackpot — legendary
        const pool = [
            ...__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["WEAPON_POOL"],
            ...__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$game$2d$core$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ARMOR_POOL"]
        ].filter((e)=>e.rarity === "LEGENDARY");
        const pick = pool[Math.floor(Math.random() * pool.length)];
        if (!pick) return null;
        return {
            name: pick.name,
            type: pick.type,
            rarity: "LEGENDARY",
            power: pick.power ?? 0,
            bonusStr: pick.bonusStr ?? 0,
            bonusAgi: pick.bonusAgi ?? 0,
            bonusDef: pick.bonusDef ?? 0,
            bonusHp: pick.bonusHp ?? 0,
            emoji: pick.type === "WEAPON" ? "⚔️" : "🛡️"
        };
    }
}
async function POST(req) {
    try {
        const { userId, itemId } = await req.json();
        if (!userId || !itemId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$15_react$2d$dom$40$19$2e$2$2e$5_react$40$19$2e$2$2e$5_$5f$react$40$19$2e$2$2e$5$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Missing fields"
            }, {
                status: 400
            });
        }
        const user = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.findUnique({
            where: {
                id: userId
            },
            include: {
                inventory: true
            }
        });
        if (!user) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$15_react$2d$dom$40$19$2e$2$2e$5_react$40$19$2e$2$2e$5_$5f$react$40$19$2e$2$2e$5$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "User not found"
        }, {
            status: 404
        });
        const item = await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].item.findFirst({
            where: {
                id: itemId,
                ownerId: userId
            }
        });
        if (!item) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$15_react$2d$dom$40$19$2e$2$2e$5_react$40$19$2e$2$2e$5_$5f$react$40$19$2e$2$2e$5$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Chest not found"
        }, {
            status: 404
        });
        if (item.type !== "GAMBLE") {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$15_react$2d$dom$40$19$2e$2$2e$5_react$40$19$2e$2$2e$5_$5f$react$40$19$2e$2$2e$5$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Item is not a chest"
            }, {
                status: 400
            });
        }
        // Determine chest tier from item name
        let tier = 1;
        const name = item.name ?? "";
        if (name.includes("Bạc") || name.includes("Rare")) tier = 2;
        else if (name.includes("Vàng") || name.includes("Epic") || name.includes("Gold")) tier = 3;
        const reward = rollChestReward(tier);
        if (!reward) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$15_react$2d$dom$40$19$2e$2$2e$5_react$40$19$2e$2$2e$5_$5f$react$40$19$2e$2$2e$5$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to roll reward"
        }, {
            status: 500
        });
        await __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$transaction([
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].item.delete({
                where: {
                    id: itemId
                }
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].item.create({
                data: {
                    ownerId: userId,
                    name: reward.name,
                    type: reward.type,
                    rarity: reward.rarity,
                    power: reward.power,
                    bonusStr: reward.bonusStr,
                    bonusAgi: reward.bonusAgi,
                    bonusDef: reward.bonusDef,
                    bonusHp: reward.bonusHp,
                    quantity: 1,
                    isEquipped: false
                }
            })
        ]);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$15_react$2d$dom$40$19$2e$2$2e$5_react$40$19$2e$2$2e$5_$5f$react$40$19$2e$2$2e$5$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            message: `Opened **${item.name}** and got **${reward.name}** (${reward.rarity})!`,
            reward: {
                name: reward.name,
                rarity: reward.rarity,
                emoji: reward.emoji
            }
        });
    } catch (err) {
        console.error("[/api/item/open-chest]", err);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$15_react$2d$dom$40$19$2e$2$2e$5_react$40$19$2e$2$2e$5_$5f$react$40$19$2e$2$2e$5$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Internal server error"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__80743624._.js.map
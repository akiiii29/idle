"use client";

import { useState, useEffect } from "react";
import styles from "./ShopPanel.module.css";
import { ACCESSORY_CONFIGS, ACCESSORY_SETS } from "@game/core";

type ShopData = {
  gold: number;
  refreshCost: number;
  consumableSlots: { slot: number; item: any; purchased: boolean }[];
  equipmentSlots: any[];
  accessorySlots: any[];
  chestSlots: { slot: string; item: any }[];
  dungeonSlots: any[];
  petSlots: { rarity: string; price: number }[];
};

type Category = "consumable" | "equipment" | "accessory" | "chest" | "dungeon" | "pet";

const rarityColors: Record<string, string> = {
  COMMON: "#9ca3af",
  RARE: "#3b82f6",
  EPIC: "#9b6dff",
  LEGENDARY: "#f0c040",
};

const rarityGlow: Record<string, string> = {
  COMMON: styles["rarity-glow-common"],
  RARE: styles["rarity-glow-rare"],
  EPIC: styles["rarity-glow-epic"],
  LEGENDARY: styles["rarity-glow-legendary"],
};

const CATEGORIES: { id: Category; label: string; icon: string }[] = [
  { id: "consumable", label: "Consumables", icon: "🧪" },
  { id: "equipment", label: "Equipment", icon: "⚔️" },
  { id: "accessory", label: "Accessories", icon: "💍" },
  { id: "chest", label: "Chests", icon: "📦" },
  { id: "dungeon", label: "Dungeon", icon: "🏰" },
  { id: "pet", label: "Pets", icon: "🐾" },
];

const PET_ICONS: Record<string, string> = {
  COMMON: "🐾",
  RARE: "🦊",
  EPIC: "🐉",
  LEGENDARY: "👑",
};

export default function ShopPanel({ user, onUpdate, onRefetch }: { user: any; onUpdate: (patch: any) => void; onRefetch?: () => void }) {
  const [shop, setShop] = useState<ShopData | null>(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<Category>("consumable");
  const [buying, setBuying] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchShop();
  }, [user?.id]);

  function fetchShop() {
    if (!user?.id) return;
    setLoading(true);
    fetch(`/api/shop?userId=${user.id}`)
      .then((r) => r.json())
      .then((data) => setShop(data))
      .finally(() => setLoading(false));
  }

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function buy(categoryType: Category, slotKey: string | number, price: number) {
    if (!shop || user.gold < price) return;
    setBuying(String(slotKey));
    try {
      const body: any = { userId: user.id, category: categoryType, slot: slotKey, price };
      if (categoryType === "chest") body.chestKey = slotKey;
      if (categoryType === "pet") body.petRarity = slotKey;

      const res = await fetch("/api/shop/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message, "success");
        onUpdate({ gold: (user.gold ?? 0) - price });
        // Refetch user to get new pet/item in inventory
        if (onRefetch) onRefetch();
      } else {
        showToast(data.message || "Purchase failed", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setBuying(null);
    }
  }

  async function refresh() {
    if (!shop || refreshing) return;
    setRefreshing(true);
    try {
      const res = await fetch("/api/shop/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, category: "refresh" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Shop refreshed with new items!", "success");
        onUpdate({ gold: (user.gold ?? 0) - 500 });
      } else {
        showToast(data.message || "Refresh failed", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setRefreshing(false);
    }
  }

  if (loading) {
    return <div className={styles.panel}><p className={styles.loading}>Loading shop...</p></div>;
  }

  const gold = shop?.gold ?? user.gold;

  return (
    <div className={styles.panel}>
      {toast && <div className={`${styles.toast} ${styles[toast.type]}`}>{toast.msg}</div>}

      <div className={styles.header}>
        <h2 className={styles.title}>🏪 Shop</h2>
        <div className={styles.headerRight}>
          <span className={styles.goldDisplay}>💰 {gold.toLocaleString()}</span>
          <button
            className={styles.refreshBtn}
            onClick={refresh}
            disabled={refreshing || (shop ? gold < shop.refreshCost : false)}
            title="Refresh shop for 500 gold"
          >
            {refreshing ? "..." : `↻ ${shop?.refreshCost}g`}
          </button>
        </div>
      </div>

      {/* Category tabs */}
      <div className={styles.tabs}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`${styles.tab} ${category === cat.id ? styles.activeTab : ""}`}
            onClick={() => setCategory(cat.id)}
          >
            <span className={styles.tabIcon}>{cat.icon}</span>
            <span className={styles.tabLabel}>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Content based on category */}
      <div className={styles.content}>
        {category === "consumable" && (
          <ConsumableShop shop={shop} gold={gold} buying={buying} onBuy={buy} />
        )}
        {category === "equipment" && (
          <EquipmentShop shop={shop} gold={gold} buying={buying} onBuy={buy} />
        )}
        {category === "accessory" && (
          <AccessoryShop shop={shop} gold={gold} buying={buying} onBuy={buy} user={user} />
        )}
        {category === "chest" && (
          <ChestShop shop={shop} gold={gold} buying={buying} onBuy={buy} />
        )}
        {category === "dungeon" && (
          <DungeonShop shop={shop} gold={gold} buying={buying} onBuy={buy} />
        )}
        {category === "pet" && (
          <PetShop shop={shop} gold={gold} onBuy={buy} />
        )}
      </div>
    </div>
  );
}

// ─── Consumable Shop ──────────────────────────────────────────────────────────
function ConsumableShop({ shop, gold, buying, onBuy }: any) {
  const slots = shop?.consumableSlots ?? [];
  return (
    <div className={styles.grid}>
      {slots.map((s: any) => {
        const item = s.item;
        if (!item) return null;
        const rarity = item.tier === 1 ? "COMMON" : item.tier === 2 ? "RARE" : "EPIC";
        return (
          <SlotCard
            key={s.slot}
            icon={item.emoji}
            name={item.name}
            rarity={rarity}
            price={item.price}
            canAfford={gold >= item.price}
            purchased={s.purchased}
            loading={buying === String(s.slot)}
            onBuy={() => onBuy("consumable", s.slot, item.price)}
            description={item.description}
          />
        );
      })}
    </div>
  );
}

// ─── Equipment Shop ───────────────────────────────────────────────────────────
function EquipmentShop({ shop, gold, buying, onBuy }: any) {
  const slots = shop?.equipmentSlots ?? [];
  return (
    <div className={styles.grid}>
      {slots.map((s: any, i: number) => (
        <SlotCard
          key={i}
          icon={s.type === "WEAPON" ? "⚔️" : "🛡️"}
          name={s.name}
          rarity={s.rarity}
          price={s.price}
          canAfford={gold >= s.price}
          purchased={false}
          loading={buying === String(i)}
          onBuy={() => onBuy("equipment", i + 100, s.price)}
          description={`⚡${s.power} · ⚔️+${s.bonusStr} 🏃+${s.bonusAgi} 🛡️+${s.bonusDef} ❤️+${s.bonusHp}`}
        />
      ))}
    </div>
  );
}

// ─── Accessory Shop ───────────────────────────────────────────────────────────
function AccessoryShop({ shop, gold, buying, onBuy, user }: any) {
  const slots = shop?.accessorySlots ?? [];

  // Build a map of set name → pieces currently equipped from user.inventory
  const equippedSets: Record<string, { pieceNames: string[]; count: number }> = {};
  const equipped = user?.inventory?.filter((i: any) => i.isEquipped && i.type === "ACCESSORY") ?? [];
  for (const item of equipped) {
    const config = (ACCESSORY_CONFIGS as Record<string, any>)[item.name];
    if (!config?.set) continue;
    if (!equippedSets[config.set]) equippedSets[config.set] = { pieceNames: [], count: 0 };
    if (!equippedSets[config.set].pieceNames.includes(item.name)) {
      equippedSets[config.set].pieceNames.push(item.name);
      equippedSets[config.set].count++;
    }
  }

  return (
    <div className={styles.grid}>
      {slots.map((s: any) => {
        const item = s.item;
        if (!item) return null;
        const rarity = item.rarity ?? "RARE";
        const config = (ACCESSORY_CONFIGS as Record<string, any>)[item.name];
        const setName = config?.set ?? null;
        const matchingSet = setName ? equippedSets[setName] ?? null : null;
        const setBonus = setName ? (ACCESSORY_SETS as Record<string, any>)[setName] : null;

        return (
          <SlotCard
            key={s.slot}
            icon="💍"
            name={item.name}
            rarity={rarity}
            price={item.price ?? 150}
            canAfford={gold >= (item.price ?? 150)}
            purchased={s.purchased}
            loading={buying === String(s.slot)}
            onBuy={() => onBuy("accessory", s.slot, item.price ?? 150)}
            description={config ? describeAccessoryEffects(config.effects) : undefined}
            setName={setName}
            setMatch={matchingSet}
            setBonus={setBonus}
          />
        );
      })}
    </div>
  );
}

// ─── Chest Shop ───────────────────────────────────────────────────────────────
function ChestShop({ shop, gold, buying, onBuy }: any) {
  const slots = shop?.chestSlots ?? [];
  return (
    <div className={styles.grid}>
      {slots.map((s: any) => (
        <SlotCard
          key={s.slot}
          icon={s.item.emoji}
          name={s.item.name}
          rarity={s.item.tier === 1 ? "COMMON" : s.item.tier === 2 ? "RARE" : "EPIC"}
          price={s.item.price}
          canAfford={gold >= s.item.price}
          purchased={false}
          loading={buying === s.slot}
          onBuy={() => onBuy("chest", s.slot, s.item.price)}
          description={s.item.description}
        />
      ))}
    </div>
  );
}

// ─── Dungeon Shop ─────────────────────────────────────────────────────────────
function DungeonShop({ shop, gold, buying, onBuy }: any) {
  const slots = shop?.dungeonSlots ?? [];
  return (
    <div className={styles.grid}>
      {slots.map((s: any) => {
        const item = s.item;
        if (!item) return null;
        const rarity = item.tier === 1 ? "COMMON" : "RARE";
        return (
          <SlotCard
            key={s.slot}
            icon={item.emoji}
            name={item.name}
            rarity={rarity}
            price={item.price}
            canAfford={gold >= item.price}
            purchased={s.purchased}
            loading={buying === String(s.slot)}
            onBuy={() => onBuy("dungeon", s.slot, item.price)}
            description={item.description}
          />
        );
      })}
    </div>
  );
}

// ─── Pet Shop ─────────────────────────────────────────────────────────────────
function PetShop({ shop, gold, onBuy }: any) {
  const slots = shop?.petSlots ?? [];
  return (
    <div className={styles.grid}>
      {slots.map((s: any) => (
        <SlotCard
          key={s.rarity}
          icon={PET_ICONS[s.rarity] ?? "🐾"}
          name={`${s.rarity} Pet`}
          rarity={s.rarity}
          price={s.price}
          canAfford={gold >= s.price}
          purchased={false}
          loading={false}
          onBuy={() => onBuy("pet", s.rarity, s.price)}
          description={`Adopt a ${s.rarity.toLowerCase()} pet companion`}
        />
      ))}
    </div>
  );
}

// ─── Slot Card ────────────────────────────────────────────────────────────────
function SlotCard({
  icon, name, rarity, price, canAfford, purchased, loading, onBuy, description,
  setName, setMatch, setBonus,
}: {
  icon: string; name: string; rarity: string; price: number;
  canAfford: boolean; purchased: boolean; loading: boolean;
  onBuy: () => void; description?: string;
  setName?: string | null; setMatch?: { pieceNames: string[]; count: number } | null; setBonus?: any;
}) {
  const hasSetHighlight = !!setMatch;
  return (
    <div
      className={`${styles.slotCard} ${rarityGlow[rarity] || ""} ${purchased ? styles.sold : ""} ${hasSetHighlight ? styles.setMatch : ""}`}
      style={{ borderColor: hasSetHighlight ? "var(--accent-gold)" : rarityColors[rarity] }}
    >
      {purchased && <div className={styles.soldOverlay}>SOLD</div>}

      {hasSetHighlight && (
        <div className={styles.setBadge}>
          <span className={styles.setBadgeText}>🧩 {setMatch!.count}/3</span>
          <div className={styles.setTooltip}>
            <p className={styles.setTooltipHeader}>🧩 {setName} Set</p>
            <p className={styles.setTooltipPieces}>
              ✓ {setMatch!.pieceNames.join(", ")}
            </p>
            {setBonus && (
              <>
                <p className={styles.setTooltipBonusTitle}>2-Piece: {describeSetBonus(setBonus.bonus2)}</p>
                {setBonus.bonus3 && (
                  <p className={styles.setTooltipBonusTitle}>3-Piece: {describeSetBonus(setBonus.bonus3)}</p>
                )}
              </>
            )}
            {setMatch!.count < 2 && (
              <p className={styles.setTooltipTip}>Equip 2 for 2-piece bonus!</p>
            )}
          </div>
        </div>
      )}

      <div className={styles.slotIcon}>{icon}</div>
      <p className={styles.slotName}>{name}</p>
      <p className={styles.slotRarity} style={{ color: rarityColors[rarity] }}>{rarity}</p>
      {description && <p className={styles.slotDesc}>{description}</p>}

      {!purchased && (
        <button
          className={`${styles.buyBtn} ${!canAfford ? styles.cantAfford : ""}`}
          onClick={onBuy}
          disabled={!canAfford || loading}
        >
          {loading ? "..." : `💰 ${price.toLocaleString()}`}
        </button>
      )}
    </div>
  );
}

function describeAccessoryEffects(effects: any[]): string {
  if (!effects || effects.length === 0) return "";
  return effects.map((e: any) => {
    const val = Math.round((e.power ?? 0) * 100);
    if (e.type === "CRIT_CHANCE") return `+${val}% Crit Chance`;
    if (e.type === "CRIT_DMG") return `+${val}% Crit DMG`;
    if (e.type === "BURN_DMG") return `+${val}% Burn DMG`;
    if (e.type === "BURN_DUR") return `+${val}s Burn Duration`;
    if (e.type === "POISON_DMG") return `+${val}% Poison DMG`;
    if (e.type === "POISON_DUR") return `+${val}s Poison Duration`;
    if (e.type === "LIFESTEAL") return `+${val}% Lifesteal`;
    if (e.type === "MULTI_HIT") return `+${val}% Multi-Hit`;
    if (e.type === "REDUCE_DMG") return `+${val}% DMG Reduction`;
    if (e.type === "PROC_CHANCE") return `${val}% Proc Chance`;
    if (e.type === "LOW_HP_DMG") return `+${val}% Low HP DMG`;
    if (e.type === "PET_DMG") return `+${val}% Pet DMG`;
    if (e.type === "PET_CHANCE") return `${val}% Pet Chance`;
    if (e.type === "PET_PLAYER_SYN") return `+${val}% Pet-Player Syn`;
    if (e.type === "HYBRID_BURN_POISON") return `+${val}% Burn+Poison`;
    if (e.type === "UNIQUE_CRIT_EXECUTE") return `${val}% Crit Execute`;
    if (e.type === "UNIQUE_BURN_INSTANT") return `${val}% Burn Instant`;
    if (e.type === "UNIQUE_POISON_BURST") return `${val}% Poison Burst`;
    if (e.type === "UNIQUE_LIFE_DOUBLE") return `${val}% Life Double`;
    if (e.type === "UNIQUE_BLOCK_HIT") return `${val}% Block Hit`;
    if (e.type === "UNIQUE_PROC_TWICE") return `${val}% Proc Twice`;
    if (e.type === "UNIQUE_BERSERK_PERCENT") return `${val}% Berserk`;
    return `${e.type} ${val}`;
  }).join(" · ");
}

function describeSetBonus(effects: any[]): string {
  if (!effects || effects.length === 0) return "";
  return effects.map((e: any) => {
    const val = e.value ?? e.amount ?? e.minValue ?? 0;
    const pct = e.percent ? "%" : "";
    const type = e.type ?? "";
    const op = e.operation ?? "ADD";
    const opStr = op === "ADD" ? "+" : op === "MULTIPLY" ? "×" : op;
    if (type === "DAMAGE") return `${opStr}${val}${pct} DMG`;
    if (type === "MAX_HP") return `${opStr}${val}${pct} HP`;
    if (type === "DODGE") return `${opStr}${val}${pct} Dodge`;
    if (type === "CRIT") return `${opStr}${val}${pct} Crit`;
    if (type === "LIFESTEAL") return `${opStr}${val}${pct} Lifesteal`;
    if (type === "ARMOR") return `${opStr}${val}${pct} Armor`;
    if (type === "FIRE_DAMAGE") return `${opStr}${val}${pct} Fire`;
    if (type === "POISON_DAMAGE") return `${opStr}${val}${pct} Poison`;
    return `${type} ${opStr}${val}${pct}`;
  }).join(", ");
}

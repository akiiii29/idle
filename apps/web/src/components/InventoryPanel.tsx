"use client";

import { useState } from "react";
import styles from "./InventoryPanel.module.css";

const rarityColors: Record<string, string> = {
  COMMON: "#9ca3af",
  RARE: "#3b82f6",
  EPIC: "#9b6dff",
  LEGENDARY: "#f0c040",
};

const typeIcons: Record<string, string> = {
  WEAPON: "⚔️",
  ARMOR: "🛡️",
  ACCESSORY: "💍",
  POTION: "🧪",
  CONSUMABLE: "📦",
  LUCK_BUFF: "🍀",
  TRAP: "🎯",
  MEAT: "🥩",
};

const typeHints: Record<string, string> = {
  WEAPON: "Offensive gear — boosts ATK",
  ARMOR: "Defensive gear — boosts DEF",
  ACCESSORY: "Special gear — various effects",
  POTION: "Consumable — heals HP",
  CONSUMABLE: "Consumable — various effects",
  LUCK_BUFF: "Consumable — permanent luck bonus",
  TRAP: "Special item — hunt modifiers",
  MEAT: "Consumable — heals HP",
};

const consumableTypes = new Set(["POTION", "CONSUMABLE", "LUCK_BUFF", "MEAT"]);

function ItemTooltip({ item, isEquipped }: { item: any; isEquipped: boolean }) {
  const isAccessory = item.type === "ACCESSORY";
  // Accessories often have power=0 but provide stat bonuses — always show stats for them
  const hasStats = isAccessory
    || item.bonusStr > 0 || item.bonusAgi > 0 || item.bonusDef > 0 || item.bonusHp > 0;

  return (
    <div className={styles.itemTooltip}>
      <div className={styles.tooltipHeader}>
        <p className={styles.tooltipName}>{item.name}</p>
        <p className={styles.tooltipRarity} style={{ color: rarityColors[item.rarity] }}>
          {item.rarity}
        </p>
      </div>

      <div className={styles.tooltipRow}>
        <span>Type</span>
        <span>{typeIcons[item.type] || item.type}</span>
      </div>
      <div className={styles.tooltipRow}>
        <span>Power</span>
        <span>{item.power}</span>
      </div>

      {hasStats && <hr className={styles.tooltipDivider} />}

      {item.bonusStr > 0 && (
        <div className={styles.tooltipRow}>
          <span>STR</span>
          <span style={{ color: "#ff6b6b" }}>+{item.bonusStr}</span>
        </div>
      )}
      {item.bonusAgi > 0 && (
        <div className={styles.tooltipRow}>
          <span>AGI</span>
          <span style={{ color: "#4ecdc4" }}>+{item.bonusAgi}</span>
        </div>
      )}
      {item.bonusDef > 0 && (
        <div className={styles.tooltipRow}>
          <span>DEF</span>
          <span style={{ color: "#60a5fa" }}>+{item.bonusDef}</span>
        </div>
      )}
      {item.bonusHp > 0 && (
        <div className={styles.tooltipRow}>
          <span>HP</span>
          <span style={{ color: "#ef4444" }}>+{item.bonusHp}</span>
        </div>
      )}

      <div className={styles.tooltipFooter}>
        {item.set && (
          <p className={styles.tooltipSet}>🎭 {item.set} Set</p>
        )}
        {item.upgradeLevel > 0 && (
          <p className={styles.tooltipUpgrade}>⬆️ Upgrade +{item.upgradeLevel}</p>
        )}
        <p className={styles.tooltipHint}>{typeHints[item.type] || item.type}</p>
        {isEquipped && <p className={styles.tooltipSet}>✓ Currently Equipped</p>}
      </div>
    </div>
  );
}

export default function InventoryPanel({ user, onUpdate }: { user: any; onUpdate: () => void }) {
  const [filter, setFilter] = useState<string>("ALL");
  const [activeTab, setActiveTab] = useState<"inventory" | "equipment">("inventory");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [flipTooltip, setFlipTooltip] = useState<Set<string>>(new Set());

  function handleCardMouseEnter(itemId: string) {
    const card = document.querySelector(`[data-item-id="${itemId}"]`);
    if (card) {
      const rect = card.getBoundingClientRect();
      if (rect.top < 200) {
        setFlipTooltip(prev => new Set(prev).add(itemId));
      }
    }
  }

  function handleCardMouseLeave(itemId: string) {
    setFlipTooltip(prev => {
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });
  }

  const items = user.inventory || [];
  const equipped = items.filter((i: any) => i.isEquipped);
  const unequipped = items.filter((i: any) => !i.isEquipped);

  const filteredItems = filter === "ALL"
    ? unequipped
    : unequipped.filter((i: any) => i.type === filter);

  const types = ["ALL", "WEAPON", "ARMOR", "ACCESSORY", "POTION", "CONSUMABLE"];

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function useItem(item: any) {
    setActionLoading(item.id);
    try {
      const res = await fetch("/api/item/use", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, itemId: item.id }),
      });
      if (res.ok) {
        showToast(`Used ${item.name}!`, "success");
        onUpdate();
      } else {
        const err = await res.json();
        showToast(err.error || "Failed", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setActionLoading(null);
    }
  }

  async function sellItem(item: any) {
    setActionLoading(item.id);
    try {
      const res = await fetch("/api/item/sell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, itemId: item.id }),
      });
      if (res.ok) {
        const data = await res.json();
        showToast(`Sold ${item.name} for ${data.goldGained} gold!`, "success");
        onUpdate();
      } else {
        const err = await res.json();
        showToast(err.error || "Failed", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setActionLoading(null);
    }
  }

  function renderItemCard(item: any, isEquippedTab: boolean) {
    const isConsumable = consumableTypes.has(item.type);
    const flipped = flipTooltip.has(item.id);

    return (
      <div
        key={item.id}
        data-item-card
        data-item-id={item.id}
        className={`${styles.itemCard} ${isEquippedTab ? styles.equipped : ""} ${flipped ? styles.cardTooltipFlip : ""}`}
        style={{ borderColor: rarityColors[item.rarity] || "#444" }}
        onMouseEnter={() => handleCardMouseEnter(item.id)}
        onMouseLeave={() => handleCardMouseLeave(item.id)}
      >
        <div className={styles.itemIcon}>
          {typeIcons[item.type] || "📦"}
        </div>
        <p className={styles.itemName} title={item.name}>{item.name}</p>
        <p className={styles.itemRarity} style={{ color: rarityColors[item.rarity] }}>
          {item.rarity}
        </p>
        {item.quantity > 1 && (
          <span className={styles.qtyBadge}>x{item.quantity}</span>
        )}
        {item.upgradeLevel > 0 && (
          <span className={styles.upgradeBadge}>+{item.upgradeLevel}</span>
        )}

        {!isEquippedTab && (
          <div className={styles.itemActions}>
            {isConsumable && (
              <button
                className={styles.useBtn}
                onClick={() => useItem(item)}
                disabled={actionLoading === item.id}
              >
                {actionLoading === item.id ? "..." : "Use"}
              </button>
            )}
            <button
              className={styles.sellBtn}
              onClick={() => sellItem(item)}
              disabled={actionLoading === item.id}
            >
              {actionLoading === item.id ? "..." : "Sell"}
            </button>
          </div>
        )}

        <ItemTooltip item={item} isEquipped={isEquippedTab} />
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      {toast && (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
          {toast.msg}
        </div>
      )}

      <h2 className={styles.title}>🎒 Inventory</h2>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "inventory" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("inventory")}
        >
          Inventory ({unequipped.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === "equipment" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("equipment")}
        >
          Equipped ({equipped.length})
        </button>
      </div>

      {activeTab === "inventory" && (
        <>
          <div className={styles.filters}>
            {types.map((t) => (
              <button
                key={t}
                className={`${styles.filterBtn} ${filter === t ? styles.activeFilter : ""}`}
                onClick={() => setFilter(t)}
              >
                {t === "ALL" ? "All" : typeIcons[t] || t}
              </button>
            ))}
          </div>

          <div className={styles.grid}>
            {filteredItems.length === 0 && (
              <p className={styles.empty}>No items in this category</p>
            )}
            {filteredItems.map((item: any) => renderItemCard(item, false))}
          </div>
        </>
      )}

      {activeTab === "equipment" && (
        <div className={styles.grid}>
          {equipped.length === 0 && <p className={styles.empty}>No equipment equipped</p>}
          {equipped.map((item: any) => renderItemCard(item, true))}
        </div>
      )}
    </div>
  );
}

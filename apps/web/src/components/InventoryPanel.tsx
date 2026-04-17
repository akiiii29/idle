"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./InventoryPanel.module.css";
import { ACCESSORY_CONFIGS, describeAccessoryEffect, ACCESSORY_SETS } from "@game/core/constants";

const rarityColors: Record<string, string> = {
  COMMON: "#9ca3af",
  RARE: "#3b82f6",
  EPIC: "#9b6dff",
  LEGENDARY: "#f0c040",
};

const rarityGlow: Record<string, string> = {
  COMMON: "0 0 10px rgba(156, 163, 175, 0.5)",
  RARE: "0 0 14px rgba(59, 130, 246, 0.7)",
  EPIC: "0 0 18px rgba(155, 109, 255, 0.8)",
  LEGENDARY: "0 0 24px rgba(240, 192, 64, 0.9), 0 0 48px rgba(240, 192, 64, 0.4)",
};

const rarityGlowClass: Record<string, string> = {
  COMMON: "glow-common",
  RARE: "glow-rare",
  EPIC: "glow-epic",
  LEGENDARY: "glow-legendary",
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
  GAMBLE: "📦",
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
  GAMBLE: "Chest — open for random rewards!",
};

const consumableTypes = new Set(["POTION", "CONSUMABLE", "LUCK_BUFF", "MEAT"]);
const chestTypes = new Set(["GAMBLE"]);

function ItemTooltip({ item, isEquipped, inventory }: { item: any; isEquipped: boolean; inventory?: any[] }) {
  const isAccessory = item.type === "ACCESSORY";
  // Accessories often have power=0 but provide stat bonuses — always show stats for them
  const hasStats = isAccessory
    || item.bonusStr > 0 || item.bonusAgi > 0 || item.bonusDef > 0 || item.bonusHp > 0;

  const accConfig = isAccessory ? ACCESSORY_CONFIGS[item.name] : null;
  const upgradeLevel = item.upgradeLevel || 0;

  // Collect set bonuses for this item's set (for display below the main effects)
  const setDef = item.set ? ACCESSORY_SETS[item.set] : null;

  // Check if this item's set is active (2+ pieces equipped) and which pieces are equipped
  let setActive = false;
  let setEquippedPieces: string[] = [];
  if (setDef && inventory) {
    const fromSet = inventory.filter((i: any) => i.isEquipped && i.set === item.set);
    setActive = fromSet.length >= 2;
    setEquippedPieces = fromSet.map((i: any) => i.name);
  }

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

      {/* Accessory special effects */}
      {isAccessory && accConfig && (
        <>
          <hr className={styles.tooltipDivider} />
          <p className={styles.tooltipSectionLabel}>Hiệu ứng:</p>
          {accConfig.effects.map((eff: any, idx: number) => (
            <p key={idx} className={styles.tooltipEffect}>
              • {describeAccessoryEffect(eff, upgradeLevel)}
            </p>
          ))}
          {setDef && (
            <>
              <p className={styles.tooltipSetInfo}>
                🎭 Bộ {item.set}
                {setActive && <span className={styles.setActiveBadge}> ✓ Đã kích hoạt</span>}
              </p>
              {setActive && setEquippedPieces.length > 0 && (
                <p className={styles.tooltipSetBonus}>
                  Đã có: {setEquippedPieces.join(", ")}
                </p>
              )}
              {setDef.bonus2.length > 0 && (
                <p className={styles.tooltipSetBonus}>
                  2 món: {setDef.bonus2.map((e: any) => describeAccessoryEffect(e, 0)).join(", ")}
                </p>
              )}
              {setDef.bonus3.length > 0 && (
                <p className={styles.tooltipSetBonus}>
                  3 món: {setDef.bonus3.map((e: any) => describeAccessoryEffect(e, 0)).join(", ")}
                </p>
              )}
              {!setActive && setEquippedPieces.length < 2 && (
                <p className={styles.tooltipHint}>Cần thêm {2 - setEquippedPieces.length} món để kích hoạt bộ</p>
              )}
            </>
          )}
        </>
      )}

      {/* Unknown accessory — show generic hint */}
      {isAccessory && !accConfig && (
        <p className={styles.tooltipHint}>Hiệu ứng đặc biệt (chưa có cấu hình)</p>
      )}

      <div className={styles.tooltipFooter}>
        {item.set && !isAccessory && (
          <p className={styles.tooltipSet}>🎭 {item.set} Set</p>
        )}
        {upgradeLevel > 0 && (
          <p className={styles.tooltipUpgrade}>⬆️ Upgrade +{upgradeLevel}</p>
        )}
        <p className={styles.tooltipHint}>{typeHints[item.type] || item.type}</p>
        {isEquipped && <p className={styles.tooltipSet}>✓ Currently Equipped</p>}
      </div>
    </div>
  );
}

export default function InventoryPanel({ user, onUpdate, onRefetch }: { user: any; onUpdate: (patch: any) => void; onRefetch?: () => void }) {
  const [filter, setFilter] = useState<string>("ALL");
  const [activeTab, setActiveTab] = useState<"inventory" | "equipment">("inventory");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [flipTooltip, setFlipTooltip] = useState<Set<string>>(new Set());
  const [localInventory, setLocalInventory] = useState<any[]>([]);
  const [syncKey, setSyncKey] = useState(0);
  const inventoryRef = useRef<any[]>([]);

  // Sync local inventory when user changes — use ref to avoid setState during render
  useEffect(() => {
    const current = user?.inventory ?? [];
    // Only update if the array reference changed
    if (current !== inventoryRef.current) {
      inventoryRef.current = current;
      setLocalInventory(current);
    }
  }, [user?.id, syncKey, user?.inventory]);

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

  const items = localInventory;
  const equipped = items.filter((i: any) => i.isEquipped);
  const unequipped = items.filter((i: any) => !i.isEquipped);

  const filteredItems = filter === "ALL"
    ? unequipped
    : unequipped.filter((i: any) => i.type === filter);

  const types = ["ALL", "WEAPON", "ARMOR", "ACCESSORY", "POTION", "CONSUMABLE", "GAMBLE"];

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
        const d = await res.json();
        showToast(`Used ${item.name}!`, "success");
        // Update local inventory immediately - remove or decrement the used item
        setLocalInventory((prev) => {
          const arr = prev || [];
          let updated: any[];
          if (item.quantity > 1) {
            updated = arr.map((i: any) =>
              i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i
            );
          } else {
            updated = arr.filter((i: any) => i.id !== item.id);
          }
          onUpdate({ currentHp: d.currentHp, maxHp: d.maxHp, luck: (user.luck ?? 0) + (d.luckGain ?? 0), inventory: updated });
          return updated;
        });
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
        setLocalInventory((prev) => {
          const arr = prev || [];
          const updated = arr.filter((i: any) => i.id !== item.id);
          onUpdate({ gold: (user.gold ?? 0) + data.goldGained, inventory: updated });
          return updated;
        });
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

  async function openChest(item: any) {
    setActionLoading(item.id);
    try {
      const res = await fetch("/api/item/open-chest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, itemId: item.id }),
      });
      const d = await res.json();
      if (d.success) {
        showToast(d.message, "success");
        // Remove chest from local state — onUpdate must NOT be inside setState updater
        const updated = (user?.inventory ?? []).filter((i: any) => i.id !== item.id);
        setLocalInventory(updated);
        onUpdate({ inventory: updated });
        if (onRefetch) onRefetch();
      } else {
        showToast(d.error || "Failed", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setActionLoading(null);
    }
  }

  const equippableTypes = new Set(["WEAPON", "ARMOR", "ACCESSORY"]);

  async function equipItem(item: any) {
    setActionLoading(item.id);
    try {
      const res = await fetch("/api/item/equip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, itemId: item.id }),
      });
      const d = await res.json();
      if (d.success) {
        showToast(`Equipped ${item.name}!`, "success");
        // Update local inventory state without refetching
        setLocalInventory((prev) => {
          const arr = prev || [];
          const updated = arr.map((i: any) => {
            if (d.unequippedId && i.id === d.unequippedId) return { ...i, isEquipped: false };
            return i;
          });
          const newInv = updated.map((i: any) =>
            i.id === item.id ? { ...i, isEquipped: true } : i
          );
          onUpdate({ inventory: newInv });
          return newInv;
        });
      } else {
        showToast(d.message || "Failed to equip", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setActionLoading(null);
    }
  }

  async function unequipItem(item: any) {
    setActionLoading(item.id);
    try {
      const res = await fetch("/api/item/unequip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, itemId: item.id }),
      });
      const d = await res.json();
      if (d.success) {
        showToast(`Unequipped ${item.name}.`, "success");
        setLocalInventory((prev) => {
          const arr = prev || [];
          const newInv = arr.map((i: any) =>
            i.id === item.id ? { ...i, isEquipped: false } : i
          );
          onUpdate({ inventory: newInv });
          return newInv;
        });
      } else {
        showToast(d.message || "Failed to unequip", "error");
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
    const rarity = item.rarity || "COMMON";

    return (
      <div
        key={item.id}
        data-item-card
        data-item-id={item.id}
        className={`${styles.itemCard} ${isEquippedTab ? styles.equipped : ""} ${flipped ? styles.cardTooltipFlip : ""} ${styles["rarity-glow-" + rarity.toLowerCase()]}`}
        style={{ borderColor: rarityColors[rarity] || "#444" }}
        onMouseEnter={() => handleCardMouseEnter(item.id)}
        onMouseLeave={() => handleCardMouseLeave(item.id)}
      >
        <div className={styles.itemIcon}>
          {typeIcons[item.type] || "📦"}
        </div>
        <p className={styles.itemName} title={item.name}>{item.name}</p>
        <p className={styles.itemRarity} style={{ color: rarityColors[rarity] }}>
          {rarity}
        </p>

        {/* Stat preview on card face */}
        {(item.bonusStr > 0 || item.bonusAgi > 0 || item.bonusDef > 0 || item.bonusHp > 0) && (
          <div className={styles.statPreview}>
            {item.bonusStr > 0 && <span style={{ color: "#ff6b6b" }}>⚔️{item.bonusStr}</span>}
            {item.bonusAgi > 0 && <span style={{ color: "#4ecdc4" }}>⚡{item.bonusAgi}</span>}
            {item.bonusDef > 0 && <span style={{ color: "#60a5fa" }}>🛡️{item.bonusDef}</span>}
            {item.bonusHp > 0 && <span style={{ color: "#22c55e" }}>❤️{item.bonusHp}</span>}
          </div>
        )}

        {item.quantity > 1 && (
          <span className={styles.qtyBadge}>x{item.quantity}</span>
        )}
        {item.upgradeLevel > 0 && (
          <span className={styles.upgradeBadge}>+{item.upgradeLevel}</span>
        )}
        {item.set && (
          <span className={styles.setBadge}>🎭</span>
        )}

        {!isEquippedTab && (
          <div className={styles.itemActions}>
            {equippableTypes.has(item.type) && (
              <button
                className={styles.equipBtn}
                onClick={() => equipItem(item)}
                disabled={actionLoading === item.id}
              >
                {actionLoading === item.id ? "..." : "Equip"}
              </button>
            )}
            {isConsumable && (
              <button
                className={styles.useBtn}
                onClick={() => useItem(item)}
                disabled={actionLoading === item.id}
              >
                {actionLoading === item.id ? "..." : "Use"}
              </button>
            )}
            {chestTypes.has(item.type) && (
              <button
                className={styles.useBtn}
                onClick={() => openChest(item)}
                disabled={actionLoading === item.id}
              >
                {actionLoading === item.id ? "..." : "Open"}
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

        {isEquippedTab && (
          <div className={styles.itemActions}>
            <button
              className={styles.unequipBtn}
              onClick={() => unequipItem(item)}
              disabled={actionLoading === item.id}
            >
              {actionLoading === item.id ? "..." : "Unequip"}
            </button>
          </div>
        )}

        <ItemTooltip item={item} isEquipped={isEquippedTab} inventory={items} />
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

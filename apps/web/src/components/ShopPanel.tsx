"use client";

import { useState, useEffect } from "react";
import styles from "./ShopPanel.module.css";

const shopCatalog = {
  slot1: { name: "Large Potion", type: "POTION", power: 50, rarity: "COMMON", price: 200 },
  slot2: { name: "Lucky Charm", type: "LUCK_BUFF", power: 10, rarity: "RARE", price: 500 },
  slot3: { name: "Hunter's Mark", type: "CONSUMABLE", power: 30, rarity: "COMMON", price: 150 },
};

export default function ShopPanel({ user, onUpdate }: { user: any; onUpdate: () => void }) {
  const [purchased, setPurchased] = useState<Set<string>>(new Set());
  const [buying, setBuying] = useState<string | null>(null);

  const slots = [
    { key: "slot1", ...shopCatalog.slot1 },
    { key: "slot2", ...shopCatalog.slot2 },
    { key: "slot3", ...shopCatalog.slot3 },
  ];

  const rarityColors: Record<string, string> = {
    COMMON: "#9ca3af",
    RARE: "#3b82f6",
    EPIC: "#9b6dff",
    LEGENDARY: "#f0c040",
  };

  const typeIcons: Record<string, string> = {
    POTION: "🧪",
    LUCK_BUFF: "🍀",
    CONSUMABLE: "📦",
  };

  async function buyItem(slotKey: string, price: number) {
    if (user.gold < price) return;
    if (purchased.has(slotKey)) return;
    setBuying(slotKey);

    try {
      const res = await fetch("/api/shop/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, slotKey }),
      });
      if (res.ok) {
        setPurchased((prev) => new Set([...prev, slotKey]));
        onUpdate();
      }
    } catch {
    } finally {
      setBuying(null);
    }
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.title}>🏪 Daily Shop</h2>
        <p className={styles.goldDisplay}>💰 {user.gold?.toLocaleString()}</p>
      </div>

      <div className={styles.grid}>
        {slots.map((slot) => {
          const isPurchased = purchased.has(slot.key);
          const canAfford = user.gold >= slot.price;

          return (
            <div
              key={slot.key}
              className={`${styles.slotCard} ${isPurchased ? styles.sold : ""}`}
              style={{ borderColor: rarityColors[slot.rarity] }}
            >
              {isPurchased && <div className={styles.soldOverlay}>SOLD</div>}

              <div className={styles.slotIcon}>
                {typeIcons[slot.type] || "📦"}
              </div>

              <p className={styles.slotName}>{slot.name}</p>
              <p className={styles.slotRarity} style={{ color: rarityColors[slot.rarity] }}>
                {slot.rarity}
              </p>
              <p className={styles.slotPower}>Power: {slot.power}</p>

              {!isPurchased && (
                <button
                  className={`${styles.buyBtn} ${!canAfford ? styles.cantAfford : ""}`}
                  onClick={() => buyItem(slot.key, slot.price)}
                  disabled={!canAfford || buying === slot.key}
                >
                  {buying === slot.key ? "..." : `💰 ${slot.price.toLocaleString()}`}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <p className={styles.refreshNote}>↻ Shop refreshes daily</p>
    </div>
  );
}

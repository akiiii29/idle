"use client";

import { useState, useEffect } from "react";
import styles from "./AchievementsPanel.module.css";

const RARITY_COLORS: Record<string, string> = {
  COMMON: "#9ca3af",
  RARE: "#3b82f6",
  EPIC: "#9b6dff",
  LEGENDARY: "#f0c040",
};

const RARITY_ORDER = ["COMMON", "RARE", "EPIC", "LEGENDARY"];

const EFFECT_LABELS: Record<string, string> = {
  damage: "⚔️ Damage",
  critDamage: "💥 Crit DMG",
  burnDamage: "🔥 Burn DMG",
  poisonDamage: "☠️ Poison DMG",
  lifesteal: "🩸 Lifesteal",
  goldGain: "💰 Gold",
  petPower: "🐾 Pet Power",
  procChance: "✨ Proc Chance",
};

export default function AchievementsPanel({ user, onUpdate }: { user: any; onUpdate: (patch: any) => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<{ key: string; action: string } | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchAchievements();
  }, [user?.id]);

  function fetchAchievements() {
    if (!user?.id) return;
    setLoading(true);
    fetch(`/api/achievements?userId=${user.id}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function toggleEquip(key: string, currentlyEquipped: boolean) {
    setAction({ key, action: currentlyEquipped ? "unequip" : "equip" });
    try {
      const res = await fetch("/api/achievements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, titleKey: key, action: currentlyEquipped ? "unequip" : "equip" }),
      });
      const d = await res.json();
      if (d.success) {
        showToast(currentlyEquipped ? "Title unequipped." : "Title equipped!", "success");
        onUpdate({ title: JSON.stringify(d.equippedTitles) });
        // Update local state directly instead of refetching
        setData((prev: any) => {
          if (!prev) return prev;
          return {
            ...prev,
            ownedTitles: prev.ownedTitles?.map((t: any) =>
              t.key === key ? { ...t, isEquipped: !currentlyEquipped } : t
            ),
          };
        });
      } else {
        showToast(d.message || "Failed", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setAction(null);
    }
  }

  if (loading) {
    return <div className={styles.panel}><p className={styles.loading}>Loading titles...</p></div>;
  }

  return (
    <div className={styles.panel}>
      {toast && <div className={`${styles.toast} ${styles[toast.type]}`}>{toast.msg}</div>}

      <div className={styles.header}>
        <h2 className={styles.title}>🏆 Titles</h2>
        <div className={styles.limits}>
          {RARITY_ORDER.map((r) => {
            const equipped = (data?.equippedTitles ?? []).filter((k: string) => {
              const t = (Object.values(data?.titles ?? {}).flat() as any[]).find((t: any) => t.key === k);
              return t?.rarity === r;
            }).length;
            return (
              <span key={r} className={styles.limitChip} style={{ borderColor: RARITY_COLORS[r] }}>
                {r[0]}: {equipped}/{data?.limits?.[r]}
              </span>
            );
          })}
        </div>
      </div>

      <div className={styles.layout}>
        {RARITY_ORDER.map((rarity) => {
          const titles = data?.titles?.[rarity] ?? [];
          return (
            <div key={rarity} className={styles.raritySection}>
              <p className={styles.sectionTitle} style={{ color: RARITY_COLORS[rarity] }}>
                {rarity} — {data?.limits?.[rarity]} slots
              </p>
              <div className={styles.titleGrid}>
                {titles.map((t: any) => (
                  <div
                    key={t.key}
                    className={`${styles.titleCard} ${rarityGlowClass(t.rarity)} ${t.equipped ? styles.equippedCard : ""} ${!t.unlocked ? styles.lockedCard : ""}`}
                    style={{ borderColor: t.unlocked ? RARITY_COLORS[rarity] : "#333" }}
                  >
                    <div className={styles.titleIcon}>
                      {t.unlocked ? getTitleEmoji(t.effectType) : "🔒"}
                    </div>
                    <div className={styles.titleInfo}>
                      <p className={styles.titleName} style={{ color: t.unlocked ? RARITY_COLORS[rarity] : "#555" }}>
                        {t.name}
                      </p>
                      <p className={styles.titleDesc}>{t.description}</p>
                      <p className={styles.titleBonus}>
                        {EFFECT_LABELS[t.effectType] ?? t.effectType}: +{(t.effectValue * 100).toFixed(0)}%
                      </p>
                    </div>
                    {t.unlocked ? (
                      <button
                        className={`${styles.equipBtn} ${t.equipped ? styles.unequipBtn : ""}`}
                        onClick={() => toggleEquip(t.key, t.equipped)}
                        disabled={action?.key === t.key}
                      >
                        {action?.key === t.key ? "..." : t.equipped ? "⬇️ Unequip" : "⬆️ Equip"}
                      </button>
                    ) : (
                      <span className={styles.lockedBadge}>🔒 Locked</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function rarityGlowClass(rarity: string): string {
  return styles[`glow-${rarity.toLowerCase()}`] ?? "";
}

function getTitleEmoji(effectType: string): string {
  const map: Record<string, string> = {
    damage: "⚔️", critDamage: "💥", burnDamage: "🔥", poisonDamage: "☠️",
    lifesteal: "🩸", goldGain: "💰", petPower: "🐾", procChance: "✨",
  };
  return map[effectType] ?? "🏆";
}

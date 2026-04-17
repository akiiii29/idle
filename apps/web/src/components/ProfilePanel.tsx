"use client";

import { useState, useEffect } from "react";
import styles from "./ProfilePanel.module.css";

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

const PET_ICONS: Record<string, string> = {
  COMMON: "🐾",
  RARE: "🦊",
  EPIC: "🐉",
  LEGENDARY: "👑",
};

export default function ProfilePanel({ user }: { user: any }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/profile/${user.id}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, [user?.id]);

  function formatCd(ms: number): string {
    if (ms <= 0) return "—";
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  if (loading) {
    return <div className={styles.panel}><p className={styles.loading}>Loading profile...</p></div>;
  }

  if (!data) {
    return <div className={styles.panel}><p className={styles.loading}>Failed to load profile.</p></div>;
  }

  const xpPct = Math.min(100, (data.exp / data.expRequired) * 100);

  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>📇 Profile</h2>

      {/* Identity */}
      <div className={styles.identitySection}>
        <div className={styles.avatarPlaceholder}>
          {data.username?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div className={styles.identityInfo}>
          <p className={styles.username}>{data.username}</p>
          {data.title && (
            <p className={styles.titleTag} style={{ color: rarityColors[data.titleRarity] }}>
              ★ {data.title}
            </p>
          )}
          <p className={styles.level}>Level {data.level}</p>
        </div>
      </div>

      {/* XP Bar */}
      <div className={styles.xpSection}>
        <div className={styles.xpBar}>
          <div className={styles.xpFill} style={{ width: `${xpPct}%` }} />
        </div>
        <p className={styles.xpText}>{data.exp.toLocaleString()} / {data.expRequired.toLocaleString()} XP</p>
      </div>

      {/* Resources */}
      <div className={styles.resourceRow}>
        <div className={styles.resourceCard}>
          <span className={styles.resourceIcon}>💰</span>
          <span className={styles.resourceValue}>{data.gold.toLocaleString()}</span>
          <span className={styles.resourceLabel}>Gold</span>
        </div>
        <div className={styles.resourceCard}>
          <span className={styles.resourceIcon}>🔩</span>
          <span className={styles.resourceValue}>{data.scrap.toLocaleString()}</span>
          <span className={styles.resourceLabel}>Scrap</span>
        </div>
      </div>

      {/* HP Bar */}
      <div className={styles.hpSection}>
        <div className={styles.hpBar}>
          <div
            className={styles.hpFill}
            style={{
              width: `${Math.min(100, (data.currentHp / data.maxHp) * 100)}%`,
              background: data.currentHp < data.maxHp * 0.3 ? "var(--hp-red)" : "var(--hp-green)",
            }}
          />
        </div>
        <p className={styles.hpText}>❤️ {Math.floor(data.currentHp).toLocaleString()} / {data.maxHp.toLocaleString()}</p>
      </div>

      {/* Combat Stats */}
      <div className={styles.section}>
        <p className={styles.sectionTitle}>⚔️ Combat Stats</p>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>⚔️</span>
            <span className={styles.statValue}>{data.attack.toLocaleString()}</span>
            <span className={styles.statLabel}>ATK</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>🛡️</span>
            <span className={styles.statValue}>{data.defense.toLocaleString()}</span>
            <span className={styles.statLabel}>DEF</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>💨</span>
            <span className={styles.statValue}>{data.speed.toLocaleString()}</span>
            <span className={styles.statLabel}>SPD</span>
          </div>
        </div>
      </div>

      {/* Base Stats */}
      <div className={styles.section}>
        <p className={styles.sectionTitle}>📊 Base Stats</p>
        <div className={styles.baseStatsGrid}>
          <div className={styles.baseStatItem}><span>⚔️ STR</span><span>{data.str}</span></div>
          <div className={styles.baseStatItem}><span>🏃 AGI</span><span>{data.agi}</span></div>
          <div className={styles.baseStatItem}><span>🍀 LUCK</span><span>{data.luck}</span></div>
        </div>
      </div>

      {/* Cooldowns */}
      <div className={styles.section}>
        <p className={styles.sectionTitle}>⏱️ Cooldowns</p>
        <div className={styles.cdGrid}>
          <div className={`${styles.cdItem} ${data.huntReady ? styles.cdReady : ""}`}>
            <span>⚔️ Hunt</span>
            <span>{data.huntReady ? "✓ Ready" : formatCd(data.huntCdMs)}</span>
          </div>
          <div className={`${styles.cdItem} ${data.dailyReady ? styles.cdReady : ""}`}>
            <span>📅 Daily</span>
            <span>{data.dailyReady ? "✓ Ready" : formatCd(data.dailyCdMs)}</span>
          </div>
          <div className={`${styles.cdItem} ${!data.isInHospital ? styles.cdReady : ""}`}>
            <span>🏥 Hospital</span>
            <span>{data.isInHospital ? formatCd(data.hospitalCdMs) : "✓ Out"}</span>
          </div>
          <div className={`${styles.cdItem} ${!data.isInTavern ? styles.cdReady : ""}`}>
            <span>🍺 Tavern</span>
            <span>{data.isInTavern ? formatCd(data.tavernCdMs) : "✓ Out"}</span>
          </div>
        </div>
      </div>

      {/* Equipped Pets */}
      <div className={styles.section}>
        <p className={styles.sectionTitle}>🐾 Pets ({data.equippedPetCount}/3)</p>
        {data.equippedPets.length === 0 ? (
          <p className={styles.empty}>No pets equipped</p>
        ) : (
          <div className={styles.petRow}>
            {data.equippedPets.map((pet: any) => (
              <div key={pet.id} className={styles.petBadge} style={{ borderColor: rarityColors[pet.rarity] }}>
                <span className={styles.petIcon}>{PET_ICONS[pet.rarity] ?? "🐾"}</span>
                <span className={styles.petName}>{pet.name}</span>
                <span className={styles.petPower}>Lv.{pet.level} · {pet.power}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inventory Preview */}
      <div className={styles.section}>
        <p className={styles.sectionTitle}>🎒 Inventory ({data.inventoryCount}/{data.inventoryLimit})</p>
        {data.inventory.length === 0 ? (
          <p className={styles.empty}>No equipment equipped</p>
        ) : (
          <div className={styles.invPreview}>
            {data.inventory.map((item: any) => (
              <div key={item.id} className={styles.invItem} style={{ borderColor: rarityColors[item.rarity] }}>
                <span>{typeIcons[item.type] || "📦"}</span>
                <span className={styles.invItemName}>{item.name}</span>
                {item.upgradeLevel > 0 && <span className={styles.invUpgrade}>+{item.upgradeLevel}</span>}
              </div>
            ))}
          </div>
        )}
        <p className={styles.invNote}>{data.equippedSkillCount} skills equipped</p>
      </div>
    </div>
  );
}

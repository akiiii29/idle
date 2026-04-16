"use client";

import styles from "./PetsPanel.module.css";

const rarityColors: Record<string, string> = {
  COMMON: "#9ca3af",
  RARE: "#3b82f6",
  EPIC: "#9b6dff",
  LEGENDARY: "#f0c040",
};

const roleIcons: Record<string, string> = {
  DPS: "⚔️",
  TANK: "🛡️",
  SUPPORT: "✨",
};

export default function PetsPanel({ user, onUpdate }: { user: any; onUpdate: () => void }) {
  const beasts = user.beasts || [];
  const equippedPets = beasts.filter((b: any) => b.isEquipped);
  const unequippedPets = beasts.filter((b: any) => !b.isEquipped);

  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>🐾 Pets</h2>

      {equippedPets.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Equipped ({equippedPets.length}/3)</h3>
          <div className={styles.grid}>
            {equippedPets.map((pet: any) => (
              <div
                key={pet.id}
                className={`${styles.petCard} ${styles.equipped}`}
                style={{ borderColor: rarityColors[pet.rarity] }}
              >
                <div className={styles.petHeader}>
                  <span className={styles.petRole}>{roleIcons[pet.role] || "🐾"}</span>
                  <span className={styles.petLevel}>Lv.{pet.level}</span>
                </div>
                <p className={styles.petName}>{pet.name}</p>
                <p className={styles.petRarity} style={{ color: rarityColors[pet.rarity] }}>
                  {pet.rarity}
                </p>
                <div className={styles.petStats}>
                  <span>Power: {pet.power}</span>
                  <span>Skill: {pet.skillPower?.toFixed(3) || 0}</span>
                </div>
                <span className={styles.equipBadge}>✓ Equipped</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>All Pets</h3>
        <div className={styles.grid}>
          {beasts.length === 0 && <p className={styles.empty}>No pets captured</p>}
          {beasts.map((pet: any) => (
            <div
              key={pet.id}
              className={styles.petCard}
              style={{ borderColor: rarityColors[pet.rarity] }}
            >
              <div className={styles.petHeader}>
                <span className={styles.petRole}>{roleIcons[pet.role] || "🐾"}</span>
                <span className={styles.petLevel}>Lv.{pet.level}</span>
              </div>
              <p className={styles.petName}>{pet.name}</p>
              <p className={styles.petRarity} style={{ color: rarityColors[pet.rarity] }}>
                {pet.rarity}
              </p>
              <div className={styles.petStats}>
                <span>PWR {pet.power}</span>
                {pet.isEquipped && <span className={styles.equippedLabel}>✓</span>}
              </div>
              {pet.exp > 0 && (
                <div className={styles.expBar}>
                  <div
                    className={styles.expFill}
                    style={{
                      width: `${Math.min(100, (pet.exp / (pet.level * 50 + 50)) * 100)}%`,
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

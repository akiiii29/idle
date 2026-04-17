"use client";

import { useState, useEffect } from "react";
import styles from "./SynergyPanel.module.css";
import { REQ_HINTS } from "@game/core/constants";

const PET_PLAYER_SYNERGY_NAMES = {
  critBoth: "🐾 Cộng hưởng Pet (Chí Mạng)",
  burnBoth: "🌋 Cộng hưởng Pet (Hỏa Hiện)",
  poisonBoth: "🤢 Cộng hưởng Pet (Độc Tố)",
  elementPet: "⚛️ Cộng hưởng Pet (Nguyên Tố)",
  defenseBoth: "🛡️ Cộng hưởng Pet (Phòng Thủ)",
  lifestealHeal: "🩸 Cộng hưởng Pet (Hút Máu)",
  critDebuff: "🎯 Cộng hưởng Pet (Xuyên Giáp)",
  executeLowHp: "💀 Cộng hưởng Pet (Hành Quyết)",
} as const;

const FLAG_COLORS: Record<string, string> = {
  didCrit: "#ff6b6b",
  didHeavy: "#f97316",
  didBleed: "#ef4444",
  didDodge: "#60a5fa",
  didMultiHit: "#fbbf24",
  didLifesteal: "#ec4899",
  didDamageReduction: "#94a3b8",
  didCounter: "#fb923c",
  didBurn: "#ef4444",
  didPoison: "#84cc16",
  ignoreDef: "#a78bfa",
  lowHp: "#f43f5e",
  chaosTriggered: "#c084fc",
  petCrit: "#f472b6",
  petBurn: "#f87171",
  petPoison: "#a3e635",
  petShield: "#38bdf8",
  petHeal: "#4ade80",
  petDebuff: "#fb7185",
};

const PET_FLAG_LABELS: Record<string, string> = {
  petCrit: "Pet Crit",
  petBurn: "Pet Burn",
  petPoison: "Pet Poison",
  petShield: "Pet Shield",
  petHeal: "Pet Heal",
  petDebuff: "Pet Debuff",
};

export default function SynergyPanel({ user }: { user: any }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/synergy/${user.id}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, [user?.id]);

  if (loading) {
    return <div className={styles.panel}><p className={styles.loading}>Loading synergies...</p></div>;
  }

  if (!data) {
    return <div className={styles.panel}><p className={styles.loading}>Failed to load.</p></div>;
  }

  const PET_COMBO_FLAGS = [
  { flag: "petCrit", skillFlag: "didCrit", name: PET_PLAYER_SYNERGY_NAMES.critBoth },
  { flag: "petBurn", skillFlag: "didBurn", name: PET_PLAYER_SYNERGY_NAMES.burnBoth },
  { flag: "petPoison", skillFlag: "didPoison", name: PET_PLAYER_SYNERGY_NAMES.poisonBoth },
  { flag: "petShield", skillFlag: "didDamageReduction", name: PET_PLAYER_SYNERGY_NAMES.defenseBoth },
  { flag: "petHeal", skillFlag: "didLifesteal", name: PET_PLAYER_SYNERGY_NAMES.lifestealHeal },
  { flag: "petDebuff", skillFlag: "didCrit", name: PET_PLAYER_SYNERGY_NAMES.critDebuff },
];

const { ownedSkillNames, active, potential, total, petSkillCombos } = data;

  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>🌀 My Synergies</h2>

      <div className={styles.summaryRow}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryVal}>{active.length}</span>
          <span className={styles.summaryLabel}>Active</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryVal}>{potential.length}</span>
          <span className={styles.summaryLabel}>Potential</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryVal}>{total}</span>
          <span className={styles.summaryLabel}>Total</span>
        </div>
      </div>

      <p className={styles.sectionTitle}>✅ Active Synergies ({active.length})</p>
      {active.length === 0 && (
        <p className={styles.emptyMsg}>No synergies fully active yet. Keep building your loadout!</p>
      )}
      <div className={styles.grid}>
        {active.map((syn: any, i: number) => (
          <div key={i} className={`${styles.synCard} ${styles.activeCard}`}>
            <p className={styles.synName}>{syn.name}</p>
            <p className={styles.synDesc}>{syn.desc}</p>
            <div className={styles.synBonus}>⚡ {syn.bonus}</div>
            <div className={styles.flagRow}>
              {syn.req.map((flag: string) => (
                <span
                  key={flag}
                  className={styles.flagBadge}
                  style={{ backgroundColor: `${FLAG_COLORS[flag] ?? "#666"}22`, color: FLAG_COLORS[flag] ?? "#999", borderColor: FLAG_COLORS[flag] ?? "#444" }}
                >
                  ✓ {flag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className={styles.sectionTitle}>📌 Potential — Almost There ({potential.length})</p>
      {potential.length === 0 && (
        <p className={styles.emptyMsg}>No synergies close to unlocking. Check /synergies for all combos!</p>
      )}
      <div className={styles.grid}>
        {potential.map((syn: any, i: number) => (
          <div key={i} className={`${styles.synCard} ${styles.potentialCard}`}>
            <p className={styles.synName}>{syn.name}</p>
            <p className={styles.synDesc}>{syn.desc}</p>
            <div className={styles.synBonus}>⚡ {syn.bonus}</div>

            <div className={styles.statusRow}>
              {syn.met.map((flag: string) => (
                <span
                  key={flag}
                  className={styles.flagBadge}
                  style={{ backgroundColor: `${FLAG_COLORS[flag] ?? "#666"}22`, color: FLAG_COLORS[flag] ?? "#999", borderColor: FLAG_COLORS[flag] ?? "#444" }}
                >
                  ✓ {flag}
                </span>
              ))}
              {syn.missing.map((flag: string) => {
                const hint = (REQ_HINTS as any)[flag];
                const isPetFlag = flag.startsWith("pet");
                return (
                  <span key={flag} className={styles.missingBadge}>
                    ✗ {flag}
                    {hint && (
                      <span className={styles.hintText}>
                        → {isPetFlag ? PET_FLAG_LABELS[flag] || flag : hint.playerSkills?.slice(0, 2).join(", ") || flag}
                      </span>
                    )}
                  </span>
                );
              })}
            </div>

            {syn.missing.map((flag: string) => {
              const hint = (REQ_HINTS as any)[flag];
              if (!hint) return null;
              const isPetFlag = flag.startsWith("pet");
              const needed = hint.playerSkills.filter((n: string) => !ownedSkillNames.includes(n));
              if (needed.length === 0) return null;
              return (
                <p key={flag} className={styles.hintLine}>
                  💡 Need: {needed.slice(0, 3).join(", ")}
                </p>
              );
            })}
          </div>
        ))}
      </div>

      {/* Pet-Skill Combo Synergies */}
      {petSkillCombos && petSkillCombos.length > 0 && (
        <>
          <p className={styles.sectionTitle}>🐾 Pet × Skill Combos ({petSkillCombos.length})</p>
          <div className={styles.grid}>
            {petSkillCombos.map((syn: any, i: number) => (
              <div key={i} className={`${styles.synCard} ${styles.comboCard}`}>
                <p className={styles.synName}>{syn.name}</p>
                <p className={styles.synDesc}>{syn.desc}</p>
                <div className={styles.synBonus}>⚡ {syn.bonus}</div>
                <div className={styles.flagRow}>
                  {syn.req.map((flag: string) => (
                    <span
                      key={flag}
                      className={styles.flagBadge}
                      style={{ backgroundColor: `${FLAG_COLORS[flag] ?? "#666"}22`, color: FLAG_COLORS[flag] ?? "#999", borderColor: FLAG_COLORS[flag] ?? "#444" }}
                    >
                      ✓ {flag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import styles from "./SynergiesPanel.module.css";
import { SYNERGY_LIST } from "@game/core";

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

export default function SynergiesPanel() {
  const [search, setSearch] = useState("");

  const filtered = SYNERGY_LIST.filter(
    (s) =>
      s.name.includes(search) ||
      s.desc.includes(search) ||
      s.bonus.includes(search) ||
      s.tips.includes(search)
  );

  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>📖 Synergy Guide</h2>
      <p className={styles.subtitle}>All synergy sets — triggers when flags are active during combat</p>

      <input
        className={styles.searchInput}
        placeholder="Search synergies..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className={styles.grid}>
        {filtered.length === 0 && (
          <p className={styles.empty}>No synergies match your search.</p>
        )}
        {filtered.map((syn, i) => (
          <div key={i} className={styles.synergyCard}>
            <p className={styles.synName}>{syn.name}</p>
            <p className={styles.synDesc}>{syn.desc}</p>
            <div className={styles.synBonus}>
              <span>⚡</span>
              <span>{syn.bonus}</span>
            </div>
            <div className={styles.flagRow}>
              {syn.req.map((flag) => (
                <span
                  key={flag}
                  className={styles.flagBadge}
                  style={{ backgroundColor: FLAG_COLORS[flag] ? `${FLAG_COLORS[flag]}22` : "var(--bg-primary)", color: FLAG_COLORS[flag] || "var(--text-dim)", borderColor: FLAG_COLORS[flag] || "var(--border)" }}
                >
                  {flag}
                </span>
              ))}
            </div>
            <p className={styles.synTips}>💡 {syn.tips}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

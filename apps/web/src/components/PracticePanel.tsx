"use client";

import { useState, useEffect } from "react";
import styles from "./PracticePanel.module.css";

export default function PracticePanel({ user }: { user: any }) {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [expandedLog, setExpandedLog] = useState(false);

  async function runPractice() {
    if (!user?.id) return;
    setRunning(true);
    setLoading(true);
    setResults(null);
    try {
      const res = await fetch(`/api/practice/${user.id}`);
      const data = await res.json();
      if (res.ok) {
        setResults(data);
      }
    } finally {
      setLoading(false);
      setRunning(false);
    }
  }

  function statColor(val: number, idx: number): string {
    const colors = ["#ff6b6b", "#4ecdc4", "#f0c040", "#ef4444"];
    return colors[idx % colors.length];
  }

  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>🎯 Practice</h2>

      <div className={styles.actionRow}>
        <button
          className={styles.runBtn}
          onClick={runPractice}
          disabled={running || loading}
        >
          {running || loading ? "⏳ Running..." : "▶️ Start Practice (10 turns)"}
        </button>
      </div>

      {!results && !loading && (
        <div className={styles.emptyState}>
          <p>Click <strong>Start Practice</strong> to simulate 10 combat turns against a training dummy.</p>
          <p className={styles.emptyNote}>Shows total damage, crits, combos, skill activations, and full combat log.</p>
        </div>
      )}

      {loading && (
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Simulating combat...</p>
        </div>
      )}

      {results && (
        <div className={styles.results}>
          {/* Damage Summary */}
          <div className={styles.damageSection}>
            <h3 className={styles.sectionTitle}>📊 Damage Summary</h3>
            <div className={styles.damageGrid}>
              <div className={styles.bigDmgCard}>
                <span className={styles.dmgLabel}>⚔️ Total Damage</span>
                <span className={styles.bigDmgVal}>{results.totalDamage.toLocaleString()}</span>
              </div>
              <div className={styles.bigDmgCard}>
                <span className={styles.dmgLabel}>💥 Max Turn</span>
                <span className={styles.bigDmgVal}>{results.maxTurnDamage.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Combat Ratings */}
          <div className={styles.ratingsSection}>
            <h3 className={styles.sectionTitle}>⚔️ Your Combat Stats</h3>
            <div className={styles.ratingsGrid}>
              {[
                ["ATK", results.playerAtk],
                ["DEF", results.playerDef],
                ["SPD", results.playerSpd],
              ].map(([label, val], i) => (
                <div key={label} className={styles.ratingCard}>
                  <span className={styles.ratingLabel}>{label}</span>
                  <span className={styles.ratingVal}>{Number(val).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activations */}
          <div className={styles.activationsSection}>
            <h3 className={styles.sectionTitle}>🎲 Combat Activations</h3>
            <div className={styles.activationsGrid}>
              {[
                ["crits", "🎯 Crits", "crit"],
                ["combos", "🔄 Combos", "combo"],
                ["burns", "🔥 Burns", "burn"],
                ["poisons", "🐍 Poisons", "poison"],
                ["lifesteals", "🩸 Lifesteals", "lifesteal"],
              ].map(([key, label, icon]) => (
                <div key={key} className={styles.actCard}>
                  <span className={styles.actLabel}>{label}</span>
                  <span className={styles.actVal}>
                    {(results[key] as number).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          {results.skillCounts && Object.keys(results.skillCounts).length > 0 && (
            <div className={styles.skillSection}>
              <h3 className={styles.sectionTitle}>✨ Skills Activated</h3>
              <div className={styles.skillList}>
                {Object.entries(results.skillCounts).map(([name, count]) => (
                  <div key={name} className={styles.skillRow}>
                    <span className={styles.skillName}>{name}</span>
                    <span className={styles.skillCount}>×{count as number}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Synergies */}
          {results.synergies && results.synergies.length > 0 && (
            <div className={styles.synergySection}>
              <h3 className={styles.sectionTitle}>🔗 Synergies</h3>
              <div className={styles.synergyList}>
                {results.synergies.map((s: string, i: number) => (
                  <span key={i} className={styles.synergyBadge}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Combat Log */}
          <div className={styles.logSection}>
            <button
              className={styles.logToggle}
              onClick={() => setExpandedLog(!expandedLog)}
            >
              📜 Combat Log {expandedLog ? "▲" : "▼"}
            </button>
            {expandedLog && (
              <div className={styles.logContent}>
                {results.turnLogs.map((log: any) => (
                  <div key={log.turn} className={styles.logTurn}>
                    <p className={styles.logTurnLabel}>━━ Lượt {log.turn} ━━</p>
                    {log.events.map((e: string, i: number) => (
                      <p key={i} className={styles.logEvent}>{e}</p>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

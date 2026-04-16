"use client";

import { useState, useEffect } from "react";
import styles from "./StatsPanel.module.css";

export default function StatsPanel({ user, isCompact = false }: { user: any; isCompact?: boolean }) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    fetch(`/api/stats/${user.id}`)
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
      })
      .finally(() => setLoading(false));
  }, [user?.id]);

  if (loading) {
    return (
      <aside className={`${styles.panel} ${isCompact ? styles.compact : ""}`}>
        <p className={styles.loading}>Loading stats...</p>
      </aside>
    );
  }

  if (isCompact) {
    return (
      <aside className={styles.compactPanel}>
        <h3 className={styles.compactTitle}>📊 Stats</h3>
        <div className={styles.compactGrid}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>ATK</span>
            <span className={styles.statValue}>{stats?.final?.attack ?? user?.str ?? 0}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>DEF</span>
            <span className={styles.statValue}>{stats?.final?.defense ?? 0}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>SPD</span>
            <span className={styles.statValue}>{stats?.final?.speed ?? 100}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>CRIT</span>
            <span className={styles.statValue}>{((stats?.critChance ?? 0) * 100).toFixed(1)}%</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>DODGE</span>
            <span className={styles.statValue}>{((stats?.dodgeChance ?? 0) * 100).toFixed(1)}%</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>BLOCK</span>
            <span className={styles.statValue}>{((stats?.blockChance ?? 0) * 100).toFixed(1)}%</span>
          </div>
        </div>
      </aside>
    );
  }

  // Full stats page — redesigned UI
  const critChance = stats?.critChance ?? 0;
  const critDmg = stats?.critMultiplier ?? 1;
  const dodgeChance = stats?.dodgeChance ?? 0;
  const blockChance = stats?.blockChance ?? 0;

  return (
    <div className={styles.fullPanel}>
      <h2 className={styles.title}>📊 Combat Stats</h2>

      {/* ── Base Stats ─────────────────────────────────────── */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Base Stats</h3>
        <div className={styles.bigStatGrid}>
          <div className={styles.bigStatCard}>
            <span className={styles.bigStatLabel}>💪 STR</span>
            <span className={`${styles.bigStatValue} ${styles.strColor}`}>{user.str}</span>
            <span className={styles.bigStatSub}>Base Strength</span>
          </div>
          <div className={styles.bigStatCard}>
            <span className={styles.bigStatLabel}>⚡ AGI</span>
            <span className={`${styles.bigStatValue} ${styles.agiColor}`}>{user.agi}</span>
            <span className={styles.bigStatSub}>Base Agility</span>
          </div>
          <div className={styles.bigStatCard}>
            <span className={styles.bigStatLabel}>🍀 LUCK</span>
            <span className={`${styles.bigStatValue} ${styles.luckColor}`}>{user.luck}</span>
            <span className={styles.bigStatSub}>Base Luck</span>
          </div>
          <div className={styles.bigStatCard}>
            <span className={styles.bigStatLabel}>❤️ HP</span>
            <span className={`${styles.bigStatValue} ${styles.hpColor}`}>{stats?.final?.maxHp ?? user.maxHp}</span>
            <span className={styles.bigStatSub}>Max HP (with buffs)</span>
          </div>
        </div>
      </div>

      {/* ── Combat Ratings ─────────────────────────────────── */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Combat Ratings</h3>
        <div className={styles.combatGrid}>
          <div className={styles.combatCard}>
            <span className={styles.combatLabel}>⚔️ ATK</span>
            <span className={styles.combatValue}>{stats?.final?.attack ?? 0}</span>
          </div>
          <div className={styles.combatCard}>
            <span className={styles.combatLabel}>🛡️ DEF</span>
            <span className={styles.combatValue}>{stats?.final?.defense ?? 0}</span>
          </div>
          <div className={styles.combatCard}>
            <span className={styles.combatLabel}>💨 SPD</span>
            <span className={styles.combatValue}>{stats?.final?.speed ?? 100}</span>
          </div>
        </div>
        <div className={styles.pctGrid}>
          <div className={styles.pctCard}>
            <span className={styles.pctLabel}>CRIT</span>
            <span className={styles.pctValue}>{(critChance * 100).toFixed(1)}%</span>
          </div>
          <div className={styles.pctCard}>
            <span className={styles.pctLabel}>CRIT DMG</span>
            <span className={styles.pctValue}>{(critDmg * 100).toFixed(0)}%</span>
          </div>
          <div className={styles.pctCard}>
            <span className={styles.pctLabel}>DODGE</span>
            <span className={styles.pctValue}>{(dodgeChance * 100).toFixed(1)}%</span>
          </div>
          <div className={styles.pctCard}>
            <span className={styles.pctLabel}>BLOCK</span>
            <span className={styles.pctValue}>{(blockChance * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* ── Damage Breakdown ────────────────────────────────── */}
      {stats?.breakdown && <BreakdownSection breakdown={stats.breakdown} />}

      {/* ── Talents ────────────────────────────────────────── */}
      {stats?.talentBonuses && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Talents</h3>
          <div className={styles.talentGrid}>
            <div className={styles.talentCard}>
              <span className={styles.talentIcon}>⚔️</span>
              <span className={styles.talentValue}>{stats.talentBonuses.dps ?? 0}</span>
              <span className={styles.talentLabel}>DPS</span>
            </div>
            <div className={styles.talentCard}>
              <span className={styles.talentIcon}>🛡️</span>
              <span className={styles.talentValue}>{stats.talentBonuses.tank ?? 0}</span>
              <span className={styles.talentLabel}>Tank</span>
            </div>
            <div className={styles.talentCard}>
              <span className={styles.talentIcon}>💚</span>
              <span className={styles.talentValue}>{stats.talentBonuses.support ?? 0}</span>
              <span className={styles.talentLabel}>Support</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BreakdownSection({ breakdown }: { breakdown: any }) {
  const sections = [
    { key: "attackParts", label: "⚔️ Attack", icon: "⚔️" },
    { key: "defenseParts", label: "🛡️ Defense", icon: "🛡️" },
    { key: "hpParts", label: "❤️ HP", icon: "❤️" },
    { key: "speedParts", label: "💨 Speed", icon: "💨" },
    { key: "critChanceParts", label: "💥 Crit Chance", icon: "💥" },
  ];

  const activeSections = sections.filter(s => breakdown[s.key]?.length > 0);

  if (activeSections.length === 0) return null;

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Damage Breakdown</h3>
      <div className={styles.breakdownContainer}>
        {activeSections.map(({ key, label, icon }) => {
          const parts = breakdown[key] || [];
          const total = parts.reduce((sum: number, p: any) => sum + (typeof p.value === 'number' ? p.value : 0), 0);
          return (
            <div key={key} className={styles.breakdownSection}>
              <div className={styles.breakdownHeader}>
                <span className={styles.breakdownTitle}>{label}</span>
                <span className={styles.breakdownTotal}>
                  {total > 0 ? `+${total.toFixed(1)}` : total.toFixed(1)}
                </span>
              </div>
              <div className={styles.breakdownRows}>
                {parts.map((part: any, i: number) => (
                  <div key={i} className={styles.breakdownRow}>
                    <span className={styles.breakdownSource}>{part.source}</span>
                    <span className={styles.breakdownVal}>
                      {typeof part.value === 'number' ? (part.value >= 0 ? `+${part.value.toFixed(1)}` : part.value.toFixed(1)) : part.value}
                    </span>
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

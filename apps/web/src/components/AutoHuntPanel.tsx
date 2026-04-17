"use client";

import { useState, useEffect } from "react";
import styles from "./AutoHuntPanel.module.css";

export default function AutoHuntPanel({ user, onUpdate }: { user: any; onUpdate: (patch: any) => void }) {
  const [autoHunt, setAutoHunt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetchAutoHunt();
  }, [user?.id]);

  function fetchAutoHunt() {
    if (!user?.id) return;
    setLoading(true);
    fetch(`/api/auto-hunt/${user.id}`)
      .then((r) => r.json())
      .then((data) => {
        setAutoHunt(data);
      })
      .finally(() => setLoading(false));
  }

  async function runAutoHunt() {
    setRunning(true);
    setResult(null);
    try {
      const res = await fetch(`/api/auto-hunt/${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
        onUpdate({
          gold: (user.gold ?? 0) + data.goldGained,
          exp: (user.exp ?? 0) + data.expGained,
          currentHp: data.hpRemaining,
          autoHuntCharges: Math.max(0, (user.autoHuntCharges ?? 3) - 1),
          hospitalUntil: data.status === "DIED" ? new Date(Date.now() + 30 * 60 * 1000) : user.hospitalUntil,
        });
      } else {
        alert(data.error || "Failed");
      }
    } finally {
      setRunning(false);
    }
  }

  function formatChargeTime(ms: number): string {
    if (ms <= 0) return "Full";
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  if (loading) {
    return <div className={styles.panel}><p className={styles.loading}>Loading...</p></div>;
  }

  const charges = autoHunt?.charges ?? 0;
  const maxCharges = autoHunt?.maxCharges ?? 3;

  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>⚡ Auto-Hunt</h2>

      {/* Charge Indicators */}
      <div className={styles.chargeSection}>
        <div className={styles.chargeRow}>
          {Array.from({ length: maxCharges }).map((_, i) => (
            <div
              key={i}
              className={`${styles.chargeOrb} ${i < charges ? styles.chargeFull : styles.chargeEmpty}`}
            >
              {i < charges ? "⚡" : "○"}
            </div>
          ))}
        </div>
        <div className={styles.chargeInfo}>
          <span className={styles.chargeLabel}>
            {charges}/{maxCharges} charges
          </span>
          {autoHunt?.msUntilNextCharge > 0 && (
            <span className={styles.nextCharge}>
              Next charge in: {formatChargeTime(autoHunt.msUntilNextCharge)}
            </span>
          )}
        </div>
      </div>

      {/* Action */}
      <button
        className={styles.startBtn}
        onClick={runAutoHunt}
        disabled={running || loading || charges <= 0}
      >
        {running ? "⏳ Hunting..." : charges > 0 ? "⚡ Start Auto-Hunt" : "❌ No Charges"}
      </button>

      {/* Info */}
      <div className={styles.infoBox}>
        <p>📋 20 fights per session</p>
        <p>⚔️ Scaling difficulty (+4%/fight)</p>
        <p>🧪 Auto-potion at &lt;30% HP</p>
        <p>💀 Death penalty: -40% gold/exp</p>
        <p>⚡ 1 charge per 2 hours</p>
      </div>

      {/* Result */}
      {result && (
        <div className={`${styles.resultCard} ${result.status === "DIED" ? styles.diedResult : styles.winResult}`}>
          <div className={styles.resultHeader}>
            <span className={styles.resultStatus}>
              {result.status === "COMPLETED" ? "🏆 Completed" : "💀 Died"}
            </span>
            <span className={styles.resultFights}>{result.fightsCompleted}/20 fights</span>
          </div>

          <div className={styles.resultStats}>
            <div className={styles.resultStat}>
              <span className={styles.resultStatLabel}>💰 Gold</span>
              <span className={styles.resultStatVal}>+{result.goldGained.toLocaleString()}</span>
            </div>
            <div className={styles.resultStat}>
              <span className={styles.resultStatLabel}>⭐ Exp</span>
              <span className={styles.resultStatVal}>+{result.expGained.toLocaleString()}</span>
            </div>
            <div className={styles.resultStat}>
              <span className={styles.resultStatLabel}>❤️ HP Left</span>
              <span className={styles.resultStatVal}>{Math.floor(result.hpRemaining).toLocaleString()}</span>
            </div>
            <div className={styles.resultStat}>
              <span className={styles.resultStatLabel}>🧪 Potions</span>
              <span className={styles.resultStatVal}>-{result.potionsUsed}</span>
            </div>
          </div>

          {/* Fight Log */}
          {result.logs && result.logs.length > 0 && (
            <div className={styles.fightLog}>
              <p className={styles.logTitle}>📜 Fight Log</p>
              <div className={styles.logGrid}>
                {result.logs.map((f: any) => (
                  <div key={f.fight} className={`${styles.fightRow} ${f.jackpot ? styles.jackpotRow : ""}`}>
                    <span>Fight {f.fight}</span>
                    <span>{f.gold.toLocaleString()}g</span>
                    {f.jackpot && <span className={styles.jackpotBadge}>🎉 Jackpot!</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

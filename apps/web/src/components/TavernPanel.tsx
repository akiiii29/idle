"use client";

import { useState, useEffect } from "react";
import styles from "./TavernPanel.module.css";

export default function TavernPanel({ user, onUpdate }: { user: any; onUpdate: (patch: any) => void }) {
  const [tavern, setTavern] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<string | null>(null);
  const [healInput, setHealInput] = useState("");
  const [betInput, setBetInput] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchTavern();
  }, [user?.id]);

  function fetchTavern() {
    if (!user?.id) return;
    setLoading(true);
    fetch(`/api/tavern/${user.id}`)
      .then((r) => r.json())
      .then((data) => setTavern(data))
      .finally(() => setLoading(false));
  }

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function doAction(actionType: string, value?: number) {
    setAction(actionType);
    try {
      const res = await fetch(`/api/tavern/${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, action: actionType, hp: value }),
      });
      const data = await res.json();
      if (res.ok) {
        if (actionType === "start") {
          showToast(`Rest started! +${data.healHp} HP for ${data.costGold} gold`, "success");
          onUpdate({ gold: (user.gold ?? 0) - data.costGold, isBusy: true, busyUntil: data.endTime, tavernUntil: data.endTime });
        } else if (actionType === "stop") {
          showToast(`Left the tavern. Healed ${data.healedHp ?? 0} HP!`, "success");
          onUpdate({ isBusy: false, busyUntil: null, tavernUntil: null, currentHp: data.newHp ?? user.currentHp });
          fetchTavern();
        } else if (actionType === "gamble") {
          showToast(
            data.isWin ? `🎊 Win! +${data.goldGained} gold` : `💀 Lost! ${data.goldGained} gold`,
            data.isWin ? "success" : "error"
          );
          onUpdate({ gold: data.newGold, gambleStreak: data.newStreak });
        }
      } else {
        showToast(data.error || "Failed", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setAction(null);
    }
  }

  function formatTime(ms: number): string {
    if (ms <= 0) return "—";
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}m ${sec}s`;
  }

  const hpPct = tavern ? Math.min(100, (tavern.currentHp / tavern.maxHp) * 100) : 100;
  const maxBet = Math.floor(user?.gold * 0.3);

  if (loading) {
    return <div className={styles.panel}><p className={styles.loading}>Loading...</p></div>;
  }

  return (
    <div className={styles.panel}>
      {toast && <div className={`${styles.toast} ${styles[toast.type]}`}>{toast.msg}</div>}

      <h2 className={styles.title}>🍺 Tavern</h2>

      {/* HP Bar */}
      <div className={styles.hpSection}>
        <div className={styles.hpBar}>
          <div className={styles.hpFill} style={{ width: `${hpPct}%` }} />
        </div>
        <div className={styles.hpText}>
          <span>❤️ {tavern?.currentHp} / {tavern?.maxHp}</span>
          {tavern?.missingHp > 0 && (
            <span className={styles.missingLabel}>-{tavern.missingHp} missing</span>
          )}
        </div>
      </div>

      {tavern?.isResting ? (
        // ── RESTING ─────────────────────────────────────────
        <div className={styles.restSection}>
          <div className={styles.restBanner}>
            <span className={styles.restIcon}>🛏️</span>
            <div>
              <p className={styles.restTitle}>Resting in progress</p>
              <p className={styles.restSub}>⏳ {formatTime(tavern.remainingMs)} remaining</p>
            </div>
          </div>
          <div className={styles.restInfo}>
            <div className={styles.infoCard}>
              <span className={styles.infoLabel}>Heal Rate</span>
              <span className={styles.infoValue}>+{tavern.healRateHpPerMin} HP/min</span>
            </div>
            <div className={styles.infoCard}>
              <span className={styles.infoLabel}>Cost</span>
              <span className={styles.infoValue}>{tavern.goldPerHp} gold/HP</span>
            </div>
          </div>
          <button
            className={styles.stopBtn}
            onClick={() => doAction("stop")}
            disabled={action !== null}
          >
            {action === "stop" ? "..." : "🚪 Leave Tavern"}
          </button>
        </div>
      ) : (
        // ── NOT RESTING ─────────────────────────────────────
        <div className={styles.restSection}>
          {/* Rest */}
          <div className={styles.restCard}>
            <div className={styles.restCardHeader}>
              <span>🛏️ Rest & Heal</span>
              <span className={styles.healRate}>+{tavern?.healRateHpPerMin} HP/min</span>
            </div>
            <p className={styles.restDesc}>Pay gold to heal HP over time. Rate: {tavern?.healCostPerHp} gold/HP.</p>
            <div className={styles.healInputs}>
              <input
                className={styles.input}
                type="number"
                placeholder={tavern?.missingHp > 0 ? `HP to heal (max ${tavern.missingHp})` : "Full heal"}
                value={healInput}
                onChange={(e) => setHealInput(e.target.value)}
                min={1}
                max={tavern?.missingHp || 999}
              />
              <button
                className={styles.startRestBtn}
                onClick={() => doAction("start", healInput ? Number(healInput) : undefined)}
                disabled={action !== null || user?.gold < Math.ceil((Number(healInput) || tavern?.missingHp) * tavern?.healCostPerHp)}
              >
                {action === "start" ? "..." : `💰 Start Rest`}
              </button>
            </div>
            {user?.gold < Math.ceil((Number(healInput) || tavern?.missingHp || 0) * (tavern?.healCostPerHp || 0.2)) && (
              <p className={styles.warning}>Not enough gold to heal {healInput || tavern?.missingHp || 0} HP</p>
            )}
          </div>

          {/* Gamble */}
          <div className={styles.restCard}>
            <div className={styles.restCardHeader}>
              <span>🎲 Tavern Gamble</span>
              <span className={styles.streakBadge}>
                🔥 Streak: {tavern?.gambleStreak ?? 0} (+{(tavern?.gambleStreak ?? 0) * 2}% win rate)
              </span>
            </div>
            <p className={styles.restDesc}>
              Win chance: 45% + streak bonus. Win: double your bet. Lose: lose your bet.
            </p>
            <div className={styles.healInputs}>
              <input
                className={styles.input}
                type="number"
                placeholder={`Bet gold (max ${maxBet})`}
                value={betInput}
                onChange={(e) => setBetInput(e.target.value)}
                min={10}
                max={maxBet}
              />
              <button
                className={styles.gambleBtn}
                onClick={() => doAction("gamble", Number(betInput))}
                disabled={action !== null || !betInput || Number(betInput) < 10 || Number(betInput) > maxBet}
              >
                {action === "gamble" ? "..." : "🎲 Gamble"}
              </button>
            </div>
            <p className={styles.gambleNote}>Max bet: 30% of gold ({maxBet})</p>
          </div>
        </div>
      )}
    </div>
  );
}

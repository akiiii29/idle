"use client";

import { useState, useEffect } from "react";
import styles from "./HospitalPanel.module.css";

export default function HospitalPanel({ user, onUpdate }: { user: any; onUpdate: (patch: any) => void }) {
  const [hospital, setHospital] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviving, setReviving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchHospital();
  }, [user?.id]);

  function fetchHospital() {
    if (!user?.id) return;
    setLoading(true);
    fetch(`/api/hospital/${user.id}`)
      .then((r) => r.json())
      .then((data) => {
        setHospital(data);
      })
      .finally(() => setLoading(false));
  }

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function revive() {
    setReviving(true);
    try {
      const res = await fetch("/api/hospital/revive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Revived! -${data.goldSpent} gold`, "success");
        onUpdate({ gold: (user.gold ?? 0) - data.goldSpent, hospitalUntil: null, currentHp: data.maxHp ?? data.newHp });
        // Update local state directly instead of refetching
        setHospital((prev: any) => {
          if (!prev) return prev;
          return {
            ...prev,
            inHospital: false,
            currentHp: data.maxHp ?? data.newHp,
            maxHp: data.maxHp ?? prev.maxHp,
            remainingMs: 0,
          };
        });
      } else {
        showToast(data.error || "Failed", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setReviving(false);
    }
  }

  function formatTime(ms: number): string {
    if (ms <= 0) return "—";
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}m ${sec}s`;
  }

  if (loading) {
    return (
      <div className={styles.panel}>
        <p className={styles.loading}>Loading...</p>
      </div>
    );
  }

  // Show in-hospital state if: explicitly in hospital OR currentHp is 0
  const isHospitalized = hospital?.inHospital === true;
  const isDead = (hospital?.currentHp ?? user?.currentHp ?? 0) <= 0;
  const shouldShowHospital = isHospitalized || isDead;

  const hpPct = hospital ? Math.min(100, (hospital.currentHp / hospital.maxHp) * 100) : 100;

  return (
    <div className={styles.panel}>
      {toast && (
        <div className={`${styles.toast} ${styles[toast.type]}`}>{toast.msg}</div>
      )}

      <h2 className={styles.title}>🏥 Hospital</h2>

      {/* HP Bar */}
      <div className={styles.hpSection}>
        <div className={styles.hpBar}>
          <div
            className={`${styles.hpFill} ${shouldShowHospital ? styles.danger : ""}`}
            style={{ width: `${hpPct}%` }}
          />
        </div>
        <div className={styles.hpText}>
          <span>❤️ {hospital?.currentHp ?? user?.currentHp ?? 0} / {hospital?.maxHp ?? user?.maxHp ?? 0}</span>
          {shouldShowHospital && (
            <span className={styles.cooldownLabel}>
              {isHospitalized ? `⏳ ${formatTime(hospital.remainingMs)} remaining` : "💀 Need revival"}
            </span>
          )}
        </div>
      </div>

      {shouldShowHospital ? (
        <div className={styles.hospitalInfo}>
          <div className={styles.infoCard}>
            <span className={styles.infoLabel}>Status</span>
            <span className={styles.infoValue}>{isHospitalized ? "🛏️ In Treatment" : "💀 Dead / Unconscious"}</span>
          </div>
          {isHospitalized && (
            <div className={styles.infoCard}>
              <span className={styles.infoLabel}>Cooldown</span>
              <span className={styles.infoValue}>{formatTime(hospital.remainingMs)}</span>
            </div>
          )}
          <div className={styles.infoCard}>
            <span className={styles.infoLabel}>Revive Cost</span>
            <span className={styles.infoValue}>💰 {hospital?.reviveCost?.toLocaleString() ?? "—"} gold</span>
          </div>

          <button
            className={styles.reviveBtn}
            onClick={revive}
            disabled={reviving || (user?.gold ?? 0) < (hospital?.reviveCost ?? 0)}
          >
            {reviving ? "..." : `🚑 Revive Now (-${hospital?.reviveCost?.toLocaleString() ?? "?"} gold)`}
          </button>
          {(user?.gold ?? 0) < (hospital?.reviveCost ?? 0) && (
            <p className={styles.warning}>Not enough gold. Wait for natural discharge.</p>
          )}
        </div>
      ) : (
        <div className={styles.dischargedInfo}>
          <span className={styles.okBadge}>✅ Healthy — no hospital treatment needed</span>
        </div>
      )}
    </div>
  );
}

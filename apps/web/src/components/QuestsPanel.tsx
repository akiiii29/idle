"use client";

import { useState, useEffect } from "react";
import styles from "./QuestsPanel.module.css";

type Quest = {
  key: string;
  description: string;
  emoji: string;
  target: number;
  goldReward: number;
  progress: number;
  isCompleted: boolean;
  isClaimed: boolean;
};

export default function QuestsPanel({ user, onUpdate }: { user: any; onUpdate: (patch: any) => void }) {
  const [data, setData] = useState<{ gold: number; daily: Quest[]; weekly: Quest[]; achievements: Quest[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchQuests();
  }, [user?.id]);

  function fetchQuests() {
    if (!user?.id) return;
    setLoading(true);
    fetch(`/api/quests?userId=${user.id}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function claim(key: string) {
    setClaiming(key);
    try {
      const res = await fetch(`/api/quests/claim/${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const d = await res.json();
      if (d.success) {
        showToast(d.message, "success");
        onUpdate({ gold: (user.gold ?? 0) + d.goldGained });
        // Update local state directly instead of refetching
        setData((prev: any) => {
          if (!prev) return prev;
          const markClaimed = (list: Quest[]) =>
            list.map((q) => q.key === key ? { ...q, isClaimed: true } : q);
          return {
            ...prev,
            daily: markClaimed(prev.daily ?? []),
            weekly: markClaimed(prev.weekly ?? []),
            achievements: markClaimed(prev.achievements ?? []),
          };
        });
      } else {
        showToast(d.message || "Failed", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setClaiming(null);
    }
  }

  if (loading) {
    return <div className={styles.panel}><p className={styles.loading}>Loading quests...</p></div>;
  }

  const allQuests = [...(data?.daily ?? []), ...(data?.weekly ?? []), ...(data?.achievements ?? [])];
  const completedCount = allQuests.filter((q) => q.isCompleted).length;
  const claimedCount = allQuests.filter((q) => q.isClaimed).length;

  return (
    <div className={styles.panel}>
      {toast && <div className={`${styles.toast} ${styles[toast.type]}`}>{toast.msg}</div>}

      <div className={styles.header}>
        <h2 className={styles.title}>📜 Quests</h2>
        <span className={styles.goldDisplay}>💰 {data?.gold?.toLocaleString() ?? 0}</span>
      </div>

      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${(claimedCount / allQuests.length) * 100}%` }} />
      </div>
      <p className={styles.progressLabel}>{claimedCount}/{allQuests.length} quests claimed</p>

      <div className={styles.layout}>
        {/* Daily */}
        <div className={styles.section}>
          <p className={styles.sectionTitle}>📅 Daily Quests</p>
          <div className={styles.questList}>
            {(data?.daily ?? []).map((q) => (
              <QuestRow key={q.key} quest={q} onClaim={claim} claiming={claiming} />
            ))}
          </div>
        </div>

        {/* Weekly */}
        <div className={styles.section}>
          <p className={styles.sectionTitle}>📆 Weekly Quests</p>
          <div className={styles.questList}>
            {(data?.weekly ?? []).map((q) => (
              <QuestRow key={q.key} quest={q} onClaim={claim} claiming={claiming} />
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className={styles.section}>
          <p className={styles.sectionTitle}>🏆 Achievements</p>
          <div className={styles.questList}>
            {(data?.achievements ?? []).map((q) => (
              <QuestRow key={q.key} quest={q} onClaim={claim} claiming={claiming} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuestRow({ quest, onClaim, claiming }: { quest: Quest; onClaim: (key: string) => void; claiming: string | null }) {
  const pct = Math.min(100, (quest.progress / quest.target) * 100);
  const canClaim = quest.isCompleted && !quest.isClaimed;

  return (
    <div className={`${styles.questCard} ${quest.isClaimed ? styles.claimed : ""} ${quest.isCompleted ? styles.completed : ""}`}>
      <div className={styles.questLeft}>
        <span className={styles.questEmoji}>{quest.emoji}</span>
        <div className={styles.questInfo}>
          <p className={styles.questDesc}>{quest.description}</p>
          <div className={styles.questBar}>
            <div className={styles.questBarFill} style={{ width: `${pct}%` }} />
          </div>
          <p className={styles.questProg}>{quest.progress}/{quest.target}</p>
        </div>
      </div>
      <div className={styles.questRight}>
        <span className={styles.goldReward}>💰 {quest.goldReward}</span>
        {canClaim ? (
          <button
            className={styles.claimBtn}
            onClick={() => onClaim(quest.key)}
            disabled={claiming === quest.key}
          >
            {claiming === quest.key ? "..." : "Claim"}
          </button>
        ) : quest.isClaimed ? (
          <span className={styles.claimedBadge}>✅</span>
        ) : quest.isCompleted ? (
          <span className={styles.readyBadge}>✓</span>
        ) : null}
      </div>
    </div>
  );
}

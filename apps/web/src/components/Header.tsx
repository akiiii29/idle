"use client";

import { useState, useEffect } from "react";
import styles from "./Header.module.css";

export default function Header({ user, onLogout }: { user: any; onLogout?: () => void }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [computedMaxHp, setComputedMaxHp] = useState<number>(user?.maxHp ?? 100);
  const [computedCurrentHp, setComputedCurrentHp] = useState<number>(user?.currentHp ?? 100);

  useEffect(() => {
    const saved = localStorage.getItem("rpg_theme") as "dark" | "light" | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/stats/${user.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.final?.maxHp) {
          setComputedMaxHp(data.final.maxHp);
        }
      })
      .catch(() => {});
  }, [user?.id, user?.inventory?.length, user?.beasts?.length, user?.level]);

  // Keep currentHp in sync with user changes
  useEffect(() => {
    setComputedCurrentHp(user?.currentHp ?? 0);
  }, [user?.currentHp]);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("rpg_theme", next);
  }

  const hpPercent = Math.max(0, Math.min(100, (computedCurrentHp / computedMaxHp) * 100));
  const hpColor = hpPercent > 50 ? "var(--hp-green)" : hpPercent > 20 ? "var(--hp-yellow)" : "var(--hp-red)";

  return (
    <header className={styles.header}>
      <div className={styles.logo}>⚔️ IDLE RPG</div>

      <div className={styles.playerInfo}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Lvl</span>
          <span className={styles.statValue}>{user.level}</span>
        </div>

        <div className={styles.stat}>
          <span className={styles.statLabel}>💰</span>
          <span className={styles.statValueGold}>{user.gold?.toLocaleString()}</span>
        </div>

        <div className={styles.hpContainer}>
          <div className={styles.hpBarOuter}>
            <div
              className={styles.hpBarInner}
              style={{ width: `${hpPercent}%`, background: hpColor }}
            />
          </div>
          <span className={styles.hpText}>
            {computedCurrentHp} / {computedMaxHp}
          </span>
        </div>

        <div className={styles.stat}>
          <span className={styles.statLabel}>✨</span>
          <span className={styles.statValueExp}>{user.exp} EXP</span>
        </div>
      </div>

      <div className={styles.username}>
        {user.username}
      </div>

      <div className={styles.headerActions}>
        <button className={styles.themeToggle} onClick={toggleTheme} title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        {onLogout && (
          <button className={styles.logoutBtn} onClick={onLogout}>
            Logout
          </button>
        )}
      </div>
    </header>
  );
}

"use client";

import styles from "./Header.module.css";

export default function Header({ user, onLogout }: { user: any; onLogout?: () => void }) {
  const hpPercent = Math.max(0, Math.min(100, (user.currentHp / user.maxHp) * 100));
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
            {user.currentHp} / {user.maxHp}
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

      {onLogout && (
        <button className={styles.logoutBtn} onClick={onLogout}>
          Logout
        </button>
      )}
    </header>
  );
}

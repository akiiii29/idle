"use client";

import styles from "./SidebarNav.module.css";

type NavItem = "hunt" | "stats" | "inventory" | "pets" | "shop" | "dungeon" | "hospital" | "tavern" | "practice" | "autohunt" | "upgrade" | "skills" | "quests" | "achievements" | "profile" | "synergies" | "synergy";

const navItems: { id: NavItem; icon: string; label: string }[] = [
  { id: "hunt", icon: "⚔️", label: "Hunt" },
  { id: "stats", icon: "📊", label: "Stats" },
  { id: "profile", icon: "📇", label: "Profile" },
  { id: "inventory", icon: "🎒", label: "Inventory" },
  { id: "pets", icon: "🐾", label: "Pets" },
  { id: "shop", icon: "🏪", label: "Shop" },
  { id: "dungeon", icon: "🏰", label: "Dungeon" },
  { id: "hospital", icon: "🏥", label: "Hospital" },
  { id: "tavern", icon: "🍺", label: "Tavern" },
  { id: "practice", icon: "🎯", label: "Practice" },
  { id: "autohunt", icon: "⚡", label: "Auto-Hunt" },
  { id: "upgrade", icon: "⚒️", label: "Upgrade" },
  { id: "skills", icon: "🏮", label: "Skills" },
  { id: "quests", icon: "📜", label: "Quests" },
  { id: "achievements", icon: "🏆", label: "Titles" },
  { id: "synergies", icon: "📖", label: "Synergies" },
  { id: "synergy", icon: "🌀", label: "My Synergies" },
];

export default function SidebarNav({
  active,
  onNavigate,
}: {
  active: NavItem;
  onNavigate: (id: NavItem) => void;
}) {
  return (
    <nav className={styles.sidebar}>
      {navItems.map((item) => (
        <button
          key={item.id}
          className={`${styles.navItem} ${active === item.id ? styles.active : ""}`}
          onClick={() => onNavigate(item.id)}
          title={item.label}
        >
          <span className={styles.icon}>{item.icon}</span>
          <span className={styles.label}>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

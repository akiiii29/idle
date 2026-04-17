"use client";

import { useState, useEffect, useCallback } from "react";
import SidebarNav from "@/components/SidebarNav";
import Header from "@/components/Header";
import CombatArena from "@/components/CombatArena";
import StatsPanel from "@/components/StatsPanel";
import InventoryPanel from "@/components/InventoryPanel";
import PetsPanel from "@/components/PetsPanel";
import ShopPanel from "@/components/ShopPanel";
import HospitalPanel from "@/components/HospitalPanel";
import TavernPanel from "@/components/TavernPanel";
import PracticePanel from "@/components/PracticePanel";
import AutoHuntPanel from "@/components/AutoHuntPanel";
import UpgradePanel from "@/components/UpgradePanel";
import SkillsPanel from "@/components/SkillsPanel";
import QuestsPanel from "@/components/QuestsPanel";
import AchievementsPanel from "@/components/AchievementsPanel";
import ProfilePanel from "@/components/ProfilePanel";
import SynergiesPanel from "@/components/SynergiesPanel";
import SynergyPanel from "@/components/SynergyPanel";
import ToastContainer from "@/components/ToastContainer";
import styles from "./page.module.css";

type ActivePanel = "hunt" | "stats" | "profile" | "inventory" | "pets" | "shop" | "dungeon" | "hospital" | "tavern" | "practice" | "autohunt" | "upgrade" | "skills" | "quests" | "achievements" | "synergies" | "synergy";

const DISCORD_ID_KEY = "rpg_discord_id";

export default function HomePage() {
  const [userId, setUserId] = useState<string>("");
  const [user, setUser] = useState<any>(null);
  const [activePanel, setActivePanel] = useState<ActivePanel>("hunt");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(DISCORD_ID_KEY);
    if (saved) setUserId(saved);
  }, []);

  function handleLogin(id: string) {
    localStorage.setItem(DISCORD_ID_KEY, id);
    setUserId(id);
  }

  function handleLogout() {
    localStorage.removeItem(DISCORD_ID_KEY);
    setUserId("");
    setUser(null);
  }

  const fetchUser = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/user/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch {}
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Merge-only update — no API call, just patches local state
  const mergeUpdate = useCallback((patch: Partial<any>) => {
    setUser((prev: any) => ({ ...prev, ...patch }));
  }, []);

  // Refetch full user from server (for actions that create items/pets/etc.)
  const refetchUser = useCallback(() => {
    fetchUser();
  }, [fetchUser]);

  // Hunt changes too many things (gold, items, beasts, exp, etc.) — always refetch
  const onHuntComplete = useCallback(() => {
    fetchUser();
  }, [fetchUser]);

  if (!userId) {
    return (
      <div className={styles.loginScreen}>
        <div className={styles.loginCard}>
          <h1 className={styles.loginTitle}>⚔️ Idle RPG</h1>
          <p className={styles.loginSubtitle}>Web interface for your Discord RPG</p>
          <input
            className={styles.loginInput}
            placeholder="Enter Discord User ID"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.currentTarget.value) handleLogin(e.currentTarget.value);
            }}
            onBlur={(e) => e.target.value && handleLogin(e.target.value)}
          />
        </div>
      </div>
    );
  }

  if (!user && !loading) {
    return (
      <div className={styles.loginScreen}>
        <div className={styles.loginCard}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.gameLayout}>
      <Header user={user} onLogout={handleLogout} />
      <div className={styles.mainArea}>
        <SidebarNav active={activePanel} onNavigate={setActivePanel} />
        <main className={styles.content}>
          {activePanel === "hunt" && <CombatArena user={user} onHuntComplete={onHuntComplete} />}
          {activePanel === "stats" && <StatsPanel user={user} />}
          {activePanel === "inventory" && <InventoryPanel user={user} onUpdate={mergeUpdate} onRefetch={refetchUser} />}
          {activePanel === "pets" && <PetsPanel user={user} onUpdate={mergeUpdate} />}
          {activePanel === "shop" && <ShopPanel user={user} onUpdate={mergeUpdate} onRefetch={refetchUser} />}
          {activePanel === "hospital" && <HospitalPanel user={user} onUpdate={mergeUpdate} />}
          {activePanel === "tavern" && <TavernPanel user={user} onUpdate={mergeUpdate} />}
          {activePanel === "practice" && <PracticePanel user={user} />}
          {activePanel === "autohunt" && <AutoHuntPanel user={user} onUpdate={mergeUpdate} />}
          {activePanel === "upgrade" && <UpgradePanel user={user} onUpdate={mergeUpdate} />}
          {activePanel === "skills" && <SkillsPanel user={user} onUpdate={mergeUpdate} />}
          {activePanel === "quests" && <QuestsPanel user={user} onUpdate={mergeUpdate} />}
          {activePanel === "achievements" && <AchievementsPanel user={user} onUpdate={mergeUpdate} />}
          {activePanel === "profile" && <ProfilePanel user={user} />}
          {activePanel === "synergies" && <SynergiesPanel />}
          {activePanel === "synergy" && <SynergyPanel user={user} />}
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}

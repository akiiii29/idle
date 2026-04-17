"use client";

import { useState, useEffect } from "react";
import styles from "./SkillsPanel.module.css";
import { SYNERGY_LIST, SKILL_TO_SYNERGY_FLAGS } from "@game/core";

const TYPE_COLORS: Record<string, string> = {
  DAMAGE: "#ff6b6b",
  DOT: "#f97316",
  DODGE: "#60a5fa",
  HEAL: "#4ade80",
  GOLD: "#f0c040",
  TAME: "#c084fc",
  REDUCE_DAMAGE: "#94a3b8",
  CHAOS: "#f43f5e",
  COUNTER: "#fb923c",
  BUFF: "#38bdf8",
  SHIELD: "#818cf8",
  POISON: "#84cc16",
  BURN: "#ef4444",
  LIFESTEAL: "#ec4899",
};

type SynergyFlag = string;

function getOwnedFlags(ownedSkillNames: string[]): Set<SynergyFlag> {
  const flags = new Set<SynergyFlag>();
  for (const name of ownedSkillNames) {
    const f = (SKILL_TO_SYNERGY_FLAGS as Record<string, SynergyFlag[]>)[name];
    if (f) f.forEach((flag) => flags.add(flag));
  }
  return flags;
}

function getSkillFlags(skillName: string): SynergyFlag[] {
  return (SKILL_TO_SYNERGY_FLAGS as Record<string, SynergyFlag[]>)[skillName] ?? [];
}

type SynergyMatch = {
  synergy: (typeof SYNERGY_LIST)[number];
  why: "completes" | "starts";
  missingFlags: SynergyFlag[];
};

function getSkillSynergyMatch(skillName: string, ownedSkillNames: string[]): SynergyMatch | null {
  const newFlags = getSkillFlags(skillName);
  if (newFlags.length === 0) return null;

  const owned = getOwnedFlags(ownedSkillNames);
  const candidates: SynergyMatch[] = [];

  for (const syn of SYNERGY_LIST) {
    // Check if this skill's flags are relevant to this synergy
    const reqFlags = syn.req as unknown as SynergyFlag[];
    const relevantNewFlags = newFlags.filter((f) => reqFlags.includes(f));
    if (relevantNewFlags.length === 0) continue;

    // What flags would we have after adding this skill?
    const futureFlags = new Set(owned);
    newFlags.forEach((f) => futureFlags.add(f));

    const missing = (syn.req as unknown as SynergyFlag[]).filter((f) => !futureFlags.has(f));

    if (missing.length === 0) {
      // Completes the synergy!
      candidates.push({ synergy: syn, why: "completes", missingFlags: [] });
    } else if (missing.length < syn.req.length) {
      // Starts or progresses the synergy
      candidates.push({ synergy: syn, why: "starts", missingFlags: missing });
    }
  }

  if (candidates.length === 0) return null;

  // Prioritize: completes > starts, then fewer missing flags
  candidates.sort((a, b) => {
    if (a.why === "completes" && b.why !== "completes") return -1;
    if (b.why === "completes" && a.why !== "completes") return 1;
    return a.missingFlags.length - b.missingFlags.length;
  });

  return candidates[0];
}

function ComboTooltip({ match, ownedSkillNames }: { match: SynergyMatch; ownedSkillNames: string[] }) {
  const { synergy, why, missingFlags } = match;

  if (why === "completes") {
    return (
      <div className={styles.comboTooltip}>
        <p className={styles.tooltipHeader}>✨ Synergy Complete!</p>
        <p className={styles.tooltipSynName}>{synergy.name}</p>
        <p className={styles.tooltipBonus}>⚡ {synergy.bonus}</p>
        <p className={styles.tooltipDesc}>{synergy.desc}</p>
      </div>
    );
  }

  // Build "why" explanation
  const ownedFlags = getOwnedFlags(ownedSkillNames);
  const current = synergy.req.filter((f) => ownedFlags.has(f));

  return (
    <div className={styles.comboTooltip}>
      <p className={styles.tooltipHeader}>🌀 Combo Progress</p>
      <p className={styles.tooltipSynName}>{synergy.name}</p>
      <p className={styles.tooltipBonus}>⚡ {synergy.bonus}</p>
      {current.length > 0 && (
        <p className={styles.tooltipProgress}>
          ✓ {[...current].slice(0, 3).join(", ")}
        </p>
      )}
      {missingFlags.length > 0 && (
        <p className={styles.tooltipMissing}>
          ✗ Still need: {missingFlags.slice(0, 3).join(", ")}
        </p>
      )}
      <p className={styles.tooltipTip}>{synergy.tips}</p>
    </div>
  );
}

export default function SkillsPanel({ user, onUpdate }: { user: any; onUpdate: (patch: any) => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);
  const [equipping, setEquipping] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchSkills();
  }, [user?.id]);

  function fetchSkills() {
    if (!user?.id) return;
    setLoading(true);
    fetch(`/api/skills?userId=${user.id}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function buySkill(skillId: string) {
    if (!user?.id) return;
    setBuying(skillId);
    try {
      const res = await fetch(`/api/skills/buy/${skillId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const d = await res.json();
      if (d.success) {
        showToast(d.message, "success");
        onUpdate({ gold: (user.gold ?? 0) - 2000 });
        // Update local state directly instead of refetching
        setData((prev: any) => {
          if (!prev) return prev;
          const slot = prev.dailySlots?.find((s: any) => s.id === skillId);
          if (!slot) return prev;
          const newOwned = [...(prev.ownedSkills ?? []), { ...slot, id: d.skillId, isEquipped: false }];
          return {
            ...prev,
            gold: (prev.gold ?? 0) - 2000,
            ownedSkills: newOwned,
            dailySlots: prev.dailySlots?.map((s: any) => s.id === skillId ? { ...s, owned: true } : s),
          };
        });
      } else {
        showToast(d.message || "Failed", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setBuying(null);
    }
  }

  async function toggleEquip(skillId: string, currentlyEquipped: boolean) {
    if (!user?.id) return;
    setEquipping(skillId);
    try {
      const res = await fetch("/api/skills/equip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, skillId, equip: !currentlyEquipped }),
      });
      const d = await res.json();
      if (d.success) {
        showToast(d.message, "success");
        // Update local state directly instead of refetching
        setData((prev: any) => {
          if (!prev) return prev;
          return {
            ...prev,
            ownedSkills: prev.ownedSkills?.map((s: any) =>
              s.id === skillId ? { ...s, isEquipped: !currentlyEquipped } : s
            ),
            equippedCount: (prev.equippedCount ?? 0) + (!currentlyEquipped ? 1 : -1),
          };
        });
      } else {
        showToast(d.message || "Failed", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setEquipping(null);
    }
  }

  if (loading) {
    return <div className={styles.panel}><p className={styles.loading}>Loading skills...</p></div>;
  }

  return (
    <div className={styles.panel}>
      {toast && <div className={`${styles.toast} ${styles[toast.type]}`}>{toast.msg}</div>}

      <div className={styles.header}>
        <h2 className={styles.title}>🏮 Skill Shop</h2>
        <div className={styles.headerRight}>
          <span className={styles.goldDisplay}>💰 {data?.gold?.toLocaleString() ?? 0}</span>
          <span className={styles.slotDisplay}>
            ⚔️ {data?.equippedCount ?? 0}/{data?.maxEquipped ?? 5} equipped
          </span>
        </div>
      </div>

      {/* Daily Shop */}
      <div className={styles.section}>
        <p className={styles.sectionTitle}>📅 Daily Skills — {data?.skillPrice?.toLocaleString() ?? 2000}g each</p>
        <div className={styles.dailyGrid}>
          {(data?.dailySlots ?? []).map((slot: any) => {
            const ownedNames = (data?.ownedSkills ?? []).map((s: any) => s.name);
            const comboMatch = !slot.owned ? getSkillSynergyMatch(slot.name, ownedNames) : null;

            return (
              <div
                key={slot.id}
                className={`${styles.dailyCard} ${slot.owned ? styles.owned : ""} ${comboMatch ? styles.comboHighlight : ""}`}
              >
                <div className={styles.dailyIcon}>{slot.emoji}</div>
                <div className={styles.dailyInfo}>
                  <p className={styles.skillName}>{slot.name}</p>
                  <p className={styles.skillType} style={{ color: TYPE_COLORS[slot.type] ?? "#9ca3af" }}>
                    {slot.type}
                  </p>
                  <p className={styles.skillDesc}>{slot.description}</p>
                </div>

                {comboMatch && (
                  <div className={styles.comboBadgeWrap}>
                    <span className={comboMatch.why === "completes" ? styles.comboBadgeComplete : styles.comboBadgeProgress}>
                      {comboMatch.why === "completes" ? "✨ Completes" : "🌀 Combo"}
                    </span>
                    <div className={styles.comboTooltipWrap}>
                      <ComboTooltip match={comboMatch} ownedSkillNames={ownedNames} />
                    </div>
                  </div>
                )}

                {slot.owned ? (
                  <span className={styles.ownedBadge}>✅ Owned</span>
                ) : (
                  <button
                    className={styles.buyBtn}
                    onClick={() => buySkill(slot.id)}
                    disabled={buying === slot.id || (data?.gold ?? 0) < (data?.skillPrice ?? 2000)}
                  >
                    {buying === slot.id ? "..." : `💰 ${(data?.skillPrice ?? 2000).toLocaleString()}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* My Skills */}
      <div className={styles.section}>
        <p className={styles.sectionTitle}>⚔️ My Skills ({data?.ownedSkills?.length ?? 0} owned)</p>
        {(data?.ownedSkills?.length ?? 0) === 0 && (
          <p className={styles.empty}>No skills yet. Buy from the daily shop above!</p>
        )}
        <div className={styles.skillGrid}>
          {(data?.ownedSkills ?? []).map((skill: any) => (
            <div
              key={skill.id}
              className={`${styles.skillCard} ${skill.isEquipped ? styles.equippedCard : ""}`}
            >
              <div className={styles.skillIcon}>{skill.emoji}</div>
              <div className={styles.skillInfo}>
                <p className={styles.skillName}>{skill.name}</p>
                <p className={styles.skillType} style={{ color: TYPE_COLORS[skill.type] ?? "#9ca3af" }}>
                  {skill.type}
                </p>
                <p className={styles.skillDesc}>{skill.description}</p>
              </div>
              <button
                className={`${styles.equipBtn} ${skill.isEquipped ? styles.unequipBtn : ""}`}
                onClick={() => toggleEquip(skill.id, skill.isEquipped)}
                disabled={equipping === skill.id}
              >
                {equipping === skill.id ? "..." : skill.isEquipped ? "⬇️ Unequip" : "⬆️ Equip"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import styles from "./UpgradePanel.module.css";
import { ItemType } from "@/lib/game/types";

const GEAR_TYPES = [ItemType.WEAPON, ItemType.ARMOR, ItemType.ACCESSORY];

const rarityColors: Record<string, string> = {
  COMMON: "#9ca3af",
  RARE: "#3b82f6",
  EPIC: "#9b6dff",
  LEGENDARY: "#f0c040",
};

const rarityGlowClass: Record<string, string> = {
  COMMON: styles["rarity-glow-common"],
  RARE: styles["rarity-glow-rare"],
  EPIC: styles["rarity-glow-epic"],
  LEGENDARY: styles["rarity-glow-legendary"],
};

type UpgradeItem = {
  id: string;
  name: string;
  type: string;
  rarity: string;
  upgradeLevel: number;
  failCount: number;
  power: number;
  bonusStr: number;
  bonusAgi: number;
  bonusDef: number;
  bonusHp: number;
  isEquipped: boolean;
};

type PreviewData = {
  item: UpgradeItem;
  preview: { baseGoldCost: number; scrapToUse: number; goldToUse: number };
  effectiveRate: number;
  userScrap: number;
  userGold: number;
};

export default function UpgradePanel({ user, onUpdate }: { user: any; onUpdate: (patch: any) => void }) {
  const [gear, setGear] = useState<UpgradeItem[]>([]);
  const [selected, setSelected] = useState<UpgradeItem | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; leveledUp: boolean; newLevel: number; pityTriggered: boolean; message: string } | null>(null);
  const [scrapAction, setScrapAction] = useState<string | null>(null);
  const [scrapMsg, setScrapMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchGear();
  }, [user?.id]);

  async function fetchGear() {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/user/${user.id}`);
      if (!res.ok) return;
      const data = await res.json();
      const items: UpgradeItem[] = (data.inventory || []).filter(
        (i: UpgradeItem) => GEAR_TYPES.includes(i.type as any) && i.isEquipped
      );
      setGear(items);
    } finally {
      setLoading(false);
    }
  }

  async function refreshGear() {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/user/${user.id}`);
      if (!res.ok) return;
      const data = await res.json();
      const items: UpgradeItem[] = (data.inventory || []).filter(
        (i: UpgradeItem) => GEAR_TYPES.includes(i.type as any) && i.isEquipped
      );
      setGear(items);
    } catch {}
  }

  async function selectItem(item: UpgradeItem) {
    setSelected(item);
    setResult(null);
    try {
      const res = await fetch(`/api/item/upgrade/${item.id}?userId=${user.id}`);
      if (res.ok) {
        setPreview(await res.json());
      }
    } catch {}
  }

  async function doUpgrade() {
    if (!selected || upgrading) return;
    setUpgrading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/item/upgrade/${selected.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({
          success: data.success,
          leveledUp: data.leveledUp,
          newLevel: data.newLevel,
          pityTriggered: data.pityTriggered,
          message: data.message,
        });
        onUpdate({ scrap: data.scrap, gold: data.gold });
        // Refresh gear list to reflect upgrade level change
        refreshGear();
        // Refresh preview
        const prev = await fetch(`/api/item/upgrade/${selected.id}?userId=${user.id}`);
        if (prev.ok) setPreview(await prev.json());
      } else {
        setResult({ success: false, leveledUp: false, newLevel: 0, pityTriggered: false, message: data.error || "Failed" });
      }
    } catch {
      setResult({ success: false, leveledUp: false, newLevel: 0, pityTriggered: false, message: "Network error" });
    } finally {
      setUpgrading(false);
    }
  }

  async function doScrap(action: string, target?: string) {
    setScrapAction(action);
    setScrapMsg(null);
    try {
      const res = await fetch("/api/item/scrap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, action, target }),
      });
      const data = await res.json();
      if (res.ok) {
        setScrapMsg(data.message);
        onUpdate({ scrap: (user.scrap ?? 0) + (data.scrapGained ?? data.totalScrap ?? 0) });
        refreshGear();
      } else {
        setScrapMsg(data.message || "Failed");
      }
    } catch {
      setScrapMsg("Network error");
    } finally {
      setScrapAction(null);
    }
  }

  if (loading) {
    return <div className={styles.panel}><p className={styles.loading}>Loading...</p></div>;
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.title}>⚒️ Forge</h2>
        <div className={styles.resourceRow}>
          <span className={styles.scrapDisplay}>🔩 {user?.scrap ?? 0} Scrap</span>
          <span className={styles.goldDisplay}>💰 {user?.gold?.toLocaleString()}</span>
        </div>
      </div>

      <div className={styles.layout}>
        {/* Left: gear list */}
        <div className={styles.gearList}>
          <p className={styles.sectionTitle}>Equipped Gear</p>
          {gear.length === 0 && (
            <p className={styles.empty}>No equipped weapons, armor, or accessories.</p>
          )}
          <div className={styles.gearGrid}>
            {gear.map((item) => (
              <button
                key={item.id}
                className={`${styles.gearCard} ${rarityGlowClass[item.rarity] || ""} ${selected?.id === item.id ? styles.selectedCard : ""}`}
                style={{ borderColor: rarityColors[item.rarity] }}
                onClick={() => selectItem(item)}
              >
                <div className={styles.gearLevel}>+{item.upgradeLevel}</div>
                <div className={styles.gearIcon}>{item.type === ItemType.WEAPON ? "⚔️" : item.type === ItemType.ARMOR ? "🛡️" : "💍"}</div>
                <div className={styles.gearName}>{item.name}</div>
                <div className={styles.gearRarity} style={{ color: rarityColors[item.rarity] }}>{item.rarity}</div>
                <div className={styles.gearPower}>⚡ {item.power}</div>
              </button>
            ))}
          </div>

          {/* Scrap actions */}
          <div className={styles.scrapSection}>
            <p className={styles.sectionTitle}>Scrap</p>
            <div className={styles.scrapBtns}>
              <button
                className={styles.scrapBtn}
                onClick={() => doScrap("duplicates")}
                disabled={scrapAction !== null}
              >
                {scrapAction === "duplicates" ? "..." : "♻️ Duplicates"}
              </button>
              <button
                className={`${styles.scrapBtn} ${styles.scrapRarity}`}
                onClick={() => doScrap("rarity", "COMMON")}
                disabled={scrapAction !== null}
              >
                {scrapAction === "rarity" ? "..." : "Common"}
              </button>
              <button
                className={`${styles.scrapBtn} ${styles.scrapRarity}`}
                onClick={() => doScrap("rarity", "RARE")}
                disabled={scrapAction !== null}
              >
                Rare
              </button>
              <button
                className={`${styles.scrapBtn} ${styles.scrapRarity}`}
                onClick={() => doScrap("rarity", "EPIC")}
                disabled={scrapAction !== null}
              >
                Epic
              </button>
            </div>
            {scrapMsg && <p className={styles.scrapMsg}>{scrapMsg}</p>}
          </div>
        </div>

        {/* Right: upgrade preview */}
        <div className={styles.previewPanel}>
          {!selected ? (
            <div className={styles.noSelection}>
              <div className={styles.noSelectIcon}>⚒️</div>
              <p>Select an item from the left to preview upgrade.</p>
            </div>
          ) : preview ? (
            <div className={styles.previewContent}>
              <div className={styles.previewHeader}>
                <div className={styles.previewIcon}>
                  {preview.item.type === ItemType.WEAPON ? "⚔️" : preview.item.type === ItemType.ARMOR ? "🛡️" : "💍"}
                </div>
                <div>
                  <p className={styles.previewName}>{preview.item.name}</p>
                  <p className={styles.previewRarity} style={{ color: rarityColors[preview.item.rarity] }}>
                    {preview.item.rarity} · +{preview.item.upgradeLevel}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className={styles.statGrid}>
                <div className={styles.statItem}><span className={styles.strColor}>⚔️ STR</span><span>+{preview.item.bonusStr}</span></div>
                <div className={styles.statItem}><span className={styles.agiColor}>🏃 AGI</span><span>+{preview.item.bonusAgi}</span></div>
                <div className={styles.statItem}><span>🛡️ DEF</span><span>+{preview.item.bonusDef}</span></div>
                <div className={styles.statItem}><span className={styles.hpColor}>❤️ HP</span><span>+{preview.item.bonusHp}</span></div>
              </div>

              <div className={styles.divider} />

              {/* Rate */}
              <div className={styles.rateSection}>
                <div className={styles.rateBar}>
                  <div
                    className={styles.rateFill}
                    style={{
                      width: `${Math.round(preview.effectiveRate * 100)}%`,
                      background: preview.effectiveRate >= 0.8 ? "var(--hp-green)" : preview.effectiveRate >= 0.5 ? "var(--hp-yellow)" : "var(--hp-red)",
                    }}
                  />
                </div>
                <div className={styles.rateRow}>
                  <span className={styles.rateLabel}>Success Rate</span>
                  <span className={styles.rateValue}>
                    {(preview.effectiveRate * 100).toFixed(0)}%
                    {preview.item.failCount > 0 && (
                      <span className={styles.pityBadge}> +{preview.item.failCount * 10}% pity</span>
                    )}
                    {preview.item.failCount >= 5 && (
                      <span className={styles.pityMax}> 🌟 GUARANTEED!</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Cost */}
              <div className={styles.costSection}>
                <p className={styles.costLabel}>Upgrade Cost</p>
                <div className={styles.costRow}>
                  {preview.preview.scrapToUse > 0 && (
                    <span className={styles.costScrap}>🔩 {preview.preview.scrapToUse} Scrap</span>
                  )}
                  {preview.preview.goldToUse > 0 && (
                    <span className={styles.costGold}>💰 {preview.preview.goldToUse.toLocaleString()} Gold</span>
                  )}
                </div>
                <p className={styles.costNote}>1 Scrap = 5 Gold value</p>
              </div>

              {/* Result */}
              {result && (
                <div className={`${styles.resultCard} ${result.leveledUp ? styles.winResult : styles.failResult}`}>
                  <p className={styles.resultTitle}>
                    {result.leveledUp ? "🎉 SUCCESS!" : "💥 FAILED!"}
                  </p>
                  {result.pityTriggered && <p className={styles.pityNote}>🌟 Pity triggered!</p>}
                  <p className={styles.resultMsg}>{result.message}</p>
                  <p className={styles.resultLevel}>
                    {result.leveledUp ? `↑ +${result.newLevel}` : `↓ +${result.newLevel}`}
                  </p>
                </div>
              )}

              {/* Upgrade button */}
              <button
                className={`${styles.upgradeBtn} ${upgrading ? styles.upgrading : ""}`}
                onClick={doUpgrade}
                disabled={upgrading || preview.item.upgradeLevel >= 100 || user.gold < preview.preview.goldToUse}
              >
                {upgrading ? "Forging..." : preview.item.upgradeLevel >= 100 ? "MAX LEVEL" : "⚒️ Forge Upgrade"}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

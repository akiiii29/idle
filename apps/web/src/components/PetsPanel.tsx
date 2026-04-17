"use client";

import { useState } from "react";
import styles from "./PetsPanel.module.css";

const rarityColors: Record<string, string> = {
  COMMON: "#9ca3af",
  RARE: "#3b82f6",
  EPIC: "#9b6dff",
  LEGENDARY: "#f0c040",
};

const roleConfig: Record<string, { icon: string; label: string; cls: string }> = {
  DPS: { icon: "⚔️", label: "DPS", cls: "role-dps" },
  TANK: { icon: "🛡️", label: "TANK", cls: "role-tank" },
  SUPPORT: { icon: "✨", label: "SUPPORT", cls: "role-support" },
};

const GOLD_VALUES: Record<string, number> = { COMMON: 10, RARE: 30, EPIC: 80, LEGENDARY: 200 };
const ESSENCE_VALUES: Record<string, number> = { COMMON: 5, RARE: 15, EPIC: 40, LEGENDARY: 100 };
const UPGRADE_COSTS = [0, 0, 10, 20, 40, 80, 120, 180, 250, 350, 500];

function getUpgradeEssenceCost(nextLevel: number) {
  return UPGRADE_COSTS[nextLevel] ?? 500;
}

function dismantleEssenceCalc(rarity: string, level: number) {
  const base = ESSENCE_VALUES[rarity] || 0;
  const bonus = level > 1 ? level * 2 : 0;
  let total = base + bonus;
  if (rarity === "EPIC" || rarity === "LEGENDARY") total = Math.floor(total * 1.1);
  return total;
}

function computePetPatch(pet: any, action: string, user: any, beasts: any[]): any {
  const patch: any = {};
  const rarity = pet.rarity || "COMMON";
  const nextLevel = (pet.upgradeLevel || 0) + 1;
  if (action === "sell") {
    patch.gold = (user.gold ?? 0) + (GOLD_VALUES[rarity] || 0);
    patch.beasts = beasts.filter((b: any) => b.id !== pet.id);
  } else if (action === "dismantle") {
    patch.petEssence = (user.petEssence ?? 0) + dismantleEssenceCalc(rarity, pet.level);
    patch.beasts = beasts.filter((b: any) => b.id !== pet.id);
  } else if (action === "upgrade") {
    patch.petEssence = (user.petEssence ?? 0) - getUpgradeEssenceCost(nextLevel);
  } else if (action === "sacrifice") {
    patch.talentDps = (user.talentDps ?? 0) + 1;
    patch.beasts = beasts.filter((b: any) => b.id !== pet.id);
  } else if (action === "equip") {
    patch.beasts = beasts.map((b: any) =>
      b.id === pet.id ? { ...b, isEquipped: true } : b
    );
  } else if (action === "unequip") {
    patch.beasts = beasts.map((b: any) =>
      b.id === pet.id ? { ...b, isEquipped: false } : b
    );
  }
  return patch;
}

// ── Equipped pet modal ─────────────────────────────────────────────────────────
function EquipModal({
  pet,
  onClose,
  onAction,
  loading,
  userEssence,
}: {
  pet: any;
  onClose: () => void;
  onAction: (petId: string, action: string) => void;
  loading: boolean;
  userEssence: number;
}) {
  const rarity = pet.rarity || "COMMON";
  const role = roleConfig[pet.role] || { icon: "🐾", label: pet.role || "PET", cls: "" };
  const nextLevel = (pet.upgradeLevel || 0) + 1;
  const upgradeCost = nextLevel <= 10 ? getUpgradeEssenceCost(nextLevel) : null;
  const canUpgrade = upgradeCost !== null && userEssence >= upgradeCost;
  const dismantleAmt = dismantleEssenceCalc(rarity, pet.level);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()} style={{ borderColor: rarityColors[rarity] }}>
        <button className={styles.modalClose} onClick={onClose}>✕</button>

        <div className={styles.modalPetIcon}>🐾</div>
        <p className={styles.modalPetName}>{pet.name}</p>
        <p className={styles.modalRarity} style={{ color: rarityColors[rarity] }}>{rarity} · {role.icon} {role.label}</p>
        <p className={styles.modalStats}>Lv.{pet.level} · ⭐★{pet.upgradeLevel || 0} · PWR {pet.power}</p>

        <div className={styles.modalActions}>
          {upgradeCost !== null && (
            <button
              className={`${styles.modalBtn} ${styles.modalUpgradeBtn}`}
              onClick={() => onAction(pet.id, "upgrade")}
              disabled={loading || !canUpgrade}
            >
              ⬆️ Upgrade to ★{nextLevel}
              <span className={styles.modalCost}>{upgradeCost} Essence</span>
            </button>
          )}
          <button
            className={`${styles.modalBtn} ${styles.modalUnequipBtn}`}
            onClick={() => onAction(pet.id, "unequip")}
            disabled={loading}
          >
            📤 Unequip
          </button>
          <button
            className={`${styles.modalBtn} ${styles.modalSellBtn}`}
            onClick={() => onAction(pet.id, "sell")}
            disabled={loading}
          >
            💰 Sell · {GOLD_VALUES[rarity] || 0}g
          </button>
          <button
            className={`${styles.modalBtn} ${styles.modalDismantleBtn}`}
            onClick={() => onAction(pet.id, "dismantle")}
            disabled={loading}
          >
            💎 Dismantle · {dismantleAmt} Essence
          </button>
          <button
            className={`${styles.modalBtn} ${styles.modalSacrificeBtn}`}
            onClick={() => onAction(pet.id, "sacrifice")}
            disabled={loading}
          >
            🔥 Sacrifice · Talent +1
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Pet Card ───────────────────────────────────────────────────────────────────
function PetCard({
  pet,
  isEquipped,
  canEquip,
  onAction,
  loadingId,
  onEquippedClick,
}: {
  pet: any;
  isEquipped: boolean;
  canEquip?: boolean;
  onAction: (petId: string, action: string) => void;
  loadingId: string | null;
  onEquippedClick?: (pet: any) => void;
}) {
  const rarity = pet.rarity || "COMMON";
  const role = roleConfig[pet.role] || { icon: "🐾", label: pet.role || "PET", cls: "" };
  const maxExp = pet.level * 50 + 50;
  const expPct = Math.min(100, (pet.exp / maxExp) * 100);
  const loading = loadingId === pet.id;
  const nextLevel = (pet.upgradeLevel || 0) + 1;
  const upgradeCost = nextLevel <= 10 ? getUpgradeEssenceCost(nextLevel) : null;
  const sellGold = GOLD_VALUES[rarity] || 0;
  const dismantleAmt = dismantleEssenceCalc(rarity, pet.level);

  return (
    <div
      className={`
        ${styles.petCard}
        ${isEquipped ? styles.equipped : ""}
        ${styles["rarity-glow-" + rarity.toLowerCase()]}
      `}
      style={{ borderColor: rarityColors[rarity] }}
      onClick={isEquipped ? () => onEquippedClick?.(pet) : undefined}
      role={isEquipped ? "button" : undefined}
      tabIndex={isEquipped ? 0 : undefined}
      onKeyDown={isEquipped ? (e) => { if (e.key === "Enter" || e.key === " ") onEquippedClick?.(pet); } : undefined}
    >
      {/* Top row: role badge + upgrade level */}
      <div className={styles.petTopRow}>
        <span className={`${styles.roleBadge} ${role.cls ? styles[role.cls] : ""}`}>
          {role.icon} {role.label}
        </span>
        {pet.upgradeLevel > 0 && (
          <span className={styles.starBadge}>★{pet.upgradeLevel}</span>
        )}
      </div>

      {/* Pet icon */}
      <div className={styles.petIcon}>🐾</div>

      <p className={styles.petName} title={pet.name}>{pet.name}</p>
      <p className={styles.petRarity} style={{ color: rarityColors[rarity] }}>
        {rarity}
      </p>

      {/* Level + Power */}
      <div className={styles.petMeta}>
        <span className={styles.levelBadge}>Lv.{pet.level}</span>
        <span className={styles.powerBadge}>PWR {pet.power}</span>
      </div>

      {/* Skill info */}
      {pet.skillType && (
        <div className={styles.skillInfo}>
          <span>{pet.skillType}</span>
          <span>{(pet.skillPower * 100).toFixed(1)}%</span>
        </div>
      )}

      {/* EXP bar */}
      {pet.exp > 0 && (
        <div className={styles.expBar}>
          <div className={styles.expFill} style={{ width: `${expPct}%` }} />
        </div>
      )}

      {isEquipped ? (
        <div className={styles.equippedBadge}>✓ Click to manage</div>
      ) : (
        /* Action buttons — only for unequipped pets */
        <div className={styles.actionRow}>
          {canEquip && (
            <button
              className={`${styles.actionBtn} ${styles.equipBtn}`}
              onClick={(e) => { e.stopPropagation(); onAction(pet.id, "equip"); }}
              disabled={loading}
              title="Equip this pet"
            >
              ⚔️
            </button>
          )}
          {upgradeCost !== null && (
            <button
              className={`${styles.actionBtn} ${styles.upgradeBtn}`}
              onClick={(e) => { e.stopPropagation(); onAction(pet.id, "upgrade"); }}
              disabled={loading || nextLevel > 10}
              title={`Upgrade to ★${nextLevel} (${upgradeCost} Essence)`}
            >
              {loading && nextLevel === pet.upgradeLevel + 1 ? "…" : "⬆️"}
            </button>
          )}
          <button
            className={`${styles.actionBtn} ${styles.sellBtn}`}
            onClick={(e) => { e.stopPropagation(); onAction(pet.id, "sell"); }}
            disabled={loading}
            title={`Sell for ${sellGold}g`}
          >
            💰
          </button>
          <button
            className={`${styles.actionBtn} ${styles.dismantleBtn}`}
            onClick={(e) => { e.stopPropagation(); onAction(pet.id, "dismantle"); }}
            disabled={loading}
            title={`Dismantle for ${dismantleAmt} Essence`}
          >
            💎
          </button>
          <button
            className={`${styles.actionBtn} ${styles.sacrificeBtn}`}
            onClick={(e) => { e.stopPropagation(); onAction(pet.id, "sacrifice"); }}
            disabled={loading}
            title="Sacrifice (Talent +1)"
          >
            🔥
          </button>
        </div>
      )}
    </div>
  );
}

export default function PetsPanel({ user, onUpdate }: { user: any; onUpdate: (patch: any) => void }) {
  const beasts = user.beasts || [];
  const equippedPets = beasts.filter((b: any) => b.isEquipped);
  const unequippedPets = beasts.filter((b: any) => !b.isEquipped);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [bulkAction, setBulkAction] = useState<string>("sell");
  const [bulkRarity, setBulkRarity] = useState<string>("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [selectedPet, setSelectedPet] = useState<any | null>(null);

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }

  async function handleAction(petId: string, action: string) {
    setLoadingId(petId);
    try {
      const res = await fetch(`/api/pets/${petId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, action }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        setSelectedPet(null);
        const pet = beasts.find((b: any) => b.id === petId);
        if (pet) {
          const patch = computePetPatch(pet, action, user, beasts);
          onUpdate(patch);
        }
      } else {
        showToast(data.message || "Action failed", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleBulk() {
    if (!bulkAction) return;
    setBulkLoading(true);
    try {
      const body: any = { userId: user.id, action: bulkAction };
      if (bulkRarity) body.rarity = bulkRarity;
      const res = await fetch("/api/pets/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        setBulkRarity("");
        onUpdate({ gold: data.gold ?? user.gold, petEssence: data.essence ?? user.petEssence, talentDps: data.talentDps ?? user.talentDps });
      } else {
        showToast(data.message || "Bulk action failed", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setBulkLoading(false);
    }
  }

  return (
    <div className={styles.panel}>
      {toast && (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
          {toast.msg}
        </div>
      )}

      {selectedPet && (
        <EquipModal
          pet={selectedPet}
          onClose={() => setSelectedPet(null)}
          onAction={handleAction}
          loading={loadingId === selectedPet.id}
          userEssence={user.petEssence || 0}
        />
      )}

      <h2 className={styles.title}>🐾 Pets</h2>
      <div className={styles.resourceRow}>
        <span className={styles.essenceDisplay}>💎 {user.petEssence ?? 0} Essence</span>
      </div>

      {/* Bulk Actions */}
      <div className={styles.bulkSection}>
        <h3 className={styles.sectionTitle}>Bulk Actions</h3>
        <div className={styles.bulkControls}>
          <select
            className={styles.bulkSelect}
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
          >
            <option value="sell">💰 Sell All</option>
            <option value="dismantle">💎 Dismantle All</option>
            <option value="sacrifice">🔥 Sacrifice All</option>
          </select>
          <select
            className={styles.bulkSelect}
            value={bulkRarity}
            onChange={(e) => setBulkRarity(e.target.value)}
          >
            <option value="">All Rarities</option>
            <option value="COMMON">COMMON</option>
            <option value="RARE">RARE</option>
            <option value="EPIC">EPIC</option>
            <option value="LEGENDARY">LEGENDARY</option>
          </select>
          <button
            className={styles.bulkBtn}
            onClick={handleBulk}
            disabled={bulkLoading || unequippedPets.length === 0}
          >
            {bulkLoading ? "…" : "Execute"}
          </button>
        </div>
      </div>

      {equippedPets.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Equipped ({equippedPets.length}/3)</h3>
          <div className={styles.grid}>
            {equippedPets.map((pet: any) => (
              <PetCard
                key={pet.id}
                pet={pet}
                isEquipped={true}
                onAction={handleAction}
                loadingId={loadingId}
                onEquippedClick={setSelectedPet}
              />
            ))}
          </div>
        </div>
      )}

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          All Pets ({beasts.length})
          {unequippedPets.length > 0 && ` — ${unequippedPets.length} unequipped`}
        </h3>
        <div className={styles.grid}>
          {beasts.length === 0 && <p className={styles.empty}>No pets captured yet</p>}
          {unequippedPets.map((pet: any) => (
            <PetCard
              key={pet.id}
              pet={pet}
              isEquipped={false}
              canEquip={equippedPets.length < 3}
              onAction={handleAction}
              loadingId={loadingId}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

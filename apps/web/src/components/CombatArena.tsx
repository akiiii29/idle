"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import styles from "./CombatArena.module.css";

interface DamageNumber {
  id: number;
  value: number;
  type: "damage" | "heal" | "crit" | "miss" | "gold" | "exp";
  target: "player" | "enemy";
}

interface BattleEvent {
  text: string;
  type: "player" | "enemy" | "system" | "damage" | "heal" | "crit";
}

interface CombatResult {
  isWin: boolean;
  enemyName: string;
  goldGained: number;
  expGained: number;
  battleLogs: string[];
  finalHp: number;
  playerMaxHp: number;
  finalEnemyHp: number;
  enemyMaxHp: number;
}

export default function CombatArena({
  user,
  onHuntComplete,
}: {
  user: any;
  onHuntComplete: () => void;
}) {
  const [phase, setPhase] = useState<"idle" | "hunting" | "result">("idle");
  const [result, setResult] = useState<CombatResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [damageNumbers, setDamageNumbers] = useState<DamageNumber[]>([]);
  const [playerHp, setPlayerHp] = useState(user.currentHp);
  const [enemyHp, setEnemyHp] = useState(0);
  const [enemyMaxHp, setEnemyMaxHp] = useState(0);
  const [enemyName, setEnemyName] = useState("");
  const [enemyLevel, setEnemyLevel] = useState(1);
  const [playerHpPercent, setPlayerHpPercent] = useState(100);
  const [enemyHpPercent, setEnemyHpPercent] = useState(100);
  const [turn, setTurn] = useState<"player" | "enemy">("player");
  const [shakeTarget, setShakeTarget] = useState<"player" | "enemy" | null>(null);
  const [victoryFlash, setVictoryFlash] = useState(false);
  const [defeatFlash, setDefeatFlash] = useState(false);
  const [floatingRewards, setFloatingRewards] = useState<{ gold?: number; exp?: number } | null>(null);

  const idCounter = useRef(0);
  const logRef = useRef<HTMLDivElement>(null);

  // Sync player HP
  useEffect(() => {
    setPlayerHp(user.currentHp);
    setPlayerHpPercent(Math.max(0, Math.min(100, (user.currentHp / user.maxHp) * 100)));
  }, [user.currentHp, user.maxHp]);

  // Auto-scroll logs
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const spawnDamageNumber = useCallback((value: number, type: DamageNumber["type"], target: DamageNumber["target"]) => {
    idCounter.current++;
    const id = idCounter.current;
    setDamageNumbers((prev) => [...prev, { id, value, type, target }]);
    setTimeout(() => {
      setDamageNumbers((prev) => prev.filter((d) => d.id !== id));
    }, 700);
  }, []);

  const triggerShake = useCallback((target: "player" | "enemy") => {
    setShakeTarget(target);
    setTimeout(() => setShakeTarget(null), 150);
  }, []);

  const animateHp = useCallback((
    setter: React.Dispatch<React.SetStateAction<number>>,
    percentSetter: React.Dispatch<React.SetStateAction<number>>,
    current: number,
    delta: number,
    max: number,
    duration = 300
  ) => {
    const start = current;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const newVal = start - delta * eased;
      setter(Math.max(0, Math.round(newVal)));
      percentSetter(Math.max(0, Math.min(100, ((start - delta * eased) / max) * 100)));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);

  async function doHunt(type: "normal" | "boss") {
    if (phase !== "idle") return;
    setPhase("hunting");
    setResult(null);
    setLogs(["⚔️ Starting hunt..."]);
    setDamageNumbers([]);
    setVictoryFlash(false);
    setDefeatFlash(false);
    setFloatingRewards(null);

    try {
      const res = await fetch("/api/hunt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, huntType: type }),
      });

      if (!res.ok) {
        const err = await res.json();
        setLogs([`Error: ${err.error}`]);
        setPhase("idle");
        return;
      }

      const data: CombatResult = await res.json();
      setResult(data);

      // Simulate combat animation
      await simulateCombatAnimation(data, user.maxHp, type);

    } catch {
      setLogs(["Network error"]);
      setPhase("idle");
    }
  }

  async function simulateCombatAnimation(data: CombatResult, playerMaxHp: number, huntType: "normal" | "boss") {
    const lvl = Math.max(1, user.level - Math.floor(Math.random() * 3));
    const isBoss = huntType === "boss";
    const enemyStrengthMultiplier = isBoss ? 3 : 1;
    const calcEnemyMaxHp = Math.floor((50 + lvl * 15) * enemyStrengthMultiplier * (lvl < 5 ? 0.7 : 1));
    const calcEnemyHp = Math.floor(calcEnemyMaxHp * 0.6 + Math.random() * calcEnemyMaxHp * 0.4);

    setEnemyName(data.enemyName || `Quái vật cấp ${lvl}`);
    setEnemyLevel(lvl);
    setEnemyMaxHp(data.enemyMaxHp || calcEnemyMaxHp);
    setEnemyHp(data.enemyMaxHp || calcEnemyMaxHp);
    setEnemyHpPercent(100);
    setPlayerHpPercent(Math.max(0, Math.min(100, (playerHp / playerMaxHp) * 100)));

    // Simulate turns
    const turns = Math.floor(3 + Math.random() * 5);
    let currentPlayerHp = playerHp;
    let currentEnemyHp = data.enemyMaxHp || calcEnemyMaxHp;

    for (let t = 0; t < turns; t++) {
      const isPlayerTurn = t % 2 === 0;
      setTurn(isPlayerTurn ? "player" : "enemy");

      await sleep(400);

      if (isPlayerTurn) {
        // Player attacks
        const baseDmg = Math.floor(20 + user.str * 2 + Math.random() * 20);
        const isCrit = Math.random() < (user.luck * 0.01);
        const dmg = isCrit ? Math.floor(baseDmg * 1.5) : baseDmg;

        spawnDamageNumber(dmg, isCrit ? "crit" : "damage", "enemy");
        triggerShake("enemy");
        currentEnemyHp = Math.max(0, currentEnemyHp - dmg);
        animateHp(setEnemyHp, setEnemyHpPercent, currentEnemyHp + dmg, dmg, data.enemyMaxHp || calcEnemyMaxHp);
        addLog(`${isCrit ? "💥 CRIT!" : ""}You deal ${dmg} damage`);

      } else {
        // Enemy attacks
        const enemyDmg = Math.floor(10 + lvl * 3 + Math.random() * 15);
        const isMiss = Math.random() < 0.15;

        if (isMiss) {
          spawnDamageNumber(0, "miss", "player");
          addLog(`Enemy misses!`);
        } else {
          spawnDamageNumber(enemyDmg, "damage", "player");
          triggerShake("player");
          currentPlayerHp = Math.max(0, currentPlayerHp - enemyDmg);
          animateHp(setPlayerHp, setPlayerHpPercent, currentPlayerHp + enemyDmg, enemyDmg, playerMaxHp);
          addLog(`Enemy deals ${enemyDmg} damage`);
        }
      }

      if (currentEnemyHp <= 0 || currentPlayerHp <= 0) break;
    }

    await sleep(300);

    if (currentEnemyHp <= 0 || data.isWin) {
      // Victory
      setVictoryFlash(true);
      setTimeout(() => setVictoryFlash(false), 400);
      spawnDamageNumber(data.goldGained, "gold", "enemy");
      await sleep(200);
      spawnDamageNumber(data.expGained, "exp", "enemy");
      addLog(`🎉 Victory! +${data.goldGained} gold, +${data.expGained} exp`);
      setFloatingRewards({ gold: data.goldGained, exp: data.expGained });
    } else {
      // Defeat
      setDefeatFlash(true);
      setTimeout(() => setDefeatFlash(false), 400);
      addLog(`💀 Defeated! Hospitalized for 30 minutes`);
    }

    await sleep(500);
    setPhase("result");
    onHuntComplete();
  }

  function addLog(text: string) {
    setLogs((prev) => [...prev.slice(-20), text]);
  }

  function sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
  }

  const hpColor = (percent: number) =>
    percent > 50 ? "var(--hp-green)" : percent > 20 ? "var(--hp-yellow)" : "var(--hp-red)";

  return (
    <div className={styles.arena}>
      {/* Victory/Defeat Flash */}
      {victoryFlash && <div className={styles.victoryFlash} />}
      {defeatFlash && <div className={styles.defeatFlash} />}

      {/* Combat Stage */}
      <div className={styles.stage}>
        {/* Player */}
        <div className={`${styles.combatant} ${turn === "player" ? styles.activeTurn : ""} ${shakeTarget === "player" ? styles.shake : ""}`}>
          <div className={styles.avatar}>
            <span className={styles.avatarEmoji}>🧙</span>
            {user.beasts?.filter((b: any) => b.isEquipped).slice(0, 2).map((b: any) => (
              <span key={b.id} className={styles.petMini}>{b.rarity === "LEGENDARY" ? "👑" : b.rarity === "EPIC" ? "💜" : "🐾"}</span>
            ))}
          </div>
          <p className={styles.combatantName}>{user.username}</p>
          <div className={styles.hpBarOuter}>
            <div
              className={styles.hpBarInner}
              style={{ width: `${playerHpPercent}%`, background: hpColor(playerHpPercent) }}
            />
          </div>
          <p className={styles.hpText}>{playerHp} / {user.maxHp}</p>
        </div>

        {/* VS indicator */}
        <div className={styles.vsIndicator}>
          {phase === "idle" && <span className={styles.vsText}>VS</span>}
          {phase === "hunting" && <span className={styles.turnIndicator}>{turn === "player" ? "⚔️" : "👹"}</span>}
          {phase === "result" && result && (
            <span className={`${styles.resultBadge} ${result.isWin ? styles.win : styles.lose}`}>
              {result.isWin ? "WIN" : "LOSE"}
            </span>
          )}
        </div>

        {/* Enemy */}
        <div className={`${styles.combatant} ${turn === "enemy" ? styles.activeTurn : ""} ${shakeTarget === "enemy" ? styles.shake : ""}`}>
          <div className={styles.avatar}>
            <span className={styles.avatarEmoji}>
              {enemyName.includes("boss") || enemyName.includes("Boss") ? "👹" : "🐺"}
            </span>
          </div>
          <p className={styles.combatantName}>{enemyName || "—"}</p>
          {enemyMaxHp > 0 && (
            <>
              <div className={styles.hpBarOuter}>
                <div
                  className={styles.hpBarInner}
                  style={{ width: `${enemyHpPercent}%`, background: hpColor(enemyHpPercent) }}
                />
              </div>
              <p className={styles.hpText}>{enemyHp} / {enemyMaxHp}</p>
            </>
          )}
        </div>

        {/* Damage Numbers Layer */}
        <div className={styles.damageLayer}>
          {damageNumbers.map((dmg) => (
            <div
              key={dmg.id}
              className={`${styles.damageNumber} ${styles[dmg.type]}`}
              style={{
                left: dmg.target === "player" ? "25%" : "75%",
              }}
            >
              {dmg.type === "miss" ? "MISS" : (dmg.type === "gold" ? `+${dmg.value} 💰` : dmg.type === "exp" ? `+${dmg.value} ✨` : `-${dmg.value}`)}
            </div>
          ))}
        </div>

        {/* Floating Rewards */}
        {floatingRewards && (
          <div className={styles.floatingRewards}>
            <div className={styles.rewardItem}>+{floatingRewards.gold} 💰</div>
            <div className={styles.rewardItem}>+{floatingRewards.exp} ✨</div>
          </div>
        )}
      </div>

      {/* Hunt Buttons */}
      <div className={styles.huntActions}>
        <button
          className={`${styles.huntBtn} ${phase === "hunting" ? styles.hunting : ""}`}
          onClick={() => doHunt("normal")}
          disabled={phase === "hunting"}
        >
          {phase === "hunting" ? "⚔️ Hunting..." : "⚔️ Normal Hunt"}
        </button>
        <button
          className={`${styles.huntBtn} ${styles.bossBtn} ${phase === "hunting" ? styles.hunting : ""}`}
          onClick={() => doHunt("boss")}
          disabled={phase === "hunting"}
        >
          {phase === "hunting" ? "👹 Hunting..." : "👹 Boss Hunt"}
        </button>
      </div>

      {/* Battle Log */}
      <div className={styles.logContainer} ref={logRef}>
        {logs.map((log, i) => (
          <p key={i} className={styles.logLine}>{log}</p>
        ))}
      </div>
    </div>
  );
}

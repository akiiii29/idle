"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import styles from "./CombatArena.module.css";

interface FloatingBadge {
  id: number;
  text: string;
  icon: string;
  color: string;
  side: "player" | "enemy";
}

interface LogEntry {
  text: string;
  type: "turn" | "skill" | "synergy" | "pet" | "damage" | "heal" | "system" | "crit" | "miss" | "dot" | "reward";
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
  achievementTracking?: { crits: number; burns: number; poisons: number; lifesteals: number; combos: number };
  combatSummary?: { synergies: string[]; comboCount: number; maxTurnDamage: number; totalDamageDealt: number; skillCounts: Record<string, number> };
  fullLogs?: { turn: number; events: string[] }[];
  dropItems?: { name: string; type: string; rarity: string }[];
  isBossKill?: boolean;
}

const LOG_TYPE_MAP: Record<string, LogEntry["type"]> = {
  "⚔️ **Thi triển": "skill",
  "🔗 **Cộng hưởng": "synergy",
  "📌 **Cộng hưởng đội pet": "pet",
  "💥 **CHÍ MẠNG": "crit",
  "💨": "miss",
  "🩸": "heal",
  "✨ **Niệm chú": "skill",
  "🐾": "pet",
  "💚": "heal",
  "[Lượt": "turn",
  "👟": "turn",
  "───": "turn",
  "⚡ **CUỘNG NỘ": "system",
  "🛡️ **Phòng thủ": "skill",
};

function classifyLog(text: string): LogEntry["type"] {
  if (text.includes("💥")) return "crit";
  if (text.includes("chịu **") && text.includes("sát thương")) return "damage";
  if (text.includes("💚")) return "heal";
  if (text.includes("thi triển kỹ năng")) return "pet";
  for (const [prefix, type] of Object.entries(LOG_TYPE_MAP)) {
    if (text.includes(prefix)) return type;
  }
  return "system";
}

function extractDmg(text: string): number | null {
  const m = text.match(/\*\*(\d+)\*\*/);
  return m ? parseInt(m[1]) : null;
}

function extractHpVals(text: string): { playerHp: number; maxHp: number } | null {
  const m = text.match(/HP.*?(\d+)\/(\d+)/);
  if (m) return { playerHp: parseInt(m[1]), maxHp: parseInt(m[2]) };
  return null;
}

function extractEnemyHp(text: string): number | null {
  const m = text.match(/gây \*\*(\d+)\*\*/);
  return m ? parseInt(m[1]) : null;
}

function parseSkillTrigger(text: string): { name: string; icon: string } | null {
  // e.g. "⚔️ **Critical Strike**" or "✨ **Niệm chú:** 💥 **Critical Strike**, Fireball..."
  const match = text.match(/\*\*([^*]+)\*\*/g);
  if (!match) return null;
  const name = match[match.length - 1]?.replace(/\*\*/g, "") ?? "";
  const icon = text.includes("💥") ? "💥" : text.includes("🔥") ? "🔥" : text.includes("💚") ? "💚" : text.includes("🛡️") ? "🛡️" : text.includes("💨") ? "💨" : text.includes("🔮") ? "🔮" : text.includes("🌋") ? "🌋" : "✨";
  return { name, icon };
}

function parseSynergy(text: string): string | null {
  // e.g. "🔗 **Hỏa Ngục** — ..."
  const match = text.match(/🔗 \*\*([^*]+)\*\*/);
  return match ? match[1] : null;
}

export default function CombatArena({ user, onHuntComplete }: { user: any; onHuntComplete: () => void }) {
  const [phase, setPhase] = useState<"idle" | "hunting" | "result">("idle");
  const [result, setResult] = useState<CombatResult | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [playerHp, setPlayerHp] = useState(user.currentHp);
  const [enemyHp, setEnemyHp] = useState(0);
  const [enemyMaxHp, setEnemyMaxHp] = useState(0);
  const [enemyName, setEnemyName] = useState("");
  const [playerHpPercent, setPlayerHpPercent] = useState(100);
  const [enemyHpPercent, setEnemyHpPercent] = useState(100);
  const [turn, setTurn] = useState<"player" | "enemy">("player");
  const [shakeTarget, setShakeTarget] = useState<"player" | "enemy" | null>(null);
  const [victoryFlash, setVictoryFlash] = useState(false);
  const [defeatFlash, setDefeatFlash] = useState(false);
  const [floatingRewards, setFloatingRewards] = useState<{ gold?: number; exp?: number } | null>(null);
  const [badges, setBadges] = useState<FloatingBadge[]>([]);
  const [activeDots, setActiveDots] = useState<{ player: string[]; enemy: string[] }>({ player: [], enemy: [] });
  const [summaryStats, setSummaryStats] = useState<any>(null);
  const [animatingTurn, setAnimatingTurn] = useState(false);
  const [showResultPanel, setShowResultPanel] = useState(false);
  const [computedMaxHp, setComputedMaxHp] = useState<number>(user?.maxHp ?? 100);

  // Fetch computed maxHp when user changes
  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/stats/${user.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.final?.maxHp) setComputedMaxHp(data.final.maxHp);
      })
      .catch(() => {});
  }, [user?.id, user?.inventory?.length, user?.beasts?.length, user?.level]);

  const idCounter = useRef(0);
  const logRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef(false);

  useEffect(() => {
    setPlayerHp(user.currentHp);
    setPlayerHpPercent(Math.max(0, Math.min(100, (user.currentHp / computedMaxHp) * 100)));
  }, [user.currentHp, computedMaxHp]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  const spawnBadge = useCallback((text: string, icon: string, color: string, side: "player" | "enemy") => {
    idCounter.current++;
    const id = idCounter.current;
    setBadges((prev) => [...prev, { id, text, icon, color, side }]);
    setTimeout(() => setBadges((prev) => prev.filter((b) => b.id !== id)), 1500);
  }, []);

  const triggerShake = useCallback((target: "player" | "enemy") => {
    setShakeTarget(target);
    setTimeout(() => setShakeTarget(null), 200);
  }, []);

  const addLog = useCallback((text: string) => {
    const type = classifyLog(text);
    setLogs((prev) => [...prev.slice(-40), { text, type }]);
  }, []);

  const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

  const hpColor = (p: number) => (p > 50 ? "var(--hp-green)" : p > 20 ? "var(--hp-yellow)" : "var(--hp-red)");

  async function doHunt(type: "normal" | "boss") {
    // If in result phase, dismiss result first then start new hunt
    if (phase === "result") {
      setShowResultPanel(false);
      setPhase("idle");
      setResult(null);
      setLogs([]);
      setBadges([]);
      setActiveDots({ player: [], enemy: [] });
    }
    if (phase !== "idle") return;
    abortRef.current = false;
    setPhase("hunting");
    setResult(null);
    setLogs([]);
    setBadges([]);
    setVictoryFlash(false);
    setDefeatFlash(false);
    setFloatingRewards(null);
    setShowResultPanel(false);
    setActiveDots({ player: [], enemy: [] });
    setPlayerHp(user.currentHp);
    setPlayerHpPercent(Math.max(0, Math.min(100, (user.currentHp / computedMaxHp) * 100)));

    try {
      const res = await fetch("/api/hunt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, huntType: type }),
      });
      if (!res.ok) { const e = await res.json(); addLog(`Error: ${e.error}`); setPhase("idle"); return; }
      const data: CombatResult = await res.json();
      setResult(data);
      setEnemyName(data.enemyName);
      setEnemyMaxHp(data.enemyMaxHp);
      setEnemyHp(data.finalEnemyHp);
      setEnemyHpPercent(Math.max(0, Math.min(100, (data.finalEnemyHp / data.enemyMaxHp) * 100)));
      await playBackLogs(data.fullLogs ?? [], data);
    } catch {
      addLog("Network error");
      setPhase("idle");
    }
  }

  async function playBackLogs(fullLogs: { turn: number; events: string[] }[], data: CombatResult) {
    let curPlayerHp = user.currentHp;
    let curEnemyHp = data.enemyMaxHp;
    const maxPlayerHp = data.playerMaxHp ?? computedMaxHp;

    addLog(`⚔️ Bắt đầu trận chiến!`);

    for (let t = 0; t < fullLogs.length; t++) {
      if (abortRef.current) break;
      const turnData = fullLogs[t]!;
      const turnNum = turnData.turn;

      // Find who attacks this turn by scanning events
      // Events format: player attacks first, then enemy
      // We process group by group
      const playerEvents: string[] = [];
      const enemyEvents: string[] = [];
      let inEnemy = false;
      for (const evt of turnData.events) {
        if (evt.includes("───")) { inEnemy = true; continue; }
        if (!inEnemy) playerEvents.push(evt);
        else enemyEvents.push(evt);
      }

      // If turn starts with enemy (speed), swap
      if (turnData.events[0]?.includes("**") && turnData.events[0]?.includes("ra đòn trước")) {
        const first = turnData.events[0];
        if (first?.includes("**") && !first?.includes(user.username)) {
          // enemy goes first — swap arrays
          const temp = [...enemyEvents];
          // enemyEvents already have everything after `───` — but need to check the first event for who attacked
        }
      }

      // Process turn header
      const turnHeader = `[Lượt ${turnNum}]`;
      addLog(turnHeader);

      // PLAYER PHASE
      if (playerEvents.length > 0) {
        setTurn("player");
        setAnimatingTurn(true);
        for (const evt of playerEvents) {
          if (abortRef.current) break;
          await processEvent(evt, "player", curPlayerHp, curEnemyHp, maxPlayerHp, data.enemyMaxHp, setPlayerHp, setEnemyHp, setPlayerHpPercent, setEnemyHpPercent, triggerShake, spawnBadge, addLog, setActiveDots, badges, idCounter);
        }
        setAnimatingTurn(false);
        await sleep(300);
      }

      if (curEnemyHp <= 0 || abortRef.current) break;

      // ENEMY PHASE
      if (enemyEvents.length > 0) {
        setTurn("enemy");
        setAnimatingTurn(true);
        for (const evt of enemyEvents) {
          if (abortRef.current) break;
          await processEvent(evt, "enemy", curPlayerHp, curEnemyHp, maxPlayerHp, data.enemyMaxHp, setPlayerHp, setEnemyHp, setPlayerHpPercent, setEnemyHpPercent, triggerShake, spawnBadge, addLog, setActiveDots, badges, idCounter);
        }
        setAnimatingTurn(false);
        await sleep(300);
      }

      // Sync HP states from refs (passed as setters, but we need current values)
      // We track via closure - curPlayerHp/curEnemyHp are updated in processEvent
    }

    await sleep(400);

    if (curEnemyHp <= 0 || data.isWin) {
      setVictoryFlash(true);
      setTimeout(() => setVictoryFlash(false), 600);
      addLog(`🎉 Chiến thắng! +${data.goldGained.toLocaleString()} gold, +${data.expGained.toLocaleString()} exp`);
      setFloatingRewards({ gold: data.goldGained, exp: data.expGained });
      setSummaryStats(data.combatSummary);
    } else {
      setDefeatFlash(true);
      setTimeout(() => setDefeatFlash(false), 600);
      addLog(`💀 Thất bại! Nằm viện 30 phút.`);
    }

    await sleep(800);
    setShowResultPanel(true);
    await sleep(1200);
    setPhase("result");
    onHuntComplete();
  }

  async function processEvent(
    text: string,
    source: "player" | "enemy",
    curPlayerHp: number,
    curEnemyHp: number,
    maxPlayerHp: number,
    maxEnemyHp: number,
    setPlayerHp: any,
    setEnemyHp: any,
    setPlayerHpPct: any,
    setEnemyHpPct: any,
    triggerShake: (t: "player" | "enemy") => void,
    spawnBadge: (text: string, icon: string, color: string, side: "player" | "enemy") => void,
    addLog: (t: string) => void,
    setActiveDots: any,
    existingBadges: FloatingBadge[],
    idRef: React.MutableRefObject<number>
  ) {
    const type = classifyLog(text);
    const skillMatch = parseSkillTrigger(text);
    const synergyMatch = parseSynergy(text);
    const dmg = extractDmg(text);
    const isCrit = text.includes("💥") || text.includes("CHÍ MẠNG");
    const isMiss = text.includes("MISS") || text.includes("né được");
    const isLifesteal = text.includes("🩸");
    const isHeal = text.includes("💚") || text.includes("Hồi phục");

    // Dot tick
    const isDot = text.includes("thiêu đốt") || text.includes("độc") || text.includes("chảy máu") || text.includes("DOT");

    // Skill badge
    if (skillMatch && source === "player") {
      spawnBadge(skillMatch.name, skillMatch.icon, "var(--accent-gold)", "player");
    }

    // Synergy badge
    if (synergyMatch) {
      spawnBadge(synergyMatch, "🔗", "var(--accent-purple)", source);
    }

    // Pet synergy lines
    if (text.includes("📌 **Cộng hưởng đội pet")) {
      const petSynName = text.split("**")[2] ?? "Pet Synergy";
      spawnBadge(petSynName, "🐾", "var(--accent-blue)", "player");
    }

    // Damage
    if (dmg !== null && (type === "damage" || type === "crit") && source === "player") {
      triggerShake("enemy");
      animateHp(setEnemyHp, setEnemyHpPct, curEnemyHp, dmg, maxEnemyHp);
    } else if (dmg !== null && (type === "damage" || type === "crit") && source === "enemy") {
      triggerShake("player");
      animateHp(setPlayerHp, setPlayerHpPct, curPlayerHp, dmg, maxPlayerHp);
    }

    // Miss
    if (isMiss && source === "enemy") {
      // just log
    }

    addLog(text);
    await sleep(isCrit ? 600 : 400);
  }

  function animateHp(
    setter: any, pctSetter: any,
    current: number, delta: number, max: number, duration = 350
  ) {
    const start = current;
    const startTime = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const newVal = Math.max(0, start - delta * eased);
      setter(Math.round(newVal));
      pctSetter(Math.max(0, Math.min(100, ((newVal / max) * 100))));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  return (
    <div className={styles.arena}>
      {victoryFlash && <div className={styles.victoryFlash} />}
      {defeatFlash && <div className={styles.defeatFlash} />}

      {/* Combat Summary Slide-in */}
      {showResultPanel && result && (
        <div className={`${styles.resultPanel} ${result.isWin ? styles.winPanel : styles.losePanel}`}>
          <div className={styles.resultPanelHeader}>
            <span className={styles.resultTitle}>
              {result.isWin ? (result.isBossKill ? "👹 BOSS KILL!" : "🏆 CHIẾN THẮNG") : "💀 THẤT BẠI"}
            </span>
            <span className={styles.resultEnemy}>{result.enemyName}</span>
          </div>

          {result.combatSummary && (
            <div className={styles.summaryGrid}>
              <div className={styles.summaryStat}>
                <span className={styles.ssVal}>{result.combatSummary.totalDamageDealt.toLocaleString()}</span>
                <span className={styles.ssLabel}>Tổng sát thương</span>
              </div>
              <div className={styles.summaryStat}>
                <span className={styles.ssVal}>{result.combatSummary.maxTurnDamage.toLocaleString()}</span>
                <span className={styles.ssLabel}>Max 1 lượt</span>
              </div>
              {result.achievementTracking && (
                <>
                  <div className={styles.summaryStat}>
                    <span className={styles.ssVal} style={{ color: "var(--accent-gold)" }}>{result.achievementTracking.crits}</span>
                    <span className={styles.ssLabel}>Chí mạng</span>
                  </div>
                  <div className={styles.summaryStat}>
                    <span className={styles.ssVal} style={{ color: "var(--hp-red)" }}>{result.achievementTracking.burns}</span>
                    <span className={styles.ssLabel}>Thiêu đốt</span>
                  </div>
                  <div className={styles.summaryStat}>
                    <span className={styles.ssVal} style={{ color: "#84cc16" }}>{result.achievementTracking.poisons}</span>
                    <span className={styles.ssLabel}>Độc tố</span>
                  </div>
                  <div className={styles.summaryStat}>
                    <span className={styles.ssVal} style={{ color: "var(--accent-purple)" }}>{result.combatSummary.synergies.length}</span>
                    <span className={styles.ssLabel}>Cộng hưởng</span>
                  </div>
                </>
              )}
            </div>
          )}

          {result.combatSummary?.synergies && result.combatSummary.synergies.length > 0 && (
            <div className={styles.synergyRow}>
              {result.combatSummary.synergies.map((s, i) => (
                <span key={i} className={styles.synBadge}>{s}</span>
              ))}
            </div>
          )}

          <div className={styles.rewardRow}>
            <span className={styles.rewardGold}>+{result.goldGained.toLocaleString()} 💰</span>
            <span className={styles.rewardExp}>+{result.expGained.toLocaleString()} ⭐</span>
          </div>

          {/* Boss drop items */}
          {result.dropItems && result.dropItems.length > 0 && (
            <div className={styles.dropRow}>
              <span className={styles.dropLabel}>🎁 Boss Drop:</span>
              <div className={styles.dropItems}>
                {result.dropItems.map((item, i) => (
                  <span
                    key={i}
                    className={styles.dropItem}
                    style={{
                      borderColor: item.rarity === "LEGENDARY" ? "var(--accent-gold)" : item.rarity === "EPIC" ? "var(--accent-purple)" : item.rarity === "RARE" ? "#3b82f6" : "#9ca3af",
                    }}
                    title={`${item.rarity} · ${item.type}`}
                  >
                    {item.type === "WEAPON" ? "⚔️" : "🛡️"} {item.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Stage */}
      <div className={styles.stage}>
        {/* Ambient glow */}
        <div className={styles.stageGlow} />

        {/* Player Side */}
        <div className={`${styles.combatant} ${turn === "player" && phase === "hunting" ? styles.activeTurn : ""} ${shakeTarget === "player" ? styles.shake : ""}`}>
          {/* Pet mini icons */}
          <div className={styles.petRow}>
            {(user.beasts?.filter((b: any) => b.isEquipped) ?? []).slice(0, 3).map((b: any) => (
              <span key={b.id} className={styles.petChip}
                title={`${b.name} (Lv ${b.level})`}>
                {b.rarity === "LEGENDARY" ? "👑" : b.rarity === "EPIC" ? "💜" : b.rarity === "RARE" ? "⭐" : "🐾"}
              </span>
            ))}
          </div>

          <div className={styles.avatar}>
            <span className={styles.avatarEmoji}>🧙</span>
          </div>

          <p className={styles.combatantName}>{user.username}</p>

          <div className={styles.hpBarOuter}>
            <div
              className={styles.hpBarInner}
              style={{ width: `${playerHpPercent}%`, background: hpColor(playerHpPercent), boxShadow: `0 0 8px ${hpColor(playerHpPercent)}60` }}
            />
          </div>
          <p className={styles.hpText}>{playerHp.toLocaleString()} / {computedMaxHp.toLocaleString()}</p>

          {/* Buffs */}
          {activeDots.player.length > 0 && (
            <div className={styles.dotRow}>
              {activeDots.player.map((d, i) => (
                <span key={i} className={`${styles.dotBadge} ${d === "burn" ? styles.dotBurn : styles.dotPoison}`}>
                  {d === "burn" ? "🔥" : "🤢"}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Center Info */}
        <div className={styles.centerInfo}>
          {phase === "idle" && <span className={styles.vsText}>⚔️ VS ⚔️</span>}
          {phase === "hunting" && (
            <div className={styles.turnBanner}>
              <span className={styles.turnEmoji}>{turn === "player" ? "⚔️" : "👹"}</span>
              <span className={styles.turnLabel}>{turn === "player" ? "Lượt bạn" : "Lượt địch"}</span>
            </div>
          )}
          {phase === "result" && result && (
            <span className={`${styles.resultBadge} ${result.isWin ? styles.winBadge : styles.loseBadge}`}>
              {result.isWin ? "WIN" : "LOSE"}
            </span>
          )}
        </div>

        {/* Enemy Side */}
        <div className={`${styles.combatant} ${turn === "enemy" && phase === "hunting" ? styles.activeTurn : ""} ${shakeTarget === "enemy" ? styles.shake : ""}`}>
          <div className={styles.avatar}>
            <span className={styles.avatarEmoji}>
              {enemyName.toLowerCase().includes("boss") ? "👹" : "🐺"}
            </span>
          </div>
          <p className={styles.combatantName}>{enemyName || "—"}</p>
          {enemyMaxHp > 0 && (
            <>
              <div className={styles.hpBarOuter}>
                <div
                  className={styles.hpBarInner}
                  style={{ width: `${enemyHpPercent}%`, background: hpColor(enemyHpPercent), boxShadow: `0 0 8px ${hpColor(enemyHpPercent)}60` }}
                />
              </div>
              <p className={styles.hpText}>{enemyHp.toLocaleString()} / {enemyMaxHp.toLocaleString()}</p>
            </>
          )}
          {activeDots.enemy.length > 0 && (
            <div className={styles.dotRow}>
              {activeDots.enemy.map((d, i) => (
                <span key={i} className={`${styles.dotBadge} ${d === "burn" ? styles.dotBurn : styles.dotPoison}`}>
                  {d === "burn" ? "🔥" : "🤢"}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Floating Badges */}
        {badges.map((b) => (
          <div
            key={b.id}
            className={styles.floatingBadge}
            style={{
              left: b.side === "player" ? "20%" : "80%",
              color: b.color,
              borderColor: b.color,
            }}
          >
            <span>{b.icon}</span>
            <span>{b.text}</span>
          </div>
        ))}

        {/* Floating Rewards */}
        {floatingRewards && (
          <div className={styles.floatingRewards}>
            <div className={styles.rewardGold}>{floatingRewards.gold?.toLocaleString()} 💰</div>
            <div className={styles.rewardExp}>{floatingRewards.exp?.toLocaleString()} ⭐</div>
          </div>
        )}
      </div>

      {/* Battle Log */}
      <div className={styles.logWrapper}>
        <div className={styles.logHeader}>
          <span className={styles.logTitle}>📜 Combat Log</span>
          {result?.combatSummary && (
            <span className={styles.logSynCount}>
              {result.combatSummary.synergies.length} syns · {result.combatSummary.comboCount} combos
            </span>
          )}
        </div>
        <div className={styles.logContainer} ref={logRef}>
          {logs.map((l, i) => (
            <p key={i} className={`${styles.logLine} ${styles["log_" + l.type]}`}>{l.text}</p>
          ))}
        </div>
      </div>

      {/* Hunt Buttons */}
      <div className={styles.huntActions}>
        <button
          className={`${styles.huntBtn} ${phase === "hunting" ? styles.hunting : ""}`}
          onClick={() => doHunt("normal")}
          disabled={phase === "hunting"}
        >
          ⚔️ Normal Hunt
        </button>
        <button
          className={`${styles.huntBtn} ${styles.bossBtn} ${phase === "hunting" ? styles.hunting : ""}`}
          onClick={() => doHunt("boss")}
          disabled={phase === "hunting"}
        >
          👹 Boss Hunt
        </button>
      </div>
    </div>
  );
}
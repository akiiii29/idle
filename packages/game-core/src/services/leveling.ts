export interface LevelableStats {
  level: number;
  exp: number;
  str: number;
  agi: number;
  luck: number;
  currentHp: number;
  maxHp: number;
}

export interface LevelUpSummary {
  updated: LevelableStats;
  levelsGained: number;
  summaries: string[];
}

export function requiredExpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

export function applyLevelUps(stats: LevelableStats): LevelUpSummary {
  const updated: LevelableStats = { ...stats };
  const summaries: string[] = [];
  let levelsGained = 0;

  while (updated.exp >= requiredExpForLevel(updated.level)) {
    const needed = requiredExpForLevel(updated.level);
    updated.exp -= needed;
    updated.level += 1;
    levelsGained += 1;

    const strGain = randomInt(1, 3);
    const agiGain = randomInt(1, 3);
    const gainedLuck = rollPercent(10) ? 1 : 0;

    updated.str += strGain;
    updated.agi += agiGain;
    updated.luck += gainedLuck;
    const hpGain = randomInt(5, 15);
    updated.maxHp += hpGain;
    updated.currentHp = updated.maxHp;

    summaries.push(
      `Level ${updated.level}: STR +${strGain}, AGI +${agiGain}${gainedLuck > 0 ? ", LUCK +1" : ""}, MAX HP +${hpGain}`
    );
  }

  return {
    updated,
    levelsGained,
    summaries
  };
}

function randomInt(min: number, max: number): number {
  const lower = Math.ceil(Math.min(min, max));
  const upper = Math.floor(Math.max(min, max));
  return Math.floor(Math.random() * (upper - lower + 1)) + lower;
}

function rollPercent(chance: number): boolean {
  return Math.random() * 100 < chance;
}

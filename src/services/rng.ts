export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function randomInt(min: number, max: number): number {
  const lower = Math.ceil(Math.min(min, max));
  const upper = Math.floor(Math.max(min, max));
  return Math.floor(Math.random() * (upper - lower + 1)) + lower;
}

export function rollPercent(chance: number): boolean {
  return Math.random() * 100 < chance;
}

export function pickRandom<T>(items: readonly T[]): T {
  return items[randomInt(0, items.length - 1)]!;
}

export function weightedPick<T extends string>(weights: Record<T, number>): T {
  const total = (Object.values(weights) as number[]).reduce((sum, value) => sum + value, 0);
  let roll = Math.random() * total;

  for (const [key, value] of Object.entries(weights) as Array<[T, number]>) {
    roll -= value;
    if (roll <= 0) {
      return key;
    }
  }

  return Object.keys(weights)[0] as T;
}

/**
 * time.ts — Centralized time utilities for UTC+7 (Vietnam Time).
 */

export function getVnDate(date: Date = new Date()) {
  const vnOffset = 7 * 60 * 60 * 1000;
  return new Date(date.getTime() + vnOffset);
}

export function getVnDayString(date: Date = new Date()): string {
  return getVnDate(date).toISOString().split("T")[0] ?? "";
}

export function msUntilNextVnMidnight(): number {
  const now = new Date();
  const nowVN = getVnDate(now);
  const nextVN = new Date(Date.UTC(
    nowVN.getUTCFullYear(),
    nowVN.getUTCMonth(),
    nowVN.getUTCDate() + 1,
    0, 0, 0
  ));
  const nextUTC = new Date(nextVN.getTime() - (7 * 60 * 60 * 1000));
  return nextUTC.getTime() - now.getTime();
}

export function isDifferentVnDay(lastDate: Date | null): boolean {
  if (!lastDate) return true;
  return getVnDayString(new Date()) !== getVnDayString(lastDate);
}

export function msUntilNextVnMidnightFrom(date: Date): number {
  const nowVN = getVnDate(date);
  const nextVN = new Date(Date.UTC(
    nowVN.getUTCFullYear(),
    nowVN.getUTCMonth(),
    nowVN.getUTCDate() + 1,
    0, 0, 0
  ));
  const nextUTC = new Date(nextVN.getTime() - (7 * 60 * 60 * 1000));
  return nextUTC.getTime() - date.getTime();
}

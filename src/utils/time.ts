/**
 * time.ts
 * Centralized time utilities for UTC+7 (Vietnam Time).
 */

export function getVnDate(date: Date = new Date()) {
    const vnOffset = 7 * 60 * 60 * 1000;
    return new Date(date.getTime() + vnOffset);
}

/** 
 * Returns YYYY-MM-DD for the current date in UTC+7.
 * Useful for seeding daily resets.
 */
export function getVnDayString(date: Date = new Date()) {
    return getVnDate(date).toISOString().split("T")[0];
}

/**
 * Calculates milliseconds remaining until the next midnight in UTC+7.
 */
export function msUntilNextVnMidnight(): number {
    const now = new Date();
    const nowVN = getVnDate(now);
    
    // next midnight in VN (translated to UTC components for constructor)
    const nextVN = new Date(Date.UTC(
        nowVN.getUTCFullYear(), 
        nowVN.getUTCMonth(), 
        nowVN.getUTCDate() + 1,
        0, 0, 0
    ));
    
    // transform back to absolute UTC timestamp
    const nextUTC = new Date(nextVN.getTime() - (7 * 60 * 60 * 1000));
    return nextUTC.getTime() - now.getTime();
}

/**
 * Returns true if the provided date was on a different UTC+7 day than now.
 */
export function isDifferentVnDay(lastDate: Date | null): boolean {
    if (!lastDate) return true;
    return getVnDayString(new Date()) !== getVnDayString(lastDate);
}

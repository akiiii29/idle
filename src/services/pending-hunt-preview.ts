import { randomUUID } from "node:crypto";

export type HuntPreviewBranch = "combat" | "chest" | "catch" | "nothing";

export interface PendingHuntPreview {
  token: string;
  userId: string;
  trapsWanted: number;
  cloversWanted: number;
  scoutLensToUse: number;
  forcedEventRoll: number;
  predictedBranch: HuntPreviewBranch;
  createdAt: Date;
  timeout: NodeJS.Timeout;
}

const pendingHuntPreviews = new Map<string, PendingHuntPreview>();

export function createHuntPreviewToken(params: {
  userId: string;
  trapsWanted: number;
  cloversWanted: number;
  scoutLensToUse: number;
  forcedEventRoll: number;
  predictedBranch: HuntPreviewBranch;
  timeoutMs: number;
}): string {
  const token = randomUUID();
  const createdAt = new Date();

  const timeout = setTimeout(() => {
    pendingHuntPreviews.delete(token);
  }, params.timeoutMs);

  pendingHuntPreviews.set(token, {
    token,
    userId: params.userId,
    trapsWanted: params.trapsWanted,
    cloversWanted: params.cloversWanted,
    scoutLensToUse: params.scoutLensToUse,
    forcedEventRoll: params.forcedEventRoll,
    predictedBranch: params.predictedBranch,
    createdAt,
    timeout
  });

  return token;
}

export function peekHuntPreview(token: string): PendingHuntPreview | null {
  return pendingHuntPreviews.get(token) ?? null;
}

export function consumeHuntPreview(token: string): PendingHuntPreview | null {
  const preview = pendingHuntPreviews.get(token) ?? null;
  if (!preview) return null;
  clearTimeout(preview.timeout);
  pendingHuntPreviews.delete(token);
  return preview;
}


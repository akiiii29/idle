/**
 * canvas-cards.ts — Thẻ profile (và có thể mở rộng hunt) qua @napi-rs/canvas.
 * Font: `canvas-fonts.ts` — ưu tiên font hệ thống / Noto trong assets để hiển thị tiếng Việt đúng.
 */

import { createCanvas, loadImage, type SKRSContext2D } from "@napi-rs/canvas";
import { AttachmentBuilder } from "discord.js";
import type { Rarity } from "./rpg-ui";
import { canvasFont } from "./canvas-fonts";

const PALETTE = {
  bg: "#0c0e14",
  bg2: "#12151f",
  panel: "#1c2030",
  panel2: "#232838",
  border: "#3d4566",
  accent: "#5865f2",
  accent2: "#7289da",
  gold: "#f0b429",
  green: "#3ba55d",
  red: "#ed4245",
  orange: "#faa61a",
  purple: "#9b59b6",
  text: "#f2f3f5",
  muted: "#949ba4",
  chipBg: "#2b3045",
} as const;

const RARITY_HEX: Record<Rarity, string> = {
  COMMON: "#99aab5",
  RARE: "#3498db",
  EPIC: "#9b59b6",
  LEGENDARY: "#f1c40f",
};

function roundRect(ctx: SKRSContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawBar(
  ctx: SKRSContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  pct: number,
  fillColor: string,
  trackColor = "#2a3148"
) {
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = trackColor;
  ctx.fill();
  if (pct > 0) {
    const fillW = Math.max(h, w * Math.min(pct, 1));
    roundRect(ctx, x, y, fillW, h, h / 2);
    ctx.fillStyle = fillColor;
    ctx.fill();
  }
}

function clipCircle(ctx: SKRSContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
}

async function fetchAvatar(url: string) {
  try {
    return await loadImage(url);
  } catch {
    return null;
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  PROFILE CARD
// ══════════════════════════════════════════════════════════════════════════════

export interface ProfileCardData {
  username: string;
  avatarUrl: string;
  title?: string;

  level: number;
  gold: number;
  scrap: number;
  exp: number;
  expRequired: number;
  currentHp: number;
  maxHp: number;

  str: number;
  agi: number;
  luck: number;

  /** Chỉ số combat tổng (đã gồm đồ/pet), không breakdown */
  attack: number;
  defense: number;
  speed: number;

  topBeast?: { name: string; rarity: string; power: number } | null;
  equippedSkillCount: number;
  inventoryCount: number;
  inventoryLimit: number;
  petCount: number;
  equippedPetCount: number;

  huntReady: boolean;
  dailyReady: boolean;
  isInHospital: boolean;
  isInTavern: boolean;
  huntCdText?: string;
  dailyCdText?: string;
  hospitalText?: string;
  tavernText?: string;
}

export async function buildProfileCard(data: ProfileCardData): Promise<AttachmentBuilder> {
  canvasFont(12);
  const W = 1160;
  const H = 720;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, PALETTE.bg);
  grad.addColorStop(1, PALETTE.bg2);
  ctx.fillStyle = grad;
  roundRect(ctx, 0, 0, W, H, 20);
  ctx.fill();

  const topBar = ctx.createLinearGradient(0, 0, W, 0);
  topBar.addColorStop(0, PALETTE.accent);
  topBar.addColorStop(0.5, PALETTE.purple);
  topBar.addColorStop(1, PALETTE.accent2);
  ctx.fillStyle = topBar;
  roundRect(ctx, 0, 0, W, 5, 0);
  ctx.fill();

  const LX = 32;
  const LY = 28;
  const LW = 300;
  const LH = H - LY * 2;

  roundRect(ctx, LX, LY, LW, LH, 18);
  ctx.fillStyle = PALETTE.panel;
  ctx.fill();
  ctx.strokeStyle = PALETTE.border;
  ctx.lineWidth = 1;
  ctx.stroke();

  const avatarSize = 152;
  const avatarCX = LX + LW / 2;
  const avatarCY = LY + 96;
  const avatarImg = await fetchAvatar(data.avatarUrl + "?size=256");
  if (avatarImg) {
    ctx.save();
    clipCircle(ctx, avatarCX, avatarCY, avatarSize / 2);
    ctx.drawImage(avatarImg, avatarCX - avatarSize / 2, avatarCY - avatarSize / 2, avatarSize, avatarSize);
    ctx.restore();
  }
  ctx.beginPath();
  ctx.arc(avatarCX, avatarCY, avatarSize / 2 + 3, 0, Math.PI * 2);
  ctx.strokeStyle = PALETTE.accent;
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.fillStyle = PALETTE.text;
  ctx.font = canvasFont(22, "bold");
  const uname = data.username.length > 18 ? data.username.slice(0, 16) + "…" : data.username;
  ctx.fillText(uname, avatarCX, avatarCY + 102);

  let yBelow = avatarCY + 132;
  if (data.title) {
    const tw = Math.min(260, ctx.measureText(data.title).width + 36);
    roundRect(ctx, avatarCX - tw / 2, yBelow - 14, tw, 30, 15);
    const tg = ctx.createLinearGradient(avatarCX - tw / 2, 0, avatarCX + tw / 2, 0);
    tg.addColorStop(0, "#5b4cdb");
    tg.addColorStop(1, PALETTE.purple);
    ctx.fillStyle = tg;
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = canvasFont(13, "bold");
    ctx.fillText(data.title, avatarCX, yBelow + 6);
    yBelow += 44;
  } else {
    yBelow += 8;
  }

  roundRect(ctx, avatarCX - 52, yBelow - 16, 104, 32, 16);
  ctx.fillStyle = PALETTE.accent;
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = canvasFont(17, "bold");
  ctx.fillText(`Cấp ${data.level}`, avatarCX, yBelow + 7);
  yBelow += 48;

  const attrs: { k: string; v: number }[] = [
    { k: "STR", v: data.str },
    { k: "AGI", v: data.agi },
    { k: "LUCK", v: data.luck },
  ];
  ctx.textAlign = "left";
  for (const a of attrs) {
    ctx.fillStyle = PALETTE.muted;
    ctx.font = canvasFont(15);
    ctx.fillText(a.k, LX + 28, yBelow);
    ctx.textAlign = "right";
    ctx.fillStyle = PALETTE.text;
    ctx.font = canvasFont(17, "bold");
    ctx.fillText(String(a.v), LX + LW - 28, yBelow);
    ctx.textAlign = "left";
    yBelow += 36;
  }

  yBelow += 6;
  ctx.textAlign = "center";
  ctx.fillStyle = PALETTE.gold;
  ctx.font = canvasFont(18, "bold");
  ctx.fillText(`${data.gold.toLocaleString("vi-VN")} vàng`, avatarCX, yBelow);
  yBelow += 32;
  ctx.fillStyle = PALETTE.muted;
  ctx.font = canvasFont(15);
  ctx.fillText(`Scrap: ${data.scrap.toLocaleString("vi-VN")}`, avatarCX, yBelow);
  yBelow += 28;
  ctx.fillStyle = PALETTE.muted;
  ctx.font = canvasFont(13);
  ctx.fillText(`Pet: ${data.equippedPetCount}/3 trận · ${data.petCount} trong chuồng`, avatarCX, yBelow);

  const RX = LX + LW + 36;
  const RW = W - RX - 36;
  let ry = 36;

  ctx.textAlign = "left";
  ctx.fillStyle = PALETTE.muted;
  ctx.font = canvasFont(15);
  ctx.fillText("Máu", RX, ry);
  const hpPct = data.maxHp > 0 ? data.currentHp / data.maxHp : 0;
  const hpColor = hpPct > 0.55 ? PALETTE.green : hpPct > 0.25 ? PALETTE.orange : PALETTE.red;
  drawBar(ctx, RX, ry + 8, RW, 22, hpPct, hpColor);
  ctx.textAlign = "right";
  ctx.fillStyle = PALETTE.text;
  ctx.font = canvasFont(14, "bold");
  ctx.fillText(`${Math.floor(data.currentHp)} / ${data.maxHp}`, RX + RW, ry + 52);
  ry += 72;

  ctx.textAlign = "left";
  ctx.fillStyle = PALETTE.muted;
  ctx.font = canvasFont(15);
  ctx.fillText("Kinh nghiệm", RX, ry);
  const xpPct = data.expRequired > 0 ? data.exp / data.expRequired : 0;
  drawBar(ctx, RX, ry + 8, RW, 22, xpPct, PALETTE.accent);
  ctx.textAlign = "right";
  ctx.fillStyle = PALETTE.text;
  ctx.font = canvasFont(14, "bold");
  ctx.fillText(`${data.exp} / ${data.expRequired} XP`, RX + RW, ry + 52);
  ry += 68;

  const boxW = (RW - 24) / 3;
  const boxH = 72;
  const combatStats: { label: string; val: number; color: string }[] = [
    { label: "Tấn công", val: data.attack, color: PALETTE.red },
    { label: "Phòng thủ", val: data.defense, color: PALETTE.accent2 },
    { label: "Tốc độ", val: data.speed, color: PALETTE.green },
  ];
  for (let i = 0; i < 3; i++) {
    const bx = RX + i * (boxW + 12);
    roundRect(ctx, bx, ry, boxW, boxH, 14);
    ctx.fillStyle = PALETTE.panel2;
    ctx.fill();
    ctx.strokeStyle = combatStats[i]!.color + "66";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.fillStyle = PALETTE.muted;
    ctx.font = canvasFont(13);
    ctx.fillText(combatStats[i]!.label, bx + boxW / 2, ry + 22);
    ctx.fillStyle = PALETTE.text;
    ctx.font = canvasFont(26, "bold");
    ctx.fillText(String(combatStats[i]!.val), bx + boxW / 2, ry + 56);
  }
  ry += boxH + 20;

  const pW = (RW - 16) / 2;
  const pH = 128;

  roundRect(ctx, RX, ry, pW, pH, 16);
  ctx.fillStyle = PALETTE.panel;
  ctx.fill();
  ctx.strokeStyle = PALETTE.border;
  ctx.stroke();
  ctx.textAlign = "left";
  ctx.fillStyle = PALETTE.muted;
  ctx.font = canvasFont(14);
  ctx.fillText("Sủng vật mạnh nhất", RX + 18, ry + 28);
  if (data.topBeast) {
    const rc = RARITY_HEX[data.topBeast.rarity as Rarity] ?? PALETTE.muted;
    ctx.fillStyle = rc;
    ctx.font = canvasFont(17, "bold");
    const nm =
      data.topBeast.name.length > 22 ? data.topBeast.name.slice(0, 20) + "…" : data.topBeast.name;
    ctx.fillText(nm, RX + 18, ry + 58);
    ctx.fillStyle = PALETTE.muted;
    ctx.font = canvasFont(14);
    ctx.fillText(`${data.topBeast.rarity} · Lực ${data.topBeast.power}`, RX + 18, ry + 88);
  } else {
    ctx.fillStyle = PALETTE.muted;
    ctx.font = canvasFont(15);
    ctx.fillText("Chưa có pet", RX + 18, ry + 62);
  }

  roundRect(ctx, RX + pW + 16, ry, pW, pH, 16);
  ctx.fillStyle = PALETTE.panel;
  ctx.fill();
  ctx.strokeStyle = PALETTE.border;
  ctx.stroke();
  ctx.fillStyle = PALETTE.muted;
  ctx.font = canvasFont(14);
  ctx.fillText("Túi đồ & kỹ năng", RX + pW + 34, ry + 28);
  ctx.fillStyle = PALETTE.text;
  ctx.font = canvasFont(30, "bold");
  const invX = RX + pW + 34;
  const invY = ry + 72;
  const invStr = `${data.inventoryCount}`;
  ctx.fillText(invStr, invX, invY);
  ctx.fillStyle = PALETTE.muted;
  ctx.font = canvasFont(16);
  ctx.fillText(`/ ${data.inventoryLimit} ô`, invX + ctx.measureText(invStr).width + 6, invY);
  ctx.font = canvasFont(14);
  ctx.fillText(`Skill trang bị: ${data.equippedSkillCount}/3`, RX + pW + 34, ry + 104);

  ry += pH + 22;

  const chips: { label: string; color: string }[] = [
    {
      label: data.huntReady ? "Đi săn · sẵn sàng" : `Đi săn · ${data.huntCdText ?? "chờ"}`,
      color: data.huntReady ? PALETTE.green : PALETTE.orange,
    },
    {
      label: data.dailyReady ? "Hằng ngày · sẵn sàng" : `Hằng ngày · ${data.dailyCdText ?? "chờ"}`,
      color: data.dailyReady ? PALETTE.green : PALETTE.orange,
    },
  ];
  if (data.isInHospital) chips.push({ label: `Bệnh viện · ${data.hospitalText}`, color: PALETTE.red });
  if (data.isInTavern) chips.push({ label: `Quán trọ · ${data.tavernText}`, color: PALETTE.accent });

  ctx.font = canvasFont(14);
  let cx = RX;
  let cy = ry;
  for (const c of chips) {
    const tw = ctx.measureText(c.label).width;
    const cw = Math.min(tw + 36, RW);
    if (cx + cw > RX + RW) {
      cx = RX;
      cy += 44;
    }
    roundRect(ctx, cx, cy, cw, 34, 17);
    ctx.strokeStyle = c.color;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.fillStyle = c.color + "22";
    ctx.fill();
    ctx.fillStyle = c.color;
    ctx.textAlign = "left";
    ctx.fillText(c.label, cx + 18, cy + 23);
    cx += cw + 10;
  }

  ctx.textAlign = "right";
  ctx.fillStyle = PALETTE.muted;
  ctx.font = canvasFont(12);
  ctx.fillText("Chi tiết chỉ số: /stats", W - 28, H - 22);

  return new AttachmentBuilder(canvas.toBuffer("image/png"), { name: "profile.png" });
}

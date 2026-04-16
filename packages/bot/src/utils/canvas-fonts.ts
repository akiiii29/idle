import { existsSync } from "node:fs";
import { join } from "node:path";
import { GlobalFonts } from "@napi-rs/canvas";

let cached: string | null = null;

function tryPath(path: string, alias: string): boolean {
  if (!existsSync(path)) return false;
  try {
    return GlobalFonts.registerFromPath(path, alias) != null;
  } catch {
    return false;
  }
}

/**
 * Đăng ký font có glyph tiếng Việt cho @napi-rs/canvas.
 * Windows: Segoe UI / Arial. Linux: DejaVu. macOS: Arial Unicode.
 * Có thể thả `assets/fonts/NotoSans-Regular.ttf` để dùng chung mọi OS.
 */
export function getCanvasUiFontFamily(): string {
  if (cached) return cached;

  const cwd = process.cwd();
  const bundled = [
    join(cwd, "assets", "fonts", "NotoSans-Regular.ttf"),
    join(cwd, "assets", "fonts", "NotoSans-Medium.ttf"),
  ];
  for (const p of bundled) {
    if (tryPath(p, "RPGVi")) {
      cached = "RPGVi";
      return cached;
    }
  }

  if (process.platform === "win32") {
    const windir = process.env.WINDIR || "C:\\Windows";
    if (
      tryPath(join(windir, "Fonts", "segoeui.ttf"), "RPGVi") ||
      tryPath(join(windir, "Fonts", "arial.ttf"), "RPGVi")
    ) {
      cached = "RPGVi";
      return cached;
    }
  }

  if (process.platform === "darwin") {
    if (
      tryPath("/System/Library/Fonts/Supplemental/Arial Unicode.ttf", "RPGVi") ||
      tryPath("/Library/Fonts/Arial Unicode.ttf", "RPGVi")
    ) {
      cached = "RPGVi";
      return cached;
    }
  }

  if (tryPath("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "RPGVi")) {
    cached = "RPGVi";
    return cached;
  }

  cached = "sans-serif";
  return cached;
}

export function canvasFont(size: number, weight: "normal" | "bold" = "normal", italic = false): string {
  const fam = getCanvasUiFontFamily();
  const w = weight === "bold" ? "bold " : "";
  const st = italic ? "italic " : "";
  return `${st}${w}${size}px ${fam}, "Segoe UI", "DejaVu Sans", sans-serif`;
}

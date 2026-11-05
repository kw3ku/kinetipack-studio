import { useVideoConfig } from "remotion";

// Safe zones per docs/formats.md. Portrait reserves room for platform UI.
export const useLayout = () => {
  const { width, height } = useVideoConfig();
  const portrait = height > width;
  const unit = Math.min(width, height) / 1080;
  const safe = portrait
    ? { top: height * 0.1, bottom: height * 0.2, left: width * 0.07, right: width * 0.15 }
    : { top: height * 0.07, bottom: height * 0.08, left: width * 0.06, right: width * 0.06 };
  return { width, height, portrait, unit, safe };
};

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// WCAG contrast ratio between two #RRGGBB colours (1 = none, 21 = black on white).
const luminance = (hex: string) => {
  const [r, g, bl] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
};
export const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// The first candidate readable on `background`, else the most readable one. 2.5:1 keeps
// strong brand accents (e.g. orange on cream) while catching pale ones like mint on white.
export const readableOn = (background: string, ...candidates: string[]) =>
  candidates.find((c) => contrast(c, background) >= 2.5) ??
  [...candidates].sort((x, y) => contrast(y, background) - contrast(x, background))[0];

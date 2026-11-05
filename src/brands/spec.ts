import { Easing } from "remotion";
import type { Brand, TransitionStyle } from "./types";

// What you write in brands/<id>/brand.json. Plain JSON, no code.
export type BrandSpec = {
  id: string;
  name: string;
  logo: string | null;
  colors: Brand["color"];
  fonts: { display: string; body: string };
  feel: Feel;
  corners: "sharp" | "round";
  // Optional so older brand.json files keep working; defaults to "bands".
  transition?: TransitionStyle;
  // Optional; sound effects follow the feel unless set to "off".
  sound?: "on" | "off";
  copy: {
    tagline: string;
    title: { kicker: string; lines: string[] };
    person: { name: string; role: string };
    pitch: { kicker: string; lines: string[] };
    end: { heading: string; cta: string };
  };
};

export type Feel = "sharp" | "calm" | "bouncy";

const feels: Record<Feel, Pick<Brand, "ease" | "dur" | "wipeAngle">> = {
  sharp: {
    ease: {
      enter: Easing.bezier(0.16, 1, 0.3, 1),
      exit: Easing.bezier(0.7, 0, 0.84, 0),
      snap: Easing.bezier(0.65, 0, 0.35, 1),
    },
    dur: { short: 8, base: 15, long: 30 },
    wipeAngle: 18,
  },
  calm: {
    ease: {
      enter: Easing.bezier(0.22, 1, 0.36, 1),
      exit: Easing.bezier(0.64, 0, 0.78, 0),
      snap: Easing.bezier(0.83, 0, 0.17, 1),
    },
    dur: { short: 10, base: 18, long: 34 },
    wipeAngle: 0,
  },
  bouncy: {
    ease: {
      enter: Easing.bezier(0.34, 1.56, 0.64, 1),
      exit: Easing.bezier(0.7, 0, 0.84, 0),
      snap: Easing.bezier(0.65, 0, 0.35, 1),
    },
    dur: { short: 7, base: 13, long: 26 },
    wipeAngle: -12,
  },
};

export const toBrand = (spec: BrandSpec): Brand => ({
  id: spec.id,
  name: spec.name,
  logo: spec.logo,
  color: spec.colors,
  font: {
    display: `"${spec.fonts.display}", sans-serif`,
    body: `"${spec.fonts.body}", sans-serif`,
  },
  radius: spec.corners === "round" ? 24 : 0,
  transition: spec.transition ?? "bands",
  sound: spec.sound === "off" ? null : spec.feel,
  ...feels[spec.feel],
});

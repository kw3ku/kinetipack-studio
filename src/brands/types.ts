export type TransitionStyle = "bands" | "iris" | "blinds";

export type EasingFn = (t: number) => number;

export type Brand = {
  id: string;
  name: string;
  // Path under studio/public, or null to render the name as a wordmark.
  logo: string | null;
  color: {
    bg: string;
    fg: string;
    accent: string;
    accent2: string;
    muted: string;
  };
  font: { display: string; body: string };
  ease: { enter: EasingFn; exit: EasingFn; snap: EasingFn };
  // Durations in frames at 30 fps.
  dur: { short: number; base: number; long: number };
  radius: number;
  transition: TransitionStyle;
  // Angle of the bands transition, in degrees (0 = vertical).
  wipeAngle: number;
  // Sound set under public/sfx/<set>/, or null for silent renders.
  sound: "sharp" | "calm" | "bouncy" | null;
};

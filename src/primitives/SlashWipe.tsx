import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { useBrand } from "../brands";
import { clamp, useLayout } from "./layout";

// Three bands sweep across at the brand's wipe angle. The frame is fully
// covered around WIPE_CUT, so place the scene cut there.
export const WIPE_DURATION = 26;
export const WIPE_CUT = 15;

export const SlashWipe: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBrand();
  const { width, height } = useLayout();
  const diag = Math.hypot(width, height);
  const bands = [b.color.accent2, b.color.fg, b.color.accent];

  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none" }}>
      {bands.map((color, i) => {
        const start = i * 3;
        const x = interpolate(frame, [start, start + WIPE_DURATION - 6], [-1.7 * diag, 1.7 * diag], { ...clamp, easing: b.ease.snap });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: width / 2,
              top: height / 2,
              width: 2.2 * diag,
              height: 3 * diag,
              background: color,
              transform: `translate(-50%, -50%) rotate(${b.wipeAngle}deg) translateX(${x}px)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

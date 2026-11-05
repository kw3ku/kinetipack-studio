import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { useBrand } from "../brands";
import { clamp, useLayout } from "./layout";
import { Sfx } from "./Sfx";

// Leaves empty slots where YouTube end-screen elements will sit.
export const EndScreen: React.FC<{ heading: string; cta: string }> = ({ heading, cta }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = useBrand();
  const { unit, height, width, safe } = useLayout();

  const headIn = interpolate(frame, [0, b.dur.base], [0, 1], { ...clamp, easing: b.ease.enter });
  // Side by side only when the frame is clearly landscape; otherwise stack and fit the height.
  const stacked = width / height < 1.5;
  const roomForSlots = height - safe.top - safe.bottom - 300 * unit;
  const slotW = stacked ? Math.min(760 * unit, (roomForSlots / 2) * 16 / 9) : 620 * unit;
  const slotH = slotW * 9 / 16;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: b.color.bg,
        padding: `${safe.top}px ${safe.right}px ${safe.bottom}px ${safe.left}px`,
        justifyContent: "center",
        alignItems: "center",
        gap: 48 * unit,
      }}
    >
      <div style={{ overflow: "hidden" }}>
        <div style={{ fontFamily: b.font.display, fontWeight: 700, fontSize: 84 * unit, color: b.color.fg, letterSpacing: "-0.03em", transform: `translateY(${(1 - headIn) * 100}%)` }}>
          {heading}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: stacked ? "column" : "row", gap: 40 * unit, alignItems: "center" }}>
        {[0, 1].map((i) => {
          const p = spring({ frame: frame - 8 - i * 5, fps, config: { damping: 15, stiffness: 140 } });
          return (
            <div
              key={i}
              style={{
                width: slotW,
                height: slotH,
                borderRadius: b.radius,
                border: `${2 * unit}px solid ${b.color.fg}26`,
                background: `${b.color.fg}0D`,
                transform: `scale(${0.85 + p * 0.15})`,
                opacity: p,
              }}
            />
          );
        })}
      </div>
      <Cta label={cta} delay={20} />
      <Sfx name="pop" at={8} volume={0.6} />
      <Sfx name="pop" at={13} volume={0.6} />
      <Sfx name="tick" at={20} />
    </AbsoluteFill>
  );
};

const Cta: React.FC<{ label: string; delay: number }> = ({ label, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = useBrand();
  const { unit } = useLayout();
  const p = spring({ frame: frame - delay, fps, config: { damping: 10, stiffness: 170 } });
  const pulse = 1 + Math.max(0, Math.sin((frame - delay - 20) / 6)) * 0.04;
  return (
    <div
      style={{
        fontFamily: b.font.body,
        fontWeight: 600,
        fontSize: 34 * unit,
        color: b.color.bg,
        background: b.color.accent,
        borderRadius: b.radius ? 999 : 0,
        padding: `${18 * unit}px ${44 * unit}px`,
        transform: `scale(${p * pulse})`,
      }}
    >
      {label}
    </div>
  );
};

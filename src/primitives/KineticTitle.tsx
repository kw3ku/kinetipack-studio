import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { useBrand } from "../brands";
import { clamp, useLayout } from "./layout";
import { Sfx } from "./Sfx";

// Words rise out of masks with a stagger; the last line is set in the accent colour.
export const KineticTitle: React.FC<{ lines: string[]; kicker?: string }> = ({ lines, kicker }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const b = useBrand();
  const { width, height, unit, portrait, safe } = useLayout();
  // Square frames are short as well as narrow, so long titles need a smaller size there.
  const square = !portrait && width / height < 1.3;
  const size = (portrait ? 128 : square ? 112 : 150) * unit;
  const exitStart = durationInFrames - b.dur.base;

  let index = 0;
  const kickerIn = interpolate(frame, [0, b.dur.base], [0, 1], { ...clamp, easing: b.ease.enter });
  const bar = interpolate(frame, [6, 6 + b.dur.long], [0, 1], { ...clamp, easing: b.ease.enter });

  return (
    <AbsoluteFill style={{ justifyContent: "center", paddingLeft: safe.left, paddingRight: safe.right }}>
      {kicker ? (
        <div style={{ display: "flex", alignItems: "center", gap: 18 * unit, marginBottom: 28 * unit, opacity: kickerIn }}>
          <div style={{ width: 80 * unit * bar, height: 6 * unit, background: b.color.accent, borderRadius: b.radius }} />
          <div style={{ fontFamily: b.font.body, fontWeight: 600, fontSize: 30 * unit, letterSpacing: "0.18em", textTransform: "uppercase", color: b.color.muted }}>
            {kicker}
          </div>
        </div>
      ) : null}
      {lines.map((line, li) => (
        <div key={li} style={{ display: "flex", flexWrap: "wrap", columnGap: size * 0.25 }}>
          {line.split(" ").map((word) => {
            const i = index++;
            const start = 4 + i * 3;
            const enter = interpolate(frame, [start, start + b.dur.base], [0, 1], { ...clamp, easing: b.ease.enter });
            const exit = interpolate(frame, [exitStart + i, exitStart + i + b.dur.short], [0, 1], { ...clamp, easing: b.ease.exit });
            const y = (1 - enter) * 110 - exit * 110;
            return (
              <span key={i} style={{ display: "inline-block", overflow: "hidden", lineHeight: 1.08, paddingBottom: size * 0.06 }}>
                <span
                  style={{
                    display: "inline-block",
                    transform: `translateY(${y}%) rotate(${(1 - enter) * 6}deg)`,
                    fontFamily: b.font.display,
                    fontWeight: 700,
                    fontSize: size,
                    letterSpacing: "-0.035em",
                    color: li === lines.length - 1 ? b.color.accent : b.color.fg,
                  }}
                >
                  {word}
                </span>
              </span>
            );
          })}
        </div>
      ))}
      <Sfx name="pop" at={4} volume={0.8} />
    </AbsoluteFill>
  );
};

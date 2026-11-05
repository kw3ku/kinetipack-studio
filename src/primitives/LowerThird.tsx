import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { useBrand } from "../brands";
import { clamp, readableOn, useLayout } from "./layout";
import { Sfx } from "./Sfx";

export const LowerThird: React.FC<{ name: string; role: string }> = ({ name, role }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const b = useBrand();
  const { unit, safe, portrait } = useLayout();

  const exitStart = durationInFrames - b.dur.base - 4;
  const open = interpolate(frame, [4, 4 + b.dur.base], [0, 1], { ...clamp, easing: b.ease.enter });
  const close = interpolate(frame, [exitStart, exitStart + b.dur.base], [0, 1], { ...clamp, easing: b.ease.exit });
  const reveal = interpolate(frame, [10, 10 + b.dur.base], [0, 1], { ...clamp, easing: b.ease.enter });
  const roleIn = interpolate(frame, [18, 18 + b.dur.base], [0, 1], { ...clamp, easing: b.ease.enter });
  const shown = open - close;

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", paddingLeft: safe.left, paddingBottom: safe.bottom + (portrait ? 40 : 0) * unit }}>
      <div style={{ display: "flex", alignItems: "stretch", gap: 22 * unit }}>
        <div style={{ width: 10 * unit, background: b.color.accent, borderRadius: b.radius, transform: `scaleY(${shown})`, transformOrigin: "bottom" }} />
        <div
          style={{
            background: b.color.fg,
            borderRadius: b.radius,
            padding: `${22 * unit}px ${34 * unit}px`,
            clipPath: `inset(0 ${(1 - shown) * 100}% 0 0 round ${b.radius}px)`,
          }}
        >
          <div style={{ overflow: "hidden" }}>
            <div
              style={{
                fontFamily: b.font.display,
                fontWeight: 700,
                fontSize: 56 * unit,
                color: b.color.bg,
                letterSpacing: "-0.02em",
                transform: `translateY(${(1 - reveal + close) * 100}%)`,
              }}
            >
              {name}
            </div>
          </div>
          <div style={{ fontFamily: b.font.body, fontWeight: 600, fontSize: 28 * unit, color: readableOn(b.color.fg, b.color.accent, b.color.accent2, b.color.bg), opacity: roleIn - close, marginTop: 4 * unit }}>
            {role}
          </div>
        </div>
      </div>
      <Sfx name="tick" at={4} />
      <Sfx name="tick" at={18} volume={0.5} />
    </AbsoluteFill>
  );
};

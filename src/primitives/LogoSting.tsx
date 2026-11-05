import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useBrand } from "../brands";
import { clamp, useLayout } from "./layout";
import { Sfx } from "./Sfx";

// Accent block sweeps across, revealing the logo (or the wordmark letter by letter), then a dot pops.
export const LogoSting: React.FC<{ tagline: string }> = ({ tagline }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = useBrand();
  const { width, unit, portrait } = useLayout();

  const blockIn = interpolate(frame, [0, b.dur.short + 2], [-1, 0], { ...clamp, easing: b.ease.snap });
  const blockOut = interpolate(frame, [b.dur.short + 4, b.dur.base + 10], [0, 1], { ...clamp, easing: b.ease.snap });
  const blockX = (blockIn + blockOut) * width;

  const size = (portrait ? 150 : 190) * unit;
  const lettersStart = b.dur.short + 6;
  const letters = b.name.split("");
  const dotStart = lettersStart + (b.logo ? 10 : letters.length * 2 + 4);
  const dot = spring({ frame: frame - dotStart, fps, config: { damping: 9, stiffness: 180 } });
  const tag = interpolate(frame, [dotStart + 4, dotStart + 4 + b.dur.base], [0, 1], { ...clamp, easing: b.ease.enter });

  return (
    <AbsoluteFill style={{ backgroundColor: b.color.bg, justifyContent: "center", alignItems: "center" }}>
      {b.logo ? (
        <div style={{ overflow: "hidden" }}>
          <Img
            src={/^(data:|https?:)/.test(b.logo) ? b.logo : staticFile(b.logo)}
            style={{
              // Wide lockups shrink to fit portrait frames instead of touching the edges.
              height: size * 1.1,
              width: width * 0.8,
              objectFit: "contain",
              display: "block",
              transform: `translateY(${(1 - spring({ frame: frame - lettersStart, fps, config: { damping: 14, stiffness: 140 } })) * 110}%)`,
            }}
          />
        </div>
      ) : (
      <div style={{ display: "flex", alignItems: "baseline", fontFamily: b.font.display, fontWeight: 700, fontSize: size, color: b.color.fg, letterSpacing: "-0.04em" }}>
        {letters.map((ch, i) => {
          const p = spring({ frame: frame - lettersStart - i * 2, fps, config: { damping: 14, stiffness: 160 } });
          return (
            <span key={i} style={{ display: "inline-block", overflow: "hidden", lineHeight: 1.1 }}>
              <span style={{ display: "inline-block", transform: `translateY(${(1 - p) * 110}%)` }}>{ch}</span>
            </span>
          );
        })}
        <span
          style={{
            display: "inline-block",
            width: size * 0.22,
            height: size * 0.22,
            marginLeft: size * 0.06,
            borderRadius: b.radius ? "50%" : 0,
            background: b.color.accent,
            transform: `scale(${dot}) rotate(${(1 - dot) * 90}deg)`,
          }}
        />
      </div>
      )}
      <div
        style={{
          marginTop: 24 * unit,
          fontFamily: b.font.body,
          fontSize: 34 * unit,
          color: b.color.muted,
          opacity: tag,
          transform: `translateY(${(1 - tag) * 20 * unit}px)`,
          textAlign: "center",
          padding: `0 ${60 * unit}px`,
        }}
      >
        {tagline}
      </div>
      <AbsoluteFill style={{ backgroundColor: b.color.accent, transform: `translateX(${blockX}px)` }} />
      <Sfx name="whoosh" />
      <Sfx name="hit" at={lettersStart} />
      <Sfx name="pop" at={dotStart} volume={0.7} />
    </AbsoluteFill>
  );
};

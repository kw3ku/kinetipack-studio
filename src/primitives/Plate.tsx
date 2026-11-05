import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useBrand } from "../brands";
import { useLayout } from "./layout";

// Stand-in for footage: slow drifting colour fields over the brand background.
export const Plate: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBrand();
  const { width, height, unit } = useLayout();
  const blobs = [
    { c: b.color.accent, x: 0.2, y: 0.3, r: 520, s: 0.011 },
    { c: b.color.accent2, x: 0.8, y: 0.7, r: 620, s: 0.008 },
    { c: b.color.muted, x: 0.55, y: 0.15, r: 420, s: 0.013 },
  ];
  return (
    <AbsoluteFill style={{ backgroundColor: b.color.bg, overflow: "hidden" }}>
      {blobs.map((o, i) => {
        const r = o.r * unit;
        const x = o.x * width + Math.sin(frame * o.s + i) * 120 * unit;
        const y = o.y * height + Math.cos(frame * o.s * 1.3 + i) * 90 * unit;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - r,
              top: y - r,
              width: r * 2,
              height: r * 2,
              borderRadius: "50%",
              background: o.c,
              opacity: 0.22,
              filter: `blur(${140 * unit}px)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

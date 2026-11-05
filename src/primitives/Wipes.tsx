import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { useBrand } from "../brands";
import type { TransitionStyle } from "../brands/types";
import { clamp, useLayout } from "./layout";
import { Sfx } from "./Sfx";
import { SlashWipe, WIPE_CUT, WIPE_DURATION } from "./SlashWipe";

export { WIPE_CUT, WIPE_DURATION };

// Circle closes over the frame, then opens from the centre onto the next scene.
const IrisWipe: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBrand();
  const { width, height } = useLayout();
  const full = Math.hypot(width, height) / 2 + 4;
  const close = interpolate(frame, [0, WIPE_CUT - 2], [0, full], { ...clamp, easing: b.ease.snap });
  const open = interpolate(frame, [WIPE_CUT, WIPE_DURATION], [0, full], { ...clamp, easing: b.ease.enter });
  const closing = frame < WIPE_CUT;
  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none" }}>
      {closing ? (
        <AbsoluteFill style={{ background: b.color.accent, clipPath: `circle(${close}px at 50% 50%)` }} />
      ) : (
        // A transparent hole with a huge spread shadow: everything outside the hole stays covered.
        <div
          style={{
            position: "absolute",
            left: width / 2 - open,
            top: height / 2 - open,
            width: open * 2,
            height: open * 2,
            borderRadius: "50%",
            boxShadow: `0 0 0 ${full * 2}px ${b.color.accent}`,
          }}
        />
      )}
    </AbsoluteFill>
  );
};

// Vertical strips fold in left to right, then fold away the same direction.
const BlindsWipe: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBrand();
  const strips = 8;
  return (
    <AbsoluteFill style={{ flexDirection: "row", pointerEvents: "none" }}>
      {Array.from({ length: strips }, (_, i) => {
        const inP = interpolate(frame, [i, WIPE_CUT - 6 + i * 0.75], [0, 1], { ...clamp, easing: b.ease.snap });
        const outP = interpolate(frame, [WIPE_CUT + i * 0.75, WIPE_DURATION - 2 + i * 0.25], [0, 1], { ...clamp, easing: b.ease.snap });
        const out = frame >= WIPE_CUT;
        return (
          <div
            key={i}
            style={{
              flex: 1,
              // Slight overlap hides seams between strips.
              marginRight: -1,
              background: i % 2 ? b.color.accent2 : b.color.accent,
              transform: `scaleX(${out ? 1 - outP : inP})`,
              transformOrigin: out ? "right" : "left",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const WIPES: Record<TransitionStyle, React.FC> = { bands: SlashWipe, iris: IrisWipe, blinds: BlindsWipe };

// The brand's chosen transition. Covers the frame at WIPE_CUT; cut scenes there.
export const BrandWipe: React.FC<{ style?: TransitionStyle }> = ({ style }) => {
  const b = useBrand();
  const Wipe = WIPES[style ?? b.transition];
  return (
    <>
      <Wipe />
      <Sfx name="whoosh" />
    </>
  );
};

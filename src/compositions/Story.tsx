import { AbsoluteFill, Sequence } from "remotion";
import bouncy from "../../brands/example-bouncy/brand.json";
import calm from "../../brands/example-calm/brand.json";
import sharp from "../../brands/example-sharp/brand.json";
import { BrandProvider } from "../brands";
import type { BrandSpec } from "../brands/spec";
import { KineticTitle } from "../primitives/KineticTitle";
import { LogoSting } from "../primitives/LogoSting";
import { Plate } from "../primitives/Plate";
import { BrandWipe, WIPE_CUT, WIPE_DURATION } from "../primitives/Wipes";

// A short problem → solution story for social posts, built only from the primitives.
// Copy it to tell your own story: change BEATS, the showcase brands and the outro.
// The middle beat flips through the example brands to show one engine dressing any brand.

type Beat = { kicker: string; lines: string[]; frames: number };

const BEATS: Beat[] = [
  { kicker: "Every week", lines: ["Great creators.", "Generic videos."], frames: 105 },
  { kicker: "The problem", lines: ["Motion design", "costs too much.", "So most skip it."], frames: 120 },
  { kicker: "So I built", lines: ["One file.", "Your whole brand", "in motion."], frames: 105 },
];
const SHOWCASE = [sharp, calm, bouncy] as BrandSpec[];
const BRAND_FRAMES = 50;
const WHY: Beat = { kicker: "Why it's free", lines: ["Good tools shouldn't", "depend on", "where you live."], frames: 135 };
const OUTRO_FRAMES = 105;
const OUTRO_TAGLINE = "Free · open source · link in reply";

export const STORY_FRAMES =
  BEATS.reduce((n, b) => n + b.frames, 0) + SHOWCASE.length * BRAND_FRAMES + WHY.frames + OUTRO_FRAMES;

export const Story: React.FC<{ spec: BrandSpec }> = ({ spec }) => {
  let t = 0;
  const cuts: number[] = [];
  const next = (frames: number) => {
    const from = t;
    if (from > 0) cuts.push(from);
    t += frames;
    return from;
  };

  const title = (b: Beat) => (
    <Sequence key={b.kicker} from={next(b.frames)} durationInFrames={b.frames}>
      <Plate />
      <KineticTitle kicker={b.kicker} lines={b.lines} />
    </Sequence>
  );

  const beats = BEATS.map(title);
  const showcaseFrom = next(SHOWCASE.length * BRAND_FRAMES);
  const why = title(WHY);
  const outroFrom = next(OUTRO_FRAMES);

  return (
    <BrandProvider spec={spec}>
      <AbsoluteFill style={{ backgroundColor: spec.colors.bg }}>
        {beats}
        {SHOWCASE.map((b, i) => (
          // Hard cuts between brands: the logo sting's own sweep carries the change.
          <Sequence key={b.id} from={showcaseFrom + i * BRAND_FRAMES} durationInFrames={BRAND_FRAMES}>
            <BrandProvider spec={b}>
              <LogoSting tagline={b.copy.tagline} />
            </BrandProvider>
          </Sequence>
        ))}
        {why}
        <Sequence from={outroFrom} durationInFrames={OUTRO_FRAMES}>
          <LogoSting tagline={OUTRO_TAGLINE} />
        </Sequence>
        {cuts.map((cut) => (
          <Sequence key={cut} from={cut - WIPE_CUT} durationInFrames={WIPE_DURATION}>
            <BrandWipe />
          </Sequence>
        ))}
      </AbsoluteFill>
    </BrandProvider>
  );
};

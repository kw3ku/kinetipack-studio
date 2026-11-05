import { AbsoluteFill, Sequence } from "remotion";
import { BrandProvider } from "../brands";
import type { BrandSpec } from "../brands/spec";
import { EndScreen } from "../primitives/EndScreen";
import { KineticTitle } from "../primitives/KineticTitle";
import { LogoSting } from "../primitives/LogoSting";
import { LowerThird } from "../primitives/LowerThird";
import { Plate } from "../primitives/Plate";
import { BrandWipe, WIPE_CUT, WIPE_DURATION } from "../primitives/Wipes";

// Scene cut points, in frames at 30 fps.
const CUTS = [75, 180, 285, 390];
export const SHOWREEL_FRAMES = 480;

// Sizzle reel of the whole pack: the quickest way to judge a brand.
export const Showreel: React.FC<{ spec: BrandSpec }> = ({ spec }) => {
  const [a, b, c, d] = CUTS;
  const { copy } = spec;
  return (
    <BrandProvider spec={spec}>
      <AbsoluteFill style={{ backgroundColor: spec.colors.bg }}>
        <Sequence durationInFrames={a}>
          <LogoSting tagline={copy.tagline} />
        </Sequence>
        <Sequence from={a} durationInFrames={b - a}>
          <Plate />
          <KineticTitle kicker={copy.title.kicker} lines={copy.title.lines} />
        </Sequence>
        <Sequence from={b} durationInFrames={c - b}>
          <Plate />
          <LowerThird name={copy.person.name} role={copy.person.role} />
        </Sequence>
        <Sequence from={c} durationInFrames={d - c}>
          <Plate />
          <KineticTitle kicker={copy.pitch.kicker} lines={copy.pitch.lines} />
        </Sequence>
        <Sequence from={d}>
          <EndScreen heading={copy.end.heading} cta={copy.end.cta} />
        </Sequence>
        {[a, c, d].map((cut) => (
          <Sequence key={cut} from={cut - WIPE_CUT} durationInFrames={WIPE_DURATION}>
            <BrandWipe />
          </Sequence>
        ))}
      </AbsoluteFill>
    </BrandProvider>
  );
};

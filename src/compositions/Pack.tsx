import { AbsoluteFill, Sequence } from "remotion";
import { BrandProvider, useBrand } from "../brands";
import type { BrandSpec } from "../brands/spec";
import { EndScreen } from "../primitives/EndScreen";
import { KineticTitle } from "../primitives/KineticTitle";
import { LogoSting } from "../primitives/LogoSting";
import { LowerThird } from "../primitives/LowerThird";
import { Plate } from "../primitives/Plate";
import type { TransitionStyle } from "../brands/types";
import { BrandWipe, WIPE_CUT } from "../primitives/Wipes";

// One component per deliverable in a brand pack. `overlay` renders on
// transparency for ProRes 4444 export; otherwise a background plate is drawn.
export type PackProps = { spec: BrandSpec; overlay?: boolean };

const Background: React.FC<{ overlay?: boolean }> = ({ overlay }) => {
  const b = useBrand();
  return overlay ? null : <AbsoluteFill style={{ backgroundColor: b.color.bg }}><Plate /></AbsoluteFill>;
};

export const PackIntro: React.FC<PackProps> = ({ spec }) => (
  <BrandProvider spec={spec}>
    <LogoSting tagline={spec.copy.tagline} />
  </BrandProvider>
);

export const PackTitle: React.FC<PackProps> = ({ spec, overlay }) => (
  <BrandProvider spec={spec}>
    <Background overlay={overlay} />
    <KineticTitle kicker={spec.copy.title.kicker} lines={spec.copy.title.lines} />
  </BrandProvider>
);

export const PackLowerThird: React.FC<PackProps> = ({ spec, overlay }) => (
  <BrandProvider spec={spec}>
    <Background overlay={overlay} />
    <LowerThird name={spec.copy.person.name} role={spec.copy.person.role} />
  </BrandProvider>
);

export const PackTransition: React.FC<PackProps> = ({ spec }) => (
  <BrandProvider spec={spec}>
    <BrandWipe />
  </BrandProvider>
);

// Two plain scenes joined by a transition, for picking a style in the builder.
export const TRANSITION_DEMO_FRAMES = 60;
export const TransitionDemo: React.FC<PackProps & { style?: TransitionStyle }> = ({ spec, style }) => {
  const cut = 30;
  return (
    <BrandProvider spec={spec}>
      <Sequence durationInFrames={cut}>
        <DemoScene label="A" inverted={false} />
      </Sequence>
      <Sequence from={cut}>
        <DemoScene label="B" inverted />
      </Sequence>
      <Sequence from={cut - WIPE_CUT}>
        <BrandWipe style={style} />
      </Sequence>
    </BrandProvider>
  );
};

const DemoScene: React.FC<{ label: string; inverted: boolean }> = ({ label, inverted }) => {
  const b = useBrand();
  return (
    <AbsoluteFill
      style={{
        backgroundColor: inverted ? b.color.fg : b.color.bg,
        color: inverted ? b.color.bg : b.color.fg,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: b.font.display,
        fontWeight: 700,
        fontSize: "40vmin",
      }}
    >
      {label}
    </AbsoluteFill>
  );
};

export const PackEndScreen: React.FC<PackProps> = ({ spec }) => (
  <BrandProvider spec={spec}>
    <EndScreen heading={spec.copy.end.heading} cta={spec.copy.end.cta} />
  </BrandProvider>
);

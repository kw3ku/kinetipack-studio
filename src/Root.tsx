import { Composition, Folder } from "remotion";
import example from "../brands/example-sharp/brand.json";
import kinetipack from "../brands/kinetipack/brand.json";
import type { BrandSpec } from "./brands/spec";
import { PackEndScreen, PackIntro, PackLowerThird, PackTitle, PackTransition, type PackProps } from "./compositions/Pack";
import { Showreel, SHOWREEL_FRAMES } from "./compositions/Showreel";
import { Story, STORY_FRAMES } from "./compositions/Story";
import { WIPE_DURATION } from "./primitives/Wipes";

// Studio previews use the example-sharp brand; scripts/make-pack.mjs swaps in any
// brand.json via --props.
const spec = example as BrandSpec;

export const FORMATS = {
  "16x9": { width: 1920, height: 1080 },
  "9x16": { width: 1080, height: 1920 },
  "4x5": { width: 1080, height: 1350 },
  "1x1": { width: 1080, height: 1080 },
} as const;

const pieces: { id: string; component: React.FC<PackProps>; frames: number }[] = [
  { id: "Intro", component: PackIntro, frames: 75 },
  { id: "Title", component: PackTitle, frames: 105 },
  { id: "LowerThird", component: PackLowerThird, frames: 150 },
  { id: "Transition", component: PackTransition, frames: WIPE_DURATION },
  // YouTube end screens must be 5–20 s.
  { id: "EndScreen", component: PackEndScreen, frames: 180 },
];

export const Root: React.FC = () => (
  <>
    {Object.entries(FORMATS).map(([f, size]) => (
      <Folder key={f} name={`f${f}`}>
        {pieces.map((p) => (
          <Composition
            key={p.id}
            id={`${p.id}-${f}`}
            component={p.component}
            durationInFrames={p.frames}
            fps={30}
            {...size}
            defaultProps={{ spec, overlay: false }}
          />
        ))}
        <Composition
          id={`Showreel-${f}`}
          component={Showreel}
          durationInFrames={SHOWREEL_FRAMES}
          fps={30}
          {...size}
          defaultProps={{ spec }}
        />
        {/* Launch story told in the project's own brand; see compositions/Story.tsx. */}
        <Composition
          id={`Story-${f}`}
          component={Story}
          durationInFrames={STORY_FRAMES}
          fps={30}
          {...size}
          defaultProps={{ spec: kinetipack as BrandSpec }}
        />
      </Folder>
    ))}
  </>
);

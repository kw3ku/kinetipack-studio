import { Audio, Sequence, staticFile } from "remotion";
import { useBrand } from "../brands";

// Sound effects made by scripts/make-sounds.mjs; the set follows the brand's feel.
export type SfxName = "whoosh" | "hit" | "pop" | "tick";

export const Sfx: React.FC<{ name: SfxName; at?: number; volume?: number }> = ({ name, at = 0, volume = 1 }) => {
  const b = useBrand();
  if (!b.sound) return null;
  return (
    <Sequence from={at} layout="none">
      <Audio src={staticFile(`sfx/${b.sound}/${name}.wav`)} volume={volume} />
    </Sequence>
  );
};

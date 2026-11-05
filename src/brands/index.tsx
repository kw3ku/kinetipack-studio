import { getAvailableFonts } from "@remotion/google-fonts";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { cancelRender, continueRender, delayRender } from "remotion";
import { toBrand, type BrandSpec } from "./spec";
import type { Brand } from "./types";

const BrandContext = createContext<Brand | null>(null);

export const useBrand = () => {
  const brand = useContext(BrandContext);
  if (!brand) throw new Error("useBrand() used outside <BrandProvider>");
  return brand;
};

const WANTED_WEIGHTS = ["400", "600", "700", "800"];

const loadGoogleFont = async (family: string) => {
  const entry = getAvailableFonts().find((f) => f.fontFamily === family);
  if (!entry) {
    console.warn(`Font "${family}" is not on Google Fonts; falling back to sans-serif`);
    return;
  }
  const font = await entry.load();
  const available = Object.keys(font.getInfo().fonts.normal ?? {});
  const weights = WANTED_WEIGHTS.filter((w) => available.includes(w));
  await font.loadFont("normal", { weights, subsets: ["latin"] }).waitUntilDone();
};

// Loads the spec's fonts (holding the render until they arrive) and provides the brand.
// The first load reuses a handle created during render, as Remotion requires;
// later font changes (e.g. a live preview in an embedding app) take a fresh handle.
export const BrandProvider: React.FC<{ spec: BrandSpec; children: React.ReactNode }> = ({ spec, children }) => {
  const brand = useMemo(() => toBrand(spec), [spec]);
  const [initialHandle] = useState(() => delayRender(`Loading fonts for ${spec.id}`));
  const isFirstLoad = useRef(true);

  useEffect(() => {
    const handle = isFirstLoad.current ? initialHandle : delayRender(`Loading fonts for ${spec.id}`);
    isFirstLoad.current = false;
    Promise.all([...new Set([spec.fonts.display, spec.fonts.body])].map(loadGoogleFont))
      .then(() => continueRender(handle))
      .catch((err) => cancelRender(err));
  }, [spec.fonts.display, spec.fonts.body, spec.id, initialHandle]);

  return <BrandContext.Provider value={brand}>{children}</BrandContext.Provider>;
};

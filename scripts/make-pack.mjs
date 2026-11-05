// Usage: node scripts/make-pack.mjs brands/<id> [--quick]
// Reads <pack>/brand.json, renders every deliverable into <pack>/out/, zips it.
// --quick renders only the 16x9 and 9x16 showreels, for checking a brand fast.
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";

const packDir = resolve(process.argv[2] ?? "");
const quick = process.argv.includes("--quick");
const specPath = join(packDir, "brand.json");
if (!existsSync(specPath)) {
  console.error(`No brand.json in ${packDir}`);
  process.exit(1);
}

const spec = JSON.parse(readFileSync(specPath, "utf8"));
for (const key of ["id", "name", "colors", "fonts", "feel", "corners", "copy"]) {
  if (!(key in spec)) throw new Error(`brand.json is missing "${key}"`);
}

// Logos are served from public/, so copy the brand's file there.
if (spec.logo) {
  const src = join(packDir, spec.logo);
  const dest = `packs/${spec.id}/logo${extname(src)}`;
  mkdirSync(`public/packs/${spec.id}`, { recursive: true });
  copyFileSync(src, join("public", dest));
  spec.logo = dest;
}

const out = join(packDir, "out");
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const render = (id, file, overlay = false) => {
  const propsFile = join(out, ".props.json");
  writeFileSync(propsFile, JSON.stringify({ spec, overlay }));
  const args = ["remotion", "render", "src/index.ts", id, join(out, file), `--props=${propsFile}`];
  if (overlay) args.push("--codec=prores", "--prores-profile=4444", "--pixel-format=yuva444p10le", "--image-format=png");
  console.log(`\n▶ ${file}`);
  execFileSync("npx", args, { stdio: "inherit" });
};

const formats = quick ? ["16x9", "9x16"] : ["16x9", "9x16", "4x5", "1x1"];

for (const f of formats) {
  render(`Showreel-${f}`, `preview/showreel-${f}.mp4`);
  if (quick) continue;
  render(`Intro-${f}`, `${f}/intro.mp4`);
  render(`Title-${f}`, `${f}/title.mp4`);
  render(`LowerThird-${f}`, `${f}/lower-third.mp4`);
  render(`EndScreen-${f}`, `${f}/end-screen.mp4`);
  // Transparent versions to lay over your own footage.
  render(`LowerThird-${f}`, `${f}/overlays/lower-third.mov`, true);
  render(`Title-${f}`, `${f}/overlays/title.mov`, true);
  render(`Transition-${f}`, `${f}/overlays/transition.mov`, true);
}

rmSync(join(out, ".props.json"), { force: true });
if (!quick) {
  const zip = `${spec.id}-brand-pack.zip`;
  execFileSync("zip", ["-qr", zip, "."], { cwd: out, stdio: "inherit" });
  console.log(`\n✔ ${join(out, zip)}`);
}
console.log(`\nDone: ${basename(packDir)}`);

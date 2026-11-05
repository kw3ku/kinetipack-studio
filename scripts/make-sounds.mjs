// Synthesises the pack's sound effects from scratch, so they are free to use anywhere:
// no samples, no downloads, no licences. One set per feel.
// Usage: node scripts/make-sounds.mjs   →  public/sfx/<feel>/<name>.wav
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RATE = 48000;
const PEAK = 0.7; // about -3 dBFS

// Seeded noise so every run produces identical files.
const rng = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const buffer = (seconds) => new Float32Array(Math.round(seconds * RATE));
const lerp = (a, b, t) => a + (b - a) * t;
const expDecay = (t, seconds) => Math.exp((-t / seconds) * 5);

// Band-pass filtered noise with a moving centre frequency (state-variable filter).
const sweptNoise = (out, seed, freqAt, q, gainAt) => {
  const rand = rng(seed);
  let low = 0;
  let band = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / out.length;
    const f = 2 * Math.sin((Math.PI * Math.min(freqAt(t), RATE / 6)) / RATE);
    const high = rand() * 2 - 1 - low - band / q;
    band += f * high;
    low += f * band;
    out[i] += band * gainAt(t);
  }
};

// Sine with a pitch envelope and amplitude envelope; phase accumulates so sweeps stay smooth.
const tone = (out, freqAt, gainAt, { start = 0, harmonics = [1] } = {}) => {
  const phases = harmonics.map(() => 0);
  for (let i = Math.round(start * RATE); i < out.length; i++) {
    const t = i / RATE - start;
    const f = freqAt(t);
    let v = 0;
    harmonics.forEach((h, k) => {
      phases[k] += (2 * Math.PI * f * (k + 1)) / RATE;
      v += Math.sin(phases[k]) * h;
    });
    out[i] += v * gainAt(t);
  }
};

const click = (out, seed, seconds, gain) => {
  const rand = rng(seed);
  const n = Math.round(seconds * RATE);
  for (let i = 0; i < n && i < out.length; i++) out[i] += (rand() * 2 - 1) * gain * (1 - i / n);
};

// Normalise, soft-clip and add 2 ms fades so nothing pops at the edges.
const finish = (out, drive = 1) => {
  for (let i = 0; i < out.length; i++) out[i] = Math.tanh(out[i] * drive);
  let max = 0;
  for (const v of out) max = Math.max(max, Math.abs(v));
  const fade = Math.round(0.002 * RATE);
  for (let i = 0; i < out.length; i++) {
    const edge = Math.min(1, i / fade, (out.length - 1 - i) / fade);
    out[i] = (out[i] / (max || 1)) * PEAK * edge;
  }
  return out;
};

const whoosh = ({ seconds, from, peak, to, q, peakAt, seed }) => {
  const out = buffer(seconds);
  const shape = (t) => (t < peakAt ? Math.pow(t / peakAt, 2) : Math.pow(1 - (t - peakAt) / (1 - peakAt), 1.6));
  sweptNoise(out, seed, (t) => (t < peakAt ? lerp(from, peak, t / peakAt) : lerp(peak, to, (t - peakAt) / (1 - peakAt))), q, shape);
  return finish(out);
};

const sounds = {
  sharp: {
    whoosh: () => whoosh({ seconds: 0.42, from: 400, peak: 5200, to: 1800, q: 1.4, peakAt: 0.55, seed: 11 }),
    hit: () => {
      const out = buffer(0.5);
      tone(out, (t) => 42 + 90 * Math.exp(-t * 28), (t) => expDecay(t, 0.4));
      click(out, 12, 0.008, 0.9);
      sweptNoise(out, 13, () => 2400, 0.8, (t) => expDecay(t, 0.05) * 0.5);
      return finish(out, 2.2);
    },
    pop: () => {
      const out = buffer(0.12);
      tone(out, (t) => 1500 - 600 * Math.min(1, t * 30), (t) => expDecay(t, 0.09));
      click(out, 14, 0.003, 0.6);
      return finish(out);
    },
    tick: () => {
      const out = buffer(0.05);
      tone(out, () => 2600, (t) => expDecay(t, 0.03), { harmonics: [1, 0.3] });
      click(out, 15, 0.002, 0.5);
      return finish(out);
    },
  },
  calm: {
    whoosh: () => whoosh({ seconds: 0.95, from: 250, peak: 2200, to: 600, q: 2.2, peakAt: 0.5, seed: 21 }),
    hit: () => {
      // A soft swell rather than a punch: warm low tone plus a gentle major-third bell.
      const out = buffer(1.6);
      const swell = (t) => Math.min(1, t / 0.03) * expDecay(t, 1.4);
      tone(out, () => 98, (t) => swell(t) * 0.8, { harmonics: [1, 0.25] });
      tone(out, () => 523.25, (t) => swell(t) * 0.22, { harmonics: [1, 0.1] });
      tone(out, () => 659.25, (t) => swell(t) * 0.16, { start: 0.04 });
      return finish(out);
    },
    pop: () => {
      const out = buffer(0.3);
      tone(out, () => 880, (t) => expDecay(t, 0.25), { harmonics: [1, 0.3, 0.1] });
      return finish(out);
    },
    tick: () => {
      const out = buffer(0.09);
      tone(out, () => 1320, (t) => Math.min(1, t / 0.004) * expDecay(t, 0.07));
      return finish(out);
    },
  },
  bouncy: {
    whoosh: () => whoosh({ seconds: 0.5, from: 600, peak: 4200, to: 2600, q: 3, peakAt: 0.4, seed: 31 }),
    hit: () => {
      const out = buffer(0.45);
      tone(out, (t) => 55 + 140 * Math.exp(-t * 35), (t) => expDecay(t, 0.3));
      // Pluck an octave-up fifth on top so it lands playful, not heavy.
      tone(out, () => 784, (t) => expDecay(t, 0.18) * 0.35, { start: 0.01, harmonics: [1, 0.4] });
      tone(out, () => 1175, (t) => expDecay(t, 0.15) * 0.25, { start: 0.06 });
      return finish(out, 1.6);
    },
    pop: () => {
      const out = buffer(0.16);
      tone(out, (t) => 380 + 900 * Math.min(1, t / 0.04), (t) => expDecay(t, 0.12));
      return finish(out);
    },
    tick: () => {
      const out = buffer(0.07);
      tone(out, (t) => 1600 + 1400 * Math.min(1, t / 0.02), (t) => expDecay(t, 0.05));
      return finish(out);
    },
  },
};

const wav = (samples) => {
  const data = Buffer.alloc(samples.length * 2);
  samples.forEach((v, i) => data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), i * 2));
  const head = Buffer.alloc(44);
  head.write("RIFF", 0);
  head.writeUInt32LE(36 + data.length, 4);
  head.write("WAVEfmt ", 8);
  head.writeUInt32LE(16, 16);
  head.writeUInt16LE(1, 20); // PCM
  head.writeUInt16LE(1, 22); // mono
  head.writeUInt32LE(RATE, 24);
  head.writeUInt32LE(RATE * 2, 28);
  head.writeUInt16LE(2, 32);
  head.writeUInt16LE(16, 34);
  head.write("data", 36);
  head.writeUInt32LE(data.length, 40);
  return Buffer.concat([head, data]);
};

for (const [feel, set] of Object.entries(sounds)) {
  const dir = join("public", "sfx", feel);
  mkdirSync(dir, { recursive: true });
  for (const [name, make] of Object.entries(set)) {
    const samples = make();
    writeFileSync(join(dir, `${name}.wav`), wav(samples));
    console.log(`${feel}/${name}.wav  ${(samples.length / RATE).toFixed(2)}s`);
  }
}

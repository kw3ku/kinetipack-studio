# Brands

One folder per brand. The only file you have to write is `brand.json`.

```
brands/<id>/
├── brand.json   the brand spec
├── logo.png     optional; set "logo": "logo.png" in brand.json
└── out/         rendered videos (git-ignored)
```

Start by copying an example:

```bash
cp -r brands/example-sharp brands/my-channel
# edit brands/my-channel/brand.json, then:
npm run pack -- brands/my-channel --quick
```

## brand.json fields

| Field | Type | Notes |
|---|---|---|
| `id` | string | Folder-safe name, e.g. `my-channel` |
| `name` | string | Shown as the wordmark when there is no logo |
| `logo` | string or `null` | File name inside the brand folder (PNG/SVG with transparency works best) |
| `colors.bg` / `fg` | hex | Background and main text |
| `colors.accent` / `accent2` | hex | Wipes, rules, highlighted words |
| `colors.muted` | hex | Secondary text |
| `fonts.display` / `body` | string | Any [Google Fonts](https://fonts.google.com) family name |
| `feel` | `sharp` · `calm` · `bouncy` | Sets easing, timing, wipe angle and sound set |
| `corners` | `sharp` · `round` | Card radius |
| `transition` | `bands` · `iris` · `blinds` | Optional, defaults to `bands` |
| `sound` | `on` · `off` | Optional, defaults to `on` |
| `copy.*` | strings | Text for the intro, title, lower third, pitch card and end screen |

The examples (Northline, Harbour, Pop Club) are made-up brands. Use them freely.

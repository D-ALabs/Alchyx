# @alchyx/assets

The D-ALabs marks, in the shape the rest of Alchyx expects: **one geometry, three
skins, no hardcoded colour outside the generator.**

```bash
pnpm add @alchyx/assets
```

## What's in here

| Folder | What it is |
|---|---|
| [`marks/`](marks) | The three marks as `currentColor` SVG. **Source of truth for shape.** |
| [`skins/`](skins) | Generated. Each mark pinned to each skin's colour — 3 × 3 files. |
| [`raster/`](raster) | The original d-alabs-website bitmaps the marks were drawn from. |

| Mark | viewBox | What it is |
|---|---|---|
| `alchemist` | `0 0 814 1024` | The hooded figure holding the flask. The house character mark. |
| `flask` | `40 40 890 952` | The Erlenmeyer glyph — the one inside the wordmark's `A`. |
| `wordmark` | `0 0 1024 185` | The full **D-⚗Labs** lockup. |

## Which file do I want?

**Inline the master when you can.** It fills with `currentColor`, so it inherits
whatever ink or accent its context carries and re-tints the instant `data-theme`
changes — the same contract every Alchyx component holds to.

```tsx
import alchemist from "@alchyx/assets/marks/alchemist.svg";

// or, inlined so currentColor actually resolves:
<span style={{ color: "var(--accent)" }} dangerouslySetInnerHTML={{ __html: svg }} />
```

**Reach for `skins/` only where `currentColor` cannot follow** — `<img src>`,
`background-image`, favicons, OG images, email:

```tsx
import { skinUrl } from "@alchyx/assets";

<img src={skinUrl("alchemist", "ark").href} alt="" />
```

```html
<link rel="icon" href="@alchyx/assets/skins/flask-ark.svg" />
```

## How a skin gets its colour

`scripts/build-svg.mjs` reads `packages/tokens/src/css/tokens.css` and pins each
master's `currentColor` to a role from that skin's own block:

| Skin | Role | Value | Why |
|---|---|---|---|
| **Lab** | `--ink` | `#16202e` | Paper & ink. Navy mark on light — the existing house treatment. |
| **Dark** | `--ink` | `#ece7db` | Slate & bone. The same mark, inverted. |
| **Ark** | `--accent` | `#d9ae63` | Abyss & gold. Ark's identity *is* the gold, so the mark takes the accent. |

Colours are never typed into this package — they are read from the token sheet
every build, which is what stops a mark drifting away from the skin it claims.
Re-tint the whole set after a token change with:

```bash
pnpm --filter @alchyx/assets build
```

`pnpm --filter @alchyx/assets check` regenerates and fails if the committed
files no longer match the tokens.

## Provenance

`marks/alchemist.svg` and `marks/wordmark.svg` are traced from the bitmaps in
`raster/` (marching squares, Douglas–Peucker) — 12 and 11 contours, ~4 KB and
~2 KB, one even-odd path each.

`marks/flask.svg` is **not** traced. It is drawn with real curves, because it is
the one mark that has to hold together at 16 px as a favicon, and a polyline
approximation visibly breaks down there.

The `raster/` originals are kept unmodified as the record of what the vectors
were derived from — they are provenance, not delivery. Prefer the SVGs.

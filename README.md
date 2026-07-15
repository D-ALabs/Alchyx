<div align="center">

# Alchyx

**Alchyx** /ˈælkɪks/ — like *alchemy*.

D-ALabs' Ultimate Design System — one coherent **React + TypeScript** library on the
D-ALabs **Lab / Dark / Ark** design language, consolidating the best of eight
MIT-licensed design systems into a single API.

`MIT` · `0.2.0-beta.1` · by **D-ALabs, LLC**

</div>

---

> **The name.** *Alchyx* = *alchemy* + the terminal **x**. The **x** is alchemy's
> **transmutation variable** — the unknown you solve for — and the mark of an
> e**X**tensible system: change one attribute and the whole surface transmutes.
> Set `data-accent`, flip `data-theme`, and every color, shadow, and focus ring
> re-tints at once. Pronounced **/ˈælkɪks/**, the way *alchemy* starts.

## What is Alchyx?

Every mainstream React design system solves the same problems a little
differently. Alchyx takes the strongest ideas from **eight** of them —
[shadcn/ui](https://github.com/shadcn-ui/ui),
[Radix Primitives](https://github.com/radix-ui/primitives),
[Base UI](https://github.com/mui/base-ui),
[Meta Astryx](https://github.com/facebook/astryx),
[Microsoft Fluent UI](https://github.com/microsoft/fluentui),
[GitHub Primer](https://github.com/primer/react),
[Twilio Paste](https://github.com/twilio-labs/paste), and
[Ant Design](https://github.com/ant-design/ant-design) — and unifies them under
**one design language and one component API**:

- **Token-driven, three skins.** Everything reads CSS variables, so a single
  `data-theme` (Lab / Dark / Ark) and optional `data-accent` re-tints the whole
  tree at runtime. No hardcoded hex.
- **Headless behavior, on-brand styling.** Accessible, keyboard-complete
  behavior (the Radix / Base UI / Astryx school) styled with the D-ALabs
  language (the shadcn model) — not a wrapper around any one library.
- **One accent, a mono-caps label layer, calm motion.** The signature D-ALabs
  moves are built in: Space Grotesk / Hanken Grotesk / Space Mono, a single
  accent per surface, fixed semantic status hues, and slow, deliberate motion
  that always honors `prefers-reduced-motion`.
- **Plain CSS *and* Tailwind.** Components ship as plain CSS over the token
  variables. Tailwind CSS 4 consumes the CSS-first theme bridge; the original
  Tailwind 3 preset remains as a deprecated compatibility adapter.

## Packages

| Package | What it is |
|---|---|
| [`@alchyx/tokens`](packages/tokens) | Framework-agnostic Lab/Dark/Ark tokens, accessible accent/status/syntax roles, CSS foundation, typed values, and Tailwind 3/4 adapters. |
| [`@alchyx/react`](packages/react) | 31 React components, form-aware controls, nested overlay coordination, behavior primitives, and `AlchyxProvider`. |
| [`@alchyx/assets`](packages/assets) | The D-ALabs marks — alchemist, flask, wordmark — as `currentColor` SVG plus Lab/Dark/Ark variants generated from the tokens. |
| `@alchyx/cli` *(planned)* | Scaffolding + component sync. Global binary **`alchyx`** (see [CLI](#cli)). |
| [`apps/playground`](apps/playground) | A focused Vite integration harness for Button, package CSS, all three skins, and live accent switching. |

## Install

```bash
pnpm add @alchyx/react @alchyx/tokens
# peers: react >= 18 < 20, react-dom >= 18 < 20
```

## Quick start

```tsx
import "@alchyx/tokens/css";        // design-token variables (once, at your root)
import "@alchyx/react/styles.css";  // all component styles
import { AlchyxProvider, Button } from "@alchyx/react";

export function App() {
  return (
    <AlchyxProvider defaultSkin="lab">
      <Button>
        Request a demo <span aria-hidden>→</span>
      </Button>
    </AlchyxProvider>
  );
}
```

## Theming — three skins, one accent

`AlchyxProvider` sets `data-theme` (and optional `data-accent`) and exposes them
via context. Everything downstream reads CSS variables, so a change re-tints the
whole subtree.

| Skin | `data-theme` | Feel | Default accent |
|---|---|---|---|
| **Lab** | `lab` (default) | Paper & ink, light, technical | Monochrome ink |
| **Dark** | `dark` | Slate & bone, low-glare | Paper |
| **Ark** | `ark` | Abyss & gold, premium / membership | Gold |
| **Lembic** | `lembic` | Parchment & gold — Ark read in daylight | Gold |

```tsx
import { useAlchyx } from "@alchyx/react";

function SkinSwitch() {
  const { skin, setSkin, setAccent } = useAlchyx();
  return (
    <>
      <button onClick={() => setSkin("dark")}>Dark</button>
      <button onClick={() => setAccent("mint")}>Mint accent</button>
      <code>{skin}</code>
    </>
  );
}
```

Accents per skin — **Lab:** monochrome · mint · blue · amber ·
**Dark:** paper · mint · blue · amber · **Ark:** gold · amber · ivory · bronze ·
**Lembic:** gold · bronze · amber.

**Lembic** is Ark's light counterpart, and the pair is why a skin is not just an
inverted palette. In Ark the gold is both the fill and the copy; on parchment
copy in `#d9ae63` sits at 1.9:1, so Lembic keeps the gold for fills and drops
`--accent-fg` to bronze `#7a4e0b`. Ivory is absent for the same reason — an
accent that can only decorate is not an accent. Read `--accent` for fills and
`--accent-fg` for text and both skins stay correct on their own.
Provider works controlled or uncontrolled, and can drive the document `<html>`
instead of a wrapper (`as="html"`).

Code editors, transcripts, and documentation can consume the canonical
`syntaxPalettes[skin]` typed palette or the matching `--syntax-*` CSS variables.
The nine roles cover comments, keywords, functions, variables, strings,
numbers, types, operators, and punctuation while ordinary code inherits the
skin's normal ink. Every syntax foreground is contrast-checked on its skin's
code-capable surfaces.

## Tailwind CSS 4 (optional)

```css
@import "tailwindcss";
@import "@alchyx/tokens/css";
@import "@alchyx/tokens/tailwind.css";
```

Utilities such as `bg-surface`, `text-ink`, `border-bd`, `rounded-card`, and
`font-display` now read the active skin variables.

### Tailwind CSS 3 compatibility

```js
// tailwind.config.js
import { alchyxPreset } from "@alchyx/tokens/tailwind";

export default {
  presets: [alchyxPreset],
  content: ["./src/**/*.{ts,tsx}"],
};
```

`@alchyx/tokens/tailwind` is deprecated and remains available through the 0.x
line for existing Tailwind CSS 3 consumers.

## Design tokens

The token contract (identical across all three skins) is documented in
[`packages/tokens`](packages/tokens/src/css/tokens.css) and mirrored as typed JS:

```ts
import {
  skins,
  getAccentPalette,
  statusPalettes,
  radius,
} from "@alchyx/tokens";
skins.ark.accent;         // "#D9AE63"
getAccentPalette("ark", "amber").accent; // "#E2A338"
statusPalettes.lab.signal.foreground;      // accessible status text
radius.card;              // 16
```

Colors step, they don't jump: `--ink → --sub → --faint` for text,
`--bg → --surface → --surface2` for backgrounds, `--bd → --bd2 → --bd-hov` for
lines, one `--accent` plus role-specific `--accent-fg` (accent copy),
`--accent-text` (copy on an accent fill), and `--focus-ring`. Semantic statuses
pair solid indicator hues with `--status-*-foreground` and `--status-*-surface`.
Full reference:
[`docs/COMPONENT_SPEC.md`](docs/COMPONENT_SPEC.md).

## Components

Available in `0.2.0-beta.1`:

- **Stable** — Alert, Avatar, Badge, Breadcrumbs, Button, Card, Checkbox,
  IconButton, Input, Kbd, Pagination, Progress, Select, Separator, Skeleton,
  Spinner, Stat, Table, Tag, and Textarea.
- **Beta** — Accordion, Dialog, Drawer, DropdownMenu, RadioGroup,
  SegmentedControl, Slider, Switch, Tabs, Toast, and Tooltip.
- **Foundations** — `AlchyxProvider` / `useAlchyx`, `Slot`, provider-aware
  `Portal`, controllable state, focus trapping, top-layer dismissal, and
  reference-counted scroll locking.

Custom form controls participate in native `FormData` and form reset through
`name`, `value`, `required`, `disabled`, and `form` props. Beta marks API
maturity, not an exemption from keyboard or accessibility requirements.

New components follow the authoring contract in
[`docs/COMPONENT_SPEC.md`](docs/COMPONENT_SPEC.md).

## CLI

The forthcoming **`@alchyx/cli`** exposes a single global binary, **`alchyx`**,
for scaffolding and syncing components into a project:

```bash
npx @alchyx/cli add dialog tabs toast
```

In terminals and agent calls you usually want the three-letter **`alx`**. Since
the bare `alx` bin name is already taken on npm, expose it **locally** as a
package script rather than a global bin (the same approach Astryx uses):

```jsonc
// package.json
{
  "scripts": { "alx": "alchyx" }
}
```

```bash
npm run alx add dialog
```

So: `@alchyx/cli` owns the global `alchyx`; `alx` stays a per-project alias — no
global bin collision, three keystrokes where it counts.

## Playground

```bash
pnpm install
pnpm playground     # Vite dev server → http://localhost:5173
```

Toggle Lab / Dark / Ark and each skin's accent set live while checking Button's
variants, sizes, loading state, and `asChild` integration. The full 31-component
catalog lives in the Alchyx documentation site; this app stays deliberately
small so it remains a fast workspace/package smoke test.

## Repository layout

```
alchyx/
├── packages/
│   ├── tokens/      @alchyx/tokens — CSS variables · typed tokens · Tailwind preset
│   └── react/       @alchyx/react  — components + headless behavior primitives
├── apps/
│   └── playground/  focused Vite integration harness (3 skins + accents)
├── docs/
│   └── COMPONENT_SPEC.md   component authoring contract (token list, a11y rules)
├── LICENSE          MIT © 2026 D-ALabs
└── NOTICE           third-party attribution
```

## Development

Requires **Node ≥ 18** and **pnpm 10**.

```bash
pnpm install
pnpm typecheck            # strict TS across the workspace
pnpm test                 # token contracts + DOM/interaction/a11y tests
pnpm check                # generated files, types, tests, and builds
pnpm pack:smoke           # packed-package installs on React 18 and React 19
pnpm playground          # dev server (HMR)
pnpm build               # build @alchyx/tokens + @alchyx/react
pnpm build:playground    # static build of the gallery
```

## Canonical identifiers

To keep the name unambiguous across registries, the project reserves:
`@alchyx/*` on npm (`@alchyx/tokens`, `@alchyx/react`, `@alchyx/cli`), the
GitHub org/repo **`alchyx`**, and the **`alchyx.dev`** domain. Please route
issues and packages through these rather than look-alikes.

## Credits

Alchyx is built on the **D-ALabs design language** (the Lab / Dark / Ark skins,
the Space Grotesk / Hanken Grotesk / Space Mono type bench, and the calm-motion
system). Its component APIs consolidate ideas from eight MIT-licensed design
systems — full attribution in [`NOTICE`](NOTICE). The three typefaces are SIL
Open Font License 1.1.

## License

[MIT](LICENSE) © 2026 D-ALabs, LLC. Third-party notices in
[`NOTICE`](NOTICE).

<div align="center">

# Alchyx

**Alchyx** /ˈælkɪks/ — like *alchemy*.

D-ALabs' Ultimate Design System — one coherent **React + TypeScript** library on the
D-ALabs **Lab / Dark / Ark** design language, consolidating the best of eight
MIT-licensed design systems into a single API.

`MIT` · `alpha (0.1.0)` · by **D-ALabs, LLC**

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
  variables, and `@alchyx/tokens/tailwind` maps every token to a Tailwind preset
  so utility classes re-tint the same way.

## Packages

| Package | What it is |
|---|---|
| [`@alchyx/tokens`](packages/tokens) | The D-ALabs language, framework-agnostic: CSS-variable skins (Lab/Dark/Ark + accents), reset, fonts, keyframes, utilities, a typed token object, and the Tailwind preset. |
| [`@alchyx/react`](packages/react) | The React component library + headless behavior primitives (`Slot`/`asChild`, controllable state, focus trap, portal, dismissable layer) and `AlchyxProvider`. |
| `@alchyx/cli` *(planned)* | Scaffolding + component sync. Global binary **`alchyx`** (see [CLI](#cli)). |
| [`apps/playground`](apps/playground) | A Vite gallery that renders every component across all three skins with a live accent switcher. |

## Install

```bash
pnpm add @alchyx/react @alchyx/tokens
# peers: react >= 18, react-dom >= 18
```

## Quick start

```tsx
import "@alchyx/tokens/css";        // design-token variables (once, at your root)
import "@alchyx/react/styles.css";  // component styles
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
**Dark:** paper · mint · blue · amber · **Ark:** gold · amber · ivory · bronze.
Provider works controlled or uncontrolled, and can drive the document `<html>`
instead of a wrapper (`as="html"`).

## Tailwind (optional)

```js
// tailwind.config.js
import { alchyxPreset } from "@alchyx/tokens/tailwind";

export default {
  presets: [alchyxPreset],
  content: ["./src/**/*.{ts,tsx}"],
};
```

```tsx
// utilities now resolve to the active skin/accent:
<div className="bg-surface text-ink border border-bd rounded-card shadow-card font-display">…</div>
```

## Design tokens

The token contract (identical across all three skins) is documented in
[`packages/tokens`](packages/tokens/src/css/tokens.css) and mirrored as typed JS:

```ts
import { tokens, skins, accentsBySkin, status, radius } from "@alchyx/tokens";
skins.ark.accent;         // "#D9AE63"
status.signal;            // "#13B981" — Signal / Live / pass
radius.card;              // 16
```

Colors step, they don't jump: `--ink → --sub → --faint` for text,
`--bg → --surface → --surface2` for backgrounds, `--bd → --bd2 → --bd-hov` for
lines, one `--accent` (+ `--accent-ink`, `--accent-soft`). Full reference:
[`docs/COMPONENT_SPEC.md`](docs/COMPONENT_SPEC.md).

## Components

Shipped in `0.1.0`:

- **Foundations** — `AlchyxProvider` / `useAlchyx`, `Slot` (`asChild`), `Portal`,
  `VisuallyHidden`, `useControllableState`, `useId`, `useComposedRefs`,
  `useDismissable`, `useFocusTrap`, `useScrollLock`.
- **Button** — variants (primary / secondary / ghost / inverse / link), sizes,
  `asChild`, `loading`.

On the roadmap for `0.1` (core set): Label, Separator, Badge, Card, Avatar,
Skeleton, Spinner, Progress, Alert, IconButton, Input, Textarea, Checkbox,
Switch, RadioGroup, Select, Tabs, Accordion, Breadcrumb, Tooltip, Dialog, Toast.

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

Toggle Lab / Dark / Ark and the accent set live; every component is shown as a
labeled specimen in the D-ALabs card frame.

## Repository layout

```
alchyx/
├── packages/
│   ├── tokens/      @alchyx/tokens — CSS variables · typed tokens · Tailwind preset
│   └── react/       @alchyx/react  — components + headless behavior primitives
├── apps/
│   └── playground/  Vite gallery (3 skins, accent switcher)
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

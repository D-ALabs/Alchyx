# Alchyx Component Authoring Contract

You are adding **one** component to the Alchyx React library (`packages/react`).
Alchyx is the D-ALabs "Ultimate Design System": one coherent, accessible React +
TypeScript library on the D-ALabs **Lab / Dark / Ark** design language,
consolidating the best APIs of shadcn/ui, Radix Primitives, Base UI, Meta Astryx,
Fluent UI, GitHub Primer, Twilio Paste, and Ant Design. Follow this contract
**exactly** so 22 independently-authored components come out as one system.

The canonical reference is the already-built **Button**:
`packages/react/src/components/button/{Button.tsx,button.css,index.ts}`. Match its
structure, quality, and conventions.

---

## 1. File layout (exact)

Create a folder `packages/react/src/components/<dir>/` where `<dir>` is the
kebab-case component name, containing exactly:

- `<PascalName>.tsx` — the component(s). (Compound components live in one file.)
- `<dir>.css` — the styles. **Filename must equal `<dir>.css`.**
- `index.ts` — re-exports the component(s) and their types.

The `.tsx` file must `import "./<dir>.css";` at the top so styles are co-located.

Do **not** edit the shared barrel (`src/index.ts`) or master stylesheet
(`src/index.css`) — the integrator regenerates those by scanning folders.

## 2. Imports — what you may use

- React: `import * as React from "react";`
- Class combiner: `import { cn } from "../../lib/cn";`
- `asChild` support: `import { Slot } from "../../lib/Slot";`
- Behavior primitives from `../../lib` (already built, do not re-implement):
  `useControllableState`, `useId`, `useComposedRefs`, `Portal`, `VisuallyHidden`,
  `useDismissable`, `useFocusTrap`, `useScrollLock`, `useIsomorphicLayoutEffect`.
- Design tokens (types/values) if needed: `import { ... } from "@alchyx/tokens";`

**No other dependencies.** No Radix, no clsx, no framer-motion, no positioning
libs. React + `react-dom` (peers) only.

## 3. TypeScript conventions

- `React.forwardRef` for any component that renders a DOM element. Give it a
  named function so the displayName is set: `forwardRef<HTMLXElement, XProps>(function X(...))`.
- Props interface `XProps extends React.ComponentPropsWithoutRef<"element">` (or
  the right `*HTMLAttributes`) so consumers can pass `className`, `id`, `aria-*`,
  data-attrs, and handlers. Always merge incoming `className` with `cn(...)`, and
  spread `{...props}` last (after your defaults) so consumers can override.
- Offer `asChild?: boolean` (via `Slot`) on single-element components where
  polymorphism is useful (triggers, items, the root of layout components).
- Controlled/uncontrolled state uses `useControllableState` — expose
  `value`/`defaultValue`/`onValueChange` (or `open`/`defaultOpen`/`onOpenChange`,
  `checked`/`defaultChecked`/`onCheckedChange`, etc., matching the pattern).
- Generate ARIA ids with `useId`.
- Strict TS: no `any` leaks in public types, no unused vars/params (the repo runs
  `noUnusedLocals`/`noUnusedParameters`), no non-null assertions on possibly-null
  DOM. It must compile under the repo's strict config.

## 4. Styling rules — the D-ALabs language

- Class names: BEM-ish, all prefixed `alx-<comp>`. Root `.alx-<comp>`, parts
  `.alx-<comp>__part`, variants `.alx-<comp>--variant`. Never collide with other
  components.
- **Only** use the CSS variables below (plus the three semantic status hexes).
  Never hardcode any other color, and never use pure black/white (paper is
  `#F5F2EA`, ink is `#16202E`). Because everything reads variables, your component
  automatically works in all three skins — **do not** write skin-specific rules
  unless a value genuinely differs per skin (rare).
- Radius vocabulary (use these, don't invent): controls/inputs
  `var(--radius-control)` = 11px (compact `--radius-control-sm` = 10px), cards
  `var(--radius-card)` = 16px, panels/modals `var(--radius-panel)` = 18px (biggest
  `--radius-panel-lg` = 22px), pills/toggles/badges `var(--radius-pill)` = 100px,
  avatars/dots `50%`.
- Typography — three roles, no substitutes:
  - `var(--font-display)` (Space Grotesk 600): headings, card titles, stat numerals.
  - `var(--font-sans)` (Hanken Grotesk 400): body, labels, button text.
  - `var(--font-mono)` (Space Mono 400): eyebrows, specs, table headers, metadata,
    breadcrumbs, badges — **always `text-transform: uppercase` + wide tracking
    `.1em`–`.2em`.** This mono-caps layer is the signature.
- One accent only: `var(--accent)` fill, `var(--accent-ink)` text on it,
  `var(--accent-soft)` for hover fills/focus halos. Never introduce a second brand
  hue. Semantic status colors are the only exception.
- Motion is slow/calm. Easings: `var(--ease-expo)` = `cubic-bezier(.16,1,.3,1)`
  (entrances, hover-lift), `var(--ease-spring)` = `cubic-bezier(.2,.9,.3,1.2)`
  (toggle knob, press). Hover/border transitions `.2s–.3s`. Reuse keyframes from
  tokens: `alx-blink`, `alx-shimmer`, `alx-spin`, `alx-revealUp`. **Every** motion
  must degrade under `@media (prefers-reduced-motion: reduce)`.
- Focus: visible focus for keyboard users via `:focus-visible` — either
  `outline: 2px solid var(--accent); outline-offset: 2px;` or an accent border /
  `0 0 0 3px var(--accent-soft)` halo. Never remove focus styling without a
  replacement.
- Deep bands: components meant to sit on `var(--deep)` (tooltip, toast) use the
  deep text ramp `--deep-ink`/`--deep-sub`/`--deep-faint` and background `--deep`.

### CSS variable reference (the only colors you may use)

Backgrounds: `--bg` (page), `--surface` (cards), `--surface2` (translucent inset:
inputs, wells, pills), `--deep`, `--deep2` (near-black bands), `--panel`,
`--panel-bd`.
Text: `--ink` (primary), `--ink2`, `--sub` (secondary/body), `--faint` (mono
labels/meta). On deep bands: `--deep-ink`, `--deep-sub`, `--deep-faint`.
Lines: `--bd` (default hairline), `--bd2` (fainter divider), `--bd-hov` (hover /
emphasis / "slash" separator). Inputs: `--input-bd`.
Accent: `--accent`, `--accent-ink`, `--accent-soft`. Inverse fill on deep:
`--inv-bg`, `--inv-tx`.
Pills/chips: `--pill-bd`, `--pill-tx`, `--chip-bd`, `--chip-bg`, `--chip-tx`.
Avatars: `--av-bg`, `--av-tx`, `--av-bd`. Stat numerals: `--stat`.
Shadows: `--sh-card` (hover lift), `--sh-btn` (accent button glow). Grid/texture:
`--grid`, `--grid-deep`.
Radii: `--radius-control`, `--radius-control-sm`, `--radius-card`, `--radius-panel`,
`--radius-panel-lg`, `--radius-pill`.
Easing: `--ease-expo`, `--ease-spring`. Fonts: `--font-display`, `--font-sans`,
`--font-mono`.
**Semantic status hues — the only hardcoded hex allowed:** Signal/Live/pass
`#13B981`, Caution/Training `#D98A2B`, Fault/error `#C25E54`. (Also available as
`--status-signal` / `--status-caution` / `--status-fault`.)

## 5. Accessibility (required)

- Correct semantics/roles, ARIA relationships (`aria-labelledby`,
  `aria-describedby`, `aria-controls`, `aria-expanded`, `aria-selected`,
  `aria-checked`, `role="dialog"` + `aria-modal`, etc.) wired with `useId`.
- Full keyboard support for the pattern (Tab, Arrow keys + roving tabindex for
  composites like Tabs/RadioGroup, Enter/Space activation, Escape to dismiss
  overlays, Home/End where idiomatic).
- Icon-only controls get an accessible name (`aria-label` or `VisuallyHidden`).
- Respect `prefers-reduced-motion`.
- Don't trap keyboard users; manage focus for overlays (use `useFocusTrap`).

## 6. Quality bar

- Production-grade, self-contained, compiles under strict TS, no console errors.
- Sensible, minimal, well-typed public API; JSDoc on the component and non-obvious
  props. Draw the API shape from the named source systems but keep it coherent
  with the rest of Alchyx (match Button's feel).
- The `.tsx` imports its `./<dir>.css`. The `index.ts` exports the component(s) +
  every public type.
- Keep unique export names (prefix subparts with the component name:
  `DialogTitle`, not `Title`) to avoid barrel collisions.

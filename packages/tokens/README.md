# `@alchyx/tokens`

Framework-agnostic D-ALabs design tokens for the Lab, Dark, and Ark skins. The
package includes runtime CSS variables, typed JavaScript values, and Tailwind
CSS adapters.

## CSS and typed tokens

Import the CSS foundation once, then put `data-theme` and optionally
`data-accent` on the application root.

```ts
import "@alchyx/tokens/css";
import {
  accentPalettes,
  defaultAccentBySkin,
  getAccentPalette,
  skins,
} from "@alchyx/tokens";

const palette = getAccentPalette("ark", "amber");
```

`getAccentPalette()` falls back to `defaultAccentBySkin[skin]` when a stored
accent does not belong to the active skin. Its `accentText` and `focusRing`
roles meet the contrast contracts checked by this package. `accentHex` remains
available for compatibility, but is deprecated because one value per accent
name cannot represent skin-specific values such as Ark amber.

Use `var(--accent-fg)` for accessible accent-colored text or icons on the
skin's `--bg` and `--surface`. Use `var(--accent-text)` for content on an
accent-filled control and `var(--focus-ring)` for focus indication. The older
`--accent-ink` name remains an accessible alias of `--accent-text`. Semantic statuses expose
`--status-{signal|caution|fault}-{foreground|surface}` pairs.

## Tailwind CSS

Tailwind CSS v4 uses the CSS-first bridge:

```css
@import "tailwindcss";
@import "@alchyx/tokens/css";
@import "@alchyx/tokens/tailwind.css";
```

This creates utilities such as `bg-surface`, `text-ink`,
`text-accent-text`, `outline-focus-ring`, `rounded-card`, and `shadow-card`.

The JavaScript preset at `@alchyx/tokens/tailwind` remains available for
Tailwind CSS v3 projects, but is deprecated for new integrations.

## Package checks

```sh
pnpm --filter @alchyx/tokens typecheck
pnpm --filter @alchyx/tokens check
```

`check` builds ESM, CommonJS, declarations, and CSS, then validates the export
contract, complete `cssVar` coverage, deterministic CSS copies, palette
fallbacks, and WCAG contrast thresholds.

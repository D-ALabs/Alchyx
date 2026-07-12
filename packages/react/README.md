# @alchyx/react

Accessible React components for the D-ALabs Lab, Dark, and Ark design language.
The package supports React 18 and React 19 and has no runtime UI dependency.

```bash
pnpm add @alchyx/react @alchyx/tokens
```

```tsx
import "@alchyx/tokens/css";
import "@alchyx/react/styles.css";
import { AlchyxProvider, Button } from "@alchyx/react";

export function App() {
  return (
    <AlchyxProvider defaultSkin="lab">
      <Button>Start experiment</Button>
    </AlchyxProvider>
  );
}
```

## Component surface

The `0.2.0-beta.1` surface contains 31 components:

- **Stable:** Alert, Avatar, Badge, Breadcrumbs, Button, Card, Checkbox,
  IconButton, Input, Kbd, Pagination, Progress, Select, Separator, Skeleton,
  Spinner, Stat, Table, Tag, and Textarea.
- **Beta:** Accordion, Dialog, Drawer, DropdownMenu, RadioGroup,
  SegmentedControl, Slider, Switch, Tabs, Toast, and Tooltip.

Beta identifies API maturity. It does not relax keyboard, focus, form, or
accessibility requirements.

## Forms and overlays

Checkbox and Select retain native form controls. Switch, RadioGroup,
SegmentedControl, and Slider use native form proxies. Together they support
`name`, `value`, `required`, `disabled`, and `form`, participate in `FormData`,
and restore uncontrolled defaults on native form reset. Controlled values remain
owned by the caller.

Portalled Dialog, Drawer, DropdownMenu, and Toast content inherits the nearest
provider's skin and accent. `AlchyxProvider` also accepts `portalContainer` for
applications with a dedicated overlay root. Nested dismissable layers share a
stack: only the top layer handles Escape/outside interaction, modal focus is
restored on close, and body scroll remains locked until the final modal closes.

Component CSS distinguishes token roles: `--accent` is the brand/indicator hue,
`--accent-fg` is accent-colored copy on a skin surface, `--accent-text` is copy
on an accent fill, and `--focus-ring` is reserved for focus indication. Status
copy/surfaces use `--status-*-foreground` and `--status-*-surface`; solid status
hues remain available for dots, bars, borders, and charts.

## Package contract

The root export ships ESM, CommonJS, and declarations. Import
`@alchyx/tokens/css` once for the token foundation and
`@alchyx/react/styles.css` once for the generated component stylesheet. React
18 and React 19 are supported peer ranges and are both exercised by the
packed-package smoke test.

```bash
pnpm --filter @alchyx/react typecheck
pnpm --filter @alchyx/react test
pnpm pack:smoke
```

See the [repository README](../../README.md) and
[component contract](../../docs/COMPONENT_SPEC.md) for authoring rules and the
maturity policy.

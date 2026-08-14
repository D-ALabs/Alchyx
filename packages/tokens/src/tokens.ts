/**
 * @alchyx/tokens — typed, programmatic access to the D-ALabs design language.
 *
 * These objects mirror the CSS variables in `css/tokens.css`. Use them when you
 * need a value in JS (charts, canvas, inline styles) rather than CSS. For UI,
 * prefer the CSS variables (`var(--surface)`) so a `data-theme` swap re-tints
 * everything at runtime.
 */

export type SkinName = "lab" | "dark" | "ark" | "lembic";

export type AccentName =
  | "monochrome"
  | "paper"
  | "gold"
  | "mint"
  | "blue"
  | "amber"
  | "ivory"
  | "bronze";

/** Per-skin palette, measured 1:1 from the reference build. */
export interface SkinPalette {
  bg: string;
  surface: string;
  surface2: string;
  deep: string;
  deep2: string;
  panel: string;
  panelBd: string;
  ink: string;
  ink2: string;
  sub: string;
  faint: string;
  bd: string;
  bd2: string;
  bdHov: string;
  stat: string;
  deepInk: string;
  deepSub: string;
  deepFaint: string;
  accent: string;
  accentInk: string;
  accentFg: string;
  accentSoft: string;
  invBg: string;
  invTx: string;
}

/** Accessible, skin-aware values derived from a brand accent. */
export interface AccentPalette {
  /** Brand hue. This remains stable for non-text decoration and solid fills. */
  accent: string;
  /** Accessible accent-colored text/icon foreground for the skin's surfaces. */
  foreground: string;
  /** Backward-compatible alias of `accentText`. */
  accentInk: string;
  /** Foreground with at least WCAG AA contrast when painted on `accent`. */
  accentText: string;
  /** Low-emphasis tint for selected and highlighted surfaces. */
  accentSoft: string;
  /** Accent-related hue with at least 3:1 contrast against the skin background. */
  focusRing: string;
  /** Skin-appropriate button shadow. */
  shadow: string;
  /** Background used by the inverse-fill treatment for this accent. */
  inverseBackground: string;
}

export type StatusName = "signal" | "caution" | "fault";

/** Accessible foreground/surface pair for a semantic status. */
export interface StatusPalette {
  /** Stable status hue retained for indicators and charts. */
  solid: string;
  /** Text/icon color intended for `surface`. */
  foreground: string;
  /** Subtle, opaque status surface. */
  surface: string;
}

/** Skin-aware source-code colors shared by web and terminal renderers. */
export interface SyntaxPalette {
  comment: string;
  keyword: string;
  function: string;
  variable: string;
  string: string;
  number: string;
  type: string;
  operator: string;
  punctuation: string;
}

export const skins: Record<SkinName, SkinPalette> = {
  lab: {
    bg: "#F5F2EA",
    surface: "#FCFBF7",
    surface2: "#EFEBE0",
    deep: "#16202E",
    deep2: "#0E1620",
    panel: "#16202E",
    panelBd: "rgba(255,255,255,.10)",
    ink: "#16202E",
    ink2: "#1B2737",
    sub: "#54606E",
    faint: "#5F6B79",
    bd: "#E4DECF",
    bd2: "#E9E4D8",
    bdHov: "#D6CFBE",
    stat: "#16202E",
    deepInk: "#EEEAE0",
    deepSub: "#AEB6C0",
    deepFaint: "#7E8896",
    accent: "#16202E",
    accentInk: "#F5F2EA",
    accentFg: "#16202E",
    accentSoft: "rgba(22,32,46,.07)",
    invBg: "#F5F2EA",
    invTx: "#16202E",
  },
  dark: {
    bg: "#0E1620",
    surface: "#141E2A",
    surface2: "#0B121A",
    deep: "#1B2736",
    deep2: "#0A1018",
    panel: "#1B2736",
    panelBd: "rgba(236,231,219,.10)",
    ink: "#ECE7DB",
    ink2: "#F4F0E6",
    sub: "#9AA4B0",
    faint: "#7E8896",
    bd: "rgba(236,231,219,.11)",
    bd2: "rgba(236,231,219,.07)",
    bdHov: "rgba(236,231,219,.20)",
    stat: "#ECE7DB",
    deepInk: "#ECE7DB",
    deepSub: "#9AA4B0",
    deepFaint: "#6E7884",
    accent: "#ECE7DB",
    accentInk: "#16202E",
    accentFg: "#ECE7DB",
    accentSoft: "rgba(236,231,219,.08)",
    invBg: "#ECE7DB",
    invTx: "#16202E",
  },
  ark: {
    bg: "#081426",
    surface: "#0E1D34",
    surface2: "rgba(11,26,48,.5)",
    deep: "#050E1D",
    deep2: "#04101F",
    panel: "#0A1830",
    panelBd: "rgba(217,174,99,.18)",
    ink: "#F4EEE0",
    ink2: "#EBE6D8",
    sub: "#9FB1C6",
    faint: "#6E8198",
    bd: "rgba(217,174,99,.22)",
    bd2: "rgba(217,174,99,.13)",
    bdHov: "rgba(217,174,99,.45)",
    stat: "#E8C074",
    deepInk: "#EBE6D8",
    deepSub: "#9FB1C6",
    deepFaint: "#7E8EA2",
    accent: "#D9AE63",
    accentInk: "#081426",
    accentFg: "#D9AE63",
    accentSoft: "rgba(217,174,99,.15)",
    invBg: "#D9AE63",
    invTx: "#081426",
  },
  lembic: {
    bg: "#F7F2E4",
    surface: "#FFFCF4",
    surface2: "#F0E9D8",
    deep: "#0E1B30",
    deep2: "#081426",
    panel: "#0E1B30",
    panelBd: "rgba(217,174,99,.22)",
    ink: "#14243E",
    ink2: "#1B2E4C",
    sub: "#55647C",
    faint: "#5A6A82",
    bd: "#E3D9BF",
    bd2: "#EDE5D1",
    bdHov: "#C8B68C",
    stat: "#8A5A12",
    deepInk: "#F4EEE0",
    deepSub: "#9FB1C6",
    deepFaint: "#7E8EA2",
    // The gold stays the gold for fills, but copy set in it would sit at
    // 1.9:1 on parchment — so `accentFg` drops to the bronze end of the ramp.
    accent: "#D9AE63",
    accentInk: "#081426",
    accentFg: "#7A4E0B",
    accentSoft: "rgba(217,174,99,.18)",
    invBg: "#F7F2E4",
    invTx: "#14243E",
  },
};

/** Accessible syntax colors for every skin. */
export const syntaxPalettes = {
  lab: {
    comment: "#54606E",
    keyword: "#6B4E9B",
    function: "#257287",
    variable: "#16202E",
    string: "#087A57",
    number: "#8A4F0A",
    type: "#315EC0",
    operator: "#9F3F35",
    punctuation: "#54606E",
  },
  dark: {
    comment: "#9AA4B0",
    keyword: "#B0A4D8",
    function: "#79C0D0",
    variable: "#ECE7DB",
    string: "#6FE0BA",
    number: "#F2B66D",
    type: "#9CB6FF",
    operator: "#FFB4AA",
    punctuation: "#9AA4B0",
  },
  ark: {
    comment: "#9FB1C6",
    keyword: "#C7B6E8",
    function: "#79C0D0",
    variable: "#F4EEE0",
    string: "#6FE0BA",
    number: "#E8C074",
    type: "#9CB6FF",
    operator: "#FFB4AA",
    punctuation: "#9FB1C6",
  },
  lembic: {
    comment: "#55647C",
    keyword: "#6B4E9B",
    function: "#257287",
    variable: "#14243E",
    string: "#087A57",
    number: "#8A5A12",
    type: "#315EC0",
    operator: "#9F3F35",
    punctuation: "#55647C",
  },
} as const satisfies Record<SkinName, SyntaxPalette>;

/** Accents available per skin (the first of each is the default). */
export const accentsBySkin: Record<SkinName, AccentName[]> = {
  lab: ["monochrome", "mint", "blue", "amber"],
  dark: ["paper", "mint", "blue", "amber"],
  ark: ["gold", "amber", "ivory", "bronze"],
  // Ivory is absent on purpose: on parchment it cannot reach 4.5:1 as copy,
  // and an accent that only works as decoration is not an accent here.
  lembic: ["gold", "bronze", "amber"],
};

/** Default accent chosen when a skin has no explicit (or an invalid) accent. */
export const defaultAccentBySkin = {
  lab: "monochrome",
  dark: "paper",
  ark: "gold",
  lembic: "gold",
} as const satisfies Record<SkinName, AccentName>;

/**
 * Full accent values are skin-aware: the same hue can require a different
 * foreground, focus ring, shadow, or inverse fill in another skin.
 */
export const accentPalettes = {
  lab: {
    monochrome: {
      accent: "#16202E",
      foreground: "#16202E",
      accentInk: "#F5F2EA",
      accentText: "#F5F2EA",
      accentSoft: "rgba(22,32,46,.07)",
      focusRing: "#16202E",
      shadow: "0 12px 30px -14px rgba(22,32,46,.75)",
      inverseBackground: "#F5F2EA",
    },
    mint: {
      accent: "#13B981",
      foreground: "#087A57",
      accentInk: "#081426",
      accentText: "#081426",
      accentSoft: "rgba(19,185,129,.15)",
      focusRing: "#087A57",
      shadow: "0 12px 30px -14px rgba(19,185,129,.75)",
      inverseBackground: "#F5F2EA",
    },
    blue: {
      accent: "#3B6FE0",
      foreground: "#315EC0",
      accentInk: "#FFFDF7",
      accentText: "#FFFDF7",
      accentSoft: "rgba(59,111,224,.15)",
      focusRing: "#315EC0",
      shadow: "0 12px 30px -14px rgba(59,111,224,.75)",
      inverseBackground: "#F5F2EA",
    },
    amber: {
      accent: "#D98A2B",
      foreground: "#9B5A0A",
      accentInk: "#081426",
      accentText: "#081426",
      accentSoft: "rgba(217,138,43,.15)",
      focusRing: "#9B5A0A",
      shadow: "0 12px 30px -14px rgba(217,138,43,.75)",
      inverseBackground: "#F5F2EA",
    },
  },
  dark: {
    paper: {
      accent: "#ECE7DB",
      foreground: "#ECE7DB",
      accentInk: "#16202E",
      accentText: "#16202E",
      accentSoft: "rgba(236,231,219,.08)",
      focusRing: "#ECE7DB",
      shadow: "0 14px 34px -16px rgba(236,231,219,.35)",
      inverseBackground: "#ECE7DB",
    },
    mint: {
      accent: "#13B981",
      foreground: "#6FE0BA",
      accentInk: "#081426",
      accentText: "#081426",
      accentSoft: "rgba(19,185,129,.15)",
      focusRing: "#13B981",
      shadow: "0 14px 34px -16px rgba(19,185,129,.35)",
      inverseBackground: "#ECE7DB",
    },
    blue: {
      accent: "#3B6FE0",
      foreground: "#9CB6FF",
      accentInk: "#FFFDF7",
      accentText: "#FFFDF7",
      accentSoft: "rgba(59,111,224,.15)",
      focusRing: "#3B6FE0",
      shadow: "0 14px 34px -16px rgba(59,111,224,.35)",
      inverseBackground: "#ECE7DB",
    },
    amber: {
      accent: "#D98A2B",
      foreground: "#F2B66D",
      accentInk: "#081426",
      accentText: "#081426",
      accentSoft: "rgba(217,138,43,.15)",
      focusRing: "#D98A2B",
      shadow: "0 14px 34px -16px rgba(217,138,43,.35)",
      inverseBackground: "#ECE7DB",
    },
  },
  ark: {
    gold: {
      accent: "#D9AE63",
      foreground: "#D9AE63",
      accentInk: "#081426",
      accentText: "#081426",
      accentSoft: "rgba(217,174,99,.15)",
      focusRing: "#D9AE63",
      shadow: "0 14px 34px -16px rgba(217,174,99,.85)",
      inverseBackground: "#D9AE63",
    },
    amber: {
      accent: "#E2A338",
      foreground: "#E2A338",
      accentInk: "#081426",
      accentText: "#081426",
      accentSoft: "rgba(226,163,56,.15)",
      focusRing: "#E2A338",
      shadow: "0 14px 34px -16px rgba(226,163,56,.85)",
      inverseBackground: "#E2A338",
    },
    ivory: {
      accent: "#E9E1CC",
      foreground: "#E9E1CC",
      accentInk: "#081426",
      accentText: "#081426",
      accentSoft: "rgba(233,225,204,.15)",
      focusRing: "#E9E1CC",
      shadow: "0 14px 34px -16px rgba(233,225,204,.85)",
      inverseBackground: "#E9E1CC",
    },
    bronze: {
      accent: "#C98C49",
      foreground: "#C98C49",
      accentInk: "#081426",
      accentText: "#081426",
      accentSoft: "rgba(201,140,73,.15)",
      focusRing: "#C98C49",
      shadow: "0 14px 34px -16px rgba(201,140,73,.85)",
      inverseBackground: "#C98C49",
    },
  },
  lembic: {
    gold: {
      accent: "#D9AE63",
      foreground: "#7A4E0B",
      accentInk: "#081426",
      accentText: "#081426",
      accentSoft: "rgba(217,174,99,.18)",
      focusRing: "#7A4E0B",
      shadow: "0 12px 30px -14px rgba(217,174,99,.55)",
      inverseBackground: "#F7F2E4",
    },
    bronze: {
      accent: "#C98C49",
      foreground: "#6F4410",
      accentInk: "#081426",
      accentText: "#081426",
      accentSoft: "rgba(201,140,73,.18)",
      focusRing: "#6F4410",
      shadow: "0 12px 30px -14px rgba(201,140,73,.55)",
      inverseBackground: "#F7F2E4",
    },
    amber: {
      accent: "#D98A2B",
      foreground: "#8A4F0A",
      accentInk: "#081426",
      accentText: "#081426",
      accentSoft: "rgba(217,138,43,.18)",
      focusRing: "#8A4F0A",
      shadow: "0 12px 30px -14px rgba(217,138,43,.55)",
      inverseBackground: "#F7F2E4",
    },
  },
} as const satisfies Record<SkinName, Partial<Record<AccentName, AccentPalette>>>;

/**
 * Resolve a valid palette for a skin. Accents from another skin safely fall
 * back to that skin's default, which makes persisted preferences resilient.
 */
export function getAccentPalette(skin: SkinName, accent?: AccentName): AccentPalette {
  const palettes = accentPalettes[skin] as Partial<Record<AccentName, AccentPalette>>;
  const fallback = palettes[defaultAccentBySkin[skin]];

  // Every skin declares its default above; the guard also protects future edits.
  if (!fallback) {
    throw new Error(`Missing default accent palette for skin: ${skin}`);
  }

  return (accent && palettes[accent]) || fallback;
}

/**
 * Legacy, skin-agnostic accent lookup.
 *
 * @deprecated Use `accentPalettes` or `getAccentPalette()`; Ark amber and the
 * Dark paper neutral cannot be represented accurately by one value per name.
 */
export const accentHex: Record<AccentName, string> = {
  monochrome: "#16202E",
  paper: "#EEEAE0",
  gold: "#D9AE63",
  mint: "#13B981",
  blue: "#3B6FE0",
  amber: "#D98A2B", // Lab/Dark amber; Ark amber is #E2A338
  ivory: "#E9E1CC",
  bronze: "#C98C49",
};

/** Fixed semantic status hues — independent of the accent. */
export const status = {
  signal: "#13B981", // Signal / Live / pass
  caution: "#D98A2B", // Caution / Training / drift
  fault: "#C25E54", // Fault / error
} as const;

/** Skin-aware status pairs for accessible callouts and badges. */
export const statusPalettes: Record<SkinName, Record<StatusName, StatusPalette>> = {
  lab: {
    signal: { solid: status.signal, foreground: "#087A57", surface: "#DDF4EA" },
    caution: { solid: status.caution, foreground: "#8A4F0A", surface: "#F8E8D2" },
    fault: { solid: status.fault, foreground: "#9F3F35", surface: "#F8E1DE" },
  },
  dark: {
    signal: { solid: status.signal, foreground: "#6FE0BA", surface: "#123A32" },
    caution: { solid: status.caution, foreground: "#F2B66D", surface: "#3B2D1D" },
    fault: { solid: status.fault, foreground: "#FFB4AA", surface: "#3B2427" },
  },
  ark: {
    signal: { solid: status.signal, foreground: "#6FE0BA", surface: "#102F2C" },
    caution: { solid: status.caution, foreground: "#F2B66D", surface: "#342B20" },
    fault: { solid: status.fault, foreground: "#FFB4AA", surface: "#352229" },
  },
  lembic: {
    signal: { solid: status.signal, foreground: "#087A57", surface: "#DDF4EA" },
    caution: { solid: status.caution, foreground: "#8A4F0A", surface: "#F8E8D2" },
    fault: { solid: status.fault, foreground: "#9F3F35", surface: "#F8E1DE" },
  },
};

/** Radius vocabulary (px). */
export const radius = {
  control: 11,
  controlSm: 10,
  card: 16,
  panel: 18,
  panelLg: 22,
  pill: 100,
} as const;

/** Typeface roles — the pairing is the brand; do not substitute. */
export const fonts = {
  display: '"Space Grotesk", sans-serif',
  sans: '"Hanken Grotesk", system-ui, sans-serif',
  mono: '"Space Mono", monospace',
} as const;

/** T-01 … T-06 type scale. */
export const typeScale = {
  display: {
    family: "display",
    weight: 600,
    size: "clamp(1.9rem, 3.6vw, 3.2rem)",
    tracking: "-.03em",
    leading: 1.03,
  },
  sectionHead: {
    family: "display",
    weight: 600,
    size: "clamp(1.7rem, 3vw, 2.4rem)",
    tracking: "-.025em",
    leading: 1.08,
  },
  cardTitle: {
    family: "display",
    weight: 600,
    size: "1.5rem",
    tracking: "-.02em",
    leading: 1.1,
  },
  body: { family: "sans", weight: 400, size: "17px", tracking: "0", leading: 1.65 },
  monoLabel: {
    family: "mono",
    weight: 400,
    size: "12px",
    tracking: ".2em",
    transform: "uppercase",
  },
  statNumeral: {
    family: "display",
    weight: 600,
    size: "clamp(2.2rem, 4vw, 3.2rem)",
    tracking: "-.04em",
    leading: 1,
  },
} as const;

/** Motion easing vocabulary + loop durations. */
export const motion = {
  ease: {
    expo: "cubic-bezier(.16,1,.3,1)", // entrances, hover-lift
    spring: "cubic-bezier(.2,.9,.3,1.2)", // magnetic, toggle knob
  },
  duration: {
    hover: "0.25s",
    lift: "0.45s",
    reveal: "0.85s",
    themeSwap: "0.45s",
  },
} as const;

/** Names of every core custom property declared by `css/tokens.css`. */
export const cssVar = {
  fontSans: "--font-sans",
  fontDisplay: "--font-display",
  fontMono: "--font-mono",
  statusSignal: "--status-signal",
  statusSignalForeground: "--status-signal-foreground",
  statusSignalSurface: "--status-signal-surface",
  statusCaution: "--status-caution",
  statusCautionForeground: "--status-caution-foreground",
  statusCautionSurface: "--status-caution-surface",
  statusFault: "--status-fault",
  statusFaultForeground: "--status-fault-foreground",
  statusFaultSurface: "--status-fault-surface",
  radiusControl: "--radius-control",
  radiusControlSm: "--radius-control-sm",
  radiusCard: "--radius-card",
  radiusPanel: "--radius-panel",
  radiusPanelLg: "--radius-panel-lg",
  radiusPill: "--radius-pill",
  easeExpo: "--ease-expo",
  easeSpring: "--ease-spring",
  bg: "--bg",
  surface: "--surface",
  surface2: "--surface2",
  deep: "--deep",
  deep2: "--deep2",
  panel: "--panel",
  panelBd: "--panel-bd",
  ink: "--ink",
  ink2: "--ink2",
  sub: "--sub",
  faint: "--faint",
  bd: "--bd",
  bd2: "--bd2",
  bdHov: "--bd-hov",
  stat: "--stat",
  grid: "--grid",
  gridDeep: "--grid-deep",
  deepInk: "--deep-ink",
  deepSub: "--deep-sub",
  deepFaint: "--deep-faint",
  syntaxComment: "--syntax-comment",
  syntaxKeyword: "--syntax-keyword",
  syntaxFunction: "--syntax-function",
  syntaxVariable: "--syntax-variable",
  syntaxString: "--syntax-string",
  syntaxNumber: "--syntax-number",
  syntaxType: "--syntax-type",
  syntaxOperator: "--syntax-operator",
  syntaxPunctuation: "--syntax-punctuation",
  chipBd: "--chip-bd",
  chipBg: "--chip-bg",
  chipTx: "--chip-tx",
  pillBd: "--pill-bd",
  pillTx: "--pill-tx",
  marquee: "--marq",
  inputBd: "--input-bd",
  avatarBg: "--av-bg",
  avatarText: "--av-tx",
  avatarBd: "--av-bd",
  shCard: "--sh-card",
  accent: "--accent",
  accentForeground: "--accent-fg",
  accentInk: "--accent-ink",
  accentText: "--accent-text",
  accentSoft: "--accent-soft",
  focusRing: "--focus-ring",
  shBtn: "--sh-btn",
  invBg: "--inv-bg",
  invTx: "--inv-tx",
  liquid: "--liquid",
  orbitBg: "--orbit-bg",
  orbitGrid: "--orbit-grid",
  orbitInk: "--orbit-ink",
  orbitAccent: "--orbit-accent",
  orbitSoft: "--orbit-soft",
} as const;

export const tokens = {
  skins,
  syntaxPalettes,
  accentsBySkin,
  defaultAccentBySkin,
  accentPalettes,
  getAccentPalette,
  accentHex,
  status,
  statusPalettes,
  radius,
  fonts,
  typeScale,
  motion,
  cssVar,
} as const;

export default tokens;

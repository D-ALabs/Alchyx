/**
 * @alchyx/tokens — typed, programmatic access to the D-ALabs design language.
 *
 * These objects mirror the CSS variables in `css/tokens.css`. Use them when you
 * need a value in JS (charts, canvas, inline styles) rather than CSS. For UI,
 * prefer the CSS variables (`var(--surface)`) so a `data-theme` swap re-tints
 * everything at runtime.
 */

export type SkinName = "lab" | "dark" | "ark";

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
  accentSoft: string;
  invBg: string;
  invTx: string;
}

export const skins: Record<SkinName, SkinPalette> = {
  lab: {
    bg: "#F5F2EA",
    surface: "#FCFBF7",
    surface2: "rgba(252,251,247,.55)",
    deep: "#16202E",
    deep2: "#0E1620",
    panel: "#16202E",
    panelBd: "rgba(0,0,0,0)",
    ink: "#16202E",
    ink2: "#1B2737",
    sub: "#54606E",
    faint: "#8A93A0",
    bd: "#E4DECF",
    bd2: "#E9E4D8",
    bdHov: "#CDC6B5",
    stat: "#16202E",
    deepInk: "#EEEAE0",
    deepSub: "#AEB6C0",
    deepFaint: "#97A1AD",
    accent: "#16202E",
    accentInk: "#F5F2EA",
    accentSoft: "rgba(22,32,46,.08)",
    invBg: "#F5F2EA",
    invTx: "#16202E",
  },
  dark: {
    bg: "#0D1522",
    surface: "#131D2D",
    surface2: "rgba(19,29,45,.55)",
    deep: "#080F1A",
    deep2: "#060B14",
    panel: "#0A1424",
    panelBd: "rgba(237,232,220,.12)",
    ink: "#EDE8DC",
    ink2: "#E4DFD2",
    sub: "#93A1B3",
    faint: "#6C7A8C",
    bd: "rgba(237,232,220,.14)",
    bd2: "rgba(237,232,220,.09)",
    bdHov: "rgba(237,232,220,.32)",
    stat: "#EDE8DC",
    deepInk: "#EDE8DC",
    deepSub: "#A5B1C0",
    deepFaint: "#7E8A99",
    accent: "#EEEAE0",
    accentInk: "#16202E",
    accentSoft: "rgba(238,234,224,.15)",
    invBg: "#F5F2EA",
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
    accentSoft: "rgba(217,174,99,.15)",
    invBg: "#D9AE63",
    invTx: "#081426",
  },
};

/** Accents available per skin (the first of each is the default). */
export const accentsBySkin: Record<SkinName, AccentName[]> = {
  lab: ["monochrome", "mint", "blue", "amber"],
  dark: ["paper", "mint", "blue", "amber"],
  ark: ["gold", "amber", "ivory", "bronze"],
};

/** The one accent hue for each `data-accent`, per skin. */
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

/** Convenience: names of every CSS custom property Alchyx defines. */
export const cssVar = {
  bg: "--bg",
  surface: "--surface",
  surface2: "--surface2",
  deep: "--deep",
  deep2: "--deep2",
  panel: "--panel",
  ink: "--ink",
  ink2: "--ink2",
  sub: "--sub",
  faint: "--faint",
  bd: "--bd",
  bd2: "--bd2",
  bdHov: "--bd-hov",
  accent: "--accent",
  accentInk: "--accent-ink",
  accentSoft: "--accent-soft",
  invBg: "--inv-bg",
  invTx: "--inv-tx",
  shCard: "--sh-card",
  shBtn: "--sh-btn",
} as const;

export const tokens = {
  skins,
  accentsBySkin,
  accentHex,
  status,
  radius,
  fonts,
  typeScale,
  motion,
  cssVar,
} as const;

export default tokens;

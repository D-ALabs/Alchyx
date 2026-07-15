/**
 * @alchyx/tokens/tailwind — legacy Tailwind CSS v3 preset (adapter).
 *
 * Every value points at an Alchyx CSS variable, so utility classes re-tint with
 * the active skin/accent exactly like the plain-CSS components do. Import the
 * token stylesheet (`@alchyx/tokens/css`) once so the variables exist, then:
 *
 *   // tailwind.config.js
 *   import { alchyxPreset } from "@alchyx/tokens/tailwind";
 *   export default { presets: [alchyxPreset], content: [...] };
 *
 * Now `bg-surface text-ink border-bd rounded-card shadow-card font-display`
 * (etc.) resolve to the D-ALabs language. Typed loosely as a plain object so
 * this package carries no dependency on `tailwindcss`.
 *
 * Tailwind CSS v4 projects should import `@alchyx/tokens/tailwind.css` instead.
 */

/**
 * @deprecated Tailwind CSS v3 compatibility only. Tailwind CSS v4 projects
 * should import `@alchyx/tokens/tailwind.css` in their CSS entry point.
 */
export const alchyxPreset = {
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: {
          DEFAULT: "var(--surface)",
          2: "var(--surface2)",
        },
        deep: {
          DEFAULT: "var(--deep)",
          2: "var(--deep2)",
        },
        panel: "var(--panel)",
        ink: {
          DEFAULT: "var(--ink)",
          2: "var(--ink2)",
        },
        sub: "var(--sub)",
        faint: "var(--faint)",
        "deep-ink": "var(--deep-ink)",
        "deep-sub": "var(--deep-sub)",
        "deep-faint": "var(--deep-faint)",
        syntax: {
          comment: "var(--syntax-comment)",
          keyword: "var(--syntax-keyword)",
          function: "var(--syntax-function)",
          variable: "var(--syntax-variable)",
          string: "var(--syntax-string)",
          number: "var(--syntax-number)",
          type: "var(--syntax-type)",
          operator: "var(--syntax-operator)",
          punctuation: "var(--syntax-punctuation)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-fg)",
          ink: "var(--accent-ink)",
          text: "var(--accent-text)",
          soft: "var(--accent-soft)",
        },
        "focus-ring": "var(--focus-ring)",
        inv: {
          bg: "var(--inv-bg)",
          tx: "var(--inv-tx)",
        },
        // fixed status hues plus accessible skin-aware foreground/surface pairs
        signal: "var(--status-signal)",
        "signal-foreground": "var(--status-signal-foreground)",
        "signal-surface": "var(--status-signal-surface)",
        caution: "var(--status-caution)",
        "caution-foreground": "var(--status-caution-foreground)",
        "caution-surface": "var(--status-caution-surface)",
        fault: "var(--status-fault)",
        "fault-foreground": "var(--status-fault-foreground)",
        "fault-surface": "var(--status-fault-surface)",
      },
      borderColor: {
        DEFAULT: "var(--bd)",
        bd: "var(--bd)",
        2: "var(--bd2)",
        hov: "var(--bd-hov)",
        accent: "var(--accent)",
        input: "var(--input-bd)",
      },
      backgroundColor: {
        chip: "var(--chip-bg)",
        av: "var(--av-bg)",
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        sans: ["Hanken Grotesk", "system-ui", "sans-serif"],
        mono: ["Space Mono", "monospace"],
      },
      fontSize: {
        // T-01 … T-06 (see references/typography.md)
        "t-display": ["clamp(1.9rem, 3.6vw, 3.2rem)", { lineHeight: "1.03", letterSpacing: "-.03em" }],
        "t-section": ["clamp(1.7rem, 3vw, 2.4rem)", { lineHeight: "1.08", letterSpacing: "-.025em" }],
        "t-card": ["1.5rem", { lineHeight: "1.1", letterSpacing: "-.02em" }],
        "t-body": ["17px", { lineHeight: "1.65" }],
        "t-mono": ["12px", { letterSpacing: ".2em" }],
        "t-stat": ["clamp(2.2rem, 4vw, 3.2rem)", { lineHeight: "1", letterSpacing: "-.04em" }],
      },
      borderRadius: {
        DEFAULT: "11px",
        control: "11px",
        "control-sm": "10px",
        card: "16px",
        panel: "18px",
        "panel-lg": "22px",
        pill: "100px",
      },
      boxShadow: {
        card: "var(--sh-card)",
        btn: "var(--sh-btn)",
        toast: "0 18px 44px -18px rgba(0,0,0,.55)",
        modal: "0 40px 90px -40px rgba(0,0,0,.6)",
      },
      transitionTimingFunction: {
        expo: "cubic-bezier(.16,1,.3,1)",
        spring: "cubic-bezier(.2,.9,.3,1.2)",
      },
      keyframes: {
        "alx-revealUp": { from: { transform: "translateY(18px)" }, to: { transform: "translateY(0)" } },
        "alx-blink": {
          "0%,45%": { opacity: "1" },
          "55%,100%": { opacity: ".25" },
        },
        "alx-shimmer": {
          "0%": { backgroundPosition: "180% 0" },
          "100%": { backgroundPosition: "-80% 0" },
        },
        "alx-spin": { to: { transform: "rotate(360deg)" } },
      },
      animation: {
        reveal: "alx-revealUp .85s cubic-bezier(.16,1,.3,1) both",
        blink: "alx-blink 2.4s ease-in-out infinite",
        shimmer: "alx-shimmer 1.6s linear infinite",
        spin: "alx-spin .8s linear infinite",
      },
    },
  },
};

export default alchyxPreset;

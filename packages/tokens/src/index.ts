/**
 * @alchyx/tokens — the D-ALabs design language, framework-agnostic.
 *
 *   import "@alchyx/tokens/css";            // the CSS-variable foundation
 *   import { tokens, skins } from "@alchyx/tokens";
 *   @import "@alchyx/tokens/tailwind.css";  // Tailwind CSS v4 theme bridge
 *
 * `@alchyx/tokens/tailwind` remains available for Tailwind CSS v3 projects.
 */
export * from "./tokens";
export { alchyxPreset } from "./tailwind-preset";

import tokens from "./tokens";
export default tokens;

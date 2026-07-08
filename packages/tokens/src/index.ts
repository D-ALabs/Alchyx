/**
 * @alchyx/tokens — the D-ALabs design language, framework-agnostic.
 *
 *   import "@alchyx/tokens/css";            // the CSS-variable foundation
 *   import { tokens, skins } from "@alchyx/tokens";
 *   import { alchyxPreset } from "@alchyx/tokens/tailwind";
 */
export * from "./tokens";
export { alchyxPreset } from "./tailwind-preset";

import tokens from "./tokens";
export default tokens;

/**
 * @alchyx/assets — the D-ALabs marks.
 *
 * Hand-written rather than compiled: this package ships files, not code, and a
 * build step here would only stand between a consumer and an SVG.
 */

/** Every mark in the set. */
export const marks = ["alchemist", "flask", "wordmark"];

/** The three Alchyx skins, in the order the design language lists them. */
export const skins = ["lab", "dark", "ark"];

/**
 * The `currentColor` master. Inline this one — it inherits whatever ink or
 * accent the surrounding tree carries, so it re-tints with `data-theme`.
 */
export const markUrl = (mark) => new URL(`./marks/${mark}.svg`, import.meta.url);

/**
 * A mark pinned to one skin's colour. Use these where `currentColor` cannot
 * reach: `<img src>`, `background-image`, favicons, OG images, email.
 */
export const skinUrl = (mark, skin) => new URL(`./skins/${mark}-${skin}.svg`, import.meta.url);

/** The untouched originals the marks were drawn from. */
export const rasterUrl = (file) => new URL(`./raster/${file}`, import.meta.url);

/**
 * Generate the per-skin mark files from the `currentColor` masters.
 *
 * The masters in `marks/` are the source of truth for *shape*; this script is
 * the source of truth for *colour*, and it takes that colour from the token
 * sheet rather than from a table kept here. That is the whole point: a mark
 * cannot drift away from the skin it claims to belong to.
 *
 * It reads `packages/tokens/src/css/tokens.css` directly rather than importing
 * `@alchyx/tokens`, so it runs in a fresh clone with nothing built yet.
 */
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const marksDirectory = resolve(packageRoot, "marks");
const outputDirectory = resolve(packageRoot, "skins");
const tokenSheet = resolve(packageRoot, "../tokens/src/css/tokens.css");

/**
 * Which role each skin paints its brand mark in.
 *
 * Lab and Dark carry the mark in ink — that is the existing house treatment
 * (navy flask on paper, bone flask on slate). Ark is the premium skin whose
 * whole identity is the gold, so there the mark takes the accent.
 *
 * Lembic takes `accent`, not `accent-fg`: a mark is a fill, not copy, so it
 * keeps the true gold rather than the bronze that accent-coloured *text* needs
 * on parchment.
 */
const ROLE_BY_SKIN = { lab: "ink", dark: "ink", ark: "accent", lembic: "accent" };

const css = await readFile(tokenSheet, "utf8");

/** Pull one declaration out of a skin's own block (not its accent variants). */
function readToken(skin, name) {
  const block = new RegExp(`\\[data-theme="${skin}"\\]\\s*\\{([^}]*)\\}`).exec(css);
  if (!block) throw new Error(`no [data-theme="${skin}"] block in ${tokenSheet}`);
  const declaration = new RegExp(`--${name}:\\s*([^;]+);`).exec(block[1]);
  if (!declaration) throw new Error(`--${name} missing from the ${skin} block`);
  return declaration[1].trim();
}

const colors = Object.fromEntries(
  Object.entries(ROLE_BY_SKIN).map(([skin, role]) => [skin, readToken(skin, role)]),
);

await rm(outputDirectory, { force: true, recursive: true });
await mkdir(outputDirectory, { recursive: true });

const masters = (await readdir(marksDirectory, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name.endsWith(".svg"))
  .map((entry) => entry.name)
  .sort();

const written = [];
for (const file of masters) {
  const master = await readFile(resolve(marksDirectory, file), "utf8");
  const name = file.replace(/\.svg$/, "");
  for (const [skin, color] of Object.entries(colors)) {
    // `currentColor` is the only fill in a master, so pinning it is the whole
    // transformation — the geometry is copied through untouched.
    const out = master.replace(/fill="currentColor"/, `fill="${color}"`);
    if (out === master) throw new Error(`${file} has no fill="currentColor" to pin`);
    await writeFile(resolve(outputDirectory, `${name}-${skin}.svg`), out);
    written.push(`${name}-${skin}.svg`);
  }
}

console.log(
  `skins: ${Object.entries(colors).map(([s, c]) => `${s}=${c}`).join("  ")}\n` +
    `wrote ${written.length} files from ${masters.length} masters`,
);

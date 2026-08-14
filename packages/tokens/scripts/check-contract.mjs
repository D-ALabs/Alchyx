import { readFile, readdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceCssDirectory = resolve(packageRoot, "src/css");
const distCssDirectory = resolve(packageRoot, "dist/css");
const tokensCss = await readFile(resolve(sourceCssDirectory, "tokens.css"), "utf8");
const packageJson = JSON.parse(await readFile(resolve(packageRoot, "package.json"), "utf8"));
const built = await import(pathToFileURL(resolve(packageRoot, "dist/index.js")).href);
const builtTailwind = await import(
  pathToFileURL(resolve(packageRoot, "dist/tailwind-preset.js")).href
);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function hexLuminance(hex) {
  const channels = [hex.slice(1, 3), hex.slice(3, 5), hex.slice(5, 7)].map(
    (channel) => Number.parseInt(channel, 16) / 255,
  );
  const [red, green, blue] = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrast(first, second) {
  const firstLuminance = hexLuminance(first);
  const secondLuminance = hexLuminance(second);
  return (
    (Math.max(firstLuminance, secondLuminance) + 0.05) /
    (Math.min(firstLuminance, secondLuminance) + 0.05)
  );
}

const syntaxRoles = [
  "comment",
  "keyword",
  "function",
  "variable",
  "string",
  "number",
  "type",
  "operator",
  "punctuation",
];

function syntaxCssVariable(role) {
  return `--syntax-${role}`;
}

function syntaxCssVarKey(role) {
  return `syntax${role[0].toUpperCase()}${role.slice(1)}`;
}

function declarationsForSkin(skin) {
  const pattern =
    skin === "lab"
      ? /:root,\s*\[data-theme="lab"\]\s*\{([\s\S]*?)\n\}/
      : new RegExp(`\\[data-theme="${skin}"\\]\\s*\\{([\\s\\S]*?)\\n\\}`);
  const block = pattern.exec(tokensCss);
  assert(block !== null, `Missing CSS token block for ${skin}`);
  return new Map(
    [...block[1].matchAll(/^\s*(--[a-z0-9-]+)\s*:\s*([^;]+);/gim)].map((match) => [
      match[1],
      match[2].trim(),
    ]),
  );
}

const declaredVariables = new Set(
  [...tokensCss.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gim)].map((match) => match[1]),
);
const exportedVariables = new Set(Object.values(built.cssVar));
const missingVariables = [...declaredVariables].filter((variable) => !exportedVariables.has(variable));
const undeclaredVariables = [...exportedVariables].filter((variable) => !declaredVariables.has(variable));

assert(missingVariables.length === 0, `cssVar is missing: ${missingVariables.join(", ")}`);
assert(undeclaredVariables.length === 0, `cssVar contains undeclared names: ${undeclaredVariables.join(", ")}`);
assert(
  Object.values(built.cssVar).length === exportedVariables.size,
  "cssVar contains duplicate custom-property names",
);
assert(
  built.tokens.syntaxPalettes === built.syntaxPalettes,
  "The aggregate tokens export must expose syntaxPalettes",
);

for (const skin of Object.keys(built.skins)) {
  const defaultAccent = built.defaultAccentBySkin[skin];
  assert(built.accentsBySkin[skin][0] === defaultAccent, `${skin} default accent must be first`);
  assert(
    built.getAccentPalette(skin) === built.accentPalettes[skin][defaultAccent],
    `${skin} default resolver mismatch`,
  );
  assert(
    built.skins[skin].accentFg === built.accentPalettes[skin][defaultAccent].foreground,
    `${skin} default accent foreground mismatch`,
  );

  for (const accent of built.accentsBySkin[skin]) {
    const palette = built.getAccentPalette(skin, accent);
    assert(palette.accentInk === palette.accentText, `${skin}/${accent} accent aliases differ`);
    assert(
      contrast(palette.foreground, built.skins[skin].bg) >= 4.5,
      `${skin}/${accent} accent foreground is below 4.5:1 on bg`,
    );
    assert(
      contrast(palette.foreground, built.skins[skin].surface) >= 4.5,
      `${skin}/${accent} accent foreground is below 4.5:1 on surface`,
    );
    assert(
      contrast(palette.accent, palette.accentText) >= 4.5,
      `${skin}/${accent} accent text is below 4.5:1`,
    );
    assert(
      contrast(palette.focusRing, built.skins[skin].bg) >= 3,
      `${skin}/${accent} focus ring is below 3:1`,
    );
  }

  for (const status of Object.keys(built.statusPalettes[skin])) {
    const palette = built.statusPalettes[skin][status];
    assert(
      contrast(palette.foreground, palette.surface) >= 4.5,
      `${skin}/${status} status pair is below 4.5:1`,
    );
  }

  const syntaxPalette = built.syntaxPalettes[skin];
  assert(syntaxPalette !== undefined, `${skin} syntax palette is missing`);
  const syntaxPaletteRoles = Object.keys(syntaxPalette);
  const missingSyntaxRoles = syntaxRoles.filter((role) => !syntaxPaletteRoles.includes(role));
  const extraSyntaxRoles = syntaxPaletteRoles.filter((role) => !syntaxRoles.includes(role));
  assert(
    missingSyntaxRoles.length === 0 && extraSyntaxRoles.length === 0,
    `${skin} syntax roles differ: missing ${missingSyntaxRoles.join(", ")}; extra ${extraSyntaxRoles.join(", ")}`,
  );

  const cssDeclarations = declarationsForSkin(skin);
  const syntaxSurfaces = [
    ["bg", built.skins[skin].bg],
    ["surface", built.skins[skin].surface],
  ];
  if (skin === "dark" || skin === "ark") {
    syntaxSurfaces.push(["panel", built.skins[skin].panel]);
  }

  for (const role of syntaxRoles) {
    const variable = syntaxCssVariable(role);
    assert(
      built.cssVar[syntaxCssVarKey(role)] === variable,
      `cssVar mapping is missing for ${variable}`,
    );
    assert(
      cssDeclarations.get(variable)?.toLowerCase() === syntaxPalette[role].toLowerCase(),
      `${skin}/${role} differs between TypeScript and CSS`,
    );
    for (const [surfaceName, surface] of syntaxSurfaces) {
      assert(
        contrast(syntaxPalette[role], surface) >= 4.5,
        `${skin}/${role} syntax color is below 4.5:1 on ${surfaceName}`,
      );
    }
  }
}

const invalidAccentFallback = built.getAccentPalette("lab", "gold");
assert(
  invalidAccentFallback === built.accentPalettes.lab.monochrome,
  "An accent from another skin must resolve to the skin default",
);

const sourceCssFiles = (await readdir(sourceCssDirectory)).filter((file) => file.endsWith(".css")).sort();
const distCssFiles = (await readdir(distCssDirectory)).filter((file) => file.endsWith(".css")).sort();
assert(
  JSON.stringify(sourceCssFiles) === JSON.stringify(distCssFiles),
  "dist/css does not contain the complete deterministic CSS set",
);
for (const file of sourceCssFiles) {
  const [source, output] = await Promise.all([
    readFile(resolve(sourceCssDirectory, file), "utf8"),
    readFile(resolve(distCssDirectory, file), "utf8"),
  ]);
  assert(source === output, `dist/css/${file} is stale`);
}

assert(packageJson.exports["."].types === "./dist/index.d.ts", "Root types export must use dist");
assert(packageJson.exports["./css"] === "./dist/css/index.css", "CSS export must use dist");
assert(
  packageJson.exports["./tailwind.css"] === "./dist/css/tailwind.css",
  "Tailwind CSS v4 export is missing",
);

const tailwindCss = await readFile(resolve(sourceCssDirectory, "tailwind.css"), "utf8");
assert(tailwindCss.includes("@theme inline"), "Tailwind CSS v4 bridge must use @theme inline");
const tailwindSyntax = builtTailwind.alchyxPreset.theme.extend.colors.syntax;
for (const role of syntaxRoles) {
  const variable = syntaxCssVariable(role);
  assert(
    tailwindCss.includes(`--color-syntax-${role}: var(${variable});`),
    `Tailwind CSS v4 bridge is missing ${role} syntax color`,
  );
  assert(
    tailwindSyntax[role] === `var(${variable})`,
    `Tailwind CSS v3 preset is missing ${role} syntax color`,
  );
}

console.log(
  `Token contracts valid: ${declaredVariables.size} CSS variables, ${sourceCssFiles.length} CSS files, all accessible pairs pass.`,
);

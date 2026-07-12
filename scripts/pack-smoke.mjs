import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const temp = mkdtempSync(join(tmpdir(), "alchyx-pack-"));
const tarballs = join(temp, "tarballs");
const releaseVersion = "0.2.0-beta.1";
const componentExports = [
  "Accordion",
  "Alert",
  "Avatar",
  "Badge",
  "Breadcrumbs",
  "Button",
  "Card",
  "Checkbox",
  "Dialog",
  "Drawer",
  "DropdownMenu",
  "IconButton",
  "Input",
  "Kbd",
  "Pagination",
  "Progress",
  "RadioGroup",
  "SegmentedControl",
  "Select",
  "Separator",
  "Skeleton",
  "Slider",
  "Spinner",
  "Stat",
  "Switch",
  "Table",
  "Tabs",
  "Tag",
  "Textarea",
  "ToastProvider",
  "Tooltip",
];

function run(command, args, cwd = root) {
  execFileSync(command, args, { cwd, stdio: "inherit" });
}

function pack(packageDir) {
  run("pnpm", ["pack", "--pack-destination", tarballs], packageDir);
}

function findTarball(prefix) {
  const name = readdirSync(tarballs).find((entry) => entry.startsWith(prefix));
  if (!name) throw new Error(`Missing packed tarball matching ${prefix}`);
  return join(tarballs, name);
}

function readPackedManifest(tarball) {
  return JSON.parse(
    execFileSync("tar", ["-xOf", tarball, "package/package.json"], { encoding: "utf8" }),
  );
}

function assertPackedManifest(tarball, packageName, requiredFiles, forbidSource = true) {
  const listing = execFileSync("tar", ["-tf", tarball], { encoding: "utf8" });
  const entries = new Set(listing.split("\n"));
  for (const required of ["package/package.json", "package/README.md", ...requiredFiles]) {
    if (!entries.has(required)) {
      throw new Error(`${tarball} does not contain ${required}`);
    }
  }
  if (forbidSource && [...entries].some((entry) => entry.startsWith("package/src/"))) {
    throw new Error(`${tarball} unexpectedly publishes source files`);
  }

  const manifest = readPackedManifest(tarball);
  if (manifest.name !== packageName || manifest.version !== releaseVersion) {
    throw new Error(
      `${tarball} packed ${manifest.name}@${manifest.version}; expected ${packageName}@${releaseVersion}`,
    );
  }
  return manifest;
}

function verifyConsumer(reactVersion, tokensTarball, reactTarball) {
  const consumer = join(temp, `react-${reactVersion.split(".")[0]}`);
  mkdirSync(consumer, { recursive: true });
  writeFileSync(
    join(consumer, "package.json"),
    JSON.stringify({ name: `alchyx-react-${reactVersion.split(".")[0]}-smoke`, private: true }, null, 2),
  );
  const reactMajor = reactVersion.split(".")[0];
  run(
    "npm",
    [
      "install",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      `react@${reactVersion}`,
      `react-dom@${reactVersion}`,
      `@types/react@${reactMajor}`,
      `@types/react-dom@${reactMajor}`,
      tokensTarball,
      reactTarball,
    ],
    consumer,
  );

  const esm = [
    'import React from "react";',
    'import { renderToStaticMarkup } from "react-dom/server";',
    'import { tokens } from "@alchyx/tokens";',
    'import * as alchyx from "@alchyx/react";',
    `const required = ${JSON.stringify(componentExports)};`,
    'for (const name of required) if (!alchyx[name]) throw new Error(`Missing ESM export: ${name}`);',
    'if (!tokens || !alchyx.AlchyxProvider) throw new Error("Missing ESM foundations");',
    'const html = renderToStaticMarkup(React.createElement(alchyx.Button, null, "Packed button"));',
    'if (!html.includes("alx-btn")) throw new Error("Packed React render failed");',
  ].join("\n");
  run("node", ["--input-type=module", "--eval", esm], consumer);

  const cjs = [
    'const tokens = require("@alchyx/tokens");',
    'const react = require("@alchyx/react");',
    'if (!tokens.tokens || !react.Button) throw new Error("Missing CommonJS exports");',
  ].join("\n");
  run("node", ["--eval", cjs], consumer);

  const packageJson = JSON.parse(
    readFileSync(join(consumer, "node_modules", "@alchyx", "react", "package.json"), "utf8"),
  );
  const tokensPackageJson = JSON.parse(
    readFileSync(join(consumer, "node_modules", "@alchyx", "tokens", "package.json"), "utf8"),
  );
  if (packageJson.version !== releaseVersion || tokensPackageJson.version !== releaseVersion) {
    throw new Error(`Installed package versions do not match ${releaseVersion}`);
  }
  if (packageJson.dependencies?.["@alchyx/tokens"] !== releaseVersion) {
    throw new Error("Packed @alchyx/react must pin the matching @alchyx/tokens prerelease");
  }
  if (!packageJson.exports?.["./styles.css"]) {
    throw new Error("@alchyx/react is missing its styles.css export");
  }
  for (const relativePath of [
    ["react", "dist", "index.css"],
    ["tokens", "dist", "css", "index.css"],
    ["tokens", "dist", "css", "tailwind.css"],
  ]) {
    const path = join(consumer, "node_modules", "@alchyx", ...relativePath);
    if (!existsSync(path)) throw new Error(`Missing installed CSS asset: ${path}`);
  }

  const reactDirectory = join(consumer, "node_modules", "@alchyx", "react");
  const esmBundle = readFileSync(join(reactDirectory, "dist", "index.js"), "utf8");
  const cjsBundle = readFileSync(join(reactDirectory, "dist", "index.cjs"), "utf8");
  const componentCss = readFileSync(join(reactDirectory, "dist", "index.css"), "utf8");
  const tokenCss = readFileSync(
    join(consumer, "node_modules", "@alchyx", "tokens", "dist", "css", "index.css"),
    "utf8",
  );
  if (!esmBundle.trimStart().startsWith('"use client";')) {
    throw new Error("ESM bundle lost its use client directive");
  }
  if (!cjsBundle.slice(0, 100).includes('"use client";')) {
    throw new Error("CommonJS bundle lost its use client directive");
  }
  if (!componentCss.includes(".alx-dialog") || !componentCss.includes(".alx-switch")) {
    throw new Error("Generated React stylesheet is missing component CSS");
  }
  if (!tokenCss.includes("tokens.css") || !tokenCss.includes("utilities.css")) {
    throw new Error("Installed token foundation stylesheet is incomplete");
  }

  const fixture = join(consumer, "fixture.tsx");
  writeFileSync(
    fixture,
    [
      'import * as React from "react";',
      'import { AlchyxProvider, Button, Dialog, RadioGroup, RadioGroupItem, Slider, Switch } from "@alchyx/react";',
      'export const fixture = <AlchyxProvider skin="ark" accent="gold"><form><Button>Save</Button><Switch name="enabled" required label="Enabled" /><RadioGroup name="plan" required><RadioGroupItem value="pro" label="Pro" /></RadioGroup><Slider name="volume" defaultValue={20} aria-label="Volume" /><Dialog><span /></Dialog></form></AlchyxProvider>;',
    ].join("\n"),
  );
  const tsc = join(root, "node_modules", ".bin", process.platform === "win32" ? "tsc.cmd" : "tsc");
  run(
    tsc,
    [
      "--noEmit",
      "--strict",
      "--skipLibCheck",
      "--target",
      "ES2020",
      "--module",
      "ESNext",
      "--moduleResolution",
      "Bundler",
      "--jsx",
      "react-jsx",
      fixture,
    ],
    consumer,
  );
}

try {
  writeFileSync(join(temp, "package.json"), JSON.stringify({ private: true }, null, 2));
  mkdirSync(tarballs, { recursive: true });
  pack(join(root, "packages", "tokens"));
  pack(join(root, "packages", "react"));

  const tokensTarball = findTarball("alchyx-tokens-");
  const reactTarball = findTarball("alchyx-react-");
  assertPackedManifest(
    tokensTarball,
    "@alchyx/tokens",
    [
      "package/dist/index.js",
      "package/dist/index.cjs",
      "package/dist/index.d.ts",
      "package/dist/index.d.cts",
      "package/dist/css/index.css",
      "package/dist/css/tailwind.css",
    ],
    false,
  );
  const reactManifest = assertPackedManifest(reactTarball, "@alchyx/react", [
    "package/dist/index.js",
    "package/dist/index.cjs",
    "package/dist/index.d.ts",
    "package/dist/index.d.cts",
    "package/dist/index.css",
  ]);
  if (reactManifest.dependencies?.["@alchyx/tokens"] !== releaseVersion) {
    throw new Error("Packed React manifest did not rewrite workspace:* to the release version");
  }
  verifyConsumer("18.3.1", tokensTarball, reactTarball);
  verifyConsumer("19.2.4", tokensTarball, reactTarball);
  console.log("Alchyx package smoke checks passed for React 18 and React 19.");
} finally {
  rmSync(temp, { recursive: true, force: true });
}

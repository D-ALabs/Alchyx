import { copyFile, mkdir, readdir, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDirectory = resolve(packageRoot, "src/css");
const outputDirectory = resolve(packageRoot, "dist/css");

await rm(outputDirectory, { force: true, recursive: true });
await mkdir(outputDirectory, { recursive: true });

const files = (await readdir(sourceDirectory, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name.endsWith(".css"))
  .map((entry) => entry.name)
  .sort();

await Promise.all(
  files.map((file) => copyFile(resolve(sourceDirectory, file), resolve(outputDirectory, file))),
);

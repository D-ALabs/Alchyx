import { copyFile, mkdir, readdir } from "node:fs/promises";
import { constants } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const packageDirectory = path.resolve(scriptDirectory, "..");
const sourceDirectory = path.resolve(
  packageDirectory,
  "../../../Alchyx-web/src/alchyx/components",
);
const targetDirectory = path.join(packageDirectory, "src/components");

const componentDirectories = (await readdir(sourceDirectory, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

let copiedFiles = 0;
for (const componentDirectory of componentDirectories) {
  const sourceComponentDirectory = path.join(sourceDirectory, componentDirectory);
  const targetComponentDirectory = path.join(targetDirectory, componentDirectory);
  const runtimeFiles = (await readdir(sourceComponentDirectory))
    .filter(
      (fileName) =>
        fileName === "index.ts" ||
        fileName.endsWith(".css") ||
        (fileName.endsWith(".tsx") && fileName !== "Demo.tsx"),
    )
    .sort();

  await mkdir(targetComponentDirectory, { recursive: true });
  for (const fileName of runtimeFiles) {
    try {
      await copyFile(
        path.join(sourceComponentDirectory, fileName),
        path.join(targetComponentDirectory, fileName),
        constants.COPYFILE_EXCL,
      );
      copiedFiles += 1;
    } catch (error) {
      if (!(error instanceof Error) || !("code" in error) || error.code !== "EEXIST") throw error;
    }
  }
}

console.log(`Promoted ${copiedFiles} missing runtime files into @alchyx/react.`);

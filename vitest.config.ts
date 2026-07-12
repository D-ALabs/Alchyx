import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const fromRoot = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@alchyx\/tokens$/,
        replacement: fromRoot("./packages/tokens/src/index.ts"),
      },
    ],
    dedupe: ["react", "react-dom"],
  },
  test: {
    environment: "jsdom",
    setupFiles: [fromRoot("./tests/setup.ts")],
    include: ["tests/**/*.test.tsx"],
    css: false,
  },
});

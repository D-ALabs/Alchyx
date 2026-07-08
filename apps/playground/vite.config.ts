import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

// Alias the workspace packages to their TS source so Vite applies the JSX/TS
// transform to them (avoids the "source package inside node_modules" pitfall)
// and React stays a single copy. Most specific aliases first.
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: [
      { find: "@alchyx/react/styles.css", replacement: r("../../packages/react/src/index.css") },
      { find: "@alchyx/react", replacement: r("../../packages/react/src/index.ts") },
      { find: "@alchyx/tokens/tailwind", replacement: r("../../packages/tokens/src/tailwind-preset.ts") },
      { find: "@alchyx/tokens/css", replacement: r("../../packages/tokens/src/css/index.css") },
      { find: "@alchyx/tokens", replacement: r("../../packages/tokens/src/index.ts") },
    ],
  },
});

import { defineConfig } from "vite";

// Relative base path so the built site works when hosted under any subpath
// (e.g. apps.charliekrug.com/waterfall-autopsy), not just at domain root.
export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
  },
});

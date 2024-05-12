import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [dts({ rollupTypes: true }), tsconfigPaths()],
  build: {
    lib: {
      formats: ["es", "umd"],
      entry: resolve(import.meta.dirname, "./src/index.ts"),
      fileName: "index",
      name: "AddPromiseToFunction",
    },
  },
});

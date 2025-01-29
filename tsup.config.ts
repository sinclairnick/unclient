import { defineConfig } from "tsup";
import { subExports } from "esbuild-sub-exports";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    axios: "src/fetcher/axios.ts",
    fetch: "src/fetcher/fetch.ts",
  },
  clean: true,
  dts: true,
  format: ["cjs", "esm"],
  outDir: "dist",
  sourcemap: false,
  treeshake: "recommended",
  esbuildPlugins: [subExports({ entries: ["axios", "fetch"] })],
});

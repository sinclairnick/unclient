import { defineConfig } from "tsup";
import pkg from "./package.json";
import fs from "node:fs/promises";

const Exports = ["axios", "fetch"];

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
  async onSuccess() {
    const files = new Set(pkg.files);

    for (const ex of Exports) {
      files.add(`dist/${ex}.mjs`);
      files.add(`dist/${ex}.js`);
      files.add(`dist/${ex}.d.ts`);

      pkg.exports[`./${ex}`] = {
        types: `./dist/${ex}.d.ts`,
        import: `./dist/${ex}.mjs`,
        require: `./dist/${ex}.js`,
      };
    }

    await fs.writeFile(
      "./package.json",
      JSON.stringify(
        {
          ...pkg,
          files: Array.from(files),
        },
        null,
        2
      )
    );
  },
});

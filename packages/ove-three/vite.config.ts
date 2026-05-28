// eslint-disable-next-line @nx/enforce-module-boundaries
import viteReactConfig from "../../vite.react.config";
import path from "node:path";
import { defineConfig, mergeConfig } from "vite";

const baseConfig = viteReactConfig({
  name: "ove-three",
  dir: __dirname
});

export default defineConfig(configEnv =>
  mergeConfig(baseConfig(configEnv), {
    resolve: {
      alias: {
        "@teselagen/range-utils": path.resolve(
          __dirname,
          "../range-utils/src/index.js"
        ),
        "@teselagen/sequence-utils": path.resolve(
          __dirname,
          "../sequence-utils/src/index.js"
        )
      }
    }
  })
);

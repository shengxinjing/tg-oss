import assert from "assert";
import { readFileSync } from "fs";

const packageJson = JSON.parse(
  readFileSync(new URL("../../package.json", import.meta.url), "utf8")
);
const readme = readFileSync(
  new URL("../../README.md", import.meta.url),
  "utf8"
);

describe("ove-three dependency and handoff review", () => {
  it("keeps debug-only tools out of runtime dependencies", () => {
    const runtimeDependencies = Object.keys(packageJson.dependencies || {});

    assert(!runtimeDependencies.includes("leva"));
    assert(!runtimeDependencies.includes("spectorjs"));
    assert(!runtimeDependencies.includes("spector.js"));
  });

  it("documents the standalone verification workflow", () => {
    assert(readme.includes("packages/ove-three"));
    assert(readme.includes("yarn nx run ove-three:test"));
    assert(readme.includes("yarn nx run ove-three:e2e"));
    assert(readme.includes("standalone"));
  });
});

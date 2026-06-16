import assert from "assert";
import { readFileSync } from "fs";

const packageJson = JSON.parse(
  readFileSync(new URL("../../package.json", import.meta.url), "utf8")
);
const readme = readFileSync(
  new URL("../../README.md", import.meta.url),
  "utf8"
);
const visualBaselineSpec = readFileSync(
  new URL("../../cypress/e2e/visual-baselines.cy.js", import.meta.url),
  "utf8"
);
const publicApi = readFileSync(new URL("../index.js", import.meta.url), "utf8");

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

  it("keeps visual baseline capture aligned with release scenarios", () => {
    assert(visualBaselineSpec.includes("circular-default-linked"));
    assert(visualBaselineSpec.includes("linear-default-linked"));
    assert(visualBaselineSpec.includes("dense-circular-labels"));
    assert(visualBaselineSpec.includes("row-huge-scroll"));
    assert(visualBaselineSpec.includes("row-200k-scroll"));
  });

  it("keeps the public API surface focused", () => {
    const exports = publicApi
      .split("\n")
      .filter(line => line.startsWith("export "));

    assert(exports.length <= 10);
    assert(publicApi.includes("ThreeDGeneViewer"));
    assert(publicApi.includes("exportCanvasPng"));
  });
});

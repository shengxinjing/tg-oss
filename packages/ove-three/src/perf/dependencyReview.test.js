import assert from "assert";
import { readFileSync } from "fs";

const packageJson = JSON.parse(
  readFileSync(new URL("../../package.json", import.meta.url), "utf8")
);
const readme = readFileSync(
  new URL("../../README.md", import.meta.url),
  "utf8"
);
const releaseReadiness = readFileSync(
  new URL("../../docs/release-readiness.md", import.meta.url),
  "utf8"
);
const interactionGuide = readFileSync(
  new URL("../../docs/interaction-guide.md", import.meta.url),
  "utf8"
);
const completionAudit = readFileSync(
  new URL("../../docs/completion-audit.md", import.meta.url),
  "utf8"
);
const codeReview = readFileSync(
  new URL("../../docs/code-review.md", import.meta.url),
  "utf8"
);
const releaseNotes = readFileSync(
  new URL("../../docs/release-notes.md", import.meta.url),
  "utf8"
);
const fullParityBacklog = readFileSync(
  new URL("../../docs/full-svg-ove-parity-backlog.md", import.meta.url),
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

  it("documents release readiness and standalone migration checks", () => {
    assert(readme.includes("release-readiness.md"));
    assert(releaseReadiness.includes("Visual Regression"));
    assert(releaseReadiness.includes("visualRegressionBaselines.js"));
    assert(releaseReadiness.includes("visual-baselines.cy.js"));
    assert(releaseReadiness.includes("Performance Budgets"));
    assert(releaseReadiness.includes("validateRenderStatsAgainstBudget"));
    assert(releaseReadiness.includes("Day 396"));
    assert(releaseReadiness.includes("Day 420"));
    assert(releaseReadiness.includes("Standalone Repository Checklist"));
    assert(releaseReadiness.includes("git diff --name-only -- packages/ove"));
    assert(readme.includes("full-svg-ove-parity-backlog.md"));
    assert(readme.includes("Performance stats"));
  });

  it("keeps visual baseline capture aligned with release scenarios", () => {
    assert(visualBaselineSpec.includes("circular-default-linked"));
    assert(visualBaselineSpec.includes("linear-default-linked"));
    assert(visualBaselineSpec.includes("dense-circular-labels"));
    assert(visualBaselineSpec.includes("row-huge-scroll"));
    assert(visualBaselineSpec.includes("row-200k-scroll"));
  });

  it("documents user interactions, controls, and biological terms", () => {
    assert(readme.includes("interaction-guide.md"));
    assert(interactionGuide.includes("Linked Two-Column View"));
    assert(interactionGuide.includes("Top Menu Buttons"));
    assert(interactionGuide.includes("Right Panel Controls"));
    assert(interactionGuide.includes("Biological Terms"));
    assert(interactionGuide.includes("Circular Map"));
    assert(interactionGuide.includes("Linear Map"));
    assert(interactionGuide.includes("Sequence Map"));
    assert(interactionGuide.includes("Restriction enzyme"));
    assert(interactionGuide.includes("Reverse complement"));
  });

  it("documents code review scope and current release summary", () => {
    assert(readme.includes("completion-audit.md"));
    assert(readme.includes("code-review.md"));
    assert(readme.includes("release-notes.md"));
    assert(completionAudit.includes("Requested Goal"));
    assert(completionAudit.includes("Circular + Sequence linked layout"));
    assert(completionAudit.includes("Linear + Sequence linked layout"));
    assert(completionAudit.includes("Important Scope Note"));
    assert(codeReview.includes("Scope Reviewed"));
    assert(codeReview.includes("No P0/P1 blockers"));
    assert(codeReview.includes("packages/ove"));
    assert(releaseNotes.includes("Major Features"));
    assert(releaseNotes.includes("Linked two-column layout"));
    assert(releaseNotes.includes("Not Full SVG Parity Yet"));
  });

  it("documents the unfinished full SVG OVE parity backlog", () => {
    assert(fullParityBacklog.includes("100% SVG OVE Parity Backlog"));
    assert(fullParityBacklog.includes("Circular Map"));
    assert(fullParityBacklog.includes("Linear Map"));
    assert(fullParityBacklog.includes("Sequence Map / Row View"));
    assert(fullParityBacklog.includes("Editor And Tool Parity"));
    assert(fullParityBacklog.includes("real chromatogram"));
    assert(fullParityBacklog.includes("parser-backed"));
    assert(fullParityBacklog.includes("git diff --name-only -- packages/ove"));
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

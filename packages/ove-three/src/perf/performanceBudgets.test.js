import assert from "assert";
import {
  getPerformanceBudget,
  performanceBudgets,
  validateRenderStatsAgainstBudget
} from "./performanceBudgets";

describe("ove-three performance budgets", () => {
  it("defines release budgets for small, dense, huge, and 200k fixtures", () => {
    assert.equal(performanceBudgets.smallCircular.targetFps, 60);
    assert.equal(performanceBudgets.denseCircular.targetFps, 50);
    assert.equal(performanceBudgets.hugeRow.targetFps, 30);
    assert.equal(performanceBudgets.row200k.targetFps, 30);
  });

  it("maps known fixtures to their expected budget", () => {
    assert.equal(getPerformanceBudget("pUC57_modified").targetFps, 60);
    assert.equal(
      getPerformanceBudget("dense_annotations_fixture").targetFps,
      50
    );
    assert.equal(getPerformanceBudget("huge_row_fixture").targetFps, 30);
    assert.equal(getPerformanceBudget("row_200k_fixture").targetFps, 30);
  });

  it("validates measured renderer stats against budget limits", () => {
    const result = validateRenderStatsAgainstBudget("huge_row_fixture", {
      fps: 31,
      drawCalls: 60,
      objectCount: 320,
      triangles: 12000
    });

    assert.equal(result.passed, true);
    assert.deepEqual(result.failures, []);

    const failingResult = validateRenderStatsAgainstBudget("huge_row_fixture", {
      fps: 20,
      drawCalls: 120,
      objectCount: 800,
      triangles: 50000
    });

    assert.equal(failingResult.passed, false);
    assert(failingResult.failures.includes("fps below 30"));
    assert(failingResult.failures.includes("draw calls above 90"));
    assert(failingResult.failures.includes("objects above 650"));
    assert(failingResult.failures.includes("triangles above 30000"));
  });
});

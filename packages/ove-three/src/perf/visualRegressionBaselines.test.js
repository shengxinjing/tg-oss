import assert from "assert";
import {
  getVisualRegressionBaseline,
  visualRegressionBaselines
} from "./visualRegressionBaselines";
import { getPerformanceBudget } from "./performanceBudgets";

describe("ove-three visual regression baselines", () => {
  it("covers linked circular, linked linear, dense circular, huge row, and 200k row", () => {
    const ids = visualRegressionBaselines.map(baseline => baseline.id);

    assert(ids.includes("circular-default-linked"));
    assert(ids.includes("linear-default-linked"));
    assert(ids.includes("dense-circular-labels"));
    assert(ids.includes("row-huge-scroll"));
    assert(ids.includes("row-200k-scroll"));
  });

  it("marks linked map baselines as two-pane checks", () => {
    assert.deepEqual(
      getVisualRegressionBaseline("circular-default-linked").expectedPanes,
      ["circular", "sequence"]
    );
    assert.deepEqual(
      getVisualRegressionBaseline("linear-default-linked").expectedPanes,
      ["linear", "sequence"]
    );
  });

  it("ties each visual baseline to a performance budget", () => {
    visualRegressionBaselines.forEach(baseline => {
      assert(baseline.budgetKey);
      assert(getPerformanceBudget(baseline.fixture).targetFps > 0);
      assert.equal(
        getPerformanceBudget(baseline.fixture),
        getPerformanceBudget(baseline.budgetKey)
      );
    });
  });
});

export const visualRegressionBaselines = [
  {
    id: "circular-default-linked",
    fixture: "pUC57_modified",
    budgetKey: "smallCircular",
    view: "circular",
    expectedPanes: ["circular", "sequence"],
    checks: ["canvas-painted", "linked-selection", "feature-labels"]
  },
  {
    id: "linear-default-linked",
    fixture: "pUC57_modified",
    budgetKey: "smallCircular",
    view: "linear",
    expectedPanes: ["linear", "sequence"],
    checks: ["canvas-painted", "linked-selection", "feature-lanes"]
  },
  {
    id: "row-huge-scroll",
    fixture: "huge_row_fixture",
    budgetKey: "hugeRow",
    view: "row",
    expectedPanes: ["row"],
    checks: ["canvas-painted", "virtual-scroll", "row-debug"]
  },
  {
    id: "row-200k-scroll",
    fixture: "row_200k_fixture",
    budgetKey: "row200k",
    view: "row",
    expectedPanes: ["row"],
    checks: ["canvas-painted", "virtual-scroll", "row-debug"]
  },
  {
    id: "dense-circular-labels",
    fixture: "dense_annotations_fixture",
    budgetKey: "denseCircular",
    view: "circular",
    expectedPanes: ["circular", "sequence"],
    checks: ["canvas-painted", "label-limit", "no-label-overlap"]
  }
];

export function getVisualRegressionBaseline(id) {
  return visualRegressionBaselines.find(baseline => baseline.id === id) || null;
}

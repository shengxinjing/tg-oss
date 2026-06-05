export const performanceBudgets = {
  smallCircular: {
    fixtures: ["pUC57_modified", "small_circular_fixture"],
    targetFps: 60,
    maxDrawCalls: 250,
    maxObjects: 400,
    maxTriangles: 25000
  },
  denseCircular: {
    fixtures: ["dense_annotations_fixture", "large_circular_fixture"],
    targetFps: 50,
    maxDrawCalls: 220,
    maxObjects: 2400,
    maxTriangles: 60000
  },
  hugeRow: {
    fixtures: ["huge_row_fixture"],
    targetFps: 30,
    maxDrawCalls: 90,
    maxObjects: 650,
    maxTriangles: 30000
  },
  row200k: {
    fixtures: ["row_200k_fixture"],
    targetFps: 30,
    maxDrawCalls: 90,
    maxObjects: 650,
    maxTriangles: 30000
  }
};

export function getPerformanceBudget(fixtureName) {
  if (performanceBudgets[fixtureName]) return performanceBudgets[fixtureName];

  return (
    Object.values(performanceBudgets).find(budget =>
      budget.fixtures.includes(fixtureName)
    ) || performanceBudgets.smallCircular
  );
}

export function validateRenderStatsAgainstBudget(fixtureName, stats = {}) {
  const budget = getPerformanceBudget(fixtureName);
  const failures = [];
  const fps = Number(stats.fps);
  const drawCalls = Number(stats.drawCalls);
  const objectCount = Number(stats.objectCount);
  const triangles = Number(stats.triangles);

  if (Number.isFinite(fps) && fps < budget.targetFps) {
    failures.push(`fps below ${budget.targetFps}`);
  }
  if (Number.isFinite(drawCalls) && drawCalls > budget.maxDrawCalls) {
    failures.push(`draw calls above ${budget.maxDrawCalls}`);
  }
  if (Number.isFinite(objectCount) && objectCount > budget.maxObjects) {
    failures.push(`objects above ${budget.maxObjects}`);
  }
  if (Number.isFinite(triangles) && triangles > budget.maxTriangles) {
    failures.push(`triangles above ${budget.maxTriangles}`);
  }

  return {
    budget,
    failures,
    passed: failures.length === 0
  };
}

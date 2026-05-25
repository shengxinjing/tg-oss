import assert from "assert";
import createSelectionGeometry from "./createSelectionGeometry";

describe("createSelectionGeometry", () => {
  it("creates a non-empty circular selection ribbon", () => {
    const geometry = createSelectionGeometry({
      startAngle: 0,
      endAngle: Math.PI / 2,
      totalAngle: Math.PI / 2
    });

    assert(geometry.getAttribute("position").count > 0);
    assert(geometry.index.count > 0);
  });
});

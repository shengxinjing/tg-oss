import assert from "assert";
import {
  getLinearAnnotationLayout,
  linearMapStyle
} from "./LinearAnnotationLayer";

describe("LinearAnnotationLayer", () => {
  it("uses readable map-scale feature and primer lanes", () => {
    const feature = getLinearAnnotationLayout("feature", 0);
    const primer = getLinearAnnotationLayout("primer", 1);

    assert(feature.height >= 0.42);
    assert(feature.fontSize >= 0.24);
    assert(primer.y - feature.y >= 1.2);
  });

  it("stacks lanes vertically without wrapping", () => {
    const lane0 = getLinearAnnotationLayout("feature", 0);
    const lane3 = getLinearAnnotationLayout("feature", 3);
    assert(lane3.y > lane0.y);
    assert.equal(Number((lane3.y - lane0.y).toFixed(2)), 2.16);
  });

  it("uses SVG-like flat map colors", () => {
    assert.equal(linearMapStyle.backgroundColor, "#f8fafc");
    assert.equal(linearMapStyle.textColor, "#111827");
    assert.equal(linearMapStyle.strokeColor, "#111827");
    assert.equal(linearMapStyle.partColor, "#b65ce8");
  });
});

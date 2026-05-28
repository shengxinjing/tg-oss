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

  it("uses SVG-like flat map colors", () => {
    assert.equal(linearMapStyle.backgroundColor, "#0b1422");
    assert.equal(linearMapStyle.textColor, "#e5eefb");
    assert.equal(linearMapStyle.strokeColor, "#dbeafe");
  });
});

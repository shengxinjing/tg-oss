import assert from "assert";
import createArrowArcGeometry from "./createArrowArcGeometry";

describe("createArrowArcGeometry", () => {
  it("puts the arrow tip at the end for forward primers", () => {
    const geometry = createArrowArcGeometry({
      startAngle: 0,
      endAngle: Math.PI / 2,
      radius: 2,
      width: 0.24,
      direction: "forward",
      segmentCount: 4
    });

    assert.equal(geometry.userData.direction, "forward");
    assert(Math.abs(geometry.userData.arrowTipAngle - Math.PI / 2) < 0.0001);
    assert(geometry.attributes.position.count > 6);
  });

  it("puts the arrow tip at the start for reverse primers", () => {
    const geometry = createArrowArcGeometry({
      startAngle: 0,
      endAngle: Math.PI / 2,
      radius: 2,
      width: 0.24,
      direction: "reverse",
      segmentCount: 4
    });

    assert.equal(geometry.userData.direction, "reverse");
    assert(Math.abs(geometry.userData.arrowTipAngle) < 0.0001);
    assert(geometry.attributes.position.count > 6);
  });

  it("keeps short primers visible", () => {
    const geometry = createArrowArcGeometry({
      startAngle: 1,
      endAngle: 1.0001,
      radius: 2,
      width: 0.24,
      minVisibleAngle: 0.08
    });

    geometry.computeBoundingBox();

    assert(geometry.userData.visibleLength >= 0.08);
    assert(geometry.boundingBox.max.x - geometry.boundingBox.min.x > 0.01);
    assert(geometry.boundingBox.max.z - geometry.boundingBox.min.z > 0.01);
  });
});

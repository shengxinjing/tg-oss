import assert from "assert";
import createArcRibbonGeometry from "./createArcRibbonGeometry";

describe("createArcRibbonGeometry", () => {
  it("creates a non-empty indexed ribbon geometry", () => {
    const geometry = createArcRibbonGeometry({
      startAngle: 0,
      endAngle: Math.PI / 2,
      radius: 2,
      width: 0.4,
      segmentCount: 8
    });

    assert.equal(geometry.attributes.position.count, 18);
    assert.equal(geometry.index.count, 48);
  });

  it("maps start and end angles onto the circular coordinate system", () => {
    const geometry = createArcRibbonGeometry({
      startAngle: 0,
      endAngle: Math.PI / 2,
      radius: 2,
      width: 0.4,
      segmentCount: 1
    });
    const position = geometry.attributes.position;

    assert(Math.abs(position.getX(0)) < 0.0001);
    assert(position.getZ(0) < -2);
    assert(position.getX(2) > 2);
    assert(Math.abs(position.getZ(2)) < 0.0001);
  });

  it("keeps very short ranges visible", () => {
    const geometry = createArcRibbonGeometry({
      startAngle: 1,
      endAngle: 1.0001,
      radius: 2,
      width: 0.4,
      minVisibleAngle: 0.08
    });

    geometry.computeBoundingBox();

    assert(geometry.boundingBox.max.x - geometry.boundingBox.min.x > 0.01);
    assert(geometry.boundingBox.max.z - geometry.boundingBox.min.z > 0.01);
  });
});

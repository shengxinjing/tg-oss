import assert from "assert";
import createTickGeometry from "./createTickGeometry";

describe("createTickGeometry", () => {
  it("creates a radial tick quad", () => {
    const geometry = createTickGeometry({
      angle: 0,
      radius: 2,
      length: 0.4,
      width: 0.08
    });

    assert.equal(geometry.attributes.position.count, 4);
    assert.equal(geometry.index.count, 6);
  });

  it("places angle zero at the top of the circular map", () => {
    const geometry = createTickGeometry({
      angle: 0,
      radius: 2,
      length: 0.4,
      width: 0.08
    });
    const position = geometry.attributes.position;

    assert(Math.abs(position.getX(0)) < 0.1);
    assert(position.getZ(0) < -1.9);
  });
});

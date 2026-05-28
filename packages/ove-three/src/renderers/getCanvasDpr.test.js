import assert from "assert";
import getCanvasDpr from "./getCanvasDpr";

describe("getCanvasDpr", () => {
  it("caps DPR to keep mobile and retina canvases predictable", () => {
    assert.deepEqual(getCanvasDpr(3), [1, 2]);
    assert.deepEqual(getCanvasDpr(1.5), [1, 1.5]);
    assert.deepEqual(getCanvasDpr(0), [1, 1]);
  });
});

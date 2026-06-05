import assert from "assert";
import getNextCircularRotation from "./getNextCircularRotation";

describe("getNextCircularRotation", () => {
  it("turns wheel movement into circular rotation", () => {
    assert.equal(getNextCircularRotation({ rotation: 0, deltaY: 120 }), 10);
  });

  it("wraps rotation inside the circular range", () => {
    assert.equal(getNextCircularRotation({ rotation: 355, deltaY: 120 }), 5);
    assert.equal(getNextCircularRotation({ rotation: 5, deltaY: -120 }), 355);
  });
});

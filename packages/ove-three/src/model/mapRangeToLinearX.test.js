import assert from "assert";
import mapRangeToLinearX from "./mapRangeToLinearX";

describe("linearMapping", () => {
  it("maps a range to linear x coordinates", () => {
    assert.deepEqual(
      mapRangeToLinearX({ start: 2, end: 5 }, { baseWidth: 10 }),
      {
        startX: 20,
        endX: 60,
        width: 40
      }
    );
  });
});

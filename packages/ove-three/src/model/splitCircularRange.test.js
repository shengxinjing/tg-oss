import assert from "assert";
import splitCircularRange from "./splitCircularRange";

describe("splitCircularRange", () => {
  it("keeps a normal range as one segment", () => {
    const segments = splitCircularRange({ start: 10, end: 20, length: 100 });

    assert.deepEqual(segments, [{ start: 10, end: 20 }]);
  });

  it("splits a range that crosses the origin", () => {
    const segments = splitCircularRange({ start: 90, end: 10, length: 100 });

    assert.deepEqual(segments, [
      { start: 90, end: 99 },
      { start: 0, end: 10 }
    ]);
  });

  it("splits joined locations into multiple segments", () => {
    const segments = splitCircularRange({
      length: 100,
      locations: [
        { start: 5, end: 15 },
        { start: 80, end: 8 }
      ]
    });

    assert.deepEqual(segments, [
      { start: 5, end: 15 },
      { start: 80, end: 99 },
      { start: 0, end: 8 }
    ]);
  });

  it("does not crash on an empty sequence", () => {
    assert.deepEqual(splitCircularRange({ start: 0, end: 0, length: 0 }), []);
  });
});

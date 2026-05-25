import assert from "assert";
import mapPointerToLinearPosition from "./mapPointerToLinearPosition";

describe("linearMapping", () => {
  it("maps x=0 to the first position", () => {
    assert.equal(
      mapPointerToLinearPosition(
        { x: 0 },
        { left: 0, baseWidth: 10, sequenceLength: 100 }
      ).position,
      0
    );
  });

  it("maps character midpoint to the matching position", () => {
    assert.equal(
      mapPointerToLinearPosition(
        { x: 25 },
        { left: 0, baseWidth: 10, sequenceLength: 100 }
      ).position,
      2
    );
  });

  it("clamps pointers past the linear end", () => {
    assert.equal(
      mapPointerToLinearPosition(
        { x: 1200 },
        { left: 0, baseWidth: 10, sequenceLength: 100 }
      ).position,
      99
    );
  });

  it("snaps protein mode positions to codon boundaries", () => {
    const result = mapPointerToLinearPosition(
      { x: 55 },
      { left: 0, baseWidth: 10, sequenceLength: 100, mode: "protein" }
    );

    assert.equal(result.position, 3);
    assert.equal(result.position % 3, 0);
  });
});

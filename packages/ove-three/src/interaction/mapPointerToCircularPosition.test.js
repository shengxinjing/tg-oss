import assert from "assert";
import mapPointerToCircularPosition from "./mapPointerToCircularPosition";

const circle = {
  centerX: 100,
  centerY: 100,
  radius: 80,
  sequenceLength: 100
};

describe("mapPointerToCircularPosition", () => {
  it("maps top/right/bottom/left pointers to circular positions", () => {
    assert.equal(
      mapPointerToCircularPosition({ x: 100, y: 20 }, circle).position,
      0
    );
    assert.equal(
      mapPointerToCircularPosition({ x: 180, y: 100 }, circle).position,
      25
    );
    assert.equal(
      mapPointerToCircularPosition({ x: 100, y: 180 }, circle).position,
      50
    );
    assert.equal(
      mapPointerToCircularPosition({ x: 20, y: 100 }, circle).position,
      75
    );
  });

  it("compensates for circular view rotation", () => {
    const result = mapPointerToCircularPosition(
      { x: 180, y: 100 },
      {
        ...circle,
        rotationRadians: Math.PI / 2
      }
    );

    assert.equal(result.position, 0);
  });

  it("returns null for pointers outside the circular hit area", () => {
    assert.equal(
      mapPointerToCircularPosition({ x: 300, y: 300 }, circle),
      null
    );
  });

  it("snaps protein mode positions to codon boundaries", () => {
    const result = mapPointerToCircularPosition(
      { x: 180, y: 100 },
      {
        ...circle,
        sequenceLength: 99,
        mode: "protein"
      }
    );

    assert.equal(result.position % 3, 0);
  });
});

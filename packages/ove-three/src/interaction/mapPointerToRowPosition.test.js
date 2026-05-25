import assert from "assert";
import mapPointerToRowPosition from "./mapPointerToRowPosition";

describe("rowMapping", () => {
  it("maps y to the visible row and x to the row position", () => {
    const result = mapPointerToRowPosition(
      { x: 25, y: 35 },
      {
        left: 0,
        top: 20,
        baseWidth: 10,
        rowHeight: 20,
        basesPerRow: 10,
        sequenceLength: 100
      }
    );

    assert.equal(result.rowIndex, 0);
    assert.equal(result.position, 2);
  });

  it("maps lower y values to later visible rows", () => {
    const result = mapPointerToRowPosition(
      { x: 35, y: 62 },
      {
        left: 0,
        top: 20,
        baseWidth: 10,
        rowHeight: 20,
        basesPerRow: 10,
        sequenceLength: 100
      }
    );

    assert.equal(result.rowIndex, 2);
    assert.equal(result.position, 23);
  });

  it("clamps x past the row end", () => {
    const result = mapPointerToRowPosition(
      { x: 900, y: 10 },
      {
        left: 0,
        top: 0,
        baseWidth: 10,
        rowHeight: 20,
        basesPerRow: 10,
        sequenceLength: 23
      }
    );

    assert.equal(result.position, 9);
  });

  it("returns null for pointers below the final row", () => {
    assert.equal(
      mapPointerToRowPosition(
        { x: 0, y: 100 },
        {
          left: 0,
          top: 0,
          baseWidth: 10,
          rowHeight: 20,
          basesPerRow: 10,
          sequenceLength: 23
        }
      ),
      null
    );
  });
});

import assert from "assert";
import getNextVisibleStartRow from "./getNextVisibleStartRow";

describe("getNextVisibleStartRow", () => {
  it("moves several rows for a large wheel delta", () => {
    assert.equal(
      getNextVisibleStartRow({
        currentStartRow: 0,
        deltaY: 360,
        rowHeightPx: 72,
        totalRows: 100,
        visibleRowCount: 10
      }),
      5
    );
  });

  it("clamps within the available row range", () => {
    assert.equal(
      getNextVisibleStartRow({
        currentStartRow: 88,
        deltaY: 360,
        rowHeightPx: 72,
        totalRows: 100,
        visibleRowCount: 10
      }),
      90
    );
  });
});

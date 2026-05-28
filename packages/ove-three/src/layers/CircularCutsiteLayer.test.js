import assert from "assert";
import { getCutsiteLabelStyle } from "./CircularCutsiteLayer";

describe("CircularCutsiteLayer", () => {
  it("shrinks and samples cutsite labels in dense circular scenes", () => {
    const style = getCutsiteLabelStyle({ cutsiteCount: 240, index: 5 });

    assert(style.fontSize < 0.07);
    assert.equal(style.showLabel, false);
  });

  it("keeps normal cutsite labels readable in small circular scenes", () => {
    const style = getCutsiteLabelStyle({ cutsiteCount: 12, index: 5 });

    assert.equal(style.fontSize, 0.11);
    assert.equal(style.showLabel, true);
  });
});

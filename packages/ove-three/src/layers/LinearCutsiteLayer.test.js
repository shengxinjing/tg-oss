import assert from "assert";
import { getLinearCutsiteLayout } from "./LinearCutsiteLayer";

describe("LinearCutsiteLayer", () => {
  it("uses readable map-scale cutsite ticks and labels", () => {
    const layout = getLinearCutsiteLayout(0);

    assert(layout.tickHeight >= 0.65);
    assert(layout.fontSize >= 0.2);
  });
});

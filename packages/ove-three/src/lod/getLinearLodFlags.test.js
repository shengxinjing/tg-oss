import { describe, expect, it } from "bun:test";
import getLinearLodFlags from "./getLinearLodFlags";

describe("getLinearLodFlags", () => {
  it("shows only the backbone bar when zoomed out", () => {
    const flags = getLinearLodFlags({ pixelsPerBase: 1 });
    expect(flags.showBackboneBar).toBe(true);
    expect(flags.showBases).toBe(false);
    expect(flags.showComplement).toBe(false);
    expect(flags.showTranslation).toBe(false);
  });

  it("reveals bases (and hides the bar) past the base threshold", () => {
    const flags = getLinearLodFlags({ pixelsPerBase: 7 });
    expect(flags.showBases).toBe(true);
    expect(flags.showBackboneBar).toBe(false);
    expect(flags.showComplement).toBe(false);
  });

  it("reveals complement then translation as px/base grows", () => {
    expect(getLinearLodFlags({ pixelsPerBase: 10 }).showComplement).toBe(true);
    expect(getLinearLodFlags({ pixelsPerBase: 10 }).showTranslation).toBe(
      false
    );
    expect(getLinearLodFlags({ pixelsPerBase: 20 }).showTranslation).toBe(true);
  });

  it("is monotonic in detail as px/base increases", () => {
    const low = getLinearLodFlags({ pixelsPerBase: 2 });
    const mid = getLinearLodFlags({ pixelsPerBase: 10 });
    const high = getLinearLodFlags({ pixelsPerBase: 20 });
    expect([low.showBases, mid.showBases, high.showBases]).toEqual([
      false,
      true,
      true
    ]);
    expect(high.showTranslation && mid.showBases && !low.showBases).toBe(true);
  });
});

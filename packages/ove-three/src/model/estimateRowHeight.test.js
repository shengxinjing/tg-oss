import { describe, expect, it } from "bun:test";
import estimateRowHeight from "./estimateRowHeight";

describe("estimateRowHeight", () => {
  it("a bare forward-only row is the shortest", () => {
    const bare = estimateRowHeight({
      showComplement: false,
      showAxis: false
    });
    const full = estimateRowHeight({
      showComplement: true,
      showAxis: true,
      showTranslations: true
    });
    expect(bare).toBeGreaterThan(0);
    expect(full).toBeGreaterThan(bare);
  });

  it("each layer adds height", () => {
    const base = estimateRowHeight({ showComplement: false, showAxis: false });
    expect(
      estimateRowHeight({ showComplement: true, showAxis: false })
    ).toBeGreaterThan(base);
    expect(
      estimateRowHeight({
        showComplement: false,
        showAxis: false,
        showTranslations: true
      })
    ).toBeGreaterThan(base);
    expect(
      estimateRowHeight({
        showComplement: false,
        showAxis: false,
        showChromatogram: true
      })
    ).toBeGreaterThan(base);
  });

  it("annotation lanes scale the height", () => {
    const none = estimateRowHeight({ annotationLanes: 0 });
    const two = estimateRowHeight({ annotationLanes: 2 });
    const four = estimateRowHeight({ annotationLanes: 4 });
    expect(two).toBeGreaterThan(none);
    expect(four - two).toBeCloseTo(two - none, 6);
  });

  it("chromatogram adds the most of any single layer", () => {
    const base = { showComplement: false, showAxis: false };
    const chroma =
      estimateRowHeight({ ...base, showChromatogram: true }) -
      estimateRowHeight(base);
    const translations =
      estimateRowHeight({ ...base, showTranslations: true }) -
      estimateRowHeight(base);
    expect(chroma).toBeGreaterThan(translations);
  });
});

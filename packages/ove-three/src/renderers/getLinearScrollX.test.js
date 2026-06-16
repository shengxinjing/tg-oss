import { describe, expect, it } from "bun:test";
import getLinearScrollX from "./getLinearScrollX";

describe("getLinearScrollX", () => {
  it("returns 0 when the whole model fits (zoomed out)", () => {
    expect(
      getLinearScrollX({
        position: 500,
        baseWidth: 0.02,
        modelWidth: 20,
        cameraZoom: 10,
        canvasWidth: 1000 // visible 100 >> modelWidth 20
      })
    ).toBe(0);
  });

  it("returns 0 for invalid inputs", () => {
    expect(getLinearScrollX({})).toBe(0);
    expect(getLinearScrollX({ modelWidth: 0, canvasWidth: 100 })).toBe(0);
  });

  it("clamps to the left edge when focusing the start while zoomed in", () => {
    // visible 5 < modelWidth 40 → zoomed in
    const x = getLinearScrollX({
      position: 0,
      baseWidth: 0.02,
      modelWidth: 40,
      cameraZoom: 200,
      canvasWidth: 1000
    });
    expect(x).toBeCloseTo(-(40 / 2 - 5 / 2), 6); // -maxX
  });

  it("clamps to the right edge when focusing the end", () => {
    const x = getLinearScrollX({
      position: 2000,
      baseWidth: 0.02,
      modelWidth: 40,
      cameraZoom: 200,
      canvasWidth: 1000
    });
    expect(x).toBeCloseTo(40 / 2 - 5 / 2, 6); // +maxX
  });

  it("centers on a mid-sequence focus when zoomed in", () => {
    const modelWidth = 40;
    const baseWidth = 0.02;
    const midPosition = modelWidth / 2 / baseWidth; // exact center
    const x = getLinearScrollX({
      position: midPosition,
      baseWidth,
      modelWidth,
      cameraZoom: 200,
      canvasWidth: 1000
    });
    expect(x).toBeCloseTo(0, 6);
  });
});

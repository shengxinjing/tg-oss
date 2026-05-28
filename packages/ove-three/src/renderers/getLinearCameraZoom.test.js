import { describe, expect, it } from "bun:test";
import getLinearCameraZoom from "./getLinearCameraZoom";

describe("getLinearCameraZoom", () => {
  it("scales a normalized linear map to fill most of a wide canvas", () => {
    const canvasWidth = 1842;
    const modelWidth = 44;
    const zoom = getLinearCameraZoom({
      canvasWidth,
      canvasHeight: 1290,
      modelWidth
    });
    const contentWidthRatio = (modelWidth * zoom) / canvasWidth;

    expect(contentWidthRatio).toBeGreaterThan(0.84);
    expect(contentWidthRatio).toBeLessThan(0.92);
  });

  it("keeps the linear map inside a short canvas", () => {
    const zoom = getLinearCameraZoom({
      canvasWidth: 1200,
      canvasHeight: 140,
      modelWidth: 44
    });
    const visibleHeight = 140 / zoom;

    expect(visibleHeight).toBeGreaterThan(8.1);
  });
});

import { describe, expect, it } from "bun:test";
import getRowCameraZoom, { getRowCameraTargetY } from "./getRowCameraZoom";

describe("getRowCameraZoom", () => {
  it("scales row content to a usable width on a large canvas", () => {
    const canvasWidth = 1842;
    const rowWidth = 80 * 0.09;
    const zoom = getRowCameraZoom({
      canvasWidth,
      canvasHeight: 1290,
      rowWidth,
      rowHeight: 0.78
    });
    const contentWidthRatio = (rowWidth * zoom) / canvasWidth;

    expect(contentWidthRatio).toBeGreaterThan(0.68);
    expect(contentWidthRatio).toBeLessThan(0.86);
  });

  it("keeps several rows visible on a short canvas", () => {
    const zoom = getRowCameraZoom({
      canvasWidth: 1200,
      canvasHeight: 220,
      rowWidth: 80 * 0.09,
      rowHeight: 0.78
    });
    const visibleHeight = 220 / zoom;

    expect(visibleHeight).toBeGreaterThan(3.9);
  });

  it("moves the camera so row content starts near the top", () => {
    const zoom = 200;
    const targetY = getRowCameraTargetY({
      canvasHeight: 1000,
      zoom,
      visibleRowCount: 10,
      rowHeight: 0.78
    });
    const visibleTop = targetY + 1000 / zoom / 2;
    const topRowContentY = ((10 - 1) * 0.78) / 2 + 0.64;

    expect(visibleTop - topRowContentY).toBeCloseTo(0.28, 2);
  });
});

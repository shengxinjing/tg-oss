import { describe, expect, it } from "bun:test";
import getCircularZoomTransform from "./getCircularZoomTransform";

describe("getCircularZoomTransform (edge-anchored zoom)", () => {
  it("is a no-op when there is no sequence", () => {
    const t = getCircularZoomTransform({ zoom: 8, sequenceLength: 0 });
    expect(t.scale).toBe(1);
    expect(t.offset).toEqual([0, 0, 0]);
  });

  it("scale follows zoom (clamped to >= 1)", () => {
    expect(
      getCircularZoomTransform({ zoom: 0.5, sequenceLength: 1000 }).scale
    ).toBe(1);
    expect(
      getCircularZoomTransform({ zoom: 8, sequenceLength: 1000 }).scale
    ).toBe(8);
  });

  it("keeps the ring centered at zoom 1 (no offset)", () => {
    const t = getCircularZoomTransform({
      zoom: 1,
      focusBp: 250,
      sequenceLength: 1000
    });
    expect(t.offset[0]).toBeCloseTo(0, 6);
    expect(t.offset[2]).toBeCloseTo(0, 6);
  });

  it("keeps the focus point anchored on screen across zoom levels", () => {
    const focusBp = 250;
    const sequenceLength = 1000;
    for (const zoom of [2, 8, 20]) {
      const t = getCircularZoomTransform({ zoom, focusBp, sequenceLength });
      const screenX = t.focusPoint[0] * t.scale + t.offset[0];
      const screenZ = t.focusPoint[1] * t.scale + t.offset[2];
      expect(screenX).toBeCloseTo(t.focusPoint[0], 5);
      expect(screenZ).toBeCloseTo(t.focusPoint[1], 5);
    }
  });

  it("pushes the ring center further off-screen as zoom grows", () => {
    const centerOffsetMag = zoom => {
      const t = getCircularZoomTransform({
        zoom,
        focusBp: 250,
        sequenceLength: 1000
      });
      return Math.hypot(t.offset[0], t.offset[2]);
    };
    expect(centerOffsetMag(8)).toBeGreaterThan(centerOffsetMag(2));
    expect(centerOffsetMag(2)).toBeGreaterThan(0);
  });
});

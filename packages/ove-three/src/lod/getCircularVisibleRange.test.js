import { describe, expect, it } from "bun:test";
import getCircularVisibleRange from "./getCircularVisibleRange";

describe("getCircularVisibleRange", () => {
  it("returns an empty window when there is no sequence", () => {
    expect(getCircularVisibleRange({ zoom: 5, sequenceLength: 0 }).count).toBe(
      0
    );
  });

  it("shows the whole ring at zoom 1", () => {
    const r = getCircularVisibleRange({ zoom: 1, sequenceLength: 1000 });
    expect(r.count).toBe(1000);
    expect(r.start).toBe(0);
    expect(r.end).toBe(999);
    expect(r.wraps).toBe(false);
  });

  it("shows only a small window when zoomed in", () => {
    const r = getCircularVisibleRange({
      zoom: 50,
      sequenceLength: 1000,
      rotation: 90
    });
    expect(r.count).toBeGreaterThan(0);
    expect(r.count).toBeLessThan(1000);
  });

  it("derives the focus bp from rotation and follows it", () => {
    expect(
      getCircularVisibleRange({ zoom: 50, sequenceLength: 1000, rotation: 0 })
        .focusBp
    ).toBe(0);
    expect(
      getCircularVisibleRange({ zoom: 50, sequenceLength: 1000, rotation: 90 })
        .focusBp
    ).toBe(250);
    expect(
      getCircularVisibleRange({ zoom: 50, sequenceLength: 1000, rotation: 180 })
        .focusBp
    ).toBe(500);
  });

  it("marks wraps (start > end) when the window crosses the origin", () => {
    const r = getCircularVisibleRange({
      zoom: 50,
      sequenceLength: 1000,
      rotation: 0
    });
    expect(r.wraps).toBe(true);
    expect(r.start).toBeGreaterThan(r.end);
  });

  it("does not wrap for a mid-sequence focus", () => {
    const r = getCircularVisibleRange({
      zoom: 50,
      sequenceLength: 1000,
      rotation: 180
    });
    expect(r.wraps).toBe(false);
    expect(r.start).toBeLessThan(r.end);
  });
});

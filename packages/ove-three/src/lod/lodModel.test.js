import { describe, expect, it } from "bun:test";
import { LOD_LEVELS } from "./lodThresholds";
import resolveLod, {
  getWorldPerBase,
  resolveLodLevel,
  getDensity
} from "./lodModel";

describe("lod worldPerBase", () => {
  it("computes circular arc-length per base from 2π·radius·zoom/len", () => {
    const wpb = getWorldPerBase({
      viewType: "circular",
      zoom: 1,
      sequenceLength: 1000,
      radius: 2.4
    });
    expect(wpb).toBeCloseTo((2 * Math.PI * 2.4) / 1000, 6);
  });

  it("scales circular worldPerBase linearly with zoom", () => {
    const a = getWorldPerBase({
      viewType: "circular",
      zoom: 1,
      sequenceLength: 1000
    });
    const b = getWorldPerBase({
      viewType: "circular",
      zoom: 8,
      sequenceLength: 1000
    });
    expect(b).toBeCloseTo(a * 8, 6);
  });

  it("uses baseWidth·zoom for linear/row views", () => {
    expect(
      getWorldPerBase({ viewType: "linear", zoom: 2, baseWidth: 0.05 })
    ).toBeCloseTo(0.1, 6);
  });

  it("returns 0 when there is no sequence (circular)", () => {
    expect(
      getWorldPerBase({ viewType: "circular", zoom: 5, sequenceLength: 0 })
    ).toBe(0);
  });
});

describe("lod level resolution", () => {
  it("is OVERVIEW at very low worldPerBase", () => {
    expect(resolveLodLevel(0.005)).toBe(LOD_LEVELS.OVERVIEW);
  });

  it("reaches BASES past the bases threshold", () => {
    expect(resolveLodLevel(0.03)).toBe(LOD_LEVELS.BASES);
  });

  it("reaches TRANSLATION at high worldPerBase", () => {
    expect(resolveLodLevel(0.2)).toBe(LOD_LEVELS.TRANSLATION);
  });

  it("applies hysteresis in the deadband (0.022–0.026)", () => {
    // rising from TICKS: needs the higher enter threshold → stays TICKS
    expect(resolveLodLevel(0.024, LOD_LEVELS.TICKS)).toBe(LOD_LEVELS.TICKS);
    // already at BASES: only drops below the lower exit threshold → stays BASES
    expect(resolveLodLevel(0.024, LOD_LEVELS.BASES)).toBe(LOD_LEVELS.BASES);
  });
});

describe("lod density", () => {
  it("shows every base when zoomed to base level", () => {
    expect(getDensity(0.1)).toBe(1);
  });

  it("decimates more as you zoom out", () => {
    expect(getDensity(0.02)).toBeGreaterThan(1);
    expect(getDensity(0.001)).toBeGreaterThanOrEqual(getDensity(0.02));
  });
});

describe("resolveLod integration", () => {
  it("a 1kb plasmid at zoom 1 stays below BASES (no letters)", () => {
    const { lodLevel } = resolveLod({
      viewType: "circular",
      zoom: 1,
      sequenceLength: 1000
    });
    expect(lodLevel).toBeLessThan(LOD_LEVELS.BASES);
  });

  it("a 1kb plasmid zoomed enough reaches BASES", () => {
    const { lodLevel } = resolveLod({
      viewType: "circular",
      zoom: 8,
      sequenceLength: 1000
    });
    expect(lodLevel).toBeGreaterThanOrEqual(LOD_LEVELS.BASES);
  });

  it("no-sequence data stays OVERVIEW even when zoomed", () => {
    const { lodLevel } = resolveLod({
      viewType: "circular",
      zoom: 50,
      sequenceLength: 0
    });
    expect(lodLevel).toBe(LOD_LEVELS.OVERVIEW);
  });

  it("returns worldPerBase, lodLevel and density together", () => {
    const result = resolveLod({
      viewType: "circular",
      zoom: 8,
      sequenceLength: 1000
    });
    expect(result).toHaveProperty("worldPerBase");
    expect(result).toHaveProperty("lodLevel");
    expect(result).toHaveProperty("density");
  });
});

import { describe, expect, it } from "bun:test";
import getCircularCameraPolar, {
  POLAR_OBLIQUE,
  POLAR_FLAT
} from "./getCircularCameraPolar";

describe("getCircularCameraPolar", () => {
  it("stays oblique at or below zoom 1 (keeps the 3D overview tilt)", () => {
    expect(getCircularCameraPolar(1)).toBe(POLAR_OBLIQUE);
    expect(getCircularCameraPolar(0.5)).toBe(POLAR_OBLIQUE);
    expect(getCircularCameraPolar()).toBe(POLAR_OBLIQUE);
  });

  it("flattens toward near top-down at high zoom", () => {
    expect(getCircularCameraPolar(16)).toBe(POLAR_FLAT);
    expect(getCircularCameraPolar(40)).toBe(POLAR_FLAT);
  });

  it("decreases monotonically between the two ends", () => {
    const a = getCircularCameraPolar(2);
    const b = getCircularCameraPolar(8);
    const c = getCircularCameraPolar(14);
    expect(a).toBeGreaterThan(b);
    expect(b).toBeGreaterThan(c);
    expect(a).toBeLessThan(POLAR_OBLIQUE);
    expect(c).toBeGreaterThan(POLAR_FLAT);
  });

  it("is flatter (smaller polar) than the oblique tilt while zooming", () => {
    expect(getCircularCameraPolar(8)).toBeLessThan(POLAR_OBLIQUE);
    expect(getCircularCameraPolar(8)).toBeGreaterThan(POLAR_FLAT);
  });

  it("guards non-finite input", () => {
    expect(getCircularCameraPolar(NaN)).toBe(POLAR_OBLIQUE);
    expect(getCircularCameraPolar(Infinity)).toBe(POLAR_FLAT);
  });
});

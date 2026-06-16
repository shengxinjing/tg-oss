import { describe, expect, it } from "bun:test";
import getAxisTickSteps from "./getAxisTickSteps";

describe("getAxisTickSteps", () => {
  it("uses default (undefined) steps when zoomed out", () => {
    expect(getAxisTickSteps({ density: 100 }).majorStep).toBeUndefined();
    expect(getAxisTickSteps({ density: 50 }).minorStep).toBeUndefined();
    expect(getAxisTickSteps({}).majorStep).toBeUndefined();
  });

  it("gives fine ticks at base-level density", () => {
    expect(getAxisTickSteps({ density: 1 })).toEqual({
      majorStep: 10,
      minorStep: 1
    });
  });

  it("gives progressively finer ticks as density tightens", () => {
    expect(getAxisTickSteps({ density: 10 }).minorStep).toBe(10);
    expect(getAxisTickSteps({ density: 5 }).minorStep).toBe(5);
    expect(getAxisTickSteps({ density: 1 }).minorStep).toBe(1);
  });
});

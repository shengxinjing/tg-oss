import { describe, expect, it } from "bun:test";
import positionCutsites from "./positionCutsites";

describe("positionCutsites", () => {
  it("returns empty for no cutsites", () => {
    expect(positionCutsites([])).toEqual([]);
  });

  it("keeps well-separated cutsites all at stack 0", () => {
    const out = positionCutsites([
      { id: "a", angle: 0 },
      { id: "b", angle: 1 },
      { id: "c", angle: 2 }
    ]);
    expect(out.every(cutsite => cutsite.stack === 0)).toBe(true);
  });

  it("stacks clustered cutsites outward", () => {
    const out = positionCutsites(
      [
        { id: "a", angle: 1.0 },
        { id: "b", angle: 1.02 },
        { id: "c", angle: 1.04 }
      ],
      { minAngularGap: 0.08 }
    );
    expect(out.map(cutsite => cutsite.stack)).toEqual([0, 1, 2]);
  });

  it("caps the stack level", () => {
    const cluster = Array.from({ length: 8 }, (_, i) => ({
      id: String(i),
      angle: 1 + i * 0.01
    }));
    const out = positionCutsites(cluster, { minAngularGap: 0.08, maxStack: 3 });
    expect(Math.max(...out.map(cutsite => cutsite.stack))).toBe(3);
  });

  it("sorts by angle and ignores items without an angle", () => {
    const out = positionCutsites([
      { id: "b", angle: 2 },
      { id: "x" },
      { id: "a", angle: 1 }
    ]);
    expect(out.map(cutsite => cutsite.id)).toEqual(["a", "b"]);
  });

  it("resets the stack after an angular gap", () => {
    const out = positionCutsites(
      [
        { id: "a", angle: 1.0 },
        { id: "b", angle: 1.02 },
        { id: "c", angle: 3.0 }
      ],
      { minAngularGap: 0.08 }
    );
    expect(out.map(cutsite => cutsite.stack)).toEqual([0, 1, 0]);
  });
});

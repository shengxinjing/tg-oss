import { describe, expect, it } from "bun:test";
import assignLinearLanes from "./assignLinearLanes";

describe("assignLinearLanes", () => {
  it("returns empty for no annotations", () => {
    expect(assignLinearLanes([])).toEqual([]);
  });

  it("keeps non-overlapping annotations on lane 0", () => {
    const out = assignLinearLanes([
      { id: "a", start: 0, end: 50 },
      { id: "b", start: 60, end: 100 },
      { id: "c", start: 110, end: 150 }
    ]);
    expect(out.every(annotation => annotation.lane === 0)).toBe(true);
  });

  it("stacks overlapping annotations into separate lanes", () => {
    const out = assignLinearLanes([
      { id: "a", start: 0, end: 100 },
      { id: "b", start: 50, end: 150 }
    ]);
    const laneA = out.find(annotation => annotation.id === "a").lane;
    const laneB = out.find(annotation => annotation.id === "b").lane;
    expect(laneA).not.toBe(laneB);
  });

  it("treats touching inclusive ranges as overlapping (share a bp)", () => {
    const out = assignLinearLanes([
      { id: "a", start: 0, end: 99 },
      { id: "b", start: 99, end: 150 }
    ]);
    expect(new Set(out.map(annotation => annotation.lane)).size).toBe(2);
  });

  it("reuses a lane once it is free", () => {
    const out = assignLinearLanes([
      { id: "a", start: 0, end: 40 },
      { id: "b", start: 20, end: 60 },
      { id: "c", start: 80, end: 120 }
    ]);
    const laneC = out.find(annotation => annotation.id === "c").lane;
    expect(laneC).toBe(0);
  });

  it("preserves input order and uses segment spans", () => {
    const out = assignLinearLanes([
      {
        id: "x",
        segments: [
          { start: 10, end: 20 },
          { start: 30, end: 40 }
        ]
      }
    ]);
    expect(out[0].id).toBe("x");
    expect(out[0].lane).toBe(0);
  });
});

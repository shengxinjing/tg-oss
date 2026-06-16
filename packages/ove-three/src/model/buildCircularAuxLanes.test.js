import { describe, expect, it } from "bun:test";
import buildCircularAuxLanes from "./buildCircularAuxLanes";

describe("buildCircularAuxLanes", () => {
  it("returns empty without data or length", () => {
    expect(
      buildCircularAuxLanes({ sequenceData: {}, sequenceLength: 1000 })
    ).toEqual([]);
    expect(
      buildCircularAuxLanes({
        sequenceData: { warnings: [{ start: 0, end: 5 }] },
        sequenceLength: 0
      })
    ).toEqual([]);
  });

  it("builds warning lanes with arc segments", () => {
    const lanes = buildCircularAuxLanes({
      sequenceData: { warnings: [{ id: "w1", start: 100, end: 200 }] },
      sequenceLength: 1000
    });
    expect(lanes).toHaveLength(1);
    expect(lanes[0].kind).toBe("warning");
    expect(lanes[0].segments.length).toBeGreaterThan(0);
  });

  it("builds lineage and assembly lanes at distinct radii", () => {
    const lanes = buildCircularAuxLanes({
      sequenceData: {
        lineageAnnotations: [{ start: 0, end: 10 }],
        assemblyPieces: [{ start: 20, end: 40 }]
      },
      sequenceLength: 1000
    });
    const lineage = lanes.find(lane => lane.kind === "lineage");
    const assembly = lanes.find(lane => lane.kind === "assembly");
    expect(lineage).toBeTruthy();
    expect(assembly).toBeTruthy();
    expect(lineage.radius).not.toBe(assembly.radius);
  });

  it("splits an origin-spanning lane item into two segments", () => {
    const lanes = buildCircularAuxLanes({
      sequenceData: { warnings: [{ start: 990, end: 10 }] },
      sequenceLength: 1000
    });
    expect(lanes[0].segments.length).toBe(2);
  });
});

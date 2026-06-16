import { describe, expect, it } from "bun:test";
import buildConsensus, { getHydropathy } from "./buildConsensus";

describe("buildConsensus", () => {
  it("returns empty for no sequences", () => {
    expect(buildConsensus({ sequences: [] })).toEqual([]);
    expect(buildConsensus({})).toEqual([]);
  });

  it("a single sequence is fully conserved at every position", () => {
    const out = buildConsensus({ sequences: ["MKV"] });
    expect(out.map(p => p.residue).join("")).toBe("MKV");
    expect(out.every(p => p.conservation === 1)).toBe(true);
  });

  it("computes per-position most-common residue and conservation", () => {
    const out = buildConsensus({ sequences: ["AAB", "AAB", "AAC"] });
    expect(out[0]).toMatchObject({ residue: "A", conservation: 1 });
    expect(out[2].residue).toBe("B");
    expect(out[2].conservation).toBeCloseTo(2 / 3, 6);
  });

  it("ignores gaps", () => {
    const out = buildConsensus({ sequences: ["A-", "AA"] });
    expect(out[1]).toMatchObject({ residue: "A", conservation: 1 });
  });

  it("attaches hydropathy for the consensus residue", () => {
    const out = buildConsensus({ sequences: ["I"] }); // Ile = 4.5
    expect(out[0].hydropathy).toBeCloseTo(4.5, 6);
  });

  it("getHydropathy falls back to 0 for unknown", () => {
    expect(getHydropathy("X")).toBe(0);
    expect(getHydropathy("")).toBe(0);
  });
});

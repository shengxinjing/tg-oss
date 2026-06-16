import { describe, expect, it } from "bun:test";
import buildVisibleBases, { MAX_VISIBLE_BASES } from "./buildVisibleBases";
import getBaseColor from "./getBaseColor";

const seq = "ATGCATGCAT"; // length 10

describe("getBaseColor", () => {
  it("colors DNA bases distinctly and case-insensitively", () => {
    expect(getBaseColor("A")).not.toBe(getBaseColor("T"));
    expect(getBaseColor("g")).toBe(getBaseColor("G"));
  });

  it("returns a string fallback for unknown characters", () => {
    expect(typeof getBaseColor("N")).toBe("string");
  });
});

describe("buildVisibleBases", () => {
  it("returns empty for no sequence or no range", () => {
    expect(
      buildVisibleBases({ sequence: "", range: { start: 0, count: 5 } })
    ).toEqual([]);
    expect(buildVisibleBases({ sequence: seq, range: null })).toEqual([]);
  });

  it("builds the window with char + complement + color + bp", () => {
    const out = buildVisibleBases({
      sequence: seq,
      range: { start: 0, end: 3, count: 4, wraps: false },
      mode: "dna"
    });
    expect(out.map(b => b.char).join("")).toBe("ATGC");
    expect(out.map(b => b.complement).join("")).toBe("tacg");
    expect(out[0].bp).toBe(0);
    expect(out[0]).toHaveProperty("color");
  });

  it("wraps across the origin", () => {
    const out = buildVisibleBases({
      sequence: seq,
      range: { start: 8, end: 1, count: 4, wraps: true },
      mode: "dna"
    });
    expect(out.map(b => b.bp)).toEqual([8, 9, 0, 1]);
  });

  it("clamps to the central MAX_VISIBLE_BASES around the focus when exceeded", () => {
    const big = "ACGT".repeat(500); // 2000 bp
    const out = buildVisibleBases({
      sequence: big,
      range: { start: 0, count: MAX_VISIBLE_BASES + 120, focusBp: 600 }
    });
    expect(out.length).toBe(MAX_VISIBLE_BASES);
    // window stays centered on the focus bp
    expect(out[Math.floor(MAX_VISIBLE_BASES / 2)].bp).toBe(600);
  });

  it("has no complement in protein mode", () => {
    const out = buildVisibleBases({
      sequence: "MKV",
      range: { start: 0, count: 3 },
      mode: "protein"
    });
    expect(out.every(b => b.complement === null)).toBe(true);
  });

  it("uses U for the complement in RNA mode", () => {
    const out = buildVisibleBases({
      sequence: "A",
      range: { start: 0, count: 1 },
      mode: "rna"
    });
    expect(out[0].complement).toBe("u");
  });
});

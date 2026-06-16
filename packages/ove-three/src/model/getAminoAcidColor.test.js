import { describe, expect, it } from "bun:test";
import getAminoAcidColor, {
  AA_GAP_COLOR,
  AA_STOP_COLOR,
  AMINO_ACID_RESIDUE_COLORS
} from "./getAminoAcidColor";

const STANDARD_AAS = "ARNDCQEGHILKMFPSTWYV".split("");

describe("getAminoAcidColor", () => {
  // --- zero-regression: object inputs from the codon translator ---
  it("family mode passes through an AA object's colorByFamily", () => {
    expect(
      getAminoAcidColor({ value: "M", colorByFamily: "#abc123" }, "family")
    ).toBe("#abc123");
  });

  it("family mode falls back when an object lacks colorByFamily", () => {
    expect(getAminoAcidColor({ value: "M" }, "family")).toBe("#22d3ee");
  });

  it("hydrophobicity mode buckets objects by residue (legacy values)", () => {
    expect(getAminoAcidColor({ value: "M" }, "hydrophobicity")).toBe("#fb923c");
    expect(getAminoAcidColor({ value: "S" }, "hydrophobicity")).toBe("#38bdf8");
    expect(getAminoAcidColor({ value: "K" }, "hydrophobicity")).toBe("#a78bfa");
    expect(getAminoAcidColor({ value: "D" }, "hydrophobicity")).toBe("#f87171");
    expect(getAminoAcidColor({ value: "*" }, "hydrophobicity")).toBe("#94a3b8");
  });

  it("preserves a stop object's family color (no legacy break)", () => {
    expect(
      getAminoAcidColor({ value: "*", colorByFamily: "#101010" }, "family")
    ).toBe("#101010");
  });

  // --- new: complete per-residue palette ---
  it("residue mode gives every standard amino acid a defined color", () => {
    for (const aa of STANDARD_AAS) {
      const color = getAminoAcidColor(aa, "residue");
      expect(color).toBe(AMINO_ACID_RESIDUE_COLORS[aa]);
      expect(color).not.toBe("#94a3b8"); // not the unknown fallback
    }
  });

  it("is case-insensitive for residue letters", () => {
    expect(getAminoAcidColor("m", "residue")).toBe(
      getAminoAcidColor("M", "residue")
    );
  });

  // --- new: alignment gaps + stop + unknown ---
  it("colors alignment gaps and stops distinctly in any mode", () => {
    for (const mode of ["family", "hydrophobicity", "residue"]) {
      expect(getAminoAcidColor("-", mode)).toBe(AA_GAP_COLOR);
      expect(getAminoAcidColor(".", mode)).toBe(AA_GAP_COLOR);
      expect(getAminoAcidColor("*", mode)).toBe(AA_STOP_COLOR);
    }
  });

  it("uses the family palette for plain residue letters", () => {
    expect(getAminoAcidColor("A", "family")).toBe("#fb923c");
    expect(getAminoAcidColor("D", "family")).toBe("#f87171");
  });

  it("returns the neutral fallback for empty / unknown residues", () => {
    expect(getAminoAcidColor("", "residue")).toBe("#94a3b8");
    expect(getAminoAcidColor("Z", "residue")).toBe("#94a3b8");
  });
});

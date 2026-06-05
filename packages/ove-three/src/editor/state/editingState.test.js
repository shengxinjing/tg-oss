import { describe, expect, it } from "bun:test";
import {
  changeSequenceCase,
  complementSequence,
  copySelection,
  createSequenceDataHistory,
  cutSelection,
  flipSequenceCase,
  pasteSequence,
  pushSequenceDataHistory,
  redoSequenceDataHistory,
  reverseComplementSequence,
  rotateSequenceToPosition,
  selectAllRange,
  selectInverseRange,
  serializeSequenceData,
  undoSequenceDataHistory
} from "./editingState";

const sequenceData = {
  name: "demo",
  circular: true,
  sequence: "ATGCatgc",
  features: [{ id: "feature-1", name: "Feature 1", start: 1, end: 3 }]
};

describe("ove-three editing state", () => {
  it("tracks undo and redo history without mutating the original sequence", () => {
    const history = createSequenceDataHistory(sequenceData);
    const changed = { ...sequenceData, sequence: "AAAA" };
    const pushed = pushSequenceDataHistory(history, changed);

    expect(undoSequenceDataHistory(pushed).present.sequence).toBe("ATGCatgc");
    expect(
      redoSequenceDataHistory(undoSequenceDataHistory(pushed)).present.sequence
    ).toBe("AAAA");
    expect(sequenceData.sequence).toBe("ATGCatgc");
  });

  it("copies, cuts, and pastes selected sequence ranges", () => {
    expect(copySelection(sequenceData, { start: 1, end: 3 })).toBe("TGC");

    const cut = cutSelection(sequenceData, { start: 1, end: 3 });
    expect(cut.copiedText).toBe("TGC");
    expect(cut.sequenceData.sequence).toBe("Aatgc");

    expect(
      pasteSequence(cut.sequenceData, { start: 1, end: 1 }, "GG").sequence
    ).toBe("AGGtgc");
  });

  it("selects all and computes a simple inverse range", () => {
    expect(selectAllRange(sequenceData)).toEqual({ start: 0, end: 7 });
    expect(selectInverseRange(sequenceData, { start: 2, end: 7 })).toEqual({
      start: 0,
      end: 1
    });
    expect(selectInverseRange(sequenceData, { start: 0, end: 2 })).toEqual({
      start: 3,
      end: 7
    });
  });

  it("changes case and complements DNA/RNA sequences", () => {
    expect(changeSequenceCase(sequenceData, "upper").sequence).toBe("ATGCATGC");
    expect(changeSequenceCase(sequenceData, "lower").sequence).toBe("atgcatgc");
    expect(flipSequenceCase(sequenceData).sequence).toBe("atgcATGC");
    expect(complementSequence(sequenceData).sequence).toBe("TACGtacg");
    expect(
      complementSequence({ ...sequenceData, isRna: true, sequence: "AUGC" })
        .sequence
    ).toBe("UACG");
    expect(
      reverseComplementSequence({ ...sequenceData, sequence: "ATGC" }).sequence
    ).toBe("GCAT");
  });

  it("rotates circular sequences to the caret while leaving linear data unchanged", () => {
    expect(rotateSequenceToPosition(sequenceData, 4).sequence).toBe("atgcATGC");
    expect(
      rotateSequenceToPosition({ ...sequenceData, circular: false }, 4).sequence
    ).toBe("ATGCatgc");
  });

  it("serializes current sequence data for common export commands", () => {
    expect(serializeSequenceData(sequenceData, "fasta")).toContain(">demo");
    expect(serializeSequenceData(sequenceData, "genbank")).toContain("LOCUS");
    expect(
      JSON.parse(serializeSequenceData(sequenceData, "json"))
    ).toMatchObject({
      name: "demo",
      sequence: "ATGCatgc"
    });
  });
});

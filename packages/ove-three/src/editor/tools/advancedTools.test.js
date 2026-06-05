import { describe, expect, it } from "bun:test";
import {
  auditSequenceKind,
  buildAdvancedToolResults,
  buildAlignmentMatches,
  buildDigestResults,
  buildMismatchRows,
  buildPcrResults,
  buildVersionHistoryRows,
  getAdvancedTools
} from "./advancedTools";

const sequenceData = {
  name: "tool-demo",
  circular: true,
  sequence: "ATGCAAGCTTATGCGAATTC",
  cutsites: [
    { id: "hindiii", enzyme: "HindIII", start: 5, end: 10 },
    { id: "ecori", enzyme: "EcoRI", start: 15, end: 20 }
  ],
  primers: [
    { id: "primer-a", name: "Primer A", start: 0, end: 5 },
    { id: "primer-b", name: "Primer B", start: 12, end: 18 }
  ],
  warnings: [{ id: "warning-a", message: "Low complexity" }],
  chromatogramData: [{ position: 2, value: 0.75 }]
};

describe("ove-three advanced tools", () => {
  it("lists the planned Day 366-395 advanced tools", () => {
    expect(getAdvancedTools().map(tool => tool.id)).toEqual([
      "preview",
      "versionHistory",
      "digest",
      "pcr",
      "alignment",
      "mismatches",
      "enzymeViewer",
      "enzymeManager",
      "autoAnnotate",
      "proteinAudit",
      "rnaOligoAudit"
    ]);
  });

  it("builds digest, PCR, alignment, and mismatch smoke results", () => {
    expect(buildDigestResults(sequenceData)).toEqual([
      { enzyme: "HindIII", range: "6-11", id: "hindiii" },
      { enzyme: "EcoRI", range: "16-21", id: "ecori" }
    ]);
    expect(buildPcrResults(sequenceData)[0]).toMatchObject({
      forwardPrimer: "Primer A",
      reversePrimer: "Primer B"
    });
    expect(buildAlignmentMatches(sequenceData, "ATGC")).toEqual([
      { start: 0, end: 3, match: "ATGC" },
      { start: 10, end: 13, match: "ATGC" }
    ]);
    expect(buildMismatchRows("ATGC", "ATTC")).toEqual([
      { position: 3, query: "G", reference: "T" }
    ]);
  });

  it("audits protein, RNA, oligo, chromatogram, temporary, and warning support", () => {
    expect(
      auditSequenceKind({ isProtein: true, proteinSequence: "MKWV" })
    ).toMatchObject({
      kind: "protein",
      unitLabel: "AA"
    });
    expect(auditSequenceKind({ isRna: true, sequence: "AUGC" })).toMatchObject({
      kind: "RNA",
      complement: "UACG"
    });
    expect(
      auditSequenceKind({ isOligo: true, sequence: "ATGC" })
    ).toMatchObject({
      kind: "oligo",
      length: 4
    });
    expect(
      buildAdvancedToolResults(sequenceData, "rnaOligoAudit")
    ).toMatchObject({
      warnings: 1,
      chromatogramPoints: 1
    });
  });

  it("renders version history rows from editor history", () => {
    expect(
      buildVersionHistoryRows({
        past: [{ name: "v1", sequence: "AT" }],
        present: { name: "v2", sequence: "ATGC" },
        future: [{ name: "v3", sequence: "ATGCAA" }]
      })
    ).toEqual([
      { label: "Past 1", name: "v1", length: 2 },
      { label: "Current", name: "v2", length: 4 },
      { label: "Future 1", name: "v3", length: 6 }
    ]);
  });
});

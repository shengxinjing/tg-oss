import { complementSequence } from "../state/editingState";

export function getAdvancedTools() {
  return [
    { id: "preview", label: "Preview Mode" },
    { id: "versionHistory", label: "Version History" },
    { id: "digest", label: "Digest Tool" },
    { id: "pcr", label: "PCR Tool" },
    { id: "alignment", label: "Alignment View" },
    { id: "mismatches", label: "Mismatches" },
    { id: "enzymeViewer", label: "Enzyme Viewer" },
    { id: "enzymeManager", label: "Restriction Enzyme Manager" },
    { id: "autoAnnotate", label: "Auto Annotate" },
    { id: "proteinAudit", label: "Protein Support" },
    { id: "rnaOligoAudit", label: "RNA / Oligo Support" }
  ];
}

function rangeLabel(annotation) {
  return `${annotation.start + 1}-${annotation.end + 1}`;
}

export function buildDigestResults(sequenceData = {}) {
  return (sequenceData.cutsites || [])
    .slice()
    .sort((a, b) => a.start - b.start)
    .map(cutsite => ({
      enzyme: cutsite.enzyme || cutsite.name || cutsite.id,
      range: rangeLabel(cutsite),
      id: cutsite.id
    }));
}

export function buildPcrResults(sequenceData = {}) {
  const primers = sequenceData.primers || [];
  if (primers.length < 2) return [];

  return [
    {
      forwardPrimer: primers[0].name || primers[0].id,
      reversePrimer: primers[1].name || primers[1].id,
      productRange: `${primers[0].start + 1}-${primers[1].end + 1}`,
      productLength: Math.max(0, primers[1].end - primers[0].start + 1)
    }
  ];
}

export function buildAlignmentMatches(sequenceData = {}, query = "") {
  const sequence = sequenceData.sequence || "";
  const normalizedQuery = query.toLowerCase();
  const searchableSequence = sequence.toLowerCase();
  if (!normalizedQuery) return [];

  const matches = [];
  let start = searchableSequence.indexOf(normalizedQuery);
  while (start >= 0) {
    matches.push({
      start,
      end: start + normalizedQuery.length - 1,
      match: sequence.slice(start, start + normalizedQuery.length)
    });
    start = searchableSequence.indexOf(normalizedQuery, start + 1);
  }
  return matches;
}

export function buildMismatchRows(query = "", reference = "") {
  const length = Math.min(query.length, reference.length);
  const rows = [];

  for (let index = 0; index < length; index += 1) {
    if (query[index] !== reference[index]) {
      rows.push({
        position: index + 1,
        query: query[index],
        reference: reference[index]
      });
    }
  }

  return rows;
}

export function auditSequenceKind(sequenceData = {}) {
  if (sequenceData.isProtein || sequenceData.proteinSequence) {
    const sequence =
      sequenceData.proteinSequence || sequenceData.sequence || "";
    return {
      kind: "protein",
      unitLabel: "AA",
      length: sequence.length
    };
  }

  if (sequenceData.isRna) {
    return {
      kind: "RNA",
      unitLabel: "nt",
      length: (sequenceData.sequence || "").length,
      complement: complementSequence(sequenceData).sequence
    };
  }

  if (sequenceData.isOligo) {
    return {
      kind: "oligo",
      unitLabel: "nt",
      length: (sequenceData.sequence || "").length
    };
  }

  return {
    kind: sequenceData.circular ? "circular DNA" : "linear DNA",
    unitLabel: "bp",
    length: (sequenceData.sequence || "").length
  };
}

export function buildVersionHistoryRows(history = {}) {
  const past = (history.past || []).map((entry, index) => ({
    label: `Past ${index + 1}`,
    name: entry.name,
    length: (entry.sequence || "").length
  }));
  const current = history.present
    ? [
        {
          label: "Current",
          name: history.present.name,
          length: (history.present.sequence || "").length
        }
      ]
    : [];
  const future = (history.future || []).map((entry, index) => ({
    label: `Future ${index + 1}`,
    name: entry.name,
    length: (entry.sequence || "").length
  }));

  return [...past, ...current, ...future];
}

export function buildAdvancedToolResults(
  sequenceData = {},
  toolId,
  options = {}
) {
  if (toolId === "digest") return buildDigestResults(sequenceData);
  if (toolId === "pcr") return buildPcrResults(sequenceData);
  if (toolId === "alignment") {
    return buildAlignmentMatches(sequenceData, options.query || "ATGC");
  }
  if (toolId === "mismatches") {
    return buildMismatchRows(
      options.query || (sequenceData.sequence || "").slice(0, 24),
      options.reference || (sequenceData.sequence || "").slice(0, 23) + "A"
    );
  }
  if (toolId === "versionHistory")
    return buildVersionHistoryRows(options.history);
  if (toolId === "proteinAudit" || toolId === "rnaOligoAudit") {
    return {
      ...auditSequenceKind(sequenceData),
      warnings: (sequenceData.warnings || []).length,
      chromatogramPoints: (sequenceData.chromatogramData || []).length,
      temporaryAnnotations: (sequenceData.temporaryAnnotations || []).length
    };
  }
  if (toolId === "enzymeViewer" || toolId === "enzymeManager") {
    return buildDigestResults(sequenceData).map(result => result.enzyme);
  }
  if (toolId === "autoAnnotate") {
    return buildAlignmentMatches(sequenceData, "ATG").map(match => ({
      name: "ATG motif",
      range: `${match.start + 1}-${match.end + 1}`
    }));
  }

  return auditSequenceKind(sequenceData);
}

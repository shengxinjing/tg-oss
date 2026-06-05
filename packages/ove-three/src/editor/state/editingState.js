function cloneSequenceData(sequenceData = {}) {
  return {
    ...sequenceData,
    features: sequenceData.features ? [...sequenceData.features] : [],
    parts: sequenceData.parts ? [...sequenceData.parts] : [],
    primers: sequenceData.primers ? [...sequenceData.primers] : [],
    cutsites: sequenceData.cutsites ? [...sequenceData.cutsites] : [],
    orfs: sequenceData.orfs ? [...sequenceData.orfs] : [],
    translations: sequenceData.translations
      ? [...sequenceData.translations]
      : []
  };
}

function normalizeRange(sequenceData, selection) {
  const sequence = sequenceData.sequence || "";
  if (!sequence.length || !selection) return null;

  const start = Math.max(0, Math.min(selection.start, sequence.length - 1));
  const end = Math.max(start, Math.min(selection.end, sequence.length - 1));
  return { start, end };
}

export function createSequenceDataHistory(sequenceData = {}) {
  return {
    past: [],
    present: cloneSequenceData(sequenceData),
    future: []
  };
}

export function pushSequenceDataHistory(history, sequenceData) {
  return {
    past: [...history.past, history.present],
    present: cloneSequenceData(sequenceData),
    future: []
  };
}

export function undoSequenceDataHistory(history) {
  if (!history.past.length) return history;
  const previous = history.past[history.past.length - 1];

  return {
    past: history.past.slice(0, -1),
    present: previous,
    future: [history.present, ...history.future]
  };
}

export function redoSequenceDataHistory(history) {
  if (!history.future.length) return history;
  const next = history.future[0];

  return {
    past: [...history.past, history.present],
    present: next,
    future: history.future.slice(1)
  };
}

export function copySelection(sequenceData, selection) {
  const range = normalizeRange(sequenceData, selection);
  if (!range) return "";

  return (sequenceData.sequence || "").slice(range.start, range.end + 1);
}

export function cutSelection(sequenceData, selection) {
  const range = normalizeRange(sequenceData, selection);
  if (!range) {
    return {
      sequenceData: cloneSequenceData(sequenceData),
      copiedText: ""
    };
  }

  const sequence = sequenceData.sequence || "";
  return {
    copiedText: sequence.slice(range.start, range.end + 1),
    sequenceData: {
      ...cloneSequenceData(sequenceData),
      sequence: `${sequence.slice(0, range.start)}${sequence.slice(range.end + 1)}`
    }
  };
}

export function pasteSequence(sequenceData, selection, insertText = "") {
  const sequence = sequenceData.sequence || "";
  const range = normalizeRange(sequenceData, selection) || {
    start: 0,
    end: -1
  };

  return {
    ...cloneSequenceData(sequenceData),
    sequence: `${sequence.slice(0, range.start)}${insertText}${sequence.slice(
      range.end + 1
    )}`
  };
}

export function selectAllRange(sequenceData) {
  const length = (sequenceData.sequence || "").length;
  return length ? { start: 0, end: length - 1 } : null;
}

export function selectInverseRange(sequenceData, selection) {
  const length = (sequenceData.sequence || "").length;
  const range = normalizeRange(sequenceData, selection);
  if (!length || !range) return null;
  if (range.start > 0) return { start: 0, end: range.start - 1 };
  if (range.end < length - 1) return { start: range.end + 1, end: length - 1 };
  return null;
}

export function changeSequenceCase(sequenceData, mode) {
  const sequence = sequenceData.sequence || "";
  return {
    ...cloneSequenceData(sequenceData),
    sequence: mode === "lower" ? sequence.toLowerCase() : sequence.toUpperCase()
  };
}

export function flipSequenceCase(sequenceData) {
  return {
    ...cloneSequenceData(sequenceData),
    sequence: (sequenceData.sequence || "")
      .split("")
      .map(base =>
        base === base.toUpperCase() ? base.toLowerCase() : base.toUpperCase()
      )
      .join("")
  };
}

function complementBase(base, isRna) {
  const map = isRna
    ? { A: "U", U: "A", C: "G", G: "C", a: "u", u: "a", c: "g", g: "c" }
    : { A: "T", T: "A", C: "G", G: "C", a: "t", t: "a", c: "g", g: "c" };
  return map[base] || base;
}

export function complementSequence(sequenceData) {
  return {
    ...cloneSequenceData(sequenceData),
    sequence: (sequenceData.sequence || "")
      .split("")
      .map(base => complementBase(base, sequenceData.isRna))
      .join("")
  };
}

export function reverseComplementSequence(sequenceData) {
  return {
    ...complementSequence(sequenceData),
    sequence: complementSequence(sequenceData)
      .sequence.split("")
      .reverse()
      .join("")
  };
}

export function rotateSequenceToPosition(sequenceData, position = 0) {
  if (!sequenceData.circular) return cloneSequenceData(sequenceData);

  const sequence = sequenceData.sequence || "";
  const start = Math.max(0, Math.min(position, sequence.length));
  return {
    ...cloneSequenceData(sequenceData),
    sequence: `${sequence.slice(start)}${sequence.slice(0, start)}`
  };
}

export function serializeSequenceData(sequenceData, format) {
  const sequence = sequenceData.sequence || "";
  if (format === "fasta")
    return `>${sequenceData.name || "sequence"}\n${sequence}\n`;
  if (format === "json") return JSON.stringify(sequenceData, null, 2);
  if (format === "genbank") {
    return [
      `LOCUS       ${sequenceData.name || "sequence"} ${sequence.length} bp`,
      "FEATURES             Location/Qualifiers",
      "ORIGIN",
      sequence,
      "//"
    ].join("\n");
  }

  return sequence;
}

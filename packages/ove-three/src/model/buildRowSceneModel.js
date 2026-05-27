import avoidRowLabelCollisions from "../labels/avoidRowLabelCollisions";
import normalizeAnnotations from "./normalizeAnnotations";
import splitCircularRange from "./splitCircularRange";
import { getAminoAcidFromSequenceTriplet } from "@teselagen/sequence-utils";

function toPositiveInteger(value, fallback) {
  const number = Math.floor(Number(value));
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getSequenceLength(sequenceData = {}) {
  const rawLength = sequenceData.noSequence
    ? sequenceData.size
    : sequenceData.sequence?.length || sequenceData.size;
  return toPositiveInteger(rawLength, 0);
}

function getSequence(sequenceData = {}, sequenceLength) {
  if (typeof sequenceData.sequence === "string") return sequenceData.sequence;
  return "".padEnd(sequenceLength, " ");
}

function complementBase(base, mode) {
  const lower = String(base || " ").toLowerCase();
  const pairs =
    mode === "rna"
      ? { a: "u", u: "a", g: "c", c: "g" }
      : { a: "t", t: "a", g: "c", c: "g" };
  return pairs[lower] || lower;
}

function reverseComplement(sequence, mode) {
  return sequence
    .split("")
    .reverse()
    .map(base => complementBase(base, mode))
    .join("");
}

function buildAxisTicks(start, end, basesPerRow) {
  const ticks = [];
  const firstMajor = Math.ceil((start + 1) / 10) * 10 - 1;

  ticks.push({ position: start, label: String(start + 1), major: true });
  for (let position = firstMajor; position <= end; position += 10) {
    if (position !== start) {
      ticks.push({ position, label: String(position + 1), major: true });
    }
  }
  if (
    end !== start &&
    basesPerRow > 1 &&
    !ticks.some(tick => tick.position === end)
  ) {
    ticks.push({ position: end, label: String(end + 1), major: true });
  }

  return ticks;
}

function isVisible(annotationType, annotationVisibility = {}) {
  return annotationVisibility[annotationType] !== false;
}

function getDirection(annotation) {
  if (annotation.forward === false || annotation.strand === -1)
    return "reverse";
  return annotation.direction === "reverse" ? "reverse" : "forward";
}

function getFrame(annotation) {
  const rawFrame = Number(annotation.frame);
  if (Number.isFinite(rawFrame) && rawFrame >= 1 && rawFrame <= 6) {
    return rawFrame;
  }
  const baseFrame = Math.abs(Number(annotation.start) || 0) % 3;
  return getDirection(annotation) === "reverse" ? baseFrame + 4 : baseFrame + 1;
}

function getLabel(annotation) {
  return annotation.enzyme || annotation.name || annotation.id;
}

function splitLinearRange(annotation, { circular, sequenceLength }) {
  if (circular) return splitCircularRange(annotation, { sequenceLength });

  const locations = Array.isArray(annotation.locations)
    ? annotation.locations
    : [annotation];

  return locations.map(location => ({
    start: Number(location.start) || 0,
    end: Number(location.end) || 0
  }));
}

function buildRowAnnotationSegments(annotation, options) {
  const {
    annotationType,
    sequence,
    sequenceLength,
    circular,
    basesPerRow,
    baseWidth
  } = options;

  return splitLinearRange(annotation, { circular, sequenceLength }).flatMap(
    range => {
      const start = clamp(
        Math.min(range.start, range.end),
        0,
        sequenceLength - 1
      );
      const end = clamp(
        Math.max(range.start, range.end),
        0,
        sequenceLength - 1
      );
      const firstRow = Math.floor(start / basesPerRow);
      const lastRow = Math.floor(end / basesPerRow);
      const segments = [];

      for (let rowIndex = firstRow; rowIndex <= lastRow; rowIndex += 1) {
        const rowStart = rowIndex * basesPerRow;
        const rowEnd = Math.min(sequenceLength - 1, rowStart + basesPerRow - 1);
        const segmentStart = Math.max(start, rowStart);
        const segmentEnd = Math.min(end, rowEnd);
        const localStart = segmentStart - rowStart;
        const localEnd = segmentEnd - rowStart;
        const width = Math.max(
          baseWidth,
          (localEnd - localStart + 1) * baseWidth
        );

        segments.push({
          ...annotation,
          annotationId: annotation.id,
          annotationType,
          sourceStart: annotation.start,
          sourceEnd: annotation.end,
          rowIndex,
          rowStart,
          rowEnd,
          start: segmentStart,
          end: segmentEnd,
          localStart,
          localEnd,
          x: localStart * baseWidth + width / 2,
          width,
          direction:
            annotationType === "primer" || annotationType === "orf"
              ? getDirection(annotation)
              : undefined,
          frame: annotationType === "orf" ? getFrame(annotation) : undefined,
          label: getLabel(annotation),
          bases:
            annotationType === "primer"
              ? sequence.slice(segmentStart, segmentEnd + 1)
              : undefined
        });
      }

      return segments;
    }
  );
}

function buildRowCutsiteSegments(sequenceData, options) {
  const { annotationVisibility } = options;
  if (!isVisible("cutsite", annotationVisibility)) return [];

  return normalizeAnnotations(sequenceData.cutsites, {
    annotationType: "cutsite"
  }).flatMap(annotation =>
    buildRowAnnotationSegments(annotation, {
      ...options,
      annotationType: "cutsite"
    })
  );
}

function getCodonTriplet(sequence, start, end, forward, mode) {
  const triplet = sequence.slice(start, end + 1);
  return forward ? triplet : reverseComplement(triplet, mode);
}

function getAminoAcidForTriplet(triplet) {
  try {
    return getAminoAcidFromSequenceTriplet(triplet);
  } catch {
    return null;
  }
}

function buildCodonsForTranslation(annotation, options) {
  const {
    sequence,
    mode,
    showAminoAcidUnitAsCodon,
    baseWidth,
    rowStart,
    rowEnd
  } = options;
  const forward = getDirection(annotation) !== "reverse";
  const rangeStart = Math.min(
    Number(annotation.start) || 0,
    Number(annotation.end) || 0
  );
  const rangeEnd = Math.max(
    Number(annotation.start) || 0,
    Number(annotation.end) || 0
  );
  const codons = [];

  if (forward) {
    for (let start = rangeStart; start + 2 <= rangeEnd; start += 3) {
      const end = start + 2;
      if (end < rowStart || start > rowEnd) continue;
      const triplet = getCodonTriplet(sequence, start, end, forward, mode);
      const aminoAcid = getAminoAcidForTriplet(triplet);
      codons.push({
        start,
        end,
        x: (start - rowStart) * baseWidth + baseWidth * 1.5,
        width: baseWidth * 3,
        triplet: triplet.toUpperCase(),
        label: showAminoAcidUnitAsCodon
          ? triplet.toUpperCase()
          : aminoAcid?.value || "?",
        color: aminoAcid?.colorByFamily || "#22d3ee"
      });
    }
    return codons;
  }

  for (let end = rangeEnd; end - 2 >= rangeStart; end -= 3) {
    const start = end - 2;
    if (end < rowStart || start > rowEnd) continue;
    const triplet = getCodonTriplet(sequence, start, end, forward, mode);
    const aminoAcid = getAminoAcidForTriplet(triplet);
    codons.push({
      start,
      end,
      x: (start - rowStart) * baseWidth + baseWidth * 1.5,
      width: baseWidth * 3,
      triplet: triplet.toUpperCase(),
      label: showAminoAcidUnitAsCodon
        ? triplet.toUpperCase()
        : aminoAcid?.value || "?",
      color: aminoAcid?.colorByFamily || "#22d3ee"
    });
  }

  return codons.sort((a, b) => a.start - b.start);
}

function buildRowTranslationSegments(sequenceData, options) {
  const { annotationVisibility, sequenceLength, circular, basesPerRow } =
    options;
  if (!isVisible("translation", annotationVisibility)) return [];

  return normalizeAnnotations(sequenceData.translations, {
    annotationType: "translation"
  }).flatMap(annotation =>
    splitLinearRange(annotation, { circular, sequenceLength }).flatMap(
      range => {
        const start = clamp(
          Math.min(range.start, range.end),
          0,
          sequenceLength - 1
        );
        const end = clamp(
          Math.max(range.start, range.end),
          0,
          sequenceLength - 1
        );
        const firstRow = Math.floor(start / basesPerRow);
        const lastRow = Math.floor(end / basesPerRow);
        const segments = [];

        for (let rowIndex = firstRow; rowIndex <= lastRow; rowIndex += 1) {
          const rowStart = rowIndex * basesPerRow;
          const rowEnd = Math.min(
            sequenceLength - 1,
            rowStart + basesPerRow - 1
          );
          const segmentStart = Math.max(start, rowStart);
          const segmentEnd = Math.min(end, rowEnd);
          const codons = buildCodonsForTranslation(annotation, {
            ...options,
            rowStart,
            rowEnd
          }).filter(
            codon => codon.end >= segmentStart && codon.start <= segmentEnd
          );

          if (!codons.length) continue;

          segments.push({
            ...annotation,
            annotationId: annotation.id,
            annotationType: "translation",
            sourceStart: annotation.start,
            sourceEnd: annotation.end,
            rowIndex,
            rowStart,
            rowEnd,
            start: segmentStart,
            end: segmentEnd,
            direction: getDirection(annotation),
            label: getLabel(annotation),
            codons
          });
        }

        return segments;
      }
    )
  );
}

function buildVisibleRowAnnotations(sequenceData, options) {
  const {
    sequence,
    sequenceLength,
    circular,
    basesPerRow,
    baseWidth,
    annotationVisibility
  } = options;
  const groups = [
    { annotationType: "feature", annotations: sequenceData.features },
    { annotationType: "part", annotations: sequenceData.parts },
    { annotationType: "primer", annotations: sequenceData.primers },
    { annotationType: "orf", annotations: sequenceData.orfs }
  ];

  return groups.flatMap(group => {
    if (!isVisible(group.annotationType, annotationVisibility)) return [];
    return normalizeAnnotations(group.annotations, {
      annotationType: group.annotationType
    }).flatMap(annotation =>
      buildRowAnnotationSegments(annotation, {
        annotationType: group.annotationType,
        sequence,
        sequenceLength,
        circular,
        basesPerRow,
        baseWidth
      })
    );
  });
}

export function getRowIndexForPosition(
  position,
  { basesPerRow = 100, sequenceLength = 0 } = {}
) {
  const rowSize = toPositiveInteger(basesPerRow, 100);
  const length = toPositiveInteger(sequenceLength, 0);
  if (length <= 0) return 0;
  return Math.floor(clamp(Number(position) || 0, 0, length - 1) / rowSize);
}

export function getScrollTopForPosition(
  position,
  { basesPerRow = 100, rowHeightPx = 72, sequenceLength = 0 } = {}
) {
  return (
    getRowIndexForPosition(position, { basesPerRow, sequenceLength }) *
    toPositiveInteger(rowHeightPx, 72)
  );
}

export default function buildRowSceneModel(
  sequenceData = {},
  {
    basesPerRow = 100,
    visibleStartRow = 0,
    visibleRowCount = 8,
    overscan = 1,
    baseWidth = 0.09,
    rowHeight = 0.78,
    rowHeightPx = 72,
    mode = "dna",
    showAminoAcidUnitAsCodon = false,
    annotationVisibility = {}
  } = {}
) {
  const sequenceLength = getSequenceLength(sequenceData);
  const sequence = getSequence(sequenceData, sequenceLength);
  const rowSize = toPositiveInteger(basesPerRow, 100);
  const totalRows = sequenceLength ? Math.ceil(sequenceLength / rowSize) : 0;
  const startRow = totalRows
    ? clamp(
        Math.floor(Number(visibleStartRow) || 0) -
          Math.max(0, Math.floor(Number(overscan) || 0)),
        0,
        totalRows - 1
      )
    : 0;
  const endRow = totalRows
    ? clamp(
        Math.floor(Number(visibleStartRow) || 0) +
          toPositiveInteger(visibleRowCount, 8) +
          Math.max(0, Math.floor(Number(overscan) || 0)) -
          1,
        0,
        totalRows - 1
      )
    : -1;
  const visibleRows = [];
  const rowAnnotations = buildVisibleRowAnnotations(sequenceData, {
    sequence,
    sequenceLength,
    circular: sequenceData.circular === true,
    basesPerRow: rowSize,
    baseWidth,
    annotationVisibility
  });
  const rowCutsites = buildRowCutsiteSegments(sequenceData, {
    sequence,
    sequenceLength,
    circular: sequenceData.circular === true,
    basesPerRow: rowSize,
    baseWidth,
    annotationVisibility
  });
  const rowTranslations = buildRowTranslationSegments(sequenceData, {
    sequence,
    sequenceLength,
    circular: sequenceData.circular === true,
    basesPerRow: rowSize,
    baseWidth,
    mode,
    showAminoAcidUnitAsCodon,
    annotationVisibility
  });

  for (let rowIndex = startRow; rowIndex <= endRow; rowIndex += 1) {
    const start = rowIndex * rowSize;
    const end = Math.min(sequenceLength - 1, start + rowSize - 1);
    const rowSequence = sequence.slice(start, end + 1);

    const annotations = avoidRowLabelCollisions(
      rowAnnotations.filter(annotation => annotation.rowIndex === rowIndex),
      { baseWidth }
    );
    const cutsites = rowCutsites.filter(
      cutsite => cutsite.rowIndex === rowIndex
    );
    const translations = rowTranslations.filter(
      translation => translation.rowIndex === rowIndex
    );

    visibleRows.push({
      rowIndex,
      relativeIndex: rowIndex - startRow,
      start,
      end,
      length: end - start + 1,
      sequence: rowSequence,
      complementSequence: rowSequence
        .split("")
        .map(base => complementBase(base, mode))
        .join(""),
      axisTicks: buildAxisTicks(start, end, rowSize),
      annotations,
      cutsites,
      translations
    });
  }

  return {
    viewType: "row",
    name: sequenceData.name || "Untitled sequence",
    sequence,
    sequenceLength,
    circular: sequenceData.circular === true,
    basesPerRow: rowSize,
    baseWidth,
    rowHeight,
    rowHeightPx: toPositiveInteger(rowHeightPx, 72),
    totalRows,
    totalHeightPx: totalRows * toPositiveInteger(rowHeightPx, 72),
    visibleStartRow: startRow,
    visibleEndRow: endRow,
    visibleRows,
    annotations: visibleRows.flatMap(row => row.annotations),
    cutsites: visibleRows.flatMap(row => row.cutsites),
    translations: visibleRows.flatMap(row => row.translations)
  };
}

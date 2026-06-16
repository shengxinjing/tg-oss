import { EDIT_COLORS } from "./buildCircularEditModel";

function clamp(value, lo, hi) {
  return Math.max(lo, Math.min(hi, value));
}

// Split edit ranges (deletion / replacement / insertion previews) into per-row
// segments for the row view — the row-space twin of buildCircularEditModel.
// Reuses EDIT_COLORS so edit colors stay unified across views. Pure: the layer
// (RowEditLayer) renders the segments; an empty model renders nothing.
export default function buildRowEditSegments({
  edits = [],
  sequenceLength = 0,
  basesPerRow = 100,
  baseWidth = 0.2
} = {}) {
  if (!Array.isArray(edits) || sequenceLength <= 0 || basesPerRow <= 0) {
    return [];
  }

  return edits
    .filter(
      edit =>
        edit &&
        Number.isFinite(Number(edit.start)) &&
        Number.isFinite(Number(edit.end))
    )
    .flatMap((edit, index) => {
      const type = edit.type || "replacement";
      const id = edit.id || `edit-${index}`;
      const color = edit.color || EDIT_COLORS[type] || EDIT_COLORS.replacement;
      const start = clamp(
        Math.min(Number(edit.start), Number(edit.end)),
        0,
        sequenceLength - 1
      );
      const end = clamp(
        Math.max(Number(edit.start), Number(edit.end)),
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
          id,
          editId: id,
          type,
          color,
          rowIndex,
          rowStart,
          rowEnd,
          start: segmentStart,
          end: segmentEnd,
          sourceStart: start,
          sourceEnd: end,
          localStart,
          localEnd,
          x: localStart * baseWidth + width / 2,
          width
        });
      }

      return segments;
    });
}

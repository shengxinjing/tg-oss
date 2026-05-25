import mapPointerToLinearPosition from "./mapPointerToLinearPosition";

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export default function mapPointerToRowPosition(
  pointer = {},
  {
    left = 0,
    top = 0,
    baseWidth = 1,
    rowHeight = 1,
    basesPerRow = 1,
    sequenceLength = 0,
    mode = "dna"
  } = {}
) {
  const length = toNumber(sequenceLength);
  const rowSize = toNumber(basesPerRow);
  const height = toNumber(rowHeight);
  if (length <= 0 || rowSize <= 0 || height <= 0) return null;

  const rowIndex = Math.floor((toNumber(pointer.y) - toNumber(top)) / height);
  if (rowIndex < 0) return null;

  const rowStart = rowIndex * rowSize;
  if (rowStart >= length) return null;

  const rowEnd = Math.min(length - 1, rowStart + rowSize - 1);
  const rowLength = rowEnd - rowStart + 1;
  const rowPosition = mapPointerToLinearPosition(pointer, {
    left,
    baseWidth,
    sequenceLength: rowLength,
    mode
  });
  if (!rowPosition) return null;

  return {
    rowIndex,
    rowStart,
    rowEnd,
    position: rowStart + rowPosition.position
  };
}

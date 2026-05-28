export default function getNextVisibleStartRow({
  currentStartRow,
  deltaY,
  rowHeightPx,
  totalRows,
  visibleRowCount
}) {
  if (!totalRows) return currentStartRow;
  const rowDelta =
    Math.sign(deltaY) * Math.max(1, Math.round(Math.abs(deltaY) / rowHeightPx));
  const maxStartRow = Math.max(0, totalRows - visibleRowCount);

  return Math.min(Math.max(currentStartRow + rowDelta, 0), maxStartRow);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default function mapPointToVisibleRowPosition(
  point = {},
  { sceneModel } = {}
) {
  const rows = sceneModel?.visibleRows || [];
  if (!rows.length || !sceneModel.baseWidth || !sceneModel.rowHeight) {
    return null;
  }

  const topY = ((rows.length - 1) * sceneModel.rowHeight) / 2;
  const topEdge = topY + sceneModel.rowHeight / 2;
  const relativeIndex = Math.floor(
    (topEdge - Number(point.y || 0)) / sceneModel.rowHeight
  );
  const row = rows[relativeIndex];

  if (!row) return null;

  const localBase = Math.floor(Number(point.x || 0) / sceneModel.baseWidth);
  const clampedLocalBase = clamp(localBase, 0, Math.max(row.length - 1, 0));

  return {
    rowIndex: row.rowIndex,
    rowStart: row.start,
    rowEnd: row.end,
    position: row.start + clampedLocalBase
  };
}

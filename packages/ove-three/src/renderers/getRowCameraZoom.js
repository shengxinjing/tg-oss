const HORIZONTAL_PADDING_RATIO = 0.25;
const VERTICAL_PADDING_RATIO = 0.35;
const MIN_VISIBLE_ROWS = 5;
const TOP_PADDING_WORLD = 0.28;
const ROW_TOP_CONTENT_OFFSET = 0.64;

export default function getRowCameraZoom({
  canvasWidth,
  canvasHeight,
  rowWidth,
  rowHeight = 0.78,
  minVisibleRows = MIN_VISIBLE_ROWS
}) {
  if (!(canvasWidth > 0) || !(canvasHeight > 0) || !(rowWidth > 0)) return 92;

  const horizontalZoom =
    canvasWidth / (rowWidth * (1 + HORIZONTAL_PADDING_RATIO));
  const verticalZoom =
    canvasHeight / (rowHeight * minVisibleRows * (1 + VERTICAL_PADDING_RATIO));

  return Math.min(horizontalZoom, verticalZoom);
}

export function getRowCameraTargetY({
  canvasHeight,
  zoom,
  visibleRowCount,
  rowHeight = 0.78,
  topPadding = TOP_PADDING_WORLD
}) {
  if (!(canvasHeight > 0) || !(zoom > 0) || !(visibleRowCount > 0)) return 0;

  const visibleHeight = canvasHeight / zoom;
  const topRowY = ((visibleRowCount - 1) * rowHeight) / 2;
  const topContentY = topRowY + ROW_TOP_CONTENT_OFFSET;

  return topContentY - visibleHeight / 2 + topPadding;
}

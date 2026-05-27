const HORIZONTAL_PADDING_RATIO = 0.25;
const VERTICAL_PADDING_RATIO = 0.35;
const MIN_VISIBLE_ROWS = 5;

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

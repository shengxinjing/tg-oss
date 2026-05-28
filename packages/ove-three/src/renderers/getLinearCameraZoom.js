const DEFAULT_CONTENT_HEIGHT = 8.2;
const HORIZONTAL_PADDING_RATIO = 0.12;
const VERTICAL_PADDING_RATIO = 0.3;

export default function getLinearCameraZoom({
  canvasWidth,
  canvasHeight,
  modelWidth,
  contentHeight = DEFAULT_CONTENT_HEIGHT
}) {
  if (!(canvasWidth > 0) || !(canvasHeight > 0) || !(modelWidth > 0)) return 10;

  const horizontalZoom =
    canvasWidth / (modelWidth * (1 + HORIZONTAL_PADDING_RATIO));
  const verticalZoom =
    canvasHeight / (contentHeight * (1 + VERTICAL_PADDING_RATIO));

  return Math.min(horizontalZoom, verticalZoom);
}

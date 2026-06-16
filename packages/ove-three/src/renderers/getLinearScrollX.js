// Horizontal scroll offset (camera x) to bring a bp position into view on the
// linear map, clamped so we never scroll past the model edges. When the whole
// model fits in the viewport (zoomed out), returns 0 (centered).
export default function getLinearScrollX({
  position = 0,
  baseWidth = 1,
  modelWidth = 0,
  cameraZoom = 1,
  canvasWidth = 0
} = {}) {
  if (!(modelWidth > 0) || !(canvasWidth > 0) || !(cameraZoom > 0)) return 0;

  const visibleWidth = canvasWidth / cameraZoom;
  if (visibleWidth >= modelWidth) return 0; // everything fits → stay centered

  const targetX = position * baseWidth - modelWidth / 2;
  const maxX = modelWidth / 2 - visibleWidth / 2;
  return Math.max(-maxX, Math.min(maxX, targetX));
}

export default function getCanvasDpr(maxDpr = 2) {
  const capped = Math.min(Math.max(Number(maxDpr) || 1, 1), 2);
  return [1, capped];
}

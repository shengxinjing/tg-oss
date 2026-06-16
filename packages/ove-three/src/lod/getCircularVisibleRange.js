// Which bp window is actually on screen for the circular map at a given
// zoom + rotation. Only this window's bases are rendered (virtualization).
// The window is centered on the "front" bp (derived from rotation) and may
// cross the origin (start > end → wraps), which callers split into two arcs.
export default function getCircularVisibleRange({
  zoom = 1,
  rotation = 0,
  sequenceLength = 0,
  marginRatio = 0.3
} = {}) {
  const len = Math.floor(Number(sequenceLength)) || 0;
  if (len <= 0) {
    return { start: 0, end: 0, count: 0, wraps: false, focusBp: 0 };
  }

  const safeZoom = Number(zoom) > 0 ? Number(zoom) : 1;
  const norm = value => ((Math.round(value) % len) + len) % len;
  const focusBp = norm((Number(rotation) / 360) * len);

  // At zoom z roughly 1/z of the ring is in view; add margin on each side.
  const basesInView = Math.ceil(len / safeZoom);
  const half = Math.ceil((basesInView / 2) * (1 + marginRatio));
  const count = 2 * half + 1;

  if (count >= len) {
    return { start: 0, end: len - 1, count: len, wraps: false, focusBp };
  }

  const start = norm(focusBp - half);
  const end = norm(start + count - 1);
  return { start, end, count, wraps: end < start, focusBp };
}

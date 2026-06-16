import { CIRCULAR_RADIUS } from "../lod/lodThresholds";

// Edge-anchored circular zoom (matches SVG OVE): instead of scaling the ring
// about its center, we "zoom to the focus point" — the focus bp's spot on the
// backbone stays fixed on screen while the ring scales, so the empty center is
// pushed out of the viewport and the focused arc fills the view.
//
// Applied as: groupPosition = offset, groupScale = scale (scale about origin).
// Then any local point P renders at P*scale + offset. For the focus point that
// equals focusPoint (anchored); for the origin (center) it equals offset, whose
// magnitude grows with zoom → center leaves the viewport.
export default function getCircularZoomTransform({
  zoom = 1,
  focusBp = 0,
  sequenceLength = 0,
  radius = CIRCULAR_RADIUS,
  framing
} = {}) {
  const len = Math.floor(Number(sequenceLength)) || 0;
  const scale = Number(zoom) > 1 ? Number(zoom) : 1;

  if (len <= 0) {
    return { scale: 1, offset: [0, 0, 0], focusPoint: [0, 0] };
  }

  const angle = ((((focusBp % len) + len) % len) / len) * 2 * Math.PI;
  const fx = radius * Math.sin(angle);
  const fz = -radius * Math.cos(angle);

  // The focus point lands at `framing` (defaults to its own scale-1 position so
  // there's no shift at zoom 1). Scaling about the origin then pushes the empty
  // center out of view as zoom grows.
  const targetX = framing ? framing[0] : fx;
  const targetZ = framing ? framing[1] : fz;
  return {
    scale,
    offset: [targetX - fx * scale, 0, targetZ - fz * scale],
    focusPoint: [fx, fz]
  };
}

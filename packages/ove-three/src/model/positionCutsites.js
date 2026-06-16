// Assigns radial "stack" levels to cut sites so clustered enzymes (cutting near
// the same position) get their labels spread outward instead of overlapping —
// matches SVG OVE's positionCutsites label stacking. Input items carry an
// `angle`; output preserves each item and adds a `stack` (0 = innermost).
export default function positionCutsites(
  cutsites = [],
  { minAngularGap = 0.08, maxStack = 3 } = {}
) {
  const sorted = [...cutsites]
    .filter(cutsite => Number.isFinite(cutsite.angle))
    .sort((a, b) => a.angle - b.angle);

  let prevAngle = -Infinity;
  let stack = 0;
  return sorted.map(cutsite => {
    if (cutsite.angle - prevAngle < minAngularGap) {
      stack = Math.min(stack + 1, maxStack);
    } else {
      stack = 0;
    }
    prevAngle = cutsite.angle;
    return { ...cutsite, stack };
  });
}

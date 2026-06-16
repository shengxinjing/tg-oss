// Map LOD density (bp between shown items) to circular axis tick steps.
// Zoomed in (small everyBp) → fine ticks; zoomed out → undefined steps, which
// tells buildCircularAxisTicks to use its length-based default.
export default function getAxisTickSteps({ density } = {}) {
  if (!density || density >= 50) {
    return { majorStep: undefined, minorStep: undefined };
  }
  if (density <= 1) return { majorStep: 10, minorStep: 1 };
  if (density <= 5) return { majorStep: 50, minorStep: 5 };
  return { majorStep: 100, minorStep: 10 };
}

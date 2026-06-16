import {
  CIRCULAR_RADIUS,
  DENSITY_STEPS,
  LOD_LEVELS,
  LOD_THRESHOLDS
} from "./lodThresholds";

// `worldPerBase` = how many world units one base occupies. This is the single
// zoom metric all views share, so LOD thresholds are independent of sequence
// length. Circular = arc length per base; linear/row = base width × camera zoom.
export function getWorldPerBase({
  viewType = "circular",
  zoom = 1,
  sequenceLength = 0,
  baseWidth,
  radius = CIRCULAR_RADIUS
} = {}) {
  const safeZoom = Number(zoom) > 0 ? Number(zoom) : 1;

  if (viewType === "circular") {
    const len = Math.floor(Number(sequenceLength)) || 0;
    if (len <= 0) return 0;
    return (2 * Math.PI * radius * safeZoom) / len;
  }

  const bw = Number(baseWidth) > 0 ? Number(baseWidth) : 0.02;
  return bw * safeZoom;
}

// Resolve the LOD level from worldPerBase, applying hysteresis against the
// previously-resolved level: to rise into a level you must cross its (higher)
// `enter` threshold; to stay you only need to remain above its (lower) `exit`.
export function resolveLodLevel(
  worldPerBase,
  previousLevel = LOD_LEVELS.OVERVIEW
) {
  let level = LOD_LEVELS.OVERVIEW;
  for (const step of LOD_THRESHOLDS) {
    const threshold = previousLevel >= step.level ? step.exit : step.enter;
    if (worldPerBase >= threshold) {
      level = step.level;
    }
  }
  return level;
}

// Discrete bp-spacing for ticks/labels (stable buckets, no jitter).
export function getDensity(worldPerBase) {
  for (const step of DENSITY_STEPS) {
    if (worldPerBase >= step.minWorldPerBase) return step.everyBp;
  }
  return DENSITY_STEPS[DENSITY_STEPS.length - 1].everyBp;
}

export default function resolveLod({
  zoom = 1,
  sequenceLength = 0,
  viewType = "circular",
  baseWidth,
  radius,
  previousLevel = LOD_LEVELS.OVERVIEW
} = {}) {
  const worldPerBase = getWorldPerBase({
    viewType,
    zoom,
    sequenceLength,
    baseWidth,
    radius
  });
  const lodLevel = resolveLodLevel(worldPerBase, previousLevel);
  const density = getDensity(worldPerBase);
  return { worldPerBase, lodLevel, density };
}

// Zoom-progressive camera flattening for the circular view. At overview zoom the
// camera keeps a dramatic 3D oblique tilt (shows off the depth); as the user
// zooms into the edge-anchored arc, the polar angle eases toward near top-down
// so the focused sequence reads as a flat, SVG-like horizontal band instead of a
// steeply foreshortened ribbon. Pure: drives OrbitControls' polar angle.
//
// Polar angle is measured from the +Y axis (three.js convention): larger =
// closer to the horizon (oblique), smaller = closer to straight-down (flat).
export const POLAR_OBLIQUE = 0.95; // ~matches the initial (0, 5.1, 7.2) camera
export const POLAR_FLAT = 0.18; // near top-down, but off-axis enough to avoid gimbal
const FLATTEN_START = 1;
const FLATTEN_END = 16;

export default function getCircularCameraPolar(zoom = 1) {
  const z = Number(zoom);
  if (Number.isNaN(z) || z <= FLATTEN_START) return POLAR_OBLIQUE;
  if (z >= FLATTEN_END) return POLAR_FLAT;

  const t = (z - FLATTEN_START) / (FLATTEN_END - FLATTEN_START);
  const eased = t * t * (3 - 2 * t); // smoothstep
  return POLAR_OBLIQUE + (POLAR_FLAT - POLAR_OBLIQUE) * eased;
}

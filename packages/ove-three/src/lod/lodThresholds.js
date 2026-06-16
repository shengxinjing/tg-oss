// Level-of-detail levels (ordered). Higher = more sequence detail revealed.
export const LOD_LEVELS = {
  OVERVIEW: 0, // whole map, features/annotations, no tick numbers
  TICKS: 1, // ruler numbers + density-decimated labels
  BASES: 2, // + forward-strand base letters
  BASES_COMPLEMENT: 3, // + complement strand
  TRANSLATION: 4 // + amino-acid translation
};

// Thresholds in `worldPerBase` (world units per base). Each level has a higher
// `enter` and a lower `exit` threshold — the gap is a hysteresis deadband so
// hovering a zoom boundary doesn't flip layers on/off (anti-flicker).
export const LOD_THRESHOLDS = [
  { level: LOD_LEVELS.TICKS, enter: 0.012, exit: 0.01 },
  { level: LOD_LEVELS.BASES, enter: 0.026, exit: 0.022 },
  { level: LOD_LEVELS.BASES_COMPLEMENT, enter: 0.05, exit: 0.044 },
  { level: LOD_LEVELS.TRANSLATION, enter: 0.085, exit: 0.075 }
];

// Discrete, stable density buckets: how many bp between shown ticks/labels.
// Discrete (not continuous) so decimation doesn't jitter while zooming.
export const DENSITY_STEPS = [
  { minWorldPerBase: 0.085, everyBp: 1 },
  { minWorldPerBase: 0.03, everyBp: 5 },
  { minWorldPerBase: 0.012, everyBp: 10 },
  { minWorldPerBase: 0.004, everyBp: 50 },
  { minWorldPerBase: 0, everyBp: 100 }
];

// Backbone radius of the circular map group (matches ThreeCircularCanvas).
export const CIRCULAR_RADIUS = 2.4;

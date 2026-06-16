// Estimates a sequence-map row's world height from the layers it shows — like
// SVG OVE's estimateRowHeight. More visible layers (complement, translations,
// annotation lanes, cutsites, chromatogram, jump buttons) → taller rows, so
// stacked content never overlaps.
const COMPONENT_HEIGHT = {
  base: 0.5, // forward sequence (always present)
  complement: 0.3,
  axis: 0.26,
  annotationLane: 0.32,
  translations: 0.4,
  cutsites: 0.3,
  chromatogram: 0.9,
  jumpButtons: 0.3,
  warnings: 0.24,
  strandHints: 0.16
};

export default function estimateRowHeight({
  showComplement = true,
  showAxis = true,
  annotationLanes = 0,
  showTranslations = false,
  showCutsites = false,
  showChromatogram = false,
  showJumpButtons = false,
  showWarnings = false,
  showStrandHints = false
} = {}) {
  let height = COMPONENT_HEIGHT.base;
  if (showComplement) height += COMPONENT_HEIGHT.complement;
  if (showAxis) height += COMPONENT_HEIGHT.axis;
  height +=
    Math.max(0, Math.floor(annotationLanes)) * COMPONENT_HEIGHT.annotationLane;
  if (showTranslations) height += COMPONENT_HEIGHT.translations;
  if (showCutsites) height += COMPONENT_HEIGHT.cutsites;
  if (showChromatogram) height += COMPONENT_HEIGHT.chromatogram;
  if (showJumpButtons) height += COMPONENT_HEIGHT.jumpButtons;
  if (showWarnings) height += COMPONENT_HEIGHT.warnings;
  if (showStrandHints) height += COMPONENT_HEIGHT.strandHints;
  return Math.round(height * 1000) / 1000;
}

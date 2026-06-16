// Linear-map LOD: which detail to show given on-screen pixels-per-base. Zooming
// in (more px/base) progressively reveals bases → complement → translation; at
// low px/base we auto-hide letters and show the solid backbone bar instead
// (SVG OVE's dense auto-hide).
export default function getLinearLodFlags({ pixelsPerBase = 0 } = {}) {
  const ppb = Number(pixelsPerBase) || 0;
  const showBases = ppb >= 6;
  return {
    pixelsPerBase: ppb,
    showBackboneBar: !showBases,
    showBases,
    showComplement: ppb >= 9,
    showTranslation: ppb >= 14
  };
}

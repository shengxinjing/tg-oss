import createArcRibbonGeometry from "./createArcRibbonGeometry";

export default function createSelectionGeometry({
  startAngle,
  endAngle,
  totalAngle,
  radius = 2.76,
  width = 0.18
} = {}) {
  return createArcRibbonGeometry({
    startAngle,
    endAngle,
    totalAngle,
    radius,
    width,
    minVisibleAngle: 0.025
  });
}

import avoidCircularLabelCollisions from "./avoidCircularLabelCollisions";
import measureText from "./measureText";

const labelableTypes = new Set(["feature", "part", "primer", "cutsite", "orf"]);
const fallbackColors = {
  feature: "#45d34f",
  part: "#a855f7",
  primer: "#22d3ee",
  cutsite: "#fb923c",
  orf: "#38bdf8"
};

function getAngle(segment) {
  return segment.startAngle + segment.totalAngle / 2;
}

function getPoint(angle, radius, y = 0.28) {
  return [
    Math.cos(angle - Math.PI / 2) * radius,
    y,
    Math.sin(angle - Math.PI / 2) * radius
  ];
}

function getText(annotation) {
  return annotation.enzyme || annotation.name || annotation.id;
}

function getPriority(annotation) {
  if (annotation.annotationType === "feature") return 5;
  if (annotation.annotationType === "part") return 4;
  if (annotation.annotationType === "primer") return 3;
  if (annotation.annotationType === "cutsite") return 2;
  return 1;
}

function buildLabel(
  annotation,
  segment,
  {
    labelRadius,
    leaderRadius,
    scale,
    fontSize,
    fontSizeWorld,
    selectedAnnotationId,
    hoveredAnnotationId
  }
) {
  const angle = getAngle(segment);
  const position = getPoint(angle, labelRadius);
  const leaderStart = getPoint(angle, leaderRadius, 0.24);
  const leaderEnd = getPoint(angle, labelRadius - 0.18, 0.24);
  const text = getText(annotation);
  const size = measureText(text, { fontSize });
  const arcWidth = Math.max(0, segment.totalAngle * leaderRadius * scale);

  return {
    id: `${annotation.id}-${segment.start}-${segment.end}`,
    annotationId: annotation.id,
    annotationType: annotation.annotationType,
    text,
    color:
      annotation.color ||
      fallbackColors[annotation.annotationType] ||
      "#e5eefb",
    position,
    leaderStart,
    leaderEnd,
    x: position[0] * scale,
    y: position[2] * scale,
    width: size.width,
    height: size.height,
    arcWidth,
    fontSizeWorld,
    priority: getPriority(annotation),
    selected: selectedAnnotationId === annotation.id,
    hovered: hoveredAnnotationId === annotation.id
  };
}

function getDenseFontSize(labelCount) {
  if (labelCount > 160) return 0.078;
  if (labelCount > 90) return 0.092;
  return 0.115;
}

function keepDenseLabel(label) {
  if (label.selected || label.hovered) return true;
  return label.annotationType !== "cutsite";
}

export default function buildCircularLabels({
  sceneModel = {},
  labelRadius = 3.45,
  leaderRadius = 2.92,
  labelScale = 1,
  scale = 120,
  fontSize = 12,
  denseLabelThreshold = 120,
  maxVisibleLabels = 72,
  onlyShowOverflowLabels = false,
  selectedAnnotationId,
  hoveredAnnotationId
} = {}) {
  const rawLabelCount = (sceneModel.annotations || []).reduce(
    (count, annotation) =>
      labelableTypes.has(annotation.annotationType)
        ? count + annotation.segments.length
        : count,
    0
  );
  const safeLabelScale = Math.max(0.7, Number(labelScale) || 1);
  const fontSizeWorld = getDenseFontSize(rawLabelCount) * safeLabelScale;
  const labels = (sceneModel.annotations || [])
    .filter(annotation => labelableTypes.has(annotation.annotationType))
    .flatMap(annotation =>
      annotation.segments.map(segment =>
        buildLabel(annotation, segment, {
          labelRadius,
          leaderRadius,
          scale,
          fontSize: fontSize * safeLabelScale,
          fontSizeWorld,
          selectedAnnotationId,
          hoveredAnnotationId
        })
      )
    );
  const overflowManagedLabels = onlyShowOverflowLabels
    ? labels.filter(label => label.width > label.arcWidth)
    : labels;
  const densityManagedLabels =
    overflowManagedLabels.length > denseLabelThreshold
      ? overflowManagedLabels.filter(keepDenseLabel)
      : overflowManagedLabels;

  return avoidCircularLabelCollisions(densityManagedLabels, {
    maxVisibleLabels
  });
}

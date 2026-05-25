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
    priority: getPriority(annotation),
    selected: selectedAnnotationId === annotation.id,
    hovered: hoveredAnnotationId === annotation.id
  };
}

export default function buildCircularLabels({
  sceneModel = {},
  labelRadius = 3.45,
  leaderRadius = 2.92,
  scale = 120,
  fontSize = 12,
  selectedAnnotationId,
  hoveredAnnotationId
} = {}) {
  const labels = (sceneModel.annotations || [])
    .filter(annotation => labelableTypes.has(annotation.annotationType))
    .flatMap(annotation =>
      annotation.segments.map(segment =>
        buildLabel(annotation, segment, {
          labelRadius,
          leaderRadius,
          scale,
          fontSize,
          selectedAnnotationId,
          hoveredAnnotationId
        })
      )
    );

  return avoidCircularLabelCollisions(labels);
}

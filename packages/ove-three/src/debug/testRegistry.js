import buildCircularLabels from "../labels/buildCircularLabels";

function getAngle(segment) {
  return segment.startAngle + segment.totalAngle / 2;
}

function getPoint(angle, radius, y) {
  return [
    Math.cos(angle - Math.PI / 2) * radius,
    y,
    Math.sin(angle - Math.PI / 2) * radius
  ];
}

function getAnnotationText(annotation) {
  return annotation.enzyme || annotation.name || annotation.id;
}

const frameColors = [
  "#38bdf8",
  "#a78bfa",
  "#f472b6",
  "#34d399",
  "#facc15",
  "#fb7185"
];

function getDirection(annotation) {
  if (annotation.forward === false || annotation.strand === -1)
    return "reverse";
  return annotation.direction === "reverse" ? "reverse" : "forward";
}

function getFrame(annotation) {
  const rawFrame = Number(annotation.frame);
  if (Number.isFinite(rawFrame) && rawFrame >= 1 && rawFrame <= 6) {
    return rawFrame;
  }
  const baseFrame = Math.abs(Number(annotation.start) || 0) % 3;
  return getDirection(annotation) === "reverse" ? baseFrame + 4 : baseFrame + 1;
}

function getRenderableAnnotations(sceneModel = {}) {
  return (sceneModel.annotations || []).filter(annotation =>
    ["feature", "part", "primer"].includes(annotation.annotationType)
  );
}

function getLinearY(annotationType, index = 0) {
  const baseYByType = {
    feature: 0.95,
    part: 1.72,
    primer: 2.45,
    cutsite: 3.65,
    orf: -1.18
  };

  return (baseYByType[annotationType] || 0.95) + (index % 3) * 0.48;
}

function getLinearPoint(sceneModel, annotation, segment, index) {
  const modelWidth = sceneModel.sequenceLength * sceneModel.baseWidth;
  return [
    segment.startX + segment.width / 2 - modelWidth / 2,
    getLinearY(annotation.annotationType, index),
    0
  ];
}

function createEntry(
  annotation,
  segment,
  worldPosition,
  index,
  { selectedAnnotationId, hoveredAnnotationId } = {}
) {
  return {
    id: annotation.id,
    annotationId: annotation.id,
    annotationType: annotation.annotationType,
    name: getAnnotationText(annotation),
    selected: selectedAnnotationId === annotation.id,
    hovered: hoveredAnnotationId === annotation.id,
    start: annotation.start,
    end: annotation.end,
    segmentStart: segment.start,
    segmentEnd: segment.end,
    direction:
      annotation.annotationType === "primer" ||
      annotation.annotationType === "orf"
        ? getDirection(annotation)
        : undefined,
    frame:
      annotation.annotationType === "orf" ? getFrame(annotation) : undefined,
    color:
      annotation.annotationType === "orf"
        ? frameColors[(getFrame(annotation) - 1) % frameColors.length]
        : annotation.color,
    worldPosition,
    index
  };
}

export function buildAnnotationRegistryEntries(sceneModel = {}, state = {}) {
  if (sceneModel.viewType === "linear") {
    return (sceneModel.annotations || []).flatMap(
      (annotation, annotationIndex) =>
        annotation.segments.map(segment =>
          createEntry(
            annotation,
            segment,
            getLinearPoint(sceneModel, annotation, segment, annotationIndex),
            annotationIndex,
            state
          )
        )
    );
  }

  const renderableAnnotations = getRenderableAnnotations(sceneModel).flatMap(
    (annotation, annotationIndex) =>
      annotation.segments.map(segment => {
        const radius =
          2.4 +
          (annotation.annotationType === "part" ? 0.22 : 0) +
          (annotation.annotationType === "primer" ? 0.42 : 0);

        return createEntry(
          annotation,
          segment,
          getPoint(
            getAngle(segment),
            radius,
            0.09 + (annotationIndex % 4) * 0.035
          ),
          annotationIndex,
          state
        );
      })
  );

  const cutsites = (sceneModel.annotations || []).filter(
    annotation => annotation.annotationType === "cutsite"
  );
  const cutsiteEntries = cutsites.flatMap((annotation, annotationIndex) =>
    annotation.segments.map(segment =>
      createEntry(
        annotation,
        segment,
        getPoint(getAngle(segment), 2.98, 0.13),
        annotationIndex,
        state
      )
    )
  );

  const orfs = (sceneModel.annotations || []).filter(
    annotation => annotation.annotationType === "orf"
  );
  const orfEntries = orfs.flatMap((annotation, annotationIndex) =>
    annotation.segments.map(segment =>
      createEntry(
        annotation,
        segment,
        getPoint(getAngle(segment), 1.92 - (annotationIndex % 6) * 0.08, 0.17),
        annotationIndex,
        state
      )
    )
  );

  return [...renderableAnnotations, ...cutsiteEntries, ...orfEntries];
}

export function buildLabelRegistryEntries({
  sceneModel,
  selectedAnnotationId,
  hoveredAnnotationId
} = {}) {
  return buildCircularLabels({
    sceneModel,
    selectedAnnotationId,
    hoveredAnnotationId
  }).visible.map(label => ({
    id: label.annotationId,
    annotationId: label.annotationId,
    annotationType: label.annotationType,
    name: label.text,
    selected: label.selected,
    hovered: label.hovered,
    worldPosition: label.position,
    box: {
      x: label.x,
      y: label.y,
      width: label.width,
      height: label.height
    }
  }));
}

function keyById(entries) {
  return entries.reduce((acc, entry) => {
    acc[entry.id] = entry;
    return acc;
  }, {});
}

function keyNames(entries) {
  return entries.reduce((acc, entry) => {
    if (entry.name) acc[entry.name] = entry.id;
    return acc;
  }, {});
}

export function countOverlappingLabelBoxes(labels = []) {
  let overlaps = 0;

  for (let i = 0; i < labels.length; i += 1) {
    for (let j = i + 1; j < labels.length; j += 1) {
      const a = labels[i].box;
      const b = labels[j].box;
      const separated =
        a.x + a.width / 2 <= b.x - b.width / 2 ||
        b.x + b.width / 2 <= a.x - a.width / 2 ||
        a.y + a.height / 2 <= b.y - b.height / 2 ||
        b.y + b.height / 2 <= a.y - a.height / 2;

      if (!separated) overlaps += 1;
    }
  }

  return overlaps;
}

export function projectRegistryEntries(entries = [], project) {
  return entries.map(entry => ({
    ...entry,
    ...project(entry.worldPosition, entry)
  }));
}

export function createRegistrySnapshot({
  annotations = [],
  labels = [],
  selectedAnnotationId,
  hoveredAnnotationId
} = {}) {
  return {
    annotations: keyById(annotations),
    annotationNames: keyNames(annotations),
    labels: keyById(labels),
    labelNames: keyNames(labels),
    labelOverlapCount: countOverlappingLabelBoxes(labels),
    selectedAnnotationId,
    hoveredAnnotationId
  };
}

export function publishTestRegistry(snapshot, target) {
  if (!target?.Cypress) return snapshot;
  target.Cypress.oveThreeTestRegistry = snapshot;
  return snapshot;
}

export function clearTestRegistry(target) {
  if (target?.Cypress?.oveThreeTestRegistry) {
    delete target.Cypress.oveThreeTestRegistry;
  }
}

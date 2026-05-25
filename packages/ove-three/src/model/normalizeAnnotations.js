function toAnnotationList(annotations) {
  if (Array.isArray(annotations)) {
    return annotations.map((annotation, index) => ({ annotation, key: index }));
  }

  return Object.entries(annotations || {}).map(([key, annotation]) => ({
    annotation,
    key
  }));
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export default function normalizeAnnotations(
  annotations,
  { annotationType = "annotation" } = {}
) {
  return toAnnotationList(annotations).map(({ annotation, key }, index) => ({
    ...annotation,
    id:
      annotation.id ||
      (typeof key === "string" ? key : `${annotationType}-${index}`),
    annotationType,
    start: toNumber(annotation.start),
    end: toNumber(annotation.end),
    sourceAnnotation: annotation
  }));
}

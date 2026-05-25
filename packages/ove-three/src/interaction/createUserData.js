export default function createUserData({
  kind,
  annotation = {},
  segment = {},
  extra = {}
} = {}) {
  return {
    pickable: true,
    kind,
    annotationId: annotation.id,
    annotationType: annotation.annotationType,
    name: annotation.name,
    start: annotation.start,
    end: annotation.end,
    segmentStart: segment.start,
    segmentEnd: segment.end,
    ...extra
  };
}

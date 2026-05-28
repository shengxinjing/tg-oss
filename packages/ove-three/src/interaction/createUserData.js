import getPickPriority from "./getPickPriority";

export default function createUserData({
  kind,
  annotation = {},
  segment = {},
  extra = {}
} = {}) {
  const userData = {
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

  return {
    ...userData,
    pickPriority: getPickPriority(userData)
  };
}

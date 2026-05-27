import mapRangeToLinearX from "./mapRangeToLinearX";
import normalizeAnnotations from "./normalizeAnnotations";
import splitCircularRange from "./splitCircularRange";

function toPositiveInteger(value, fallback) {
  const number = Math.floor(Number(value));
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function getSequenceLength(sequenceData = {}) {
  const rawLength = sequenceData.noSequence
    ? sequenceData.size
    : sequenceData.sequence?.length || sequenceData.size;
  return toPositiveInteger(rawLength, 0);
}

function getSequence(sequenceData = {}, sequenceLength) {
  if (typeof sequenceData.sequence === "string") return sequenceData.sequence;
  return "".padEnd(sequenceLength, " ");
}

function isVisible(annotationType, annotationVisibility = {}) {
  return annotationVisibility[annotationType] !== false;
}

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

function splitLinearRange(annotation, { circular, sequenceLength }) {
  if (circular) return splitCircularRange(annotation, { sequenceLength });

  const locations = Array.isArray(annotation.locations)
    ? annotation.locations
    : [annotation];

  return locations.map(location => ({
    start: Number(location.start) || 0,
    end: Number(location.end) || 0
  }));
}

function buildAxisTicks(sequenceLength) {
  if (sequenceLength <= 0) return [];
  const step = sequenceLength <= 1000 ? 100 : 500;
  const ticks = [];

  for (let position = 0; position < sequenceLength; position += step) {
    ticks.push({ position, label: String(position + 1) });
  }

  return ticks;
}

function buildAnnotations(
  annotations,
  { annotationType, sequenceLength, circular, baseWidth }
) {
  return normalizeAnnotations(annotations, { annotationType }).map(
    annotation => {
      const segments = splitLinearRange(annotation, {
        circular,
        sequenceLength
      }).map(segment => ({
        annotationId: annotation.id,
        annotationType,
        ...segment,
        ...mapRangeToLinearX(segment, { baseWidth })
      }));

      return {
        ...annotation,
        direction:
          annotationType === "primer" || annotationType === "orf"
            ? getDirection(annotation)
            : undefined,
        frame: annotationType === "orf" ? getFrame(annotation) : undefined,
        segments
      };
    }
  );
}

export default function buildLinearSceneModel(
  sequenceData = {},
  { annotationVisibility = {}, baseWidth = 8 } = {}
) {
  const sequenceLength = getSequenceLength(sequenceData);
  const circular = sequenceData.circular === true;
  const groups = [
    { annotationType: "feature", annotations: sequenceData.features },
    { annotationType: "part", annotations: sequenceData.parts },
    { annotationType: "primer", annotations: sequenceData.primers },
    { annotationType: "cutsite", annotations: sequenceData.cutsites },
    { annotationType: "orf", annotations: sequenceData.orfs }
  ];
  const annotations = groups.flatMap(group => {
    if (!isVisible(group.annotationType, annotationVisibility)) return [];
    return buildAnnotations(group.annotations, {
      annotationType: group.annotationType,
      sequenceLength,
      circular,
      baseWidth
    });
  });

  return {
    viewType: "linear",
    name: sequenceData.name || "Untitled sequence",
    sequence: getSequence(sequenceData, sequenceLength),
    sequenceLength,
    circular,
    baseWidth,
    axisTicks: buildAxisTicks(sequenceLength),
    annotations,
    segments: annotations.flatMap(annotation => annotation.segments)
  };
}

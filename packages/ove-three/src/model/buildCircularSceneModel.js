import mapRangeToCircularAngles from "./mapRangeToCircularAngles";
import normalizeAnnotations from "./normalizeAnnotations";

function getSequenceLength(sequenceData = {}) {
  if (sequenceData.noSequence) return sequenceData.size || 0;
  return sequenceData.sequence?.length || sequenceData.size || 0;
}

function isVisible(annotationType, annotationVisibility = {}) {
  return annotationVisibility[annotationType] !== false;
}

function buildAnnotations(
  annotations,
  { annotationType, sequenceLength, filter }
) {
  return normalizeAnnotations(annotations, { annotationType })
    .filter(annotation => !filter || filter(annotation))
    .map(annotation => {
      const segments = mapRangeToCircularAngles(annotation, {
        sequenceLength
      }).map(segment => ({
        ...segment,
        annotationId: annotation.id,
        annotationType
      }));

      return {
        ...annotation,
        segments
      };
    });
}

export default function buildCircularSceneModel(
  sequenceData = {},
  { annotationVisibility = {}, featureFilter } = {}
) {
  const sequenceLength = getSequenceLength(sequenceData);
  const circular = sequenceData.circular !== false;

  if (!circular) {
    return {
      name: sequenceData.name || "Untitled sequence",
      sequenceLength,
      circular,
      annotations: [],
      segments: []
    };
  }

  const annotationGroups = [
    {
      annotationType: "feature",
      annotations: sequenceData.features,
      filter: featureFilter
    },
    {
      annotationType: "part",
      annotations: sequenceData.parts
    },
    {
      annotationType: "primer",
      annotations: sequenceData.primers
    },
    {
      annotationType: "cutsite",
      annotations: sequenceData.cutsites
    },
    {
      annotationType: "orf",
      annotations: sequenceData.orfs
    }
  ];

  const annotations = annotationGroups.flatMap(group => {
    if (!isVisible(group.annotationType, annotationVisibility)) return [];
    return buildAnnotations(group.annotations, {
      annotationType: group.annotationType,
      sequenceLength,
      filter: group.filter
    });
  });

  return {
    name: sequenceData.name || "Untitled sequence",
    sequenceLength,
    circular,
    annotations,
    segments: annotations.flatMap(annotation => annotation.segments)
  };
}

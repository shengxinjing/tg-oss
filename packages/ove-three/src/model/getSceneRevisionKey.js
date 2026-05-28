function getSequenceLength(sequenceData = {}) {
  const rawLength = sequenceData.noSequence
    ? sequenceData.size
    : sequenceData.sequence?.length || sequenceData.size;
  const length = Math.floor(Number(rawLength));
  return Number.isFinite(length) && length > 0 ? length : 0;
}

function getSequenceFingerprint(sequence = "") {
  const value = String(sequence || "");
  if (!value) return "";
  if (value.length <= 80) return value;

  const middle = Math.floor(value.length / 2);
  return [
    value.slice(0, 24),
    value.slice(middle, middle + 24),
    value.slice(-24)
  ].join("|");
}

function getAnnotationList(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") return Object.values(value);
  return [];
}

function getAnnotationIds(sequenceData = {}) {
  return [
    "features",
    "filteredFeatures",
    "parts",
    "filteredParts",
    "primers",
    "filteredPrimers",
    "cutsites",
    "orfs",
    "translations"
  ].flatMap(key =>
    getAnnotationList(sequenceData[key]).map(annotation =>
      [
        key,
        annotation.id,
        annotation.name,
        annotation.start,
        annotation.end,
        annotation.forward,
        annotation.strand
      ].join(":")
    )
  );
}

function sortObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }

  return Object.keys(value)
    .sort()
    .reduce((acc, key) => {
      acc[key] = sortObject(value[key]);
      return acc;
    }, {});
}

export default function getSceneRevisionKey({
  sequenceData = {},
  annotationVisibility,
  viewType = "circular"
} = {}) {
  return JSON.stringify({
    viewType,
    name: sequenceData.name,
    circular: !!sequenceData.circular,
    isProtein: !!sequenceData.isProtein,
    isRna: !!sequenceData.isRna,
    sequenceLength: getSequenceLength(sequenceData),
    sequenceFingerprint: getSequenceFingerprint(sequenceData.sequence),
    annotationIds: getAnnotationIds(sequenceData),
    annotationVisibility: sortObject(annotationVisibility)
  });
}

const fallbackColors = {
  promoter: "#8b5cf6",
  operator: "#3b82f6",
  CDS: "#45d34f",
  tag: "#f5d13d",
  origin: "#60a5fa",
  misc_feature: "#f97316"
};

function normalizeFeature(feature, index, sequenceLength) {
  const start = Number(feature.start) || 0;
  const end = Number(feature.end) || 0;
  const startAngle = (start / sequenceLength) * Math.PI * 2;
  const endAngle = ((end + 1) / sequenceLength) * Math.PI * 2;
  const totalAngle =
    start <= end ? endAngle - startAngle : Math.PI * 2 - startAngle + endAngle;

  return {
    ...feature,
    id: feature.id || `feature-${index}`,
    color:
      feature.color ||
      fallbackColors[feature.type] ||
      fallbackColors.misc_feature,
    start,
    end,
    startAngle,
    endAngle,
    totalAngle
  };
}

export default function buildThreeDSceneModel(sequenceData = {}) {
  const sequenceLength = sequenceData.noSequence
    ? sequenceData.size || 0
    : sequenceData.sequence?.length || sequenceData.size || 0;
  const features = Array.isArray(sequenceData.features)
    ? sequenceData.features
    : Object.values(sequenceData.features || {});

  return {
    name: sequenceData.name || "Untitled sequence",
    sequenceLength,
    circular: sequenceData.circular !== false,
    features: features.map((feature, index) =>
      normalizeFeature(feature, index, Math.max(sequenceLength, 1))
    )
  };
}

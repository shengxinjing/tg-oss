import mapRangeToCircularAngles from "./mapRangeToCircularAngles";

// Auxiliary circular lanes beyond the core feature/part/primer/cutsite/ORF set:
// warnings, lineage annotations, and assembly pieces. Each kind gets its own
// radius + color so they read as separate outer rings (matches SVG OVE).
const LANE_CONFIG = {
  warning: { color: "#e3a73f", radius: 3.18 },
  lineage: { color: "#9d7cf2", radius: 3.32 },
  assembly: { color: "#46c6d8", radius: 3.46 }
};

const SOURCE_KEYS = {
  warning: ["warnings"],
  lineage: ["lineageAnnotations", "lineage"],
  assembly: ["assemblyPieces", "assembly"]
};

function collect(sequenceData, keys) {
  for (const key of keys) {
    const value = sequenceData[key];
    if (Array.isArray(value)) return value;
    if (value && typeof value === "object") return Object.values(value);
  }
  return [];
}

export default function buildCircularAuxLanes({
  sequenceData = {},
  sequenceLength = 0
} = {}) {
  if (sequenceLength <= 0) return [];

  const lanes = [];
  Object.entries(SOURCE_KEYS).forEach(([kind, keys]) => {
    collect(sequenceData, keys)
      .filter(
        item =>
          item &&
          Number.isFinite(Number(item.start)) &&
          Number.isFinite(Number(item.end))
      )
      .forEach((item, index) => {
        lanes.push({
          id: item.id || `${kind}-${index}`,
          kind,
          color: item.color || LANE_CONFIG[kind].color,
          radius: LANE_CONFIG[kind].radius,
          name: item.name || item.message || kind,
          segments: mapRangeToCircularAngles(
            { start: Number(item.start), end: Number(item.end) },
            { sequenceLength }
          )
        });
      });
  });
  return lanes;
}

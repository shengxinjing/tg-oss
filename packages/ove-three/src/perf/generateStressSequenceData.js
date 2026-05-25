const dnaAlphabet = "atgc";
const featureTypes = [
  "CDS",
  "promoter",
  "operator",
  "origin",
  "tag",
  "misc_feature"
];
const featureColors = [
  "#45d34f",
  "#8b5cf6",
  "#3b82f6",
  "#60a5fa",
  "#f5d13d",
  "#f97316"
];

function makeSequence(length) {
  return dnaAlphabet
    .repeat(Math.ceil(length / dnaAlphabet.length))
    .slice(0, length);
}

function makeRange(index, sequenceLength, width, stride, offset = 0) {
  const start = (offset + index * stride) % sequenceLength;
  const end = Math.min(sequenceLength - 1, start + width - 1);
  return { start, end };
}

function makeFeatures(count, sequenceLength) {
  return Array.from({ length: count }, (_, index) => {
    const type = featureTypes[index % featureTypes.length];
    const range = makeRange(
      index,
      sequenceLength,
      96 + (index % 5) * 24,
      149,
      31
    );
    return {
      id: `feature-${index + 1}`,
      name: `${type} ${index + 1}`,
      type,
      color: featureColors[index % featureColors.length],
      ...range
    };
  });
}

function makePrimers(count, sequenceLength) {
  return Array.from({ length: count }, (_, index) => ({
    id: `primer-${index + 1}`,
    name: `Primer ${index + 1}`,
    type: "primer",
    color: "#22d3ee",
    ...makeRange(index, sequenceLength, 22, 73, 17)
  }));
}

function makeCutsites(count, sequenceLength) {
  return Array.from({ length: count }, (_, index) => ({
    id: `cutsite-${index + 1}`,
    name: `Cutsite ${index + 1}`,
    enzyme: ["EcoRI", "BamHI", "XhoI", "HindIII"][index % 4],
    recognitionSite: ["gaattc", "ggatcc", "ctcgag", "aagctt"][index % 4],
    ...makeRange(index, sequenceLength, 6, 37, 11)
  }));
}

export default function generateStressSequenceData({
  name = "stress-sequence",
  sequenceLength = 10000,
  featureCount = 50,
  primerCount = 100,
  cutsiteCount = 200,
  circular = true
} = {}) {
  return {
    name,
    circular,
    sequence: makeSequence(sequenceLength),
    features: makeFeatures(featureCount, sequenceLength),
    primers: makePrimers(primerCount, sequenceLength),
    cutsites: makeCutsites(cutsiteCount, sequenceLength)
  };
}

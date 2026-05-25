function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function getSequenceLength(range, sequenceLength) {
  return toNumber(sequenceLength ?? range.sequenceLength ?? range.length);
}

function splitOneRange(range, sequenceLength) {
  const start = toNumber(range.start);
  const end = toNumber(range.end);

  if (sequenceLength <= 0) return [];
  if (start <= end) return [{ start, end }];

  return [
    { start, end: sequenceLength - 1 },
    { start: 0, end }
  ];
}

export default function splitCircularRange(
  range = {},
  { sequenceLength } = {}
) {
  const length = getSequenceLength(range, sequenceLength);
  if (length <= 0) return [];

  const locations = Array.isArray(range.locations) ? range.locations : [range];
  return locations.flatMap(location => splitOneRange(location, length));
}

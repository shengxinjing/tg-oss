import splitCircularRange from "./splitCircularRange";

const fullCircle = Math.PI * 2;

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function getSequenceLength(range, sequenceLength) {
  return toNumber(sequenceLength ?? range.sequenceLength ?? range.length);
}

export function mapPositionToCircularAngle(position, sequenceLength) {
  const length = toNumber(sequenceLength);
  if (length <= 0) return 0;
  return (toNumber(position) / length) * fullCircle;
}

export default function mapRangeToCircularAngles(
  range = {},
  { sequenceLength } = {}
) {
  const length = getSequenceLength(range, sequenceLength);
  if (length <= 0) return [];

  return splitCircularRange(range, { sequenceLength: length }).map(segment => {
    const startAngle = mapPositionToCircularAngle(segment.start, length);
    const endAngle = mapPositionToCircularAngle(segment.end + 1, length);
    const totalAngle = endAngle - startAngle;

    return {
      ...segment,
      startAngle,
      endAngle,
      totalAngle
    };
  });
}

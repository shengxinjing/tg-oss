const fullCircle = Math.PI * 2;

function clampPosition(position, sequenceLength) {
  const length = Number(sequenceLength) || 0;
  if (length <= 0) return 0;
  const numericPosition = Math.max(0, Number(position) || 0);
  return Math.min(length - 1, Math.floor(numericPosition));
}

function snapPosition(position, mode) {
  if (mode !== "protein") return position;
  return Math.floor(position / 3) * 3;
}

function pointAt(angle, radius, y = 0.34) {
  return [
    Math.cos(angle - Math.PI / 2) * radius,
    y,
    Math.sin(angle - Math.PI / 2) * radius
  ];
}

export default function buildCircularCaret({
  position = 0,
  sequenceLength = 0,
  mode = "dna",
  innerRadius = 2.18,
  outerRadius = 2.88
} = {}) {
  const length = Number(sequenceLength) || 0;
  if (length <= 0) return null;

  const snappedPosition = snapPosition(clampPosition(position, length), mode);
  const angle = (snappedPosition / length) * fullCircle;

  return {
    position: snappedPosition,
    angle,
    lineStart: pointAt(angle, innerRadius),
    lineEnd: pointAt(angle, outerRadius),
    handlePosition: pointAt(angle, outerRadius + 0.08, 0.36)
  };
}

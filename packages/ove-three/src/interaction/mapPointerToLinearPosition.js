function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function snapPosition(position, mode) {
  if (mode !== "protein") return position;
  return Math.floor(position / 3) * 3;
}

export default function mapPointerToLinearPosition(
  pointer = {},
  { left = 0, baseWidth = 1, sequenceLength = 0, mode = "dna" } = {}
) {
  const length = toNumber(sequenceLength);
  const width = toNumber(baseWidth);
  if (length <= 0 || width <= 0) return null;

  const relativeX = toNumber(pointer.x) - toNumber(left);
  const rawPosition = Math.floor(relativeX / width);
  const clampedPosition = clamp(rawPosition, 0, length - 1);
  const position = snapPosition(clampedPosition, mode);

  return {
    position,
    relativeX
  };
}

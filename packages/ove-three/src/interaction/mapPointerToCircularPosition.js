const fullCircle = Math.PI * 2;

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function normalizeAngle(angle) {
  return ((angle % fullCircle) + fullCircle) % fullCircle;
}

function snapPosition(position, mode) {
  if (mode !== "protein") return position;
  return Math.floor(position / 3) * 3;
}

export default function mapPointerToCircularPosition(
  pointer = {},
  {
    centerX = 0,
    centerY = 0,
    radius = 0,
    rotationRadians = 0,
    sequenceLength = 0,
    mode = "dna"
  } = {}
) {
  const length = toNumber(sequenceLength);
  const hitRadius = toNumber(radius);
  if (length <= 0 || hitRadius <= 0) return null;

  const dx = toNumber(pointer.x) - toNumber(centerX);
  const dy = toNumber(pointer.y) - toNumber(centerY);
  const distance = Math.hypot(dx, dy);
  if (distance > hitRadius) return null;

  const screenAngle = Math.atan2(dx, -dy);
  const angle = normalizeAngle(screenAngle - toNumber(rotationRadians));
  const rawPosition = Math.floor((angle / fullCircle) * length);
  const position = snapPosition(Math.min(length - 1, rawPosition), mode);

  return {
    position,
    angle,
    distance
  };
}

import { mapPositionToCircularAngle } from "./mapRangeToCircularAngles";

function chooseMajorStep(sequenceLength) {
  if (sequenceLength <= 1000) return 100;
  if (sequenceLength <= 3000) return 500;
  if (sequenceLength <= 12000) return 1000;
  return 5000;
}

function normalizeRotation(rotation) {
  if (rotation > Math.PI) return rotation - Math.PI * 2;
  if (rotation < -Math.PI) return rotation + Math.PI * 2;
  return rotation;
}

function buildTicks(sequenceLength, step, labelTicks = false) {
  const ticks = [];
  for (let position = 0; position < sequenceLength; position += step) {
    const angle = mapPositionToCircularAngle(position, sequenceLength);
    ticks.push({
      position,
      label: labelTicks && position === 0 ? "1" : String(position),
      angle,
      rotation: normalizeRotation(angle)
    });
  }
  return ticks;
}

export default function buildCircularAxisTicks({
  sequenceLength = 0,
  majorStep,
  minorStep
} = {}) {
  if (sequenceLength <= 0) {
    return {
      major: [],
      minor: [],
      labels: []
    };
  }

  const major = majorStep || chooseMajorStep(sequenceLength);
  const minor = minorStep || Math.max(1, Math.floor(major / 5));

  const majorTicks = buildTicks(sequenceLength, major, true);
  const minorTicks = buildTicks(sequenceLength, minor).filter(
    tick => tick.position % major !== 0
  );

  return {
    major: majorTicks.map(({ position, label, angle }) => ({
      position,
      label,
      angle
    })),
    minor: minorTicks.map(({ position, angle }) => ({ position, angle })),
    labels: majorTicks.map(({ position, label, angle, rotation }) => ({
      position,
      label,
      angle,
      rotation
    }))
  };
}

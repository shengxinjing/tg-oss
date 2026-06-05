export default function getNextCircularRotation({ rotation, deltaY }) {
  const currentRotation = Number(rotation) || 0;
  const wheelDelta = Number(deltaY) || 0;
  const nextRotation = currentRotation + wheelDelta / 12;

  return ((nextRotation % 360) + 360) % 360;
}

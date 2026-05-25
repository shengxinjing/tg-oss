import * as THREE from "three";

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function getAngleLength(startAngle, endAngle, totalAngle) {
  if (Number.isFinite(totalAngle)) return Math.max(0, totalAngle);
  const rawLength = endAngle - startAngle;
  return rawLength >= 0 ? rawLength : Math.PI * 2 + rawLength;
}

function pointOnCircle(angle, radius) {
  return [
    Math.cos(angle - Math.PI / 2) * radius,
    0,
    Math.sin(angle - Math.PI / 2) * radius
  ];
}

export default function createArcRibbonGeometry({
  startAngle = 0,
  endAngle = 0,
  totalAngle,
  radius = 2.4,
  width = 0.22,
  segmentCount = 32,
  minVisibleAngle = 0.025
} = {}) {
  const start = toNumber(startAngle);
  const requestedLength = getAngleLength(start, toNumber(endAngle), totalAngle);
  const visibleLength = Math.max(requestedLength, minVisibleAngle);
  const visibleStart =
    requestedLength < minVisibleAngle
      ? start + requestedLength / 2 - visibleLength / 2
      : start;
  const segments = Math.max(1, Math.floor(segmentCount));
  const innerRadius = Math.max(0, toNumber(radius) - toNumber(width) / 2);
  const outerRadius = toNumber(radius) + toNumber(width) / 2;
  const positions = [];
  const indices = [];

  for (let index = 0; index <= segments; index += 1) {
    const angle = visibleStart + (visibleLength * index) / segments;
    positions.push(...pointOnCircle(angle, outerRadius));
    positions.push(...pointOnCircle(angle, innerRadius));
  }

  for (let index = 0; index < segments; index += 1) {
    const outerStart = index * 2;
    const innerStart = outerStart + 1;
    const outerEnd = outerStart + 2;
    const innerEnd = outerStart + 3;

    indices.push(outerStart, innerStart, outerEnd);
    indices.push(innerStart, innerEnd, outerEnd);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  return geometry;
}

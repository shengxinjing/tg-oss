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

function addRibbonSegment(positions, indices, angle, innerRadius, outerRadius) {
  positions.push(...pointOnCircle(angle, outerRadius));
  positions.push(...pointOnCircle(angle, innerRadius));

  if (positions.length <= 6) return;

  const currentOuter = positions.length / 3 - 2;
  const currentInner = currentOuter + 1;
  const previousOuter = currentOuter - 2;
  const previousInner = currentOuter - 1;

  indices.push(previousOuter, previousInner, currentOuter);
  indices.push(previousInner, currentInner, currentOuter);
}

function addArrowHead(
  positions,
  indices,
  { baseAngle, tipAngle, innerRadius, outerRadius, radius }
) {
  const baseOuter = positions.length / 3;
  positions.push(...pointOnCircle(baseAngle, outerRadius));
  const baseInner = positions.length / 3;
  positions.push(...pointOnCircle(baseAngle, innerRadius));
  const tip = positions.length / 3;
  positions.push(...pointOnCircle(tipAngle, radius));
  indices.push(baseOuter, baseInner, tip);
}

export default function createArrowArcGeometry({
  startAngle = 0,
  endAngle = 0,
  totalAngle,
  radius = 2.4,
  width = 0.18,
  segmentCount = 24,
  minVisibleAngle = 0.035,
  headAngle = 0.12,
  direction = "forward"
} = {}) {
  const start = toNumber(startAngle);
  const requestedLength = getAngleLength(start, toNumber(endAngle), totalAngle);
  const visibleLength = Math.max(requestedLength, minVisibleAngle);
  const visibleStart =
    requestedLength < minVisibleAngle
      ? start + requestedLength / 2 - visibleLength / 2
      : start;
  const visibleEnd = visibleStart + visibleLength;
  const arrowLength = Math.min(toNumber(headAngle, 0.12), visibleLength * 0.6);
  const resolvedDirection = direction === "reverse" ? "reverse" : "forward";
  const innerRadius = Math.max(0, toNumber(radius) - toNumber(width) / 2);
  const outerRadius = toNumber(radius) + toNumber(width) / 2;
  const bodyStart =
    resolvedDirection === "reverse" ? visibleStart + arrowLength : visibleStart;
  const bodyEnd =
    resolvedDirection === "reverse" ? visibleEnd : visibleEnd - arrowLength;
  const bodyLength = Math.max(0, bodyEnd - bodyStart);
  const segments = Math.max(
    1,
    Math.ceil((segmentCount * bodyLength) / visibleLength)
  );
  const positions = [];
  const indices = [];

  for (let index = 0; index <= segments; index += 1) {
    const angle = bodyStart + (bodyLength * index) / segments;
    addRibbonSegment(positions, indices, angle, innerRadius, outerRadius);
  }

  if (resolvedDirection === "reverse") {
    addArrowHead(positions, indices, {
      baseAngle: bodyStart,
      tipAngle: visibleStart,
      innerRadius,
      outerRadius,
      radius
    });
  } else {
    addArrowHead(positions, indices, {
      baseAngle: bodyEnd,
      tipAngle: visibleEnd,
      innerRadius,
      outerRadius,
      radius
    });
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
  geometry.userData = {
    direction: resolvedDirection,
    visibleStart,
    visibleEnd,
    visibleLength,
    arrowTipAngle: resolvedDirection === "reverse" ? visibleStart : visibleEnd
  };

  return geometry;
}

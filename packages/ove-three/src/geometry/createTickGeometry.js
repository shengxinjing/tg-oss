import * as THREE from "three";

function pointOnCircle(angle, radius) {
  return [
    Math.cos(angle - Math.PI / 2) * radius,
    0,
    Math.sin(angle - Math.PI / 2) * radius
  ];
}

export default function createTickGeometry({
  angle = 0,
  radius = 2.4,
  length = 0.28,
  width = 0.06
} = {}) {
  const angularHalfWidth = radius > 0 ? width / radius / 2 : 0;
  const innerRadius = radius;
  const outerRadius = radius + length;
  const positions = [
    ...pointOnCircle(angle - angularHalfWidth, innerRadius),
    ...pointOnCircle(angle + angularHalfWidth, innerRadius),
    ...pointOnCircle(angle + angularHalfWidth, outerRadius),
    ...pointOnCircle(angle - angularHalfWidth, outerRadius)
  ];

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setIndex([0, 1, 2, 0, 2, 3]);
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  return geometry;
}

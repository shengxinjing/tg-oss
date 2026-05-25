import React from "react";

export default function CircularBackboneLayer({
  radius = 2.4,
  tubeRadius = 0.035
}) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} userData={{ kind: "backbone" }}>
      <torusGeometry args={[radius, tubeRadius, 16, 192]} />
      <meshStandardMaterial
        color="#5fb3ff"
        emissive="#0b3c66"
        roughness={0.35}
      />
    </mesh>
  );
}

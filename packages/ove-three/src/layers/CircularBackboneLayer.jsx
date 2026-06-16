import React from "react";
import circularMapStyle from "../theme/circularMapStyle";

export default function CircularBackboneLayer({
  radius = 2.4,
  tubeRadius = 0.035
}) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} userData={{ kind: "backbone" }}>
      <torusGeometry args={[radius, tubeRadius, 16, 192]} />
      <meshStandardMaterial
        color={circularMapStyle.backbone}
        emissive={circularMapStyle.backboneEmissive}
        roughness={0.35}
      />
    </mesh>
  );
}

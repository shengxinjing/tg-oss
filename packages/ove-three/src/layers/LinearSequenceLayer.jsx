import React, { useMemo } from "react";
import { Text } from "@react-three/drei";

const baseColors = {
  A: "#ef4444",
  T: "#3b82f6",
  G: "#22c55e",
  C: "#f59e0b",
  U: "#8b5cf6"
};

function getSequencePreview(sequence) {
  if (sequence.length <= 260) return sequence;
  return `${sequence.slice(0, 220)} ... ${sequence.slice(-28)}`;
}

export default function LinearSequenceLayer({ sceneModel }) {
  const modelWidth = sceneModel.sequenceLength * sceneModel.baseWidth;
  const preview = useMemo(
    () => getSequencePreview(sceneModel.sequence.toUpperCase()),
    [sceneModel.sequence]
  );
  const swatches = useMemo(
    () =>
      sceneModel.sequence
        .slice(0, Math.min(sceneModel.sequence.length, 160))
        .toUpperCase()
        .split("")
        .map((base, index) => ({
          base,
          x: index * sceneModel.baseWidth - modelWidth / 2
        })),
    [modelWidth, sceneModel.baseWidth, sceneModel.sequence]
  );

  return (
    <group userData={{ kind: "linear-sequence" }}>
      <mesh position={[0, 0, -0.03]}>
        <planeGeometry args={[modelWidth, 0.08]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.78} />
      </mesh>
      {swatches.map(({ base, x }, index) => (
        <mesh
          key={`${base}-${index}`}
          position={[x + sceneModel.baseWidth / 2, -0.14, 0]}
        >
          <planeGeometry args={[sceneModel.baseWidth * 0.82, 0.08]} />
          <meshBasicMaterial color={baseColors[base] || "#94a3b8"} />
        </mesh>
      ))}
      <Text
        position={[-modelWidth / 2, -0.34, 0.02]}
        color="#dbeafe"
        fontSize={0.13}
        anchorX="left"
        anchorY="middle"
        maxWidth={modelWidth}
        whiteSpace="nowrap"
      >
        {preview}
      </Text>
    </group>
  );
}

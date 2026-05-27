import React from "react";
import SafeText from "./SafeText";

const baseColors = {
  A: "#ef4444",
  T: "#3b82f6",
  G: "#22c55e",
  C: "#f59e0b",
  U: "#8b5cf6"
};

function getRowY(row, sceneModel) {
  const top = ((sceneModel.visibleRows.length - 1) * sceneModel.rowHeight) / 2;
  return top - row.relativeIndex * sceneModel.rowHeight;
}

function BaseSwatches({ row, sceneModel, y }) {
  return row.sequence
    .toUpperCase()
    .split("")
    .map((base, index) => (
      <mesh
        key={`${row.rowIndex}-${index}-${base}`}
        position={[
          index * sceneModel.baseWidth + sceneModel.baseWidth / 2,
          y - 0.02,
          -0.02
        ]}
      >
        <planeGeometry args={[sceneModel.baseWidth * 0.82, 0.2]} />
        <meshBasicMaterial
          color={baseColors[base] || "#475569"}
          transparent
          opacity={0.62}
        />
      </mesh>
    ));
}

export default function RowSequenceLayer({ sceneModel }) {
  return (
    <group userData={{ kind: "row-sequence" }}>
      {sceneModel.visibleRows.map(row => {
        const y = getRowY(row, sceneModel);

        return (
          <group key={row.rowIndex}>
            <BaseSwatches row={row} sceneModel={sceneModel} y={y} />
            <SafeText
              position={[0, y + 0.04, 0.03]}
              color="#f8fafc"
              fontSize={0.14}
              anchorX="left"
              anchorY="middle"
              whiteSpace="nowrap"
            >
              {row.sequence.toUpperCase()}
            </SafeText>
            <SafeText
              position={[0, y - 0.2, 0.03]}
              color="#93a4ba"
              fontSize={0.12}
              anchorX="left"
              anchorY="middle"
              whiteSpace="nowrap"
            >
              {row.complementSequence.toUpperCase()}
            </SafeText>
          </group>
        );
      })}
    </group>
  );
}

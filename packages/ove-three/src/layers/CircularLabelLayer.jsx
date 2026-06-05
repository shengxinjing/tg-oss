import React, { useMemo } from "react";
import * as THREE from "three";
import { Billboard, Line, Text } from "@react-three/drei";
import buildCircularLabels from "../labels/buildCircularLabels";

function LabelBox({ label }) {
  const width = label.width / 120;
  const height = label.height / 120;
  return (
    <mesh position={label.position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        color="#f59e0b"
        transparent
        opacity={0.18}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

function CircularLabel({ label, showLabelBoxes, lineOpacity }) {
  return (
    <group>
      <Line
        points={[label.leaderStart, label.leaderEnd]}
        color={label.color}
        lineWidth={1}
        transparent
        opacity={lineOpacity}
      />
      {showLabelBoxes && <LabelBox label={label} />}
      <Billboard position={label.position}>
        <Text
          color={label.selected || label.hovered ? "#ffffff" : label.color}
          fontSize={label.fontSizeWorld || 0.115}
          anchorX="center"
          anchorY="middle"
          outlineColor="#07111f"
          outlineWidth={0.012}
        >
          {label.text}
        </Text>
      </Billboard>
    </group>
  );
}

export default function CircularLabelLayer({
  sceneModel,
  selectedAnnotationId,
  hoveredAnnotationId,
  showLabelBoxes = false,
  labelScale = 1,
  lineOpacity = 0.8,
  showInternalLabels = false,
  onlyShowOverflowLabels = false,
  maxVisibleLabels = 72
}) {
  const labels = useMemo(
    () =>
      buildCircularLabels({
        sceneModel,
        labelRadius: showInternalLabels ? 2.16 : 3.45,
        leaderRadius: showInternalLabels ? 2.56 : 2.92,
        labelScale,
        lineOpacity,
        maxVisibleLabels,
        onlyShowOverflowLabels,
        selectedAnnotationId,
        hoveredAnnotationId
      }).visible,
    [
      hoveredAnnotationId,
      labelScale,
      lineOpacity,
      maxVisibleLabels,
      onlyShowOverflowLabels,
      sceneModel,
      selectedAnnotationId,
      showInternalLabels
    ]
  );

  return (
    <group userData={{ kind: "labels" }}>
      {labels.map(label => (
        <CircularLabel
          key={label.id}
          label={label}
          showLabelBoxes={showLabelBoxes}
          lineOpacity={lineOpacity}
        />
      ))}
    </group>
  );
}

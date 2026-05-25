import React, { useMemo } from "react";
import * as THREE from "three";
import createSelectionGeometry from "../geometry/createSelectionGeometry";
import buildCircularCaret from "../model/buildCircularCaret";
import mapRangeToCircularAngles from "../model/mapRangeToCircularAngles";

function SelectionSegment({ segment }) {
  const geometry = useMemo(
    () =>
      createSelectionGeometry({
        startAngle: segment.startAngle,
        endAngle: segment.endAngle,
        totalAngle: segment.totalAngle
      }),
    [segment.endAngle, segment.startAngle, segment.totalAngle]
  );

  return (
    <mesh
      geometry={geometry}
      position={[0, 0.075, 0]}
      userData={{ kind: "selection" }}
    >
      <meshBasicMaterial
        color="#facc15"
        transparent
        opacity={0.34}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

function SelectionHandle({ position, sequenceLength }) {
  const caret = useMemo(
    () =>
      buildCircularCaret({
        position,
        sequenceLength,
        innerRadius: 2.98,
        outerRadius: 2.98
      }),
    [position, sequenceLength]
  );

  if (!caret) return null;

  return (
    <mesh
      position={caret.handlePosition}
      userData={{ kind: "selection-handle" }}
    >
      <sphereGeometry args={[0.065, 18, 18]} />
      <meshBasicMaterial color="#facc15" />
    </mesh>
  );
}

export default function SelectionLayer({ selectionRange, sequenceLength }) {
  const segments = useMemo(() => {
    if (!selectionRange) return [];
    return mapRangeToCircularAngles(selectionRange, { sequenceLength });
  }, [selectionRange, sequenceLength]);

  if (!selectionRange || !segments.length) return null;

  return (
    <group userData={{ kind: "selection-layer" }}>
      {segments.map((segment, index) => (
        <SelectionSegment
          key={`${segment.start}-${segment.end}-${index}`}
          segment={segment}
        />
      ))}
      <SelectionHandle
        position={selectionRange.start}
        sequenceLength={sequenceLength}
      />
      <SelectionHandle
        position={selectionRange.end}
        sequenceLength={sequenceLength}
      />
    </group>
  );
}

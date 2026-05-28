import React, { useMemo } from "react";
import { Line } from "@react-three/drei";
import buildCircularCaret from "../model/buildCircularCaret";

function LinearCaretLayer({ position = 0, sceneModel }) {
  if (!sceneModel) return null;
  const modelWidth = sceneModel.sequenceLength * sceneModel.baseWidth;
  const x = position * sceneModel.baseWidth - modelWidth / 2;

  return (
    <group userData={{ kind: "caret", position, variant: "linear" }}>
      <Line
        points={[
          [x, -0.54, 0.08],
          [x, 1.48, 0.08]
        ]}
        color="#f8fafc"
        lineWidth={2}
      />
      <mesh position={[x, 1.54, 0.09]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshBasicMaterial color="#f8fafc" />
      </mesh>
    </group>
  );
}

function getRowY(row, sceneModel) {
  const top = ((sceneModel.visibleRows.length - 1) * sceneModel.rowHeight) / 2;
  return top - row.relativeIndex * sceneModel.rowHeight;
}

function RowCaretLayer({ position = -1, sceneModel }) {
  if (!sceneModel || position < 0) return null;
  const row = sceneModel.visibleRows.find(
    visibleRow =>
      visibleRow.start <= position &&
      (visibleRow.end >= position ||
        (visibleRow.end === sceneModel.sequenceLength - 1 &&
          position === sceneModel.sequenceLength))
  );
  if (!row) return null;

  const localPosition = Math.min(position - row.start, row.length);
  const x = localPosition * sceneModel.baseWidth;
  const y = getRowY(row, sceneModel);

  return (
    <group userData={{ kind: "caret", position, variant: "row" }}>
      <Line
        points={[
          [x, y - 0.32, 0.09],
          [x, y + 0.25, 0.09]
        ]}
        color="#111827"
        lineWidth={2}
      />
      <mesh position={[x, y + 0.31, 0.1]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshBasicMaterial color="#111827" />
      </mesh>
    </group>
  );
}

function CircularCaretLayer({
  position = 0,
  sequenceLength = 0,
  mode = "dna"
}) {
  const caret = useMemo(
    () => buildCircularCaret({ position, sequenceLength, mode }),
    [mode, position, sequenceLength]
  );

  if (!caret) return null;

  return (
    <group userData={{ kind: "caret", position: caret.position }}>
      <Line
        points={[caret.lineStart, caret.lineEnd]}
        color="#f8fafc"
        lineWidth={3}
      />
      <mesh position={caret.handlePosition}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshBasicMaterial color="#f8fafc" />
      </mesh>
    </group>
  );
}

export default function CaretLayer({
  position = 0,
  sequenceLength = 0,
  mode = "dna",
  variant = "circular",
  sceneModel
}) {
  if (variant === "row") {
    return <RowCaretLayer position={position} sceneModel={sceneModel} />;
  }

  if (variant === "linear") {
    return <LinearCaretLayer position={position} sceneModel={sceneModel} />;
  }

  return (
    <CircularCaretLayer
      position={position}
      sequenceLength={sequenceLength}
      mode={mode}
    />
  );
}

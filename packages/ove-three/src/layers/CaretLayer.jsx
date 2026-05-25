import React, { useMemo } from "react";
import { Line } from "@react-three/drei";
import buildCircularCaret from "../model/buildCircularCaret";

export default function CaretLayer({
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

import React from "react";
import { linearMapStyle } from "./LinearAnnotationLayer";

export default function LinearSequenceLayer({ sceneModel }) {
  const modelWidth = sceneModel.sequenceLength * sceneModel.baseWidth;

  return (
    <group userData={{ kind: "linear-sequence" }}>
      <mesh position={[0, 0, -0.04]}>
        <planeGeometry args={[modelWidth, 0.52]} />
        <meshBasicMaterial color={linearMapStyle.strokeColor} />
      </mesh>
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[modelWidth, 0.42]} />
        <meshBasicMaterial color="#0075e8" />
      </mesh>
    </group>
  );
}

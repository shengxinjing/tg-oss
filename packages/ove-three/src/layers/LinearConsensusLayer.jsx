import React from "react";
import { linearMapStyle } from "./LinearAnnotationLayer";

const BASE_Y = -2.0; // sits below the linear map
const MAX_HEIGHT = 0.7;

// Conservation bar plot for the linear (protein/alignment) view. `consensus`
// comes from buildConsensus; bar height ∝ conservation. Renders nothing without
// data, so it's inert for plain single-sequence DNA fixtures.
export default function LinearConsensusLayer({
  consensus = [],
  baseWidth = 0.02,
  sequenceLength = 0
}) {
  if (!consensus.length || sequenceLength <= 0) return null;

  const modelWidth = sequenceLength * baseWidth;
  const barWidth = Math.max(baseWidth * 0.8, 0.004);

  return (
    <group userData={{ kind: "linear-consensus" }}>
      {consensus.map(item => {
        const height = Math.max(0.02, item.conservation * MAX_HEIGHT);
        const x = item.position * baseWidth - modelWidth / 2;
        return (
          <mesh key={item.position} position={[x, BASE_Y + height / 2, -0.03]}>
            <planeGeometry args={[barWidth, height]} />
            <meshBasicMaterial
              color={linearMapStyle.backboneColor}
              transparent
              opacity={0.6}
            />
          </mesh>
        );
      })}
    </group>
  );
}

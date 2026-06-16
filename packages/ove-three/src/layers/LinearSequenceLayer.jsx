import React from "react";
import { linearMapStyle } from "./LinearAnnotationLayer";

// Backbone bar for the linear map. Dense auto-hide: when zoomed out (lodFlags
// .showBackboneBar) it's a full bar; once zoomed in enough to reveal bases it
// collapses to a thin guide line (making room for base detail).
export default function LinearSequenceLayer({ sceneModel, lodFlags = {} }) {
  const modelWidth = sceneModel.sequenceLength * sceneModel.baseWidth;
  const showBar = lodFlags.showBackboneBar !== false;
  const outerHeight = showBar ? 0.52 : 0.14;
  const innerHeight = showBar ? 0.42 : 0.08;

  return (
    <group userData={{ kind: "linear-sequence" }}>
      <mesh position={[0, 0, -0.04]}>
        <planeGeometry args={[modelWidth, outerHeight]} />
        <meshBasicMaterial color={linearMapStyle.strokeColor} />
      </mesh>
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[modelWidth, innerHeight]} />
        <meshBasicMaterial color={linearMapStyle.backboneColor} />
      </mesh>
    </group>
  );
}

import React from "react";
import { Billboard } from "@react-three/drei";
import SafeText from "./SafeText";
import circularMapStyle from "../theme/circularMapStyle";
import { LOD_LEVELS } from "../lod/lodThresholds";

// Position a base on the ring (bp 0 at top, clockwise). Lives inside the
// rotated+scaled circular group, so it follows rotation/zoom automatically.
function basePoint(bp, sequenceLength, radius, y) {
  const angle = (bp / sequenceLength) * Math.PI * 2;
  return [radius * Math.sin(angle), y, -radius * Math.cos(angle)];
}

// Renders forward (and, when zoomed further, complement) base letters along the
// backbone arc. Only the visible bp window is passed in (virtualized). Font size
// is derived from per-base arc spacing so letters fit at any zoom (the group's
// own scale makes them readable).
export default function CircularSequenceLayer({
  visibleBases = [],
  sequenceLength = 0,
  lodLevel = 0,
  forwardRadius = 2.52,
  complementRadius = 2.3
}) {
  if (
    lodLevel < LOD_LEVELS.BASES ||
    sequenceLength <= 0 ||
    !visibleBases.length
  ) {
    return null;
  }

  const showComplement = lodLevel >= LOD_LEVELS.BASES_COMPLEMENT;
  // local font ≈ per-base arc spacing (scales with the group, so readable at any zoom)
  const fontSize = (2 * Math.PI * forwardRadius * 0.95) / sequenceLength;

  return (
    <group userData={{ kind: "sequence-bases" }}>
      {visibleBases.map(base => {
        const position = basePoint(
          base.bp,
          sequenceLength,
          forwardRadius,
          0.07
        );
        return (
          <Billboard key={`f-${base.bp}`} position={position}>
            <SafeText
              fontSize={fontSize}
              color={base.color}
              anchorX="center"
              anchorY="middle"
              outlineColor={circularMapStyle.textOutline}
              outlineWidth={fontSize * 0.12}
            >
              {base.char}
            </SafeText>
          </Billboard>
        );
      })}
      {showComplement &&
        visibleBases.map(base => {
          const position = basePoint(
            base.bp,
            sequenceLength,
            complementRadius,
            0.07
          );
          return (
            <Billboard key={`c-${base.bp}`} position={position}>
              <SafeText
                fontSize={fontSize * 0.9}
                color={circularMapStyle.axisRing}
                anchorX="center"
                anchorY="middle"
                outlineColor={circularMapStyle.textOutline}
                outlineWidth={fontSize * 0.1}
              >
                {base.complement}
              </SafeText>
            </Billboard>
          );
        })}
    </group>
  );
}

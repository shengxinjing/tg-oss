import React from "react";
import SafeText from "./SafeText";
import rowMapStyle from "./rowMapStyle";

function getRowY(row, sceneModel) {
  const top = ((sceneModel.visibleRows.length - 1) * sceneModel.rowHeight) / 2;
  return top - row.relativeIndex * sceneModel.rowHeight;
}

export default function RowSequenceLayer({ sceneModel }) {
  return (
    <group userData={{ kind: "row-sequence" }}>
      {sceneModel.visibleRows.map(row => {
        const y = getRowY(row, sceneModel);

        return (
          <group key={row.rowIndex}>
            <mesh
              position={[
                (row.length * sceneModel.baseWidth) / 2,
                y - 0.08,
                -0.03
              ]}
            >
              <planeGeometry args={[row.length * sceneModel.baseWidth, 0.44]} />
              <meshBasicMaterial
                color={rowMapStyle.baseGuideColor}
                transparent
                opacity={rowMapStyle.baseGuideOpacity}
              />
            </mesh>
            <SafeText
              position={[0, y + 0.04, 0.03]}
              color={rowMapStyle.forwardTextColor}
              fontSize={0.1}
              anchorX="left"
              anchorY="middle"
              whiteSpace="nowrap"
            >
              {row.sequence.toUpperCase()}
            </SafeText>
            <SafeText
              position={[0, y - 0.2, 0.03]}
              color={rowMapStyle.complementTextColor}
              fontSize={0.08}
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

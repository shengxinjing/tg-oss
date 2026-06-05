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
        const rowWidth = row.length * sceneModel.baseWidth;

        return (
          <group key={row.rowIndex}>
            <mesh position={[rowWidth / 2, y - 0.08, -0.03]}>
              <planeGeometry args={[rowWidth, 0.44]} />
              <meshBasicMaterial
                color={rowMapStyle.baseGuideColor}
                transparent
                opacity={rowMapStyle.baseGuideOpacity}
              />
            </mesh>
            {row.baseColors.map(base => (
              <mesh
                key={`${row.rowIndex}-${base.index}`}
                position={[
                  base.index * sceneModel.baseWidth + sceneModel.baseWidth / 2,
                  y + 0.04,
                  -0.005
                ]}
              >
                <planeGeometry
                  args={[Math.max(sceneModel.baseWidth * 0.72, 0.035), 0.15]}
                />
                <meshBasicMaterial
                  color={base.color}
                  transparent
                  opacity={0.48}
                />
              </mesh>
            ))}
            {row.strandHints && (
              <>
                <SafeText
                  position={[-0.08, y + 0.04, 0.03]}
                  color={rowMapStyle.complementTextColor}
                  fontSize={rowMapStyle.strandHintFontSize}
                  anchorX="right"
                  anchorY="middle"
                >
                  {row.strandHints.forwardStart}
                </SafeText>
                <SafeText
                  position={[rowWidth + 0.08, y + 0.04, 0.03]}
                  color={rowMapStyle.complementTextColor}
                  fontSize={rowMapStyle.strandHintFontSize}
                  anchorX="left"
                  anchorY="middle"
                >
                  {row.strandHints.forwardEnd}
                </SafeText>
                <SafeText
                  position={[-0.08, y - 0.2, 0.03]}
                  color={rowMapStyle.complementTextColor}
                  fontSize={rowMapStyle.complementStrandHintFontSize}
                  anchorX="right"
                  anchorY="middle"
                >
                  {row.strandHints.complementStart}
                </SafeText>
                <SafeText
                  position={[rowWidth + 0.08, y - 0.2, 0.03]}
                  color={rowMapStyle.complementTextColor}
                  fontSize={rowMapStyle.complementStrandHintFontSize}
                  anchorX="left"
                  anchorY="middle"
                >
                  {row.strandHints.complementEnd}
                </SafeText>
              </>
            )}
            <SafeText
              position={[0, y + 0.04, 0.03]}
              color={rowMapStyle.forwardTextColor}
              fontSize={rowMapStyle.forwardSequenceFontSize}
              anchorX="left"
              anchorY="middle"
              whiteSpace="nowrap"
            >
              {row.sequence}
            </SafeText>
            <SafeText
              position={[0, y - 0.2, 0.03]}
              color={rowMapStyle.complementTextColor}
              fontSize={rowMapStyle.complementSequenceFontSize}
              anchorX="left"
              anchorY="middle"
              whiteSpace="nowrap"
            >
              {row.complementSequence}
            </SafeText>
          </group>
        );
      })}
    </group>
  );
}

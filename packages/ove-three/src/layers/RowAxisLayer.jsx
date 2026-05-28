import React from "react";
import { Line } from "@react-three/drei";
import SafeText from "./SafeText";
import rowMapStyle from "./rowMapStyle";

function getRowY(row, sceneModel) {
  const top = ((sceneModel.visibleRows.length - 1) * sceneModel.rowHeight) / 2;
  return top - row.relativeIndex * sceneModel.rowHeight;
}

export default function RowAxisLayer({ sceneModel }) {
  const rowWidth = sceneModel.basesPerRow * sceneModel.baseWidth;

  return (
    <group userData={{ kind: "row-axis" }}>
      {sceneModel.visibleRows.map(row => {
        const y = getRowY(row, sceneModel);

        return (
          <group key={row.rowIndex}>
            <Line
              points={[
                [0, y, -0.04],
                [row.length * sceneModel.baseWidth, y, -0.04]
              ]}
              color={rowMapStyle.rowGuideColor}
              lineWidth={1}
            />
            <SafeText
              position={[-0.34, y + 0.16, 0.02]}
              color={rowMapStyle.rowLabelColor}
              fontSize={0.08}
              anchorX="right"
              anchorY="middle"
            >
              {row.start + 1}
            </SafeText>
            {row.axisTicks.map(tick => {
              const x = (tick.position - row.start) * sceneModel.baseWidth;
              return (
                <group key={tick.position} position={[x, y + 0.24, 0.01]}>
                  <mesh>
                    <planeGeometry args={[0.01, 0.12]} />
                    <meshBasicMaterial color={rowMapStyle.tickColor} />
                  </mesh>
                  <SafeText
                    position={[0, 0.13, 0.01]}
                    color={rowMapStyle.tickLabelColor}
                    fontSize={0.065}
                    anchorX="center"
                    anchorY="middle"
                  >
                    {tick.label}
                  </SafeText>
                </group>
              );
            })}
          </group>
        );
      })}
      <Line
        points={[
          [0, -3.9, -0.05],
          [rowWidth, -3.9, -0.05]
        ]}
        color={rowMapStyle.rowGuideColor}
        lineWidth={1}
      />
    </group>
  );
}

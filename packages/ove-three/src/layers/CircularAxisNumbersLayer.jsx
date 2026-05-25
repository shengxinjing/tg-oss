import React, { useMemo } from "react";
import { Billboard, Text } from "@react-three/drei";
import buildCircularAxisTicks from "../model/buildCircularAxisTicks";

export default function CircularAxisNumbersLayer({
  sequenceLength,
  radius = 2.92
}) {
  const ticks = useMemo(
    () => buildCircularAxisTicks({ sequenceLength }),
    [sequenceLength]
  );

  return (
    <group userData={{ kind: "axis-numbers" }}>
      {ticks.labels.map(tick => {
        const x = Math.cos(tick.angle - Math.PI / 2) * radius;
        const z = Math.sin(tick.angle - Math.PI / 2) * radius;

        return (
          <Billboard key={tick.position} position={[x, 0.08, z]}>
            <Text
              color="#c8d7ea"
              fontSize={0.13}
              anchorX="center"
              anchorY="middle"
              outlineColor="#07111f"
              outlineWidth={0.012}
            >
              {tick.label}
            </Text>
          </Billboard>
        );
      })}
    </group>
  );
}

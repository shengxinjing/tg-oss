import React, { useMemo } from "react";
import buildCircularAxisTicks from "../model/buildCircularAxisTicks";

function Tick({ angle, radius, length, width, color }) {
  const tickRadius = radius + length / 2;
  const x = Math.cos(angle - Math.PI / 2) * tickRadius;
  const z = Math.sin(angle - Math.PI / 2) * tickRadius;

  return (
    <mesh position={[x, 0.05, z]} rotation={[0, -angle, 0]}>
      <boxGeometry args={[width, 0.035, length]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

export default function CircularAxisLayer({ sequenceLength, radius = 2.55 }) {
  const ticks = useMemo(
    () => buildCircularAxisTicks({ sequenceLength }),
    [sequenceLength]
  );

  return (
    <group userData={{ kind: "axis" }}>
      {ticks.minor.map(tick => (
        <Tick
          key={`minor-${tick.position}`}
          angle={tick.angle}
          radius={radius}
          length={0.08}
          width={0.012}
          color="#69809d"
        />
      ))}
      {ticks.major.map(tick => (
        <Tick
          key={`major-${tick.position}`}
          angle={tick.angle}
          radius={radius}
          length={0.16}
          width={0.018}
          color="#dbeafe"
        />
      ))}
    </group>
  );
}

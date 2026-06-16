import React, { useMemo } from "react";
import * as THREE from "three";
import createArcRibbonGeometry from "../geometry/createArcRibbonGeometry";

function LaneSegment({ lane, segment }) {
  const geometry = useMemo(
    () =>
      createArcRibbonGeometry({
        startAngle: segment.startAngle,
        totalAngle: segment.totalAngle,
        radius: lane.radius,
        width: lane.kind === "warning" ? 0.08 : 0.16
      }),
    [segment.startAngle, segment.totalAngle, lane.radius, lane.kind]
  );

  return (
    <mesh
      geometry={geometry}
      position={[0, 0.05, 0]}
      userData={{ kind: "aux-lane", laneKind: lane.kind }}
    >
      <meshBasicMaterial
        color={lane.color}
        transparent
        opacity={0.7}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

// Renders warning / lineage / assembly lanes as outer arc rings. `auxLanes`
// comes from buildCircularAuxLanes; empty renders nothing.
export default function CircularAuxLayer({ auxLanes = [] }) {
  if (!auxLanes.length) return null;

  return (
    <group userData={{ kind: "aux-lanes" }}>
      {auxLanes.flatMap(lane =>
        lane.segments.map((segment, index) => (
          <LaneSegment
            key={`${lane.id}-${index}`}
            lane={lane}
            segment={segment}
          />
        ))
      )}
    </group>
  );
}

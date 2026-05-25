import React, { useMemo } from "react";
import * as THREE from "three";
import { Billboard, Text } from "@react-three/drei";
import createTickGeometry from "../geometry/createTickGeometry";
import createUserData from "../interaction/createUserData";

function getCutsites(sceneModel = {}) {
  return (sceneModel.annotations || []).filter(
    annotation => annotation.annotationType === "cutsite"
  );
}

function getSegmentAngle(segment) {
  return segment.startAngle + segment.totalAngle / 2;
}

function getLabel(annotation) {
  return annotation.enzyme || annotation.name || annotation.id;
}

function CutsiteTick({
  annotation,
  segment,
  radius,
  onSelectRange,
  onDoubleClickRange,
  onContextMenuRange,
  onHoverRange,
  onHoverEnd
}) {
  const angle = getSegmentAngle(segment);
  const geometry = useMemo(
    () =>
      createTickGeometry({
        angle,
        radius,
        length: 0.34,
        width: 0.055
      }),
    [angle, radius]
  );
  const labelRadius = radius + 0.48;
  const x = Math.cos(angle - Math.PI / 2) * labelRadius;
  const z = Math.sin(angle - Math.PI / 2) * labelRadius;
  const color = annotation.color || "#fb923c";
  const userData = createUserData({
    kind: "cutsite",
    annotation,
    segment,
    extra: { name: getLabel(annotation) }
  });

  return (
    <group>
      <mesh
        geometry={geometry}
        position={[0, 0.13, 0]}
        name={getLabel(annotation)}
        userData={userData}
        onPointerOver={event => {
          event.stopPropagation();
          onHoverRange?.(annotation, event.object.userData, event);
        }}
        onPointerOut={onHoverEnd}
        onClick={event => {
          event.stopPropagation();
          onSelectRange?.(annotation, event.object.userData, event);
        }}
        onDoubleClick={event => {
          event.stopPropagation();
          onDoubleClickRange?.(annotation, event.object.userData, event);
        }}
        onContextMenu={event => {
          event.stopPropagation();
          event.nativeEvent?.preventDefault?.();
          onContextMenuRange?.(annotation, event.object.userData, event);
        }}
      >
        <meshBasicMaterial color={color} side={THREE.DoubleSide} />
      </mesh>
      <Billboard position={[x, 0.16, z]}>
        <Text
          color="#fed7aa"
          fontSize={0.11}
          anchorX="center"
          anchorY="middle"
          outlineColor="#07111f"
          outlineWidth={0.01}
        >
          {getLabel(annotation)}
        </Text>
      </Billboard>
    </group>
  );
}

export default function CircularCutsiteLayer({
  sceneModel,
  radius = 2.98,
  onSelectRange,
  onDoubleClickRange,
  onContextMenuRange,
  onHoverRange,
  onHoverEnd
}) {
  const cutsites = getCutsites(sceneModel);

  return (
    <group userData={{ kind: "cutsites" }}>
      {cutsites.flatMap(annotation =>
        annotation.segments.map((segment, segmentIndex) => (
          <CutsiteTick
            key={`${annotation.id}-${segment.start}-${segment.end}-${segmentIndex}`}
            annotation={annotation}
            segment={segment}
            radius={radius}
            onSelectRange={onSelectRange}
            onDoubleClickRange={onDoubleClickRange}
            onContextMenuRange={onContextMenuRange}
            onHoverRange={onHoverRange}
            onHoverEnd={onHoverEnd}
          />
        ))
      )}
    </group>
  );
}

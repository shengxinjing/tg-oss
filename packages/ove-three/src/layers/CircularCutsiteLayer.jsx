import React, { useMemo } from "react";
import * as THREE from "three";
import { Billboard, Text } from "@react-three/drei";
import createTickGeometry from "../geometry/createTickGeometry";
import createUserData from "../interaction/createUserData";
import isContextPointerButton from "../interaction/isContextPointerButton";
import shouldHandlePick from "../interaction/shouldHandlePick";

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

export function getCutsiteLabelStyle({ cutsiteCount = 0, index = 0 } = {}) {
  if (cutsiteCount > 160) {
    return { fontSize: 0.052, showLabel: index % 4 === 0 };
  }
  if (cutsiteCount > 90) {
    return { fontSize: 0.07, showLabel: index % 2 === 0 };
  }
  return { fontSize: 0.11, showLabel: true };
}

function CutsiteTick({
  annotation,
  segment,
  index,
  cutsiteCount,
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
  const labelStyle = getCutsiteLabelStyle({ cutsiteCount, index });
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
          if (!shouldHandlePick(event, event.object.userData)) return;
          event.stopPropagation();
          onHoverRange?.(annotation, event.object.userData, event);
        }}
        onPointerOut={onHoverEnd}
        onClick={event => {
          if (!shouldHandlePick(event, event.object.userData)) return;
          event.stopPropagation();
          onSelectRange?.(annotation, event.object.userData, event);
        }}
        onDoubleClick={event => {
          if (!shouldHandlePick(event, event.object.userData)) return;
          event.stopPropagation();
          onDoubleClickRange?.(annotation, event.object.userData, event);
        }}
        onPointerUp={event => {
          if (!isContextPointerButton(event)) return;
          if (!shouldHandlePick(event, event.object.userData)) return;
          event.stopPropagation();
          event.nativeEvent?.preventDefault?.();
          onContextMenuRange?.(annotation, event.object.userData, event);
        }}
        onContextMenu={event => {
          if (!shouldHandlePick(event, event.object.userData)) return;
          event.stopPropagation();
          event.nativeEvent?.preventDefault?.();
          onContextMenuRange?.(annotation, event.object.userData, event);
        }}
      >
        <meshBasicMaterial color={color} side={THREE.DoubleSide} />
      </mesh>
      {labelStyle.showLabel && (
        <Billboard position={[x, 0.16, z]}>
          <Text
            color="#fed7aa"
            fontSize={labelStyle.fontSize}
            anchorX="center"
            anchorY="middle"
            outlineColor="#07111f"
            outlineWidth={Math.min(0.01, labelStyle.fontSize * 0.09)}
          >
            {getLabel(annotation)}
          </Text>
        </Billboard>
      )}
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
      {cutsites.flatMap((annotation, annotationIndex) =>
        annotation.segments.map((segment, segmentIndex) => (
          <CutsiteTick
            key={`${annotation.id}-${segment.start}-${segment.end}-${segmentIndex}`}
            annotation={annotation}
            segment={segment}
            index={annotationIndex}
            cutsiteCount={cutsites.length}
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

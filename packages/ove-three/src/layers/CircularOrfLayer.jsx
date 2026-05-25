import React, { useMemo, useState } from "react";
import * as THREE from "three";
import createArrowArcGeometry from "../geometry/createArrowArcGeometry";
import createUserData from "../interaction/createUserData";

const frameColors = [
  "#38bdf8",
  "#a78bfa",
  "#f472b6",
  "#34d399",
  "#facc15",
  "#fb7185"
];

function getOrfs(sceneModel = {}) {
  return (sceneModel.annotations || []).filter(
    annotation => annotation.annotationType === "orf"
  );
}

function getDirection(annotation) {
  if (annotation.forward === false || annotation.strand === -1)
    return "reverse";
  return annotation.direction === "reverse" ? "reverse" : "forward";
}

function getFrame(annotation) {
  const rawFrame = Number(annotation.frame);
  if (Number.isFinite(rawFrame) && rawFrame >= 1 && rawFrame <= 6) {
    return rawFrame;
  }
  const baseFrame = Math.abs(Number(annotation.start) || 0) % 3;
  return getDirection(annotation) === "reverse" ? baseFrame + 4 : baseFrame + 1;
}

function OrfArc({
  annotation,
  segment,
  radius,
  onSelectRange,
  onDoubleClickRange,
  onContextMenuRange,
  onHoverRange,
  onHoverEnd,
  selectedAnnotationId
}) {
  const [hovered, setHovered] = useState(false);
  const direction = getDirection(annotation);
  const frame = getFrame(annotation);
  const color = frameColors[(frame - 1) % frameColors.length];
  const geometry = useMemo(
    () =>
      createArrowArcGeometry({
        startAngle: segment.startAngle,
        endAngle: segment.endAngle,
        totalAngle: segment.totalAngle,
        radius,
        width: 0.11,
        minVisibleAngle: 0.05,
        direction
      }),
    [
      direction,
      radius,
      segment.endAngle,
      segment.startAngle,
      segment.totalAngle
    ]
  );
  const selected =
    selectedAnnotationId && selectedAnnotationId === annotation.id;
  const userData = createUserData({
    kind: "orf",
    annotation,
    segment,
    extra: { frame, direction }
  });

  return (
    <mesh
      geometry={geometry}
      position={[0, hovered || selected ? 0.2 : 0.17, 0]}
      name={annotation.name || annotation.id}
      userData={userData}
      onPointerOver={event => {
        event.stopPropagation();
        setHovered(true);
        onHoverRange?.(annotation, event.object.userData, event);
      }}
      onPointerOut={() => {
        setHovered(false);
        onHoverEnd?.();
      }}
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
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={hovered || selected ? 0.55 : 0.18}
        roughness={0.5}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export default function CircularOrfLayer({
  sceneModel,
  radius = 1.92,
  onSelectRange,
  onDoubleClickRange,
  onContextMenuRange,
  onHoverRange,
  onHoverEnd,
  selectedAnnotationId
}) {
  const orfs = getOrfs(sceneModel);

  return (
    <group userData={{ kind: "orfs" }}>
      {orfs.flatMap((annotation, annotationIndex) =>
        annotation.segments.map((segment, segmentIndex) => (
          <OrfArc
            key={`${annotation.id}-${segment.start}-${segment.end}-${segmentIndex}`}
            annotation={annotation}
            segment={segment}
            radius={radius - (annotationIndex % 6) * 0.08}
            onSelectRange={onSelectRange}
            onDoubleClickRange={onDoubleClickRange}
            onContextMenuRange={onContextMenuRange}
            onHoverRange={onHoverRange}
            onHoverEnd={onHoverEnd}
            selectedAnnotationId={selectedAnnotationId}
          />
        ))
      )}
    </group>
  );
}

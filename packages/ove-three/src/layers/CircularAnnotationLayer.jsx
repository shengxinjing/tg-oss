import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useHelper } from "@react-three/drei";
import createArrowArcGeometry from "../geometry/createArrowArcGeometry";
import createArcRibbonGeometry from "../geometry/createArcRibbonGeometry";
import createUserData from "../interaction/createUserData";

const fallbackColors = {
  promoter: "#8b5cf6",
  operator: "#3b82f6",
  CDS: "#45d34f",
  tag: "#f5d13d",
  origin: "#60a5fa",
  part: "#a855f7",
  primer: "#22d3ee",
  misc_feature: "#f97316"
};

function getColor(annotation) {
  return (
    annotation.color ||
    fallbackColors[annotation.type] ||
    fallbackColors.misc_feature
  );
}

function getRenderableAnnotations(sceneModel = {}) {
  return (sceneModel.annotations || []).filter(
    annotation =>
      annotation.annotationType === "feature" ||
      annotation.annotationType === "part" ||
      annotation.annotationType === "primer"
  );
}

function getDirection(annotation) {
  if (annotation.forward === false || annotation.strand === -1)
    return "reverse";
  return annotation.direction === "reverse" ? "reverse" : "forward";
}

function AnnotationRibbon({
  annotation,
  segment,
  radius,
  trackIndex,
  onSelectRange,
  onDoubleClickRange,
  onContextMenuRange,
  onHoverRange,
  onHoverEnd,
  selectedAnnotationId,
  hoveredAnnotationId,
  showBoxHelpers
}) {
  const meshRef = useRef(null);
  const color = getColor(annotation);
  const isPrimer = annotation.annotationType === "primer";
  const direction = isPrimer ? getDirection(annotation) : undefined;
  const ribbonWidth = annotation.annotationType === "part" ? 0.16 : 0.24;
  const selected = selectedAnnotationId === annotation.id;
  const hovered = hoveredAnnotationId === annotation.id;
  const userData = createUserData({
    kind: "annotation",
    annotation,
    segment,
    extra: { direction }
  });
  const geometry = useMemo(
    () =>
      isPrimer
        ? createArrowArcGeometry({
            startAngle: segment.startAngle,
            endAngle: segment.endAngle,
            totalAngle: segment.totalAngle,
            radius,
            width: 0.14,
            minVisibleAngle: 0.04,
            direction
          })
        : createArcRibbonGeometry({
            startAngle: segment.startAngle,
            endAngle: segment.endAngle,
            totalAngle: segment.totalAngle,
            radius,
            width: ribbonWidth,
            minVisibleAngle: 0.025
          }),
    [
      direction,
      isPrimer,
      radius,
      ribbonWidth,
      segment.endAngle,
      segment.startAngle,
      segment.totalAngle
    ]
  );

  useHelper(showBoxHelpers ? meshRef : null, THREE.BoxHelper, "#f59e0b");

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={[0, 0.09 + trackIndex * 0.035, 0]}
      name={annotation.name || annotation.id}
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
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={selected || hovered ? 0.55 : 0.22}
        roughness={0.42}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export default function CircularAnnotationLayer({
  sceneModel,
  radius = 2.4,
  onSelectRange,
  onDoubleClickRange,
  onContextMenuRange,
  onHoverRange,
  onHoverEnd,
  selectedAnnotationId,
  hoveredAnnotationId,
  showBoxHelpers = false
}) {
  const annotations = getRenderableAnnotations(sceneModel);

  return (
    <group userData={{ kind: "annotations" }}>
      {annotations.flatMap((annotation, annotationIndex) =>
        annotation.segments.map((segment, segmentIndex) => (
          <AnnotationRibbon
            key={`${annotation.id}-${segment.start}-${segment.end}-${segmentIndex}`}
            annotation={annotation}
            segment={segment}
            radius={
              radius +
              (annotation.annotationType === "part" ? 0.22 : 0) +
              (annotation.annotationType === "primer" ? 0.42 : 0)
            }
            trackIndex={annotationIndex % 4}
            onSelectRange={onSelectRange}
            onDoubleClickRange={onDoubleClickRange}
            onContextMenuRange={onContextMenuRange}
            onHoverRange={onHoverRange}
            onHoverEnd={onHoverEnd}
            selectedAnnotationId={selectedAnnotationId}
            hoveredAnnotationId={hoveredAnnotationId}
            showBoxHelpers={showBoxHelpers}
          />
        ))
      )}
    </group>
  );
}

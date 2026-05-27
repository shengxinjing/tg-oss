import React from "react";
import { Text } from "@react-three/drei";
import createUserData from "../interaction/createUserData";

const fallbackColors = {
  promoter: "#8b5cf6",
  operator: "#3b82f6",
  CDS: "#45d34f",
  tag: "#f5d13d",
  origin: "#60a5fa",
  primer: "#22d3ee",
  orf: "#38bdf8",
  misc_feature: "#f97316"
};

function getColor(annotation) {
  return (
    annotation.color ||
    fallbackColors[annotation.type] ||
    fallbackColors[annotation.annotationType] ||
    fallbackColors.misc_feature
  );
}

function getY(annotationType, index) {
  const yByType = {
    feature: 0.52,
    part: 0.78,
    primer: 1.04,
    orf: -0.62
  };
  return (yByType[annotationType] || 0.52) + (index % 3) * 0.18;
}

function getHeight(annotationType) {
  return annotationType === "primer" || annotationType === "orf" ? 0.12 : 0.16;
}

function getLabel(annotation) {
  return annotation.name || annotation.id;
}

function LinearAnnotation({
  annotation,
  segment,
  modelWidth,
  index,
  onSelectRange,
  onDoubleClickRange,
  onContextMenuRange,
  onHoverRange,
  onHoverEnd,
  selectedAnnotationId,
  hoveredAnnotationId
}) {
  const x = segment.startX + segment.width / 2 - modelWidth / 2;
  const y = getY(annotation.annotationType, index);
  const color = getColor(annotation);
  const selected = selectedAnnotationId === annotation.id;
  const hovered = hoveredAnnotationId === annotation.id;
  const userData = createUserData({
    kind: annotation.annotationType,
    annotation,
    segment,
    extra: {
      direction: annotation.direction,
      frame: annotation.frame
    }
  });

  return (
    <group position={[x, y, 0.02]}>
      <mesh
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
        <planeGeometry
          args={[
            Math.max(segment.width, 0.08),
            getHeight(annotation.annotationType)
          ]}
        />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={selected || hovered ? 0.98 : 0.82}
        />
      </mesh>
      <Text
        position={[-segment.width / 2 + 0.04, 0, 0.03]}
        color="#f8fafc"
        fontSize={0.105}
        anchorX="left"
        anchorY="middle"
        maxWidth={Math.max(segment.width - 0.08, 0.1)}
        whiteSpace="nowrap"
      >
        {getLabel(annotation)}
      </Text>
    </group>
  );
}

export default function LinearAnnotationLayer({
  sceneModel,
  onSelectRange,
  onDoubleClickRange,
  onContextMenuRange,
  onHoverRange,
  onHoverEnd,
  selectedAnnotationId,
  hoveredAnnotationId
}) {
  const modelWidth = sceneModel.sequenceLength * sceneModel.baseWidth;
  const annotations = (sceneModel.annotations || []).filter(annotation =>
    ["feature", "part", "primer", "orf"].includes(annotation.annotationType)
  );

  return (
    <group userData={{ kind: "linear-annotations" }}>
      {annotations.flatMap((annotation, annotationIndex) =>
        annotation.segments.map((segment, segmentIndex) => (
          <LinearAnnotation
            key={`${annotation.id}-${segment.start}-${segment.end}-${segmentIndex}`}
            annotation={annotation}
            segment={segment}
            modelWidth={modelWidth}
            index={annotationIndex}
            onSelectRange={onSelectRange}
            onDoubleClickRange={onDoubleClickRange}
            onContextMenuRange={onContextMenuRange}
            onHoverRange={onHoverRange}
            onHoverEnd={onHoverEnd}
            selectedAnnotationId={selectedAnnotationId}
            hoveredAnnotationId={hoveredAnnotationId}
          />
        ))
      )}
    </group>
  );
}

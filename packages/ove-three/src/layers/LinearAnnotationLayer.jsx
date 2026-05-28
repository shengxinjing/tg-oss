import React from "react";
import { Text } from "@react-three/drei";
import createUserData from "../interaction/createUserData";
import isContextPointerButton from "../interaction/isContextPointerButton";
import shouldHandlePick from "../interaction/shouldHandlePick";

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

export const linearMapStyle = {
  backgroundColor: "#0b1422",
  strokeColor: "#dbeafe",
  textColor: "#e5eefb",
  inverseTextColor: "#0b1422"
};

function getColor(annotation) {
  return (
    annotation.color ||
    fallbackColors[annotation.type] ||
    fallbackColors[annotation.annotationType] ||
    fallbackColors.misc_feature
  );
}

export function getLinearAnnotationLayout(annotationType, index) {
  const layoutByType = {
    feature: { y: 0.95, height: 0.46, fontSize: 0.28 },
    part: { y: 1.72, height: 0.3, fontSize: 0.23 },
    primer: { y: 2.45, height: 0.28, fontSize: 0.22 },
    orf: { y: -1.18, height: 0.24, fontSize: 0.18 }
  };
  const layout = layoutByType[annotationType] || layoutByType.feature;
  return {
    ...layout,
    y: layout.y + (index % 3) * 0.48
  };
}

function getLabel(annotation) {
  return annotation.name || annotation.id;
}

function getAnnotationTextColor(annotation) {
  return ["operator", "origin", "CDS", "tag"].includes(annotation.type)
    ? linearMapStyle.inverseTextColor
    : linearMapStyle.textColor;
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
  const layout = getLinearAnnotationLayout(annotation.annotationType, index);
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
    <group position={[x, layout.y, 0.02]}>
      <mesh position={[0, 0, -0.012]}>
        <planeGeometry
          args={[Math.max(segment.width, 0.12) + 0.08, layout.height + 0.08]}
        />
        <meshBasicMaterial color={linearMapStyle.strokeColor} />
      </mesh>
      <mesh
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
        <planeGeometry args={[Math.max(segment.width, 0.12), layout.height]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={selected || hovered ? 1 : 0.96}
        />
      </mesh>
      <Text
        position={[-segment.width / 2 + 0.04, 0, 0.03]}
        color={getAnnotationTextColor(annotation)}
        fontSize={layout.fontSize}
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

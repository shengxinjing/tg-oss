import React from "react";
import { Text } from "@react-three/drei";
import createUserData from "../interaction/createUserData";
import isContextPointerButton from "../interaction/isContextPointerButton";
import isPrimaryPointerButton from "../interaction/isPrimaryPointerButton";
import shouldHandlePick from "../interaction/shouldHandlePick";
import { cssVar } from "../theme/cssVars";

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
  get backgroundColor() {
    return cssVar("--o3-bg-0", "#f8fafc");
  },
  get backboneColor() {
    return cssVar("--o3-map-backbone", "#0075e8");
  },
  get strokeColor() {
    return cssVar("--o3-text-1", "#111827");
  },
  get textColor() {
    return cssVar("--o3-text-1", "#111827");
  },
  inverseTextColor: "#ffffff",
  partColor: "#b65ce8",
  primerColor: "#c084fc",
  orfColor: "#67c7d8"
};

function getColor(annotation) {
  if (annotation.annotationType === "part") return linearMapStyle.partColor;
  if (annotation.annotationType === "primer") return linearMapStyle.primerColor;
  if (annotation.annotationType === "orf") return linearMapStyle.orfColor;

  return (
    annotation.color ||
    fallbackColors[annotation.type] ||
    fallbackColors[annotation.annotationType] ||
    fallbackColors.misc_feature
  );
}

export function getLinearAnnotationLayout(annotationType, lane = 0) {
  const layoutByType = {
    feature: { y: 1.05, height: 0.78, fontSize: 0.52 },
    part: { y: 2.05, height: 0.56, fontSize: 0.44 },
    primer: { y: 2.95, height: 0.52, fontSize: 0.42 },
    orf: { y: -1.95, height: 0.46, fontSize: 0.38 }
  };
  const layout = layoutByType[annotationType] || layoutByType.feature;
  return {
    ...layout,
    y: layout.y + lane * 0.72
  };
}

function getLabel(annotation) {
  return annotation.name || annotation.id;
}

function getAnnotationTextColor(annotation) {
  if (["part", "primer"].includes(annotation.annotationType)) {
    return linearMapStyle.partColor;
  }

  return ["operator", "origin", "CDS", "tag"].includes(annotation.type)
    ? linearMapStyle.inverseTextColor
    : linearMapStyle.textColor;
}

function LinearAnnotation({
  annotation,
  segment,
  modelWidth,
  onSelectRange,
  onDoubleClickRange,
  onContextMenuRange,
  onHoverRange,
  onHoverEnd,
  selectedAnnotationId,
  hoveredAnnotationId
}) {
  const x = segment.startX + segment.width / 2 - modelWidth / 2;
  const layout = getLinearAnnotationLayout(
    annotation.annotationType,
    annotation.lane || 0
  );
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
        onPointerDown={event => {
          if (!isPrimaryPointerButton(event)) return;
          if (!shouldHandlePick(event, event.object.userData)) return;
          event.stopPropagation();
        }}
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
          opacity={selected || hovered ? 1 : 0.92}
        />
      </mesh>
      <Text
        position={[-segment.width / 2 + 0.04, 0, 0.03]}
        color={getAnnotationTextColor(annotation)}
        fontSize={layout.fontSize}
        anchorX="left"
        anchorY="middle"
        maxWidth={Math.max(segment.width - 0.08, 0.1)}
        outlineColor={
          ["part", "primer"].includes(annotation.annotationType)
            ? linearMapStyle.backgroundColor
            : linearMapStyle.strokeColor
        }
        outlineWidth={0.01}
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

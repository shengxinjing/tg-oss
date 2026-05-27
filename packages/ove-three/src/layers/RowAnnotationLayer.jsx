import React from "react";
import createUserData from "../interaction/createUserData";
import SafeText from "./SafeText";

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
const frameColors = [
  "#38bdf8",
  "#a78bfa",
  "#f472b6",
  "#34d399",
  "#facc15",
  "#fb7185"
];

function getRowY(row, sceneModel) {
  const top = ((sceneModel.visibleRows.length - 1) * sceneModel.rowHeight) / 2;
  return top - row.relativeIndex * sceneModel.rowHeight;
}

function getColor(annotation) {
  if (annotation.annotationType === "orf") {
    return frameColors[((annotation.frame || 1) - 1) % frameColors.length];
  }
  return (
    annotation.color ||
    fallbackColors[annotation.type] ||
    fallbackColors[annotation.annotationType] ||
    fallbackColors.misc_feature
  );
}

function getEventAnnotation(annotation) {
  return {
    ...annotation,
    start: annotation.sourceStart ?? annotation.start,
    end: annotation.sourceEnd ?? annotation.end
  };
}

function RowAnnotation({
  annotation,
  row,
  sceneModel,
  onSelectRange,
  onDoubleClickRange,
  onContextMenuRange,
  onHoverRange,
  onHoverEnd,
  selectedAnnotationId,
  hoveredAnnotationId
}) {
  const eventAnnotation = getEventAnnotation(annotation);
  const color = getColor(annotation);
  const selected = selectedAnnotationId === annotation.id;
  const hovered = hoveredAnnotationId === annotation.id;
  const y = getRowY(row, sceneModel) + 0.34 + annotation.stack * 0.15;
  const userData = createUserData({
    kind: annotation.annotationType,
    annotation: eventAnnotation,
    segment: annotation,
    extra: {
      direction: annotation.direction,
      rowIndex: annotation.rowIndex,
      stack: annotation.stack
    }
  });

  return (
    <group position={[annotation.x, y, 0.06]}>
      <mesh
        name={annotation.label}
        userData={userData}
        onPointerOver={event => {
          event.stopPropagation();
          onHoverRange?.(eventAnnotation, event.object.userData, event);
        }}
        onPointerOut={onHoverEnd}
        onClick={event => {
          event.stopPropagation();
          onSelectRange?.(eventAnnotation, event.object.userData, event);
        }}
        onDoubleClick={event => {
          event.stopPropagation();
          onDoubleClickRange?.(eventAnnotation, event.object.userData, event);
        }}
        onContextMenu={event => {
          event.stopPropagation();
          event.nativeEvent?.preventDefault?.();
          onContextMenuRange?.(eventAnnotation, event.object.userData, event);
        }}
      >
        <planeGeometry args={[Math.max(annotation.width, 0.04), 0.12]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={selected || hovered ? 0.98 : 0.84}
        />
      </mesh>
      <SafeText
        position={[-annotation.width / 2 + 0.025, 0.006, 0.03]}
        color="#f8fafc"
        fontSize={0.085}
        anchorX="left"
        anchorY="middle"
        maxWidth={Math.max(annotation.width - 0.05, 0.05)}
        whiteSpace="nowrap"
      >
        {annotation.displayLabel}
      </SafeText>
      {annotation.annotationType === "orf" && (
        <mesh
          position={[
            annotation.direction === "reverse"
              ? -annotation.width / 2 + 0.04
              : annotation.width / 2 - 0.04,
            0,
            0.04
          ]}
          rotation={[0, 0, annotation.direction === "reverse" ? Math.PI : 0]}
        >
          <coneGeometry args={[0.045, 0.09, 3]} />
          <meshBasicMaterial color="#f8fafc" transparent opacity={0.92} />
        </mesh>
      )}
      {annotation.annotationType === "primer" && annotation.bases && (
        <SafeText
          position={[-annotation.width / 2 + 0.025, -0.1, 0.03]}
          color="#bae6fd"
          fontSize={0.065}
          anchorX="left"
          anchorY="middle"
          maxWidth={Math.max(annotation.width - 0.05, 0.05)}
          whiteSpace="nowrap"
        >
          {annotation.bases.toUpperCase()}
        </SafeText>
      )}
    </group>
  );
}

export default function RowAnnotationLayer({
  sceneModel,
  onSelectRange,
  onDoubleClickRange,
  onContextMenuRange,
  onHoverRange,
  onHoverEnd,
  selectedAnnotationId,
  hoveredAnnotationId
}) {
  return (
    <group userData={{ kind: "row-annotations" }}>
      {sceneModel.visibleRows.flatMap(row =>
        row.annotations.map(annotation => (
          <RowAnnotation
            key={`${annotation.id}-${annotation.rowIndex}-${annotation.start}-${annotation.end}`}
            annotation={annotation}
            row={row}
            sceneModel={sceneModel}
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

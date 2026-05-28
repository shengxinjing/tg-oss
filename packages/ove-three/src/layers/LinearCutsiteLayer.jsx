import React from "react";
import { Text } from "@react-three/drei";
import createUserData from "../interaction/createUserData";
import isContextPointerButton from "../interaction/isContextPointerButton";
import shouldHandlePick from "../interaction/shouldHandlePick";
import { linearMapStyle } from "./LinearAnnotationLayer";

function getLabel(annotation) {
  return annotation.enzyme || annotation.name || annotation.id;
}

export function getLinearCutsiteLayout(index = 0) {
  return {
    y: 3.65 + (index % 3) * 0.52,
    tickHeight: 0.72,
    tickWidth: 0.055,
    fontSize: 0.22,
    labelOffsetY: 0.47
  };
}

function Cutsite({
  annotation,
  segment,
  modelWidth,
  index,
  onSelectRange,
  onDoubleClickRange,
  onContextMenuRange,
  onHoverRange,
  onHoverEnd
}) {
  const x = segment.startX + segment.width / 2 - modelWidth / 2;
  const layout = getLinearCutsiteLayout(index);
  const userData = createUserData({
    kind: "cutsite",
    annotation,
    segment,
    extra: { name: getLabel(annotation) }
  });

  return (
    <group position={[x, layout.y, 0.04]}>
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
        <planeGeometry args={[layout.tickWidth, layout.tickHeight]} />
        <meshBasicMaterial color={linearMapStyle.strokeColor} />
      </mesh>
      <Text
        position={[0.08, layout.labelOffsetY, 0.02]}
        color={linearMapStyle.textColor}
        fontSize={layout.fontSize}
        anchorX="left"
        anchorY="middle"
        whiteSpace="nowrap"
      >
        {getLabel(annotation)}
      </Text>
    </group>
  );
}

export default function LinearCutsiteLayer({
  sceneModel,
  onSelectRange,
  onDoubleClickRange,
  onContextMenuRange,
  onHoverRange,
  onHoverEnd
}) {
  const modelWidth = sceneModel.sequenceLength * sceneModel.baseWidth;
  const cutsites = (sceneModel.annotations || []).filter(
    annotation => annotation.annotationType === "cutsite"
  );

  return (
    <group userData={{ kind: "linear-cutsites" }}>
      {cutsites.flatMap((annotation, annotationIndex) =>
        annotation.segments.map((segment, segmentIndex) => (
          <Cutsite
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
          />
        ))
      )}
    </group>
  );
}

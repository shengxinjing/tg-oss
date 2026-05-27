import React from "react";
import { Text } from "@react-three/drei";
import createUserData from "../interaction/createUserData";

function getLabel(annotation) {
  return annotation.enzyme || annotation.name || annotation.id;
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
  const y = 1.34 + (index % 3) * 0.18;
  const userData = createUserData({
    kind: "cutsite",
    annotation,
    segment,
    extra: { name: getLabel(annotation) }
  });

  return (
    <group position={[x, y, 0.04]}>
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
        <planeGeometry args={[0.035, 0.42]} />
        <meshBasicMaterial color="#fb923c" />
      </mesh>
      <Text
        position={[0.05, 0.26, 0.02]}
        color="#fed7aa"
        fontSize={0.105}
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

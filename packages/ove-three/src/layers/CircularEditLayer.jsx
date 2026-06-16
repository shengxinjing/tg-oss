import React, { useMemo } from "react";
import * as THREE from "three";
import createArcRibbonGeometry from "../geometry/createArcRibbonGeometry";
import createUserData from "../interaction/createUserData";
import isContextPointerButton from "../interaction/isContextPointerButton";
import shouldHandlePick from "../interaction/shouldHandlePick";

function EditSegment({
  edit,
  segment,
  radius,
  onSelectRange,
  onContextMenuRange
}) {
  const isDeletion = edit.type === "deletion";
  const geometry = useMemo(
    () =>
      createArcRibbonGeometry({
        startAngle: segment.startAngle,
        totalAngle: segment.totalAngle,
        radius,
        width: isDeletion ? 0.07 : 0.26
      }),
    [segment.startAngle, segment.totalAngle, radius, isDeletion]
  );
  const editAnnotation = {
    id: edit.id,
    annotationType: "edit",
    name: edit.type,
    start: segment.start,
    end: segment.end
  };
  const userData = createUserData({
    kind: "edit",
    annotation: editAnnotation,
    segment,
    extra: { editType: edit.type }
  });

  return (
    <mesh
      geometry={geometry}
      position={[0, 0.16, 0]}
      userData={userData}
      onClick={event => {
        if (!shouldHandlePick(event, event.object.userData)) return;
        event.stopPropagation();
        onSelectRange?.(editAnnotation, event.object.userData, event);
      }}
      onPointerUp={event => {
        if (!isContextPointerButton(event)) return;
        if (!shouldHandlePick(event, event.object.userData)) return;
        event.stopPropagation();
        event.nativeEvent?.preventDefault?.();
        onContextMenuRange?.(editAnnotation, event.object.userData, event);
      }}
      onContextMenu={event => {
        if (!shouldHandlePick(event, event.object.userData)) return;
        event.stopPropagation();
        event.nativeEvent?.preventDefault?.();
        onContextMenuRange?.(editAnnotation, event.object.userData, event);
      }}
    >
      <meshBasicMaterial
        color={edit.color}
        transparent
        opacity={isDeletion ? 0.85 : 0.45}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

// Renders deletion/replacement/insertion edit ranges as arc ribbons on the
// circle. Pickable (click / right-click) like annotations. `editModel` comes
// from buildCircularEditModel; empty model renders nothing.
export default function CircularEditLayer({
  editModel = [],
  radius = 2.4,
  onSelectRange,
  onContextMenuRange
}) {
  if (!editModel.length) return null;

  return (
    <group userData={{ kind: "edits" }}>
      {editModel.flatMap(edit =>
        edit.segments.map((segment, index) => (
          <EditSegment
            key={`${edit.id}-${index}`}
            edit={edit}
            segment={segment}
            radius={radius}
            onSelectRange={onSelectRange}
            onContextMenuRange={onContextMenuRange}
          />
        ))
      )}
    </group>
  );
}

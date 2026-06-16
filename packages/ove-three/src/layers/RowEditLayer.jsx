import React from "react";
import createUserData from "../interaction/createUserData";
import isContextPointerButton from "../interaction/isContextPointerButton";
import shouldHandlePick from "../interaction/shouldHandlePick";

function getRowY(row, sceneModel) {
  const top = ((sceneModel.visibleRows.length - 1) * sceneModel.rowHeight) / 2;
  return top - row.relativeIndex * sceneModel.rowHeight;
}

function RowEditSegment({
  segment,
  row,
  sceneModel,
  onSelectRange,
  onContextMenuRange
}) {
  const isDeletion = segment.type === "deletion";
  const y = getRowY(row, sceneModel);
  const height = isDeletion ? 0.04 : 0.24;
  const editAnnotation = {
    id: segment.editId,
    annotationType: "edit",
    name: segment.type,
    start: segment.start,
    end: segment.end
  };
  const userData = createUserData({
    kind: "edit",
    annotation: editAnnotation,
    segment,
    extra: { editType: segment.type, rowIndex: segment.rowIndex }
  });

  return (
    <mesh
      position={[segment.x, y, 0.05]}
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
      <planeGeometry args={[Math.max(segment.width, 0.04), height]} />
      <meshBasicMaterial
        color={segment.color}
        transparent
        opacity={isDeletion ? 0.9 : 0.4}
        depthWrite={false}
      />
    </mesh>
  );
}

// Renders deletion/replacement/insertion edit ranges in the row view, split per
// row by buildRowEditSegments. Deletions read as a thin strike-through over the
// bases; replacements/insertions as a translucent block. Pickable like the
// circular edit layer. Empty model renders nothing (inert by default).
export default function RowEditLayer({
  editModel = [],
  sceneModel,
  onSelectRange,
  onContextMenuRange
}) {
  if (!editModel.length || !sceneModel?.visibleRows?.length) return null;

  return (
    <group userData={{ kind: "row-edits" }}>
      {editModel.map((segment, index) => {
        const row = sceneModel.visibleRows.find(
          r => r.rowIndex === segment.rowIndex
        );
        if (!row) return null;
        return (
          <RowEditSegment
            key={`${segment.editId}-${segment.rowIndex}-${index}`}
            segment={segment}
            row={row}
            sceneModel={sceneModel}
            onSelectRange={onSelectRange}
            onContextMenuRange={onContextMenuRange}
          />
        );
      })}
    </group>
  );
}

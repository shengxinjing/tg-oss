import React from "react";
import createUserData from "../interaction/createUserData";
import isContextPointerButton from "../interaction/isContextPointerButton";
import shouldHandlePick from "../interaction/shouldHandlePick";
import SafeText from "./SafeText";
import rowMapStyle from "./rowMapStyle";

function getRowY(row, sceneModel) {
  const top = ((sceneModel.visibleRows.length - 1) * sceneModel.rowHeight) / 2;
  return top - row.relativeIndex * sceneModel.rowHeight;
}

function getEventAnnotation(cutsite) {
  return {
    ...cutsite,
    start: cutsite.sourceStart ?? cutsite.start,
    end: cutsite.sourceEnd ?? cutsite.end
  };
}

function RowCutsite({
  cutsite,
  row,
  sceneModel,
  onSelectRange,
  onDoubleClickRange,
  onContextMenuRange,
  onHoverRange,
  onHoverEnd
}) {
  const eventAnnotation = getEventAnnotation(cutsite);
  const x = cutsite.localStart * sceneModel.baseWidth;
  const y = getRowY(row, sceneModel) + 0.18;
  const userData = createUserData({
    kind: "cutsite",
    annotation: eventAnnotation,
    segment: cutsite,
    extra: {
      rowIndex: row.rowIndex,
      enzyme: cutsite.enzyme || cutsite.name
    }
  });

  return (
    <group position={[x, y, 0.08]}>
      <mesh
        name={cutsite.label}
        userData={userData}
        onPointerOver={event => {
          if (!shouldHandlePick(event, event.object.userData)) return;
          event.stopPropagation();
          onHoverRange?.(eventAnnotation, event.object.userData, event);
        }}
        onPointerOut={onHoverEnd}
        onClick={event => {
          if (!shouldHandlePick(event, event.object.userData)) return;
          event.stopPropagation();
          onSelectRange?.(eventAnnotation, event.object.userData, event);
        }}
        onDoubleClick={event => {
          if (!shouldHandlePick(event, event.object.userData)) return;
          event.stopPropagation();
          onDoubleClickRange?.(eventAnnotation, event.object.userData, event);
        }}
        onPointerUp={event => {
          if (!isContextPointerButton(event)) return;
          if (!shouldHandlePick(event, event.object.userData)) return;
          event.stopPropagation();
          event.nativeEvent?.preventDefault?.();
          onContextMenuRange?.(eventAnnotation, event.object.userData, event);
        }}
        onContextMenu={event => {
          if (!shouldHandlePick(event, event.object.userData)) return;
          event.stopPropagation();
          event.nativeEvent?.preventDefault?.();
          onContextMenuRange?.(eventAnnotation, event.object.userData, event);
        }}
      >
        <planeGeometry args={[0.02, 0.5]} />
        <meshBasicMaterial color={rowMapStyle.cutsiteColor} />
      </mesh>
      <SafeText
        position={[0.04, 0.28, 0.02]}
        color={rowMapStyle.cutsiteTextColor}
        fontSize={0.07}
        anchorX="left"
        anchorY="middle"
        whiteSpace="nowrap"
      >
        {cutsite.label}
      </SafeText>
    </group>
  );
}

export default function RowCutsiteLayer({
  sceneModel,
  onSelectRange,
  onDoubleClickRange,
  onContextMenuRange,
  onHoverRange,
  onHoverEnd
}) {
  return (
    <group userData={{ kind: "row-cutsites" }}>
      {sceneModel.visibleRows.flatMap(row =>
        row.cutsites.map(cutsite => (
          <RowCutsite
            key={`${cutsite.id}-${row.rowIndex}-${cutsite.start}-${cutsite.end}`}
            cutsite={cutsite}
            row={row}
            sceneModel={sceneModel}
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

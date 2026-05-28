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

function getEventAnnotation(translation) {
  return {
    ...translation,
    start: translation.sourceStart ?? translation.start,
    end: translation.sourceEnd ?? translation.end
  };
}

function RowTranslationCodon({
  translation,
  codon,
  row,
  sceneModel,
  onSelectRange,
  onDoubleClickRange,
  onContextMenuRange,
  onHoverRange,
  onHoverEnd
}) {
  const eventAnnotation = getEventAnnotation(translation);
  const y = getRowY(row, sceneModel) - 0.46;
  const userData = createUserData({
    kind: "translation",
    annotation: eventAnnotation,
    segment: codon,
    extra: {
      rowIndex: row.rowIndex,
      codonStart: codon.start,
      codonEnd: codon.end,
      triplet: codon.triplet
    }
  });

  return (
    <group position={[codon.x, y, 0.07]}>
      <mesh
        name={translation.label}
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
        <planeGeometry args={[Math.max(codon.width, 0.04), 0.16]} />
        <meshBasicMaterial color={codon.color} transparent opacity={0.58} />
      </mesh>
      <SafeText
        position={[0, 0, 0.02]}
        color={rowMapStyle.translationTextColor}
        fontSize={0.065}
        anchorX="center"
        anchorY="middle"
        whiteSpace="nowrap"
      >
        {codon.label}
      </SafeText>
    </group>
  );
}

export default function RowTranslationLayer({
  sceneModel,
  onSelectRange,
  onDoubleClickRange,
  onContextMenuRange,
  onHoverRange,
  onHoverEnd
}) {
  return (
    <group userData={{ kind: "row-translations" }}>
      {sceneModel.visibleRows.flatMap(row =>
        row.translations.flatMap(translation =>
          translation.codons.map(codon => (
            <RowTranslationCodon
              key={`${translation.id}-${row.rowIndex}-${codon.start}-${codon.end}`}
              translation={translation}
              codon={codon}
              row={row}
              sceneModel={sceneModel}
              onSelectRange={onSelectRange}
              onDoubleClickRange={onDoubleClickRange}
              onContextMenuRange={onContextMenuRange}
              onHoverRange={onHoverRange}
              onHoverEnd={onHoverEnd}
            />
          ))
        )
      )}
    </group>
  );
}

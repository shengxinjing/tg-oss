import React, { useMemo } from "react";
import * as THREE from "three";
import createSelectionGeometry from "../geometry/createSelectionGeometry";
import buildCircularCaret from "../model/buildCircularCaret";
import mapRangeToCircularAngles from "../model/mapRangeToCircularAngles";

function SelectionSegment({ segment }) {
  const geometry = useMemo(
    () =>
      createSelectionGeometry({
        startAngle: segment.startAngle,
        endAngle: segment.endAngle,
        totalAngle: segment.totalAngle
      }),
    [segment.endAngle, segment.startAngle, segment.totalAngle]
  );

  return (
    <mesh
      geometry={geometry}
      position={[0, 0.075, 0]}
      userData={{ kind: "selection" }}
    >
      <meshBasicMaterial
        color="#facc15"
        transparent
        opacity={0.34}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

function SelectionHandle({ position, sequenceLength }) {
  const caret = useMemo(
    () =>
      buildCircularCaret({
        position,
        sequenceLength,
        innerRadius: 2.98,
        outerRadius: 2.98
      }),
    [position, sequenceLength]
  );

  if (!caret) return null;

  return (
    <mesh
      position={caret.handlePosition}
      userData={{ kind: "selection-handle" }}
    >
      <sphereGeometry args={[0.065, 18, 18]} />
      <meshBasicMaterial color="#facc15" />
    </mesh>
  );
}

function LinearSelectionSegment({ segment, modelWidth }) {
  return (
    <mesh
      position={[
        segment.startX + segment.width / 2 - modelWidth / 2,
        -0.02,
        0.05
      ]}
      userData={{ kind: "selection" }}
    >
      <planeGeometry args={[Math.max(segment.width, 0.04), 0.42]} />
      <meshBasicMaterial
        color="#facc15"
        transparent
        opacity={0.32}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

function LinearSelectionHandle({ position, modelWidth, baseWidth }) {
  return (
    <mesh
      position={[position * baseWidth - modelWidth / 2, 0.24, 0.07]}
      userData={{ kind: "selection-handle" }}
    >
      <sphereGeometry args={[0.055, 16, 16]} />
      <meshBasicMaterial color="#facc15" />
    </mesh>
  );
}

function LinearSelectionLayer({ selectionRange, sceneModel }) {
  if (!selectionRange || !sceneModel) return null;
  const modelWidth = sceneModel.sequenceLength * sceneModel.baseWidth;
  const start = Math.min(selectionRange.start, selectionRange.end);
  const end = Math.max(selectionRange.start, selectionRange.end);
  const segment = {
    start,
    end,
    startX: start * sceneModel.baseWidth,
    endX: (end + 1) * sceneModel.baseWidth,
    width: Math.max(
      sceneModel.baseWidth,
      (end - start + 1) * sceneModel.baseWidth
    )
  };

  return (
    <group userData={{ kind: "selection-layer", variant: "linear" }}>
      <LinearSelectionSegment segment={segment} modelWidth={modelWidth} />
      <LinearSelectionHandle
        position={start}
        modelWidth={modelWidth}
        baseWidth={sceneModel.baseWidth}
      />
      <LinearSelectionHandle
        position={end}
        modelWidth={modelWidth}
        baseWidth={sceneModel.baseWidth}
      />
    </group>
  );
}

function getRowY(row, sceneModel) {
  const top = ((sceneModel.visibleRows.length - 1) * sceneModel.rowHeight) / 2;
  return top - row.relativeIndex * sceneModel.rowHeight;
}

function getSelectionBounds(selectionRange) {
  return {
    start: Math.min(selectionRange.start, selectionRange.end),
    end: Math.max(selectionRange.start, selectionRange.end)
  };
}

function getRowSelectionSegments(selectionRange, sceneModel) {
  if (!selectionRange || !sceneModel) return [];
  const bounds = getSelectionBounds(selectionRange);

  return sceneModel.visibleRows.flatMap(row => {
    const start = Math.max(bounds.start, row.start);
    const end = Math.min(bounds.end, row.end);
    if (start > end) return [];

    const localStart = start - row.start;
    const width = Math.max(
      sceneModel.baseWidth,
      (end - start + 1) * sceneModel.baseWidth
    );

    return [
      {
        row,
        start,
        end,
        x: localStart * sceneModel.baseWidth + width / 2,
        y: getRowY(row, sceneModel) - 0.08,
        width
      }
    ];
  });
}

function RowSelectionHandle({ position, sceneModel }) {
  const row = sceneModel.visibleRows.find(
    visibleRow => visibleRow.start <= position && visibleRow.end >= position
  );
  if (!row) return null;

  const x = (position - row.start) * sceneModel.baseWidth;
  const y = getRowY(row, sceneModel) - 0.08;

  return (
    <mesh
      position={[x, y + 0.26, 0.075]}
      userData={{ kind: "selection-handle", variant: "row", position }}
    >
      <sphereGeometry args={[0.045, 16, 16]} />
      <meshBasicMaterial color="#facc15" />
    </mesh>
  );
}

function RowSelectionLayer({ selectionRange, sceneModel }) {
  const segments = getRowSelectionSegments(selectionRange, sceneModel);
  if (!segments.length) return null;
  const bounds = getSelectionBounds(selectionRange);

  return (
    <group userData={{ kind: "selection-layer", variant: "row" }}>
      {segments.map(segment => (
        <mesh
          key={`${segment.row.rowIndex}-${segment.start}-${segment.end}`}
          position={[segment.x, segment.y, 0.04]}
          userData={{
            kind: "selection",
            variant: "row",
            start: segment.start,
            end: segment.end
          }}
        >
          <planeGeometry args={[segment.width, 0.42]} />
          <meshBasicMaterial
            color="#facc15"
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
      <RowSelectionHandle position={bounds.start} sceneModel={sceneModel} />
      <RowSelectionHandle position={bounds.end} sceneModel={sceneModel} />
    </group>
  );
}

function CircularSelectionLayer({ selectionRange, sequenceLength }) {
  const segments = useMemo(() => {
    if (!selectionRange) return [];
    return mapRangeToCircularAngles(selectionRange, { sequenceLength });
  }, [selectionRange, sequenceLength]);

  if (!selectionRange || !segments.length) return null;

  return (
    <group userData={{ kind: "selection-layer" }}>
      {segments.map((segment, index) => (
        <SelectionSegment
          key={`${segment.start}-${segment.end}-${index}`}
          segment={segment}
        />
      ))}
      <SelectionHandle
        position={selectionRange.start}
        sequenceLength={sequenceLength}
      />
      <SelectionHandle
        position={selectionRange.end}
        sequenceLength={sequenceLength}
      />
    </group>
  );
}

export default function SelectionLayer({
  selectionRange,
  sequenceLength,
  variant = "circular",
  sceneModel
}) {
  if (variant === "row") {
    return (
      <RowSelectionLayer
        selectionRange={selectionRange}
        sceneModel={sceneModel}
      />
    );
  }

  if (variant === "linear") {
    return (
      <LinearSelectionLayer
        selectionRange={selectionRange}
        sceneModel={sceneModel}
      />
    );
  }

  return (
    <CircularSelectionLayer
      selectionRange={selectionRange}
      sequenceLength={sequenceLength}
    />
  );
}

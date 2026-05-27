import React, { useCallback, useEffect, useLayoutEffect, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import RowDebugOverlay from "../debug/RowDebugOverlay";
import CaretLayer from "../layers/CaretLayer";
import RowAnnotationLayer from "../layers/RowAnnotationLayer";
import RowAxisLayer from "../layers/RowAxisLayer";
import RowCutsiteLayer from "../layers/RowCutsiteLayer";
import RowSequenceLayer from "../layers/RowSequenceLayer";
import RowTranslationLayer from "../layers/RowTranslationLayer";
import SearchLayer from "../layers/SearchLayer";
import SelectionLayer from "../layers/SelectionLayer";
import isPrimaryPointerButton from "../interaction/isPrimaryPointerButton";
import mapPointToVisibleRowPosition from "../interaction/mapPointToVisibleRowPosition";
import buildRowSceneModel from "../model/buildRowSceneModel";
import getRowCameraZoom from "./getRowCameraZoom";
import { getRowIndexForPosition } from "../model/buildRowSceneModel";

function RowPointerHitArea({
  sceneModel,
  rowGroupX,
  onCaretPositionChange,
  onPointerPositionChange,
  onSelectionStart,
  onSelectionMove,
  onSelectionEnd,
  onBackgroundContextMenu,
  isSelecting
}) {
  const rowWidth = sceneModel.basesPerRow * sceneModel.baseWidth;
  const viewHeight = Math.max(
    sceneModel.visibleRows.length * sceneModel.rowHeight,
    sceneModel.rowHeight
  );
  const mapEvent = event =>
    mapPointToVisibleRowPosition(
      {
        x: event.point.x - rowGroupX,
        y: event.point.y
      },
      { sceneModel }
    );

  return (
    <mesh
      position={[rowWidth / 2, 0, -0.08]}
      onPointerMove={event => {
        const mapped = mapEvent(event);
        if (isSelecting) {
          if (mapped) onSelectionMove?.(mapped.position);
          return;
        }
        onPointerPositionChange?.(mapped);
      }}
      onPointerDown={event => {
        if (!isPrimaryPointerButton(event)) return;
        const mapped = mapEvent(event);
        if (!mapped) return;
        event.stopPropagation();
        event.target.setPointerCapture?.(event.pointerId);
        onSelectionStart?.(mapped.position);
      }}
      onPointerUp={event => {
        if (!isPrimaryPointerButton(event)) return;
        event.stopPropagation();
        event.target.releasePointerCapture?.(event.pointerId);
        if (!isSelecting) return;
        const mapped = mapEvent(event);
        if (mapped) onSelectionEnd?.(mapped.position);
      }}
      onClick={event => {
        if (!isPrimaryPointerButton(event)) return;
        const mapped = mapEvent(event);
        if (!mapped) return;
        event.stopPropagation();
        onCaretPositionChange?.(mapped.position);
      }}
      onContextMenu={event => {
        event.stopPropagation();
        event.nativeEvent?.preventDefault?.();
        onBackgroundContextMenu?.({ originalEvent: event });
      }}
    >
      <planeGeometry args={[rowWidth, viewHeight]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

function RowCameraFrame({ sceneModel, rowGroupX }) {
  const { camera, size } = useThree();
  const rowWidth = sceneModel.basesPerRow * sceneModel.baseWidth;

  useLayoutEffect(() => {
    camera.position.set(rowGroupX + rowWidth / 2, 0, 20);
    camera.zoom = getRowCameraZoom({
      canvasWidth: size.width,
      canvasHeight: size.height,
      rowWidth,
      rowHeight: sceneModel.rowHeight
    });
    camera.updateProjectionMatrix();
  }, [
    camera,
    rowGroupX,
    rowWidth,
    sceneModel.rowHeight,
    size.height,
    size.width
  ]);

  return null;
}

function RowScene({
  sceneModel,
  onSelectRange,
  onDoubleClickRange,
  onContextMenuRange,
  onBackgroundContextMenu,
  onHoverRange,
  onHoverEnd,
  selectedAnnotationId,
  hoveredAnnotationId,
  caretPosition,
  selectionRange,
  searchRanges,
  onCaretPositionChange,
  onPointerPositionChange,
  onSelectionStart,
  onSelectionMove,
  onSelectionEnd,
  isSelecting
}) {
  const rowWidth = sceneModel.basesPerRow * sceneModel.baseWidth;
  const rowGroupX = -rowWidth / 2 + 0.45;

  return (
    <>
      <color attach="background" args={["#07111f"]} />
      <ambientLight intensity={1} />
      <RowCameraFrame sceneModel={sceneModel} rowGroupX={rowGroupX} />
      <group position={[rowGroupX, 0, 0]}>
        <RowPointerHitArea
          sceneModel={sceneModel}
          rowGroupX={rowGroupX}
          onCaretPositionChange={onCaretPositionChange}
          onPointerPositionChange={onPointerPositionChange}
          onSelectionStart={onSelectionStart}
          onSelectionMove={onSelectionMove}
          onSelectionEnd={onSelectionEnd}
          onBackgroundContextMenu={onBackgroundContextMenu}
          isSelecting={isSelecting}
        />
        <SearchLayer searchRanges={searchRanges} sceneModel={sceneModel} />
        <SelectionLayer
          variant="row"
          selectionRange={selectionRange}
          sceneModel={sceneModel}
        />
        <CaretLayer
          variant="row"
          position={caretPosition}
          sceneModel={sceneModel}
        />
        <RowAxisLayer sceneModel={sceneModel} />
        <RowSequenceLayer sceneModel={sceneModel} />
        <RowTranslationLayer
          sceneModel={sceneModel}
          onSelectRange={onSelectRange}
          onDoubleClickRange={onDoubleClickRange}
          onContextMenuRange={onContextMenuRange}
          onHoverRange={onHoverRange}
          onHoverEnd={onHoverEnd}
        />
        <RowAnnotationLayer
          sceneModel={sceneModel}
          onSelectRange={onSelectRange}
          onDoubleClickRange={onDoubleClickRange}
          onContextMenuRange={onContextMenuRange}
          onHoverRange={onHoverRange}
          onHoverEnd={onHoverEnd}
          selectedAnnotationId={selectedAnnotationId}
          hoveredAnnotationId={hoveredAnnotationId}
        />
        <RowCutsiteLayer
          sceneModel={sceneModel}
          onSelectRange={onSelectRange}
          onDoubleClickRange={onDoubleClickRange}
          onContextMenuRange={onContextMenuRange}
          onHoverRange={onHoverRange}
          onHoverEnd={onHoverEnd}
        />
      </group>
    </>
  );
}

export default function ThreeRowCanvas({
  sequenceData,
  visibleStartRow,
  onVisibleStartRowChange,
  basesPerRow = 80,
  visibleRowCount = 10,
  mode = "dna",
  annotationVisibility,
  showAminoAcidUnitAsCodon = false,
  onSelectRange,
  onDoubleClickRange,
  onContextMenuRange,
  onBackgroundContextMenu,
  onHoverRange,
  onHoverEnd,
  selectedAnnotationId,
  hoveredAnnotationId,
  caretPosition = -1,
  selectionRange,
  searchRanges,
  onCaretPositionChange,
  onPointerPositionChange,
  onSelectionStart,
  onSelectionMove,
  onSelectionEnd,
  isSelecting = false
}) {
  const rowHeightPx = 72;
  const sceneModel = useMemo(
    () =>
      buildRowSceneModel(sequenceData, {
        basesPerRow,
        visibleStartRow,
        visibleRowCount,
        rowHeightPx,
        mode,
        showAminoAcidUnitAsCodon,
        annotationVisibility
      }),
    [
      annotationVisibility,
      basesPerRow,
      mode,
      showAminoAcidUnitAsCodon,
      sequenceData,
      visibleRowCount,
      visibleStartRow
    ]
  );
  const scrollToPosition = useCallback(
    position => {
      if (position < 0) return;
      const rowIndex = getRowIndexForPosition(position, {
        basesPerRow,
        sequenceLength: sceneModel.sequenceLength
      });
      const visibleEndRow = visibleStartRow + visibleRowCount - 1;
      if (rowIndex >= visibleStartRow && rowIndex <= visibleEndRow) return;

      onVisibleStartRowChange?.(rowIndex);
    },
    [
      basesPerRow,
      onVisibleStartRowChange,
      sceneModel.sequenceLength,
      visibleRowCount,
      visibleStartRow
    ]
  );
  const handleWheel = useCallback(
    event => {
      if (!sceneModel.totalRows) return;
      event.preventDefault();
      const rowDelta =
        Math.sign(event.deltaY) *
        Math.max(1, Math.round(Math.abs(event.deltaY) / rowHeightPx));
      const maxStartRow = Math.max(0, sceneModel.totalRows - visibleRowCount);
      const nextStartRow = Math.min(
        Math.max(visibleStartRow + rowDelta, 0),
        maxStartRow
      );
      if (nextStartRow !== visibleStartRow) {
        onVisibleStartRowChange?.(nextStartRow);
      }
    },
    [
      onVisibleStartRowChange,
      sceneModel.totalRows,
      visibleRowCount,
      visibleStartRow
    ]
  );
  useEffect(() => {
    const ranges = Array.isArray(searchRanges)
      ? searchRanges
      : searchRanges
        ? [searchRanges]
        : [];
    const searchPosition = ranges.find(range => range?.start > -1)?.start;
    const selectionPosition = selectionRange?.start;
    const targetPosition =
      searchPosition ??
      selectionPosition ??
      (caretPosition > -1 ? caretPosition : -1);

    scrollToPosition(targetPosition);
  }, [caretPosition, scrollToPosition, searchRanges, selectionRange?.start]);

  return (
    <div
      className="ove-three-row-view"
      data-testid="ove-three-row-view"
      onWheel={handleWheel}
    >
      <RowDebugOverlay sceneModel={sceneModel} />
      <div className="ove-three-row-canvas-sticky">
        <Canvas
          orthographic
          camera={{ position: [0, 0, 20], zoom: 92, near: 0.1, far: 100 }}
          dpr={[1, 2]}
          gl={{ antialias: true, powerPreference: "high-performance" }}
        >
          <RowScene
            sceneModel={sceneModel}
            onSelectRange={onSelectRange}
            onDoubleClickRange={onDoubleClickRange}
            onContextMenuRange={onContextMenuRange}
            onBackgroundContextMenu={onBackgroundContextMenu}
            onHoverRange={onHoverRange}
            onHoverEnd={onHoverEnd}
            selectedAnnotationId={selectedAnnotationId}
            hoveredAnnotationId={hoveredAnnotationId}
            caretPosition={caretPosition}
            selectionRange={selectionRange}
            searchRanges={searchRanges}
            onCaretPositionChange={onCaretPositionChange}
            onPointerPositionChange={onPointerPositionChange}
            onSelectionStart={onSelectionStart}
            onSelectionMove={onSelectionMove}
            onSelectionEnd={onSelectionEnd}
            isSelecting={isSelecting}
          />
        </Canvas>
      </div>
      <div
        className="ove-three-row-scroll-spacer"
        style={{
          height: `${Math.max(sceneModel.totalHeightPx, rowHeightPx)}px`
        }}
      />
    </div>
  );
}

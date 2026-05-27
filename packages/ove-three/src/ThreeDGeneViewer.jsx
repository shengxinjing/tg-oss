import React, { useCallback, useMemo, useRef, useState } from "react";
import ThreeCircularCanvas from "./renderers/ThreeCircularCanvas";
import ThreeLinearCanvas from "./renderers/ThreeLinearCanvas";
import ThreeRowCanvas from "./renderers/ThreeRowCanvas";
import buildCircularSceneModel from "./model/buildCircularSceneModel";
import buildLinearSceneModel from "./model/buildLinearSceneModel";
import PickingDebugOverlay from "./debug/PickingDebugOverlay";
import PointerPositionDebugOverlay from "./debug/PointerPositionDebugOverlay";
import useRaycastPicking from "./interaction/useRaycastPicking";
import collectRenderStats from "./perf/collectRenderStats";
import "./style.css";

function SceneStatsReadout({ stats }) {
  return (
    <div className="ove-three-scene-stats" data-testid="ove-three-scene-stats">
      <div className="ove-three-scene-stats__fixture">{stats.fixtureName}</div>
      <dl>
        <div>
          <dt>FPS</dt>
          <dd>{stats.fps ?? "--"}</dd>
        </div>
        <div>
          <dt>Draw calls</dt>
          <dd>{stats.drawCalls}</dd>
        </div>
        <div>
          <dt>Objects</dt>
          <dd>{stats.objectCount}</dd>
        </div>
        <div>
          <dt>Triangles</dt>
          <dd>{stats.triangles}</dd>
        </div>
        <div>
          <dt>Geometries</dt>
          <dd>{stats.geometries}</dd>
        </div>
        <div>
          <dt>Textures</dt>
          <dd>{stats.textures}</dd>
        </div>
      </dl>
    </div>
  );
}

function getSequenceLength(sequenceData = {}) {
  const rawLength = sequenceData.noSequence
    ? sequenceData.size
    : sequenceData.sequence?.length || sequenceData.size;
  const sequenceLength = Math.floor(Number(rawLength));
  return Number.isFinite(sequenceLength) && sequenceLength > 0
    ? sequenceLength
    : 0;
}

export default function ThreeDGeneViewer({
  sequenceData,
  viewType = "circular",
  onSelectRange,
  onDoubleClickRange,
  onContextMenuRange,
  onBackgroundContextMenu,
  onCaretPositionChange,
  onSelectionChange,
  className = "",
  showSceneStats = false,
  showAxes = false,
  showGrid = false,
  showBoxHelpers = false,
  showLabelBoxes = false,
  showPickRay = false,
  showPointerPosition = false,
  mode = "dna",
  annotationVisibility,
  linearBaseWidth,
  showAminoAcidUnitAsCodon = false,
  searchRanges
}) {
  const isLinear = viewType === "linear";
  const isRow = viewType === "row";
  const [rowVisibleStartRow, setRowVisibleStartRow] = useState(0);
  const resolvedLinearBaseWidth =
    linearBaseWidth ??
    Math.min(0.018, 44 / Math.max(getSequenceLength(sequenceData), 1));
  const sceneModel = useMemo(() => {
    if (isRow) return null;
    if (isLinear) {
      return buildLinearSceneModel(sequenceData, {
        annotationVisibility,
        baseWidth: resolvedLinearBaseWidth
      });
    }
    return buildCircularSceneModel(sequenceData, { annotationVisibility });
  }, [
    annotationVisibility,
    isLinear,
    isRow,
    resolvedLinearBaseWidth,
    sequenceData
  ]);
  const viewerRef = useRef(null);
  const fixtureName =
    sequenceData?.name || sceneModel?.name || "Untitled sequence";
  const [renderStats, setRenderStats] = useState(() =>
    collectRenderStats(undefined, { fixtureName })
  );
  const [caretPosition, setCaretPosition] = useState(0);
  const [pointerPosition, setPointerPosition] = useState(null);
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionRange, setSelectionRange] = useState(null);
  const picking = useRaycastPicking({
    onSelectRange,
    onDoubleClickRange,
    onContextMenuRange,
    onBackgroundContextMenu
  });
  const handleCaretPositionChange = useCallback(
    position => {
      setCaretPosition(position);
      onCaretPositionChange?.(position);
    },
    [onCaretPositionChange]
  );
  const handleSelectionStart = useCallback(position => {
    setSelectionStart(position);
    setSelectionRange({ start: position, end: position });
  }, []);
  const handleSelectionMove = useCallback(
    position => {
      if (selectionStart === null) return;
      setSelectionRange({ start: selectionStart, end: position });
    },
    [selectionStart]
  );
  const handleSelectionEnd = useCallback(
    position => {
      if (selectionStart === null) return;
      const nextSelection = { start: selectionStart, end: position };
      setSelectionRange(nextSelection);
      setSelectionStart(null);
      onSelectionChange?.(nextSelection);
    },
    [onSelectionChange, selectionStart]
  );

  return (
    <div
      className={`ove-three-viewer ${className}`}
      data-testid="ove-three-canvas-container"
      ref={viewerRef}
    >
      {showSceneStats && <SceneStatsReadout stats={renderStats} />}
      <PickingDebugOverlay
        hoveredId={picking.hoveredId}
        selectedId={picking.selectedId}
        lastPick={picking.lastPick}
        lastLatencyMs={picking.lastLatencyMs}
        showPickRay={showPickRay}
      />
      <PointerPositionDebugOverlay
        caretPosition={caretPosition}
        pointerPosition={pointerPosition}
        selectionRange={selectionRange}
        showPointerPosition={showPointerPosition}
      />
      {isRow ? (
        <ThreeRowCanvas
          sequenceData={sequenceData}
          visibleStartRow={rowVisibleStartRow}
          onVisibleStartRowChange={setRowVisibleStartRow}
          mode={mode}
          annotationVisibility={annotationVisibility}
          showAminoAcidUnitAsCodon={showAminoAcidUnitAsCodon}
          onSelectRange={picking.handleClick}
          onDoubleClickRange={picking.handleDoubleClick}
          onContextMenuRange={picking.handleContextMenu}
          onBackgroundContextMenu={picking.handleBackgroundContextMenu}
          onHoverRange={picking.handleHover}
          onHoverEnd={picking.handleLeave}
          selectedAnnotationId={picking.selectedId}
          hoveredAnnotationId={picking.hoveredId}
          caretPosition={caretPosition}
          selectionRange={selectionRange}
          searchRanges={searchRanges}
          onCaretPositionChange={handleCaretPositionChange}
          onPointerPositionChange={setPointerPosition}
          onSelectionStart={handleSelectionStart}
          onSelectionMove={handleSelectionMove}
          onSelectionEnd={handleSelectionEnd}
          isSelecting={selectionStart !== null}
        />
      ) : isLinear ? (
        <ThreeLinearCanvas
          sceneModel={sceneModel}
          onSelectRange={picking.handleClick}
          onDoubleClickRange={picking.handleDoubleClick}
          onContextMenuRange={picking.handleContextMenu}
          onBackgroundContextMenu={picking.handleBackgroundContextMenu}
          onHoverRange={picking.handleHover}
          onHoverEnd={picking.handleLeave}
          showPointerPosition={showPointerPosition}
          selectedAnnotationId={picking.selectedId}
          hoveredAnnotationId={picking.hoveredId}
          caretPosition={caretPosition}
          selectionRange={selectionRange}
          mode={mode}
          onCaretPositionChange={handleCaretPositionChange}
          onPointerPositionChange={setPointerPosition}
          onSelectionStart={handleSelectionStart}
          onSelectionMove={handleSelectionMove}
          onSelectionEnd={handleSelectionEnd}
          isSelecting={selectionStart !== null}
        />
      ) : (
        <ThreeCircularCanvas
          sceneModel={sceneModel}
          onSelectRange={picking.handleClick}
          onDoubleClickRange={picking.handleDoubleClick}
          onContextMenuRange={picking.handleContextMenu}
          onBackgroundContextMenu={picking.handleBackgroundContextMenu}
          onHoverRange={picking.handleHover}
          onHoverEnd={picking.handleLeave}
          showAxes={showAxes}
          showGrid={showGrid}
          showBoxHelpers={showBoxHelpers}
          showLabelBoxes={showLabelBoxes}
          showPickRay={showPickRay}
          showPointerPosition={showPointerPosition}
          pickRay={picking.pickRay}
          showSceneStats={showSceneStats}
          selectedAnnotationId={picking.selectedId}
          hoveredAnnotationId={picking.hoveredId}
          caretPosition={caretPosition}
          selectionRange={selectionRange}
          mode={mode}
          onCaretPositionChange={handleCaretPositionChange}
          onPointerPositionChange={setPointerPosition}
          onSelectionStart={handleSelectionStart}
          onSelectionMove={handleSelectionMove}
          onSelectionEnd={handleSelectionEnd}
          isSelecting={selectionStart !== null}
          fixtureName={fixtureName}
          parentRef={viewerRef}
          onStatsChange={setRenderStats}
        />
      )}
    </div>
  );
}

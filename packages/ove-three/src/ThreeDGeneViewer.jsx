import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import ThreeCircularCanvas from "./renderers/ThreeCircularCanvas";
import ThreeLinearCanvas from "./renderers/ThreeLinearCanvas";
import ThreeRowCanvas from "./renderers/ThreeRowCanvas";
import buildCircularSceneModel from "./model/buildCircularSceneModel";
import buildLinearSceneModel from "./model/buildLinearSceneModel";
import { getRowIndexForPosition } from "./model/buildRowSceneModel";
import PickingDebugOverlay from "./debug/PickingDebugOverlay";
import PointerPositionDebugOverlay from "./debug/PointerPositionDebugOverlay";
import useRaycastPicking from "./interaction/useRaycastPicking";
import collectRenderStats from "./perf/collectRenderStats";
import getSceneRevisionKey from "./model/getSceneRevisionKey";
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
  circularLabelScale = 1,
  circularLabelLineOpacity = 0.8,
  showCircularInternalLabels = false,
  onlyShowCircularOverflowLabels = false,
  annotationLimit = 72,
  mode = "dna",
  annotationVisibility,
  focusedAnnotationId,
  focusRange,
  linearBaseWidth,
  showCircularAxis = true,
  showCircularAxisNumbers = true,
  circularZoom = 1,
  circularRotation = 0,
  onCircularRotationChange,
  maxDpr = 2,
  preserveDrawingBuffer = false,
  rowSequenceCase = "raw",
  reverseRowSequence = false,
  showRowStrandHints = false,
  rowBaseSpacing = 1,
  rowBasesPerRow = 80,
  rowVisibleRowCount = 10,
  showDnaBaseColors = false,
  showRowWarnings = false,
  showRowChromatogram = false,
  showAminoAcidUnitAsCodon = false,
  aminoAcidColorMode = "family",
  searchRanges,
  testRegistryId
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
  const { resetPicking } = picking;
  const selectedAnnotationId =
    focusedAnnotationId === undefined
      ? picking.selectedId
      : focusedAnnotationId;
  const sceneRevisionKey = useMemo(
    () =>
      getSceneRevisionKey({
        sequenceData,
        annotationVisibility,
        viewType
      }),
    [annotationVisibility, sequenceData, viewType]
  );

  useEffect(() => {
    setRowVisibleStartRow(0);
    setCaretPosition(0);
    setPointerPosition(null);
    setSelectionStart(null);
    setSelectionRange(null);
    setRenderStats(collectRenderStats(undefined, { fixtureName }));
    resetPicking();
  }, [fixtureName, resetPicking, sceneRevisionKey]);

  useEffect(() => {
    if (!focusRange) return;

    const start = Math.floor(Number(focusRange.start));
    const end = Math.floor(Number(focusRange.end ?? focusRange.start));
    if (!Number.isFinite(start) || !Number.isFinite(end)) return;

    setCaretPosition(start);
    setPointerPosition(null);
    setSelectionStart(null);
    setSelectionRange({ start, end });
  }, [focusRange, sceneRevisionKey]);

  useEffect(() => {
    if (!isRow || !focusRange) return;

    const start = Math.floor(Number(focusRange.start));
    if (!Number.isFinite(start)) return;

    setRowVisibleStartRow(
      getRowIndexForPosition(start, {
        basesPerRow: rowBasesPerRow,
        sequenceLength: getSequenceLength(sequenceData)
      })
    );
  }, [focusRange, isRow, rowBasesPerRow, sequenceData]);

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
  const handleSelectRange = useCallback(
    (annotation, userData, event) => {
      if (
        Number.isFinite(Number(annotation?.start)) &&
        Number.isFinite(Number(annotation?.end))
      ) {
        setSelectionRange({
          start: Math.floor(Number(annotation.start)),
          end: Math.floor(Number(annotation.end))
        });
      }
      picking.handleClick(annotation, userData, event);
    },
    [picking]
  );

  return (
    <div
      className={`ove-three-viewer ${className}`}
      data-testid="ove-three-canvas-container"
      data-scene-revision={sceneRevisionKey}
      ref={viewerRef}
    >
      {showSceneStats && <SceneStatsReadout stats={renderStats} />}
      <PickingDebugOverlay
        hoveredId={picking.hoveredId}
        selectedId={selectedAnnotationId}
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
      {selectionRange && (
        <div
          className="ove-three-edit-preview"
          data-testid="ove-three-edit-preview"
        >
          <span>
            Selection {Math.min(selectionRange.start, selectionRange.end) + 1}-
            {Math.max(selectionRange.start, selectionRange.end) + 1}
          </span>
        </div>
      )}
      {isRow ? (
        <ThreeRowCanvas
          key={`row:${sceneRevisionKey}`}
          sequenceData={sequenceData}
          visibleStartRow={rowVisibleStartRow}
          onVisibleStartRowChange={setRowVisibleStartRow}
          basesPerRow={rowBasesPerRow}
          visibleRowCount={rowVisibleRowCount}
          mode={mode}
          annotationVisibility={annotationVisibility}
          sequenceCase={rowSequenceCase}
          reverseRowSequence={reverseRowSequence}
          showStrandHints={showRowStrandHints}
          baseSpacing={rowBaseSpacing}
          showDnaBaseColors={showDnaBaseColors}
          showRowWarnings={showRowWarnings}
          showRowChromatogram={showRowChromatogram}
          showAminoAcidUnitAsCodon={showAminoAcidUnitAsCodon}
          aminoAcidColorMode={aminoAcidColorMode}
          onSelectRange={handleSelectRange}
          onDoubleClickRange={picking.handleDoubleClick}
          onContextMenuRange={picking.handleContextMenu}
          onBackgroundContextMenu={picking.handleBackgroundContextMenu}
          onHoverRange={picking.handleHover}
          onHoverEnd={picking.handleLeave}
          selectedAnnotationId={selectedAnnotationId}
          hoveredAnnotationId={picking.hoveredId}
          caretPosition={caretPosition}
          selectionRange={selectionRange}
          focusRange={focusRange}
          searchRanges={searchRanges}
          onCaretPositionChange={handleCaretPositionChange}
          onPointerPositionChange={setPointerPosition}
          onSelectionStart={handleSelectionStart}
          onSelectionMove={handleSelectionMove}
          onSelectionEnd={handleSelectionEnd}
          isSelecting={selectionStart !== null}
          showSceneStats={showSceneStats}
          fixtureName={fixtureName}
          parentRef={viewerRef}
          onStatsChange={setRenderStats}
          maxDpr={maxDpr}
          preserveDrawingBuffer={preserveDrawingBuffer}
          testRegistryId={testRegistryId || "row"}
        />
      ) : isLinear ? (
        <ThreeLinearCanvas
          key={`linear:${sceneRevisionKey}`}
          sceneModel={sceneModel}
          onSelectRange={handleSelectRange}
          onDoubleClickRange={picking.handleDoubleClick}
          onContextMenuRange={picking.handleContextMenu}
          onBackgroundContextMenu={picking.handleBackgroundContextMenu}
          onHoverRange={picking.handleHover}
          onHoverEnd={picking.handleLeave}
          showPointerPosition={showPointerPosition}
          selectedAnnotationId={selectedAnnotationId}
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
          showSceneStats={showSceneStats}
          fixtureName={fixtureName}
          parentRef={viewerRef}
          onStatsChange={setRenderStats}
          maxDpr={maxDpr}
          preserveDrawingBuffer={preserveDrawingBuffer}
          testRegistryId={testRegistryId || "linear"}
        />
      ) : (
        <ThreeCircularCanvas
          key={`circular:${sceneRevisionKey}`}
          sceneModel={sceneModel}
          onSelectRange={handleSelectRange}
          onDoubleClickRange={picking.handleDoubleClick}
          onContextMenuRange={picking.handleContextMenu}
          onBackgroundContextMenu={picking.handleBackgroundContextMenu}
          onHoverRange={picking.handleHover}
          onHoverEnd={picking.handleLeave}
          showAxes={showAxes}
          showGrid={showGrid}
          showBoxHelpers={showBoxHelpers}
          showLabelBoxes={showLabelBoxes}
          circularLabelScale={circularLabelScale}
          circularLabelLineOpacity={circularLabelLineOpacity}
          showCircularInternalLabels={showCircularInternalLabels}
          onlyShowCircularOverflowLabels={onlyShowCircularOverflowLabels}
          annotationLimit={annotationLimit}
          showCircularAxis={showCircularAxis}
          showCircularAxisNumbers={showCircularAxisNumbers}
          circularZoom={circularZoom}
          circularRotation={circularRotation}
          onCircularRotationChange={onCircularRotationChange}
          showPickRay={showPickRay}
          showPointerPosition={showPointerPosition}
          pickRay={picking.pickRay}
          showSceneStats={showSceneStats}
          selectedAnnotationId={selectedAnnotationId}
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
          maxDpr={maxDpr}
          preserveDrawingBuffer={preserveDrawingBuffer}
          testRegistryId={testRegistryId || "circular"}
        />
      )}
    </div>
  );
}

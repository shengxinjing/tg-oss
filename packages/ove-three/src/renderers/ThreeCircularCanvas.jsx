import React from "react";
import { Canvas } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import CircularAnnotationLayer from "../layers/CircularAnnotationLayer";
import CircularAxisLayer from "../layers/CircularAxisLayer";
import CircularAxisNumbersLayer from "../layers/CircularAxisNumbersLayer";
import CircularBackboneLayer from "../layers/CircularBackboneLayer";
import CaretLayer from "../layers/CaretLayer";
import CircularCutsiteLayer from "../layers/CircularCutsiteLayer";
import CircularLabelLayer from "../layers/CircularLabelLayer";
import CircularOrfLayer from "../layers/CircularOrfLayer";
import SelectionLayer from "../layers/SelectionLayer";
import PerfOverlay from "../perf/PerfOverlay";
import mapPointerToCircularPosition from "../interaction/mapPointerToCircularPosition";

function mapCircularEvent(event, { radius, sequenceLength, mode }) {
  return mapPointerToCircularPosition(
    {
      x: event.point.x,
      y: event.point.z
    },
    {
      radius,
      sequenceLength,
      mode
    }
  );
}

function CircularPointerHitArea({
  sequenceLength,
  mode,
  onCaretPositionChange,
  onPointerPositionChange,
  onSelectionStart,
  onSelectionMove,
  onSelectionEnd,
  isSelecting,
  showPointerPosition
}) {
  const radius = 3.35;

  return (
    <mesh
      position={[0, -0.04, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      onPointerMove={event => {
        if (isSelecting) {
          const mapped = mapCircularEvent(event, {
            radius,
            sequenceLength,
            mode
          });
          if (mapped) onSelectionMove?.(mapped.position);
          return;
        }
        if (!showPointerPosition) return;
        onPointerPositionChange?.(
          mapCircularEvent(event, { radius, sequenceLength, mode })
        );
      }}
      onPointerDown={event => {
        const mapped = mapCircularEvent(event, {
          radius,
          sequenceLength,
          mode
        });
        if (!mapped) return;
        onSelectionStart?.(mapped.position);
      }}
      onPointerUp={event => {
        if (!isSelecting) return;
        const mapped = mapCircularEvent(event, {
          radius,
          sequenceLength,
          mode
        });
        if (!mapped) return;
        onSelectionEnd?.(mapped.position);
      }}
      onClick={event => {
        const mapped = mapCircularEvent(event, {
          radius,
          sequenceLength,
          mode
        });
        if (!mapped) return;
        onCaretPositionChange?.(mapped.position);
      }}
    >
      <planeGeometry args={[radius * 2, radius * 2]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

function CircularScene({
  sceneModel,
  onSelectRange,
  onDoubleClickRange,
  onContextMenuRange,
  onHoverRange,
  onHoverEnd,
  showAxes,
  showGrid,
  showBoxHelpers,
  showLabelBoxes,
  showPickRay,
  showPointerPosition,
  pickRay,
  showSceneStats,
  selectedAnnotationId,
  hoveredAnnotationId,
  caretPosition,
  selectionRange,
  mode,
  onCaretPositionChange,
  onPointerPositionChange,
  onSelectionStart,
  onSelectionMove,
  onSelectionEnd,
  isSelecting,
  fixtureName,
  parentRef,
  onStatsChange
}) {
  const radius = 2.4;

  return (
    <>
      <color attach="background" args={["#07111f"]} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 5, 4]} intensity={1.3} />
      {showGrid && <gridHelper args={[7, 14, "#334155", "#1e293b"]} />}
      {showAxes && <axesHelper args={[3.2]} />}
      <CircularPointerHitArea
        sequenceLength={sceneModel.sequenceLength}
        mode={mode}
        onCaretPositionChange={onCaretPositionChange}
        onPointerPositionChange={onPointerPositionChange}
        onSelectionStart={onSelectionStart}
        onSelectionMove={onSelectionMove}
        onSelectionEnd={onSelectionEnd}
        isSelecting={isSelecting}
        showPointerPosition={showPointerPosition}
      />
      <CircularBackboneLayer radius={radius} />
      <SelectionLayer
        selectionRange={selectionRange}
        sequenceLength={sceneModel.sequenceLength}
      />
      <CaretLayer
        position={caretPosition}
        sequenceLength={sceneModel.sequenceLength}
        mode={mode}
      />
      <CircularAxisLayer
        sequenceLength={sceneModel.sequenceLength}
        radius={2.58}
      />
      <CircularAxisNumbersLayer
        sequenceLength={sceneModel.sequenceLength}
        radius={3}
      />
      <CircularOrfLayer
        sceneModel={sceneModel}
        onSelectRange={onSelectRange}
        onDoubleClickRange={onDoubleClickRange}
        onContextMenuRange={onContextMenuRange}
        onHoverRange={onHoverRange}
        onHoverEnd={onHoverEnd}
        selectedAnnotationId={selectedAnnotationId}
      />
      <CircularAnnotationLayer
        sceneModel={sceneModel}
        radius={radius}
        onSelectRange={onSelectRange}
        onDoubleClickRange={onDoubleClickRange}
        onContextMenuRange={onContextMenuRange}
        onHoverRange={onHoverRange}
        onHoverEnd={onHoverEnd}
        selectedAnnotationId={selectedAnnotationId}
        hoveredAnnotationId={hoveredAnnotationId}
        showBoxHelpers={showBoxHelpers}
      />
      <CircularCutsiteLayer
        sceneModel={sceneModel}
        onSelectRange={onSelectRange}
        onDoubleClickRange={onDoubleClickRange}
        onContextMenuRange={onContextMenuRange}
        onHoverRange={onHoverRange}
        onHoverEnd={onHoverEnd}
      />
      <CircularLabelLayer
        sceneModel={sceneModel}
        selectedAnnotationId={selectedAnnotationId}
        hoveredAnnotationId={hoveredAnnotationId}
        showLabelBoxes={showLabelBoxes}
      />
      {showPickRay && pickRay && (
        <Line
          points={[
            pickRay.origin,
            [
              pickRay.origin[0] + pickRay.direction[0] * 8,
              pickRay.origin[1] + pickRay.direction[1] * 8,
              pickRay.origin[2] + pickRay.direction[2] * 8
            ]
          ]}
          color="#facc15"
          lineWidth={2}
        />
      )}
      <OrbitControls enableDamping makeDefault />
      {showSceneStats && (
        <PerfOverlay
          fixtureName={fixtureName}
          parentRef={parentRef}
          onStatsChange={onStatsChange}
        />
      )}
    </>
  );
}

export default function ThreeCircularCanvas({
  sceneModel,
  onSelectRange,
  onDoubleClickRange,
  onContextMenuRange,
  onBackgroundContextMenu,
  onHoverRange,
  onHoverEnd,
  showAxes = false,
  showGrid = false,
  showBoxHelpers = false,
  showLabelBoxes = false,
  showPickRay = false,
  showPointerPosition = false,
  pickRay,
  showSceneStats = false,
  selectedAnnotationId,
  hoveredAnnotationId,
  caretPosition = 0,
  selectionRange,
  mode = "dna",
  onCaretPositionChange,
  onPointerPositionChange,
  onSelectionStart,
  onSelectionMove,
  onSelectionEnd,
  isSelecting = false,
  fixtureName,
  parentRef,
  onStatsChange
}) {
  return (
    <Canvas
      camera={{ position: [0, 5.1, 7.2], fov: 45, near: 0.1, far: 100 }}
      dpr={[1, 2]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onContextMenu={onBackgroundContextMenu}
    >
      <CircularScene
        sceneModel={sceneModel}
        onSelectRange={onSelectRange}
        onDoubleClickRange={onDoubleClickRange}
        onContextMenuRange={onContextMenuRange}
        onHoverRange={onHoverRange}
        onHoverEnd={onHoverEnd}
        showAxes={showAxes}
        showGrid={showGrid}
        showBoxHelpers={showBoxHelpers}
        showLabelBoxes={showLabelBoxes}
        showPickRay={showPickRay}
        showPointerPosition={showPointerPosition}
        pickRay={pickRay}
        showSceneStats={showSceneStats}
        selectedAnnotationId={selectedAnnotationId}
        hoveredAnnotationId={hoveredAnnotationId}
        caretPosition={caretPosition}
        selectionRange={selectionRange}
        mode={mode}
        onCaretPositionChange={onCaretPositionChange}
        onPointerPositionChange={onPointerPositionChange}
        onSelectionStart={onSelectionStart}
        onSelectionMove={onSelectionMove}
        onSelectionEnd={onSelectionEnd}
        isSelecting={isSelecting}
        fixtureName={fixtureName}
        parentRef={parentRef}
        onStatsChange={onStatsChange}
      />
    </Canvas>
  );
}

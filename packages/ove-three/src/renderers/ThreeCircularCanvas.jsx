import React, { Suspense, useEffect, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
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
import NativeContextMenuPicker from "../interaction/NativeContextMenuPicker";
import isPrimaryPointerButton from "../interaction/isPrimaryPointerButton";
import mapPointerToCircularPosition from "../interaction/mapPointerToCircularPosition";
import setOrbitControlsEnabled from "../interaction/setOrbitControlsEnabled";
import getCanvasDpr from "./getCanvasDpr";
import {
  buildAnnotationRegistryEntries,
  buildLabelRegistryEntries,
  clearTestRegistry,
  createRegistrySnapshot,
  projectRegistryEntries,
  publishTestRegistry
} from "../debug/testRegistry";

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
  showPointerPosition,
  controlsRef
}) {
  const radius = 3.35;
  const restoreOrbitControls = () => {
    setOrbitControlsEnabled(controlsRef, true);
  };

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
        if (!isPrimaryPointerButton(event)) return;
        const mapped = mapCircularEvent(event, {
          radius,
          sequenceLength,
          mode
        });
        if (!mapped) return;
        event.stopPropagation();
        event.target.setPointerCapture?.(event.pointerId);
        setOrbitControlsEnabled(controlsRef, false);
        onSelectionStart?.(mapped.position);
      }}
      onPointerUp={event => {
        if (!isPrimaryPointerButton(event)) return;
        event.stopPropagation();
        event.target.releasePointerCapture?.(event.pointerId);
        restoreOrbitControls();
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
        if (!isPrimaryPointerButton(event)) return;
        event.stopPropagation();
        const mapped = mapCircularEvent(event, {
          radius,
          sequenceLength,
          mode
        });
        if (!mapped) return;
        onCaretPositionChange?.(mapped.position);
      }}
      onPointerCancel={restoreOrbitControls}
      onLostPointerCapture={restoreOrbitControls}
    >
      <planeGeometry args={[radius * 2, radius * 2]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

function canPublishTestRegistry() {
  return typeof window !== "undefined" && !!window.Cypress;
}

function projectToCanvas(camera, gl, worldPosition) {
  const rect = gl.domElement.getBoundingClientRect();
  const vector = new THREE.Vector3(...worldPosition).project(camera);
  const x = (vector.x * 0.5 + 0.5) * rect.width;
  const y = (-vector.y * 0.5 + 0.5) * rect.height;

  return {
    x,
    y,
    clientX: rect.left + x,
    clientY: rect.top + y
  };
}

function TestRegistryPublisher({
  sceneModel,
  selectedAnnotationId,
  hoveredAnnotationId
}) {
  const { camera, gl } = useThree();

  useEffect(() => {
    return () => {
      if (canPublishTestRegistry()) clearTestRegistry(window);
    };
  }, []);

  useFrame(() => {
    if (!canPublishTestRegistry()) return;
    const project = worldPosition => projectToCanvas(camera, gl, worldPosition);
    const annotations = projectRegistryEntries(
      buildAnnotationRegistryEntries(sceneModel, {
        selectedAnnotationId,
        hoveredAnnotationId
      }),
      project
    );
    const labels = projectRegistryEntries(
      buildLabelRegistryEntries({
        sceneModel,
        selectedAnnotationId,
        hoveredAnnotationId
      }),
      project
    );

    publishTestRegistry(
      createRegistrySnapshot({
        annotations,
        labels,
        selectedAnnotationId,
        hoveredAnnotationId
      }),
      window
    );
  });

  return null;
}

function CircularScene({
  sceneModel,
  onSelectRange,
  onDoubleClickRange,
  onContextMenuRange,
  onBackgroundContextMenu,
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
  const controlsRef = useRef(null);

  return (
    <>
      <color attach="background" args={["#07111f"]} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 5, 4]} intensity={1.3} />
      {showGrid && <gridHelper args={[7, 14, "#334155", "#1e293b"]} />}
      {showAxes && <axesHelper args={[3.2]} />}
      <TestRegistryPublisher
        sceneModel={sceneModel}
        selectedAnnotationId={selectedAnnotationId}
        hoveredAnnotationId={hoveredAnnotationId}
      />
      <NativeContextMenuPicker
        sceneModel={sceneModel}
        onContextMenuRange={onContextMenuRange}
        onBackgroundContextMenu={onBackgroundContextMenu}
      />
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
        controlsRef={controlsRef}
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
      <OrbitControls
        ref={controlsRef}
        enabled={!isSelecting}
        enableDamping
        makeDefault
      />
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
  onStatsChange,
  maxDpr = 2,
  preserveDrawingBuffer = false
}) {
  return (
    <Canvas
      data-testid="ove-three-webgl-canvas"
      camera={{ position: [0, 5.1, 7.2], fov: 45, near: 0.1, far: 100 }}
      dpr={getCanvasDpr(maxDpr)}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        preserveDrawingBuffer
      }}
    >
      <Suspense fallback={null}>
        <CircularScene
          sceneModel={sceneModel}
          onSelectRange={onSelectRange}
          onDoubleClickRange={onDoubleClickRange}
          onContextMenuRange={onContextMenuRange}
          onBackgroundContextMenu={onBackgroundContextMenu}
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
      </Suspense>
    </Canvas>
  );
}

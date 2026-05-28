import React, { Suspense, useEffect, useLayoutEffect } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import CaretLayer from "../layers/CaretLayer";
import LinearAnnotationLayer from "../layers/LinearAnnotationLayer";
import { linearMapStyle } from "../layers/LinearAnnotationLayer";
import LinearCutsiteLayer from "../layers/LinearCutsiteLayer";
import LinearSequenceLayer from "../layers/LinearSequenceLayer";
import SelectionLayer from "../layers/SelectionLayer";
import PerfOverlay from "../perf/PerfOverlay";
import NativeContextMenuPicker from "../interaction/NativeContextMenuPicker";
import isPrimaryPointerButton from "../interaction/isPrimaryPointerButton";
import mapPointerToLinearPosition from "../interaction/mapPointerToLinearPosition";
import getCanvasDpr from "./getCanvasDpr";
import getLinearCameraZoom from "./getLinearCameraZoom";
import {
  buildAnnotationRegistryEntries,
  clearTestRegistry,
  createRegistrySnapshot,
  projectRegistryEntries,
  publishTestRegistry
} from "../debug/testRegistry";

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

    publishTestRegistry(
      createRegistrySnapshot({
        annotations,
        selectedAnnotationId,
        hoveredAnnotationId
      }),
      window
    );
  });

  return null;
}

function LinearCameraFrame({ sceneModel }) {
  const { camera, size } = useThree();
  const modelWidth = sceneModel.sequenceLength * sceneModel.baseWidth;

  useLayoutEffect(() => {
    camera.position.set(0, 1.55, 20);
    camera.zoom = getLinearCameraZoom({
      canvasWidth: size.width,
      canvasHeight: size.height,
      modelWidth
    });
    camera.updateProjectionMatrix();
  }, [camera, modelWidth, size.height, size.width]);

  return null;
}

function mapLinearEvent(event, { sceneModel, mode }) {
  const modelWidth = sceneModel.sequenceLength * sceneModel.baseWidth;
  return mapPointerToLinearPosition(
    {
      x: event.point.x
    },
    {
      left: -modelWidth / 2,
      baseWidth: sceneModel.baseWidth,
      sequenceLength: sceneModel.sequenceLength,
      mode
    }
  );
}

function LinearPointerHitArea({
  sceneModel,
  mode,
  onCaretPositionChange,
  onPointerPositionChange,
  onSelectionStart,
  onSelectionMove,
  onSelectionEnd,
  isSelecting,
  showPointerPosition
}) {
  const modelWidth = sceneModel.sequenceLength * sceneModel.baseWidth;

  return (
    <mesh
      position={[0, 1.55, -0.08]}
      onPointerMove={event => {
        const mapped = mapLinearEvent(event, { sceneModel, mode });
        if (isSelecting && mapped) {
          onSelectionMove?.(mapped.position);
          return;
        }
        if (showPointerPosition) onPointerPositionChange?.(mapped);
      }}
      onPointerDown={event => {
        if (!isPrimaryPointerButton(event)) return;
        const mapped = mapLinearEvent(event, { sceneModel, mode });
        if (mapped) onSelectionStart?.(mapped.position);
      }}
      onPointerUp={event => {
        if (!isPrimaryPointerButton(event)) return;
        const mapped = mapLinearEvent(event, { sceneModel, mode });
        if (isSelecting && mapped) onSelectionEnd?.(mapped.position);
      }}
      onClick={event => {
        if (!isPrimaryPointerButton(event)) return;
        const mapped = mapLinearEvent(event, { sceneModel, mode });
        if (mapped) onCaretPositionChange?.(mapped.position);
      }}
    >
      <planeGeometry args={[modelWidth, 8.2]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

function AxisTicks({ sceneModel }) {
  const modelWidth = sceneModel.sequenceLength * sceneModel.baseWidth;
  const axisY = -0.56;

  return (
    <group userData={{ kind: "linear-axis" }}>
      <mesh position={[0, axisY - 0.17, 0.025]}>
        <planeGeometry args={[modelWidth, 0.025]} />
        <meshBasicMaterial color={linearMapStyle.strokeColor} />
      </mesh>
      {sceneModel.axisTicks.map(tick => {
        const x = tick.position * sceneModel.baseWidth - modelWidth / 2;
        return (
          <group key={tick.position} position={[x, axisY, 0.03]}>
            <mesh>
              <planeGeometry args={[0.018, 0.34]} />
              <meshBasicMaterial color={linearMapStyle.strokeColor} />
            </mesh>
            <Text
              position={[0.04, -0.34, 0.02]}
              color={linearMapStyle.textColor}
              fontSize={0.2}
              anchorX="left"
              anchorY="middle"
            >
              {tick.label}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

function LinearScene({
  sceneModel,
  onSelectRange,
  onDoubleClickRange,
  onContextMenuRange,
  onBackgroundContextMenu,
  onHoverRange,
  onHoverEnd,
  showPointerPosition,
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
  showSceneStats,
  fixtureName,
  parentRef,
  onStatsChange
}) {
  return (
    <>
      <color attach="background" args={[linearMapStyle.backgroundColor]} />
      <ambientLight intensity={1} />
      <NativeContextMenuPicker
        sceneModel={sceneModel}
        onContextMenuRange={onContextMenuRange}
        onBackgroundContextMenu={onBackgroundContextMenu}
      />
      <LinearCameraFrame sceneModel={sceneModel} />
      <LinearPointerHitArea
        sceneModel={sceneModel}
        mode={mode}
        onCaretPositionChange={onCaretPositionChange}
        onPointerPositionChange={onPointerPositionChange}
        onSelectionStart={onSelectionStart}
        onSelectionMove={onSelectionMove}
        onSelectionEnd={onSelectionEnd}
        isSelecting={isSelecting}
        showPointerPosition={showPointerPosition}
      />
      <AxisTicks sceneModel={sceneModel} />
      <LinearSequenceLayer sceneModel={sceneModel} />
      <SelectionLayer
        variant="linear"
        selectionRange={selectionRange}
        sceneModel={sceneModel}
      />
      <CaretLayer
        variant="linear"
        position={caretPosition}
        sceneModel={sceneModel}
      />
      <LinearAnnotationLayer
        sceneModel={sceneModel}
        onSelectRange={onSelectRange}
        onDoubleClickRange={onDoubleClickRange}
        onContextMenuRange={onContextMenuRange}
        onHoverRange={onHoverRange}
        onHoverEnd={onHoverEnd}
        selectedAnnotationId={selectedAnnotationId}
        hoveredAnnotationId={hoveredAnnotationId}
      />
      <LinearCutsiteLayer
        sceneModel={sceneModel}
        onSelectRange={onSelectRange}
        onDoubleClickRange={onDoubleClickRange}
        onContextMenuRange={onContextMenuRange}
        onHoverRange={onHoverRange}
        onHoverEnd={onHoverEnd}
      />
      <OrbitControls
        enableRotate={false}
        enableDamping
        makeDefault
        target={[0, 1.55, 0]}
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

export default function ThreeLinearCanvas({
  sceneModel,
  onSelectRange,
  onDoubleClickRange,
  onContextMenuRange,
  onBackgroundContextMenu,
  onHoverRange,
  onHoverEnd,
  showPointerPosition = false,
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
  showSceneStats = false,
  fixtureName,
  parentRef,
  onStatsChange,
  maxDpr = 2,
  preserveDrawingBuffer = false
}) {
  return (
    <Canvas
      data-testid="ove-three-webgl-canvas"
      orthographic
      camera={{ position: [0, 0.42, 20], zoom: 10, near: 0.1, far: 100 }}
      dpr={getCanvasDpr(maxDpr)}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        preserveDrawingBuffer
      }}
    >
      <TestRegistryPublisher
        sceneModel={sceneModel}
        selectedAnnotationId={selectedAnnotationId}
        hoveredAnnotationId={hoveredAnnotationId}
      />
      <Suspense fallback={null}>
        <LinearScene
          sceneModel={sceneModel}
          onSelectRange={onSelectRange}
          onDoubleClickRange={onDoubleClickRange}
          onContextMenuRange={onContextMenuRange}
          onBackgroundContextMenu={onBackgroundContextMenu}
          onHoverRange={onHoverRange}
          onHoverEnd={onHoverEnd}
          showPointerPosition={showPointerPosition}
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
          showSceneStats={showSceneStats}
          fixtureName={fixtureName}
          parentRef={parentRef}
          onStatsChange={onStatsChange}
        />
      </Suspense>
    </Canvas>
  );
}

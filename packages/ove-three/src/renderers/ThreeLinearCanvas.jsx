import React, { Suspense, useEffect, useLayoutEffect } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import CaretLayer from "../layers/CaretLayer";
import LinearAnnotationLayer from "../layers/LinearAnnotationLayer";
import LinearCutsiteLayer from "../layers/LinearCutsiteLayer";
import LinearSequenceLayer from "../layers/LinearSequenceLayer";
import SelectionLayer from "../layers/SelectionLayer";
import isPrimaryPointerButton from "../interaction/isPrimaryPointerButton";
import mapPointerToLinearPosition from "../interaction/mapPointerToLinearPosition";
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
    camera.position.set(0, 0.42, 20);
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
      position={[0, 0.45, -0.08]}
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
      <planeGeometry args={[modelWidth, 3.4]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

function AxisTicks({ sceneModel }) {
  const modelWidth = sceneModel.sequenceLength * sceneModel.baseWidth;

  return (
    <group userData={{ kind: "linear-axis" }}>
      {sceneModel.axisTicks.map(tick => {
        const x = tick.position * sceneModel.baseWidth - modelWidth / 2;
        return (
          <group key={tick.position} position={[x, 0.18, 0.03]}>
            <mesh>
              <planeGeometry args={[0.018, 0.16]} />
              <meshBasicMaterial color="#94a3b8" />
            </mesh>
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
  isSelecting
}) {
  return (
    <>
      <color attach="background" args={["#07111f"]} />
      <ambientLight intensity={1} />
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
        target={[0, 0.42, 0]}
      />
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
  isSelecting = false
}) {
  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0.42, 20], zoom: 10, near: 0.1, far: 100 }}
      dpr={[1, 2]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onContextMenu={onBackgroundContextMenu}
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
        />
      </Suspense>
    </Canvas>
  );
}

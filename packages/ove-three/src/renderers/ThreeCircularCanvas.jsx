import React, { Suspense, useEffect, useLayoutEffect, useRef } from "react";
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
import getNextCircularRotation from "../interaction/getNextCircularRotation";
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

const baseCameraDirection = new THREE.Vector3(0, 5.1, 7.2).normalize();

function getCircularCameraDistance(size = {}) {
  const shortSide = Math.max(1, Math.min(size.width || 1, size.height || 1));
  const fitScale = Math.max(1, 360 / shortSide);

  return THREE.MathUtils.clamp(8.82 * fitScale, 8.82, 22);
}

function mapCircularEvent(
  event,
  { radius, rotationRadians, sequenceLength, mode }
) {
  return mapPointerToCircularPosition(
    {
      x: event.point.x,
      y: event.point.z
    },
    {
      radius,
      rotationRadians,
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
  circularZoom,
  circularRotation,
  controlsRef
}) {
  const rotationRadians = (Number(circularRotation) * Math.PI) / 180;
  const radius = 3.35 * Number(circularZoom || 1);
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
            rotationRadians,
            sequenceLength,
            mode
          });
          if (mapped) onSelectionMove?.(mapped.position);
          return;
        }
        if (!showPointerPosition) return;
        onPointerPositionChange?.(
          mapCircularEvent(event, {
            radius,
            rotationRadians,
            sequenceLength,
            mode
          })
        );
      }}
      onPointerDown={event => {
        if (!isPrimaryPointerButton(event)) return;
        const mapped = mapCircularEvent(event, {
          radius,
          rotationRadians,
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
          rotationRadians,
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
          rotationRadians,
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

function hasPickableObjects(scene) {
  let hasPickable = false;
  scene.traverse(object => {
    if (object.userData?.pickable) hasPickable = true;
  });
  return hasPickable;
}

function CircularCameraFrame() {
  const {
    camera,
    size: { height, width }
  } = useThree();

  useLayoutEffect(() => {
    const distance = getCircularCameraDistance({ height, width });
    camera.position.copy(baseCameraDirection.clone().multiplyScalar(distance));
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, height, width]);

  return null;
}

function TestRegistryPublisher({
  sceneModel,
  selectedAnnotationId,
  hoveredAnnotationId,
  registryId
}) {
  const { camera, gl, scene } = useThree();

  useEffect(() => {
    return () => {
      if (canPublishTestRegistry()) clearTestRegistry(window, registryId);
    };
  }, [registryId]);

  useFrame(() => {
    if (!canPublishTestRegistry()) return;
    if (!hasPickableObjects(scene)) return;
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
      window,
      registryId
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
  circularLabelScale,
  circularLabelLineOpacity,
  showCircularInternalLabels,
  onlyShowCircularOverflowLabels,
  annotationLimit,
  showCircularAxis,
  showCircularAxisNumbers,
  circularZoom,
  circularRotation,
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
  onStatsChange,
  testRegistryId
}) {
  const radius = 2.4;
  const controlsRef = useRef(null);
  const { size } = useThree();
  const cameraDistance = getCircularCameraDistance(size);
  const safeZoom = Math.max(0.5, Number(circularZoom) || 1);
  const rotationRadians = (Number(circularRotation) * Math.PI) / 180;

  return (
    <>
      <color attach="background" args={["#07111f"]} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 5, 4]} intensity={1.3} />
      {showGrid && <gridHelper args={[7, 14, "#334155", "#1e293b"]} />}
      {showAxes && <axesHelper args={[3.2]} />}
      <NativeContextMenuPicker
        sceneModel={sceneModel}
        onContextMenuRange={onContextMenuRange}
        onBackgroundContextMenu={onBackgroundContextMenu}
        registryId={testRegistryId}
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
        circularZoom={safeZoom}
        circularRotation={circularRotation}
        controlsRef={controlsRef}
      />
      <group
        rotation={[0, -rotationRadians, 0]}
        scale={[safeZoom, safeZoom, safeZoom]}
      >
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
        {showCircularAxis && (
          <CircularAxisLayer
            sequenceLength={sceneModel.sequenceLength}
            radius={2.58}
          />
        )}
        {showCircularAxisNumbers && (
          <CircularAxisNumbersLayer
            sequenceLength={sceneModel.sequenceLength}
            radius={3}
          />
        )}
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
          labelScale={circularLabelScale}
          lineOpacity={circularLabelLineOpacity}
          showInternalLabels={showCircularInternalLabels}
          onlyShowOverflowLabels={onlyShowCircularOverflowLabels}
          maxVisibleLabels={annotationLimit}
        />
      </group>
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
        enablePan={false}
        enableZoom={false}
        minDistance={cameraDistance * 0.82}
        maxDistance={cameraDistance * 1.18}
        minPolarAngle={0.55}
        maxPolarAngle={1.18}
        makeDefault
      />
      {showSceneStats && (
        <PerfOverlay
          fixtureName={fixtureName}
          parentRef={parentRef}
          onStatsChange={onStatsChange}
          testRegistryId={testRegistryId}
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
  circularLabelScale = 1,
  circularLabelLineOpacity = 0.8,
  showCircularInternalLabels = false,
  onlyShowCircularOverflowLabels = false,
  annotationLimit = 72,
  showCircularAxis = true,
  showCircularAxisNumbers = true,
  circularZoom = 1,
  circularRotation = 0,
  onCircularRotationChange,
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
  preserveDrawingBuffer = false,
  testRegistryId = "circular"
}) {
  const handleWheel = event => {
    if (!onCircularRotationChange) return;
    event.preventDefault();
    event.stopPropagation();
    onCircularRotationChange(
      getNextCircularRotation({
        rotation: circularRotation,
        deltaY: event.deltaY
      })
    );
  };

  return (
    <Canvas
      data-testid="ove-three-webgl-canvas"
      onWheel={handleWheel}
      camera={{ position: [0, 5.1, 7.2], fov: 45, near: 0.1, far: 100 }}
      dpr={getCanvasDpr(maxDpr)}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        preserveDrawingBuffer
      }}
    >
      <CircularCameraFrame />
      <TestRegistryPublisher
        sceneModel={sceneModel}
        selectedAnnotationId={selectedAnnotationId}
        hoveredAnnotationId={hoveredAnnotationId}
        registryId={testRegistryId}
      />
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
          circularLabelScale={circularLabelScale}
          circularLabelLineOpacity={circularLabelLineOpacity}
          showCircularInternalLabels={showCircularInternalLabels}
          onlyShowCircularOverflowLabels={onlyShowCircularOverflowLabels}
          annotationLimit={annotationLimit}
          showCircularAxis={showCircularAxis}
          showCircularAxisNumbers={showCircularAxisNumbers}
          circularZoom={circularZoom}
          circularRotation={circularRotation}
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
          testRegistryId={testRegistryId}
        />
      </Suspense>
    </Canvas>
  );
}

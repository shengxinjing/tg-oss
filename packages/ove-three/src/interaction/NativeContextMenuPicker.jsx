import { useCallback, useEffect, useMemo } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { getBestPickableIntersection } from "./shouldHandlePick";

function normalizeAnnotation(annotation) {
  if (!annotation) return null;
  return {
    ...annotation,
    start: annotation.sourceStart ?? annotation.start,
    end: annotation.sourceEnd ?? annotation.end
  };
}

function collectAnnotations(sceneModel = {}) {
  const annotations = [...(sceneModel.annotations || [])];

  (sceneModel.visibleRows || []).forEach(row => {
    annotations.push(
      ...(row.annotations || []),
      ...(row.cutsites || []),
      ...(row.translations || [])
    );
  });

  return annotations;
}

function findSceneAnnotation(sceneModel, userData = {}) {
  return normalizeAnnotation(
    collectAnnotations(sceneModel).find(
      annotation => annotation.id === userData.annotationId
    )
  );
}

function createContextEvent(
  nativeEvent,
  intersection,
  intersections,
  raycaster
) {
  return {
    nativeEvent,
    object: intersection.object,
    point: intersection.point,
    intersections,
    ray: raycaster.ray
  };
}

export default function NativeContextMenuPicker({
  sceneModel,
  onContextMenuRange,
  onBackgroundContextMenu
}) {
  const { camera, gl, scene } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const pointer = useMemo(() => new THREE.Vector2(), []);

  const handleContextMenu = useCallback(
    event => {
      event.preventDefault();
      event.stopPropagation();

      const element = gl.domElement;
      const rect = element.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);

      const intersections = raycaster.intersectObjects(scene.children, true);
      const best = getBestPickableIntersection({ intersections });
      if (window.Cypress) {
        window.Cypress.oveThreeLastNativeContextPick = {
          clientX: event.clientX,
          clientY: event.clientY,
          rect: {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height
          },
          pointer: {
            x: pointer.x,
            y: pointer.y
          },
          pickableCount: intersections.filter(
            intersection => intersection.object?.userData?.pickable
          ).length,
          annotationId: best?.object?.userData?.annotationId || null
        };
      }
      if (best) {
        const userData = best.object.userData;
        const annotation = findSceneAnnotation(sceneModel, userData);
        if (annotation) {
          onContextMenuRange?.(
            annotation,
            userData,
            createContextEvent(event, best, intersections, raycaster)
          );
          return;
        }
      }

      onBackgroundContextMenu?.(
        createContextEvent(
          event,
          { object: { userData: { kind: "background" } }, point: null },
          intersections,
          raycaster
        )
      );
    },
    [
      camera,
      gl.domElement,
      onBackgroundContextMenu,
      onContextMenuRange,
      pointer,
      raycaster,
      scene.children,
      sceneModel
    ]
  );

  useFrame(() => {
    if (!window.Cypress) return;
    const rect = gl.domElement.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    window.Cypress.oveThreeNativeContextCanvas = gl.domElement;
    window.Cypress.oveThreeNativeContextMenu = handleContextMenu;
    if (window.Cypress.oveThreeLastNativeContextPick === undefined) {
      window.Cypress.oveThreeLastNativeContextPick = null;
    }
  });

  useEffect(() => {
    const element = gl.domElement;
    element.addEventListener("contextmenu", handleContextMenu);
    return () => {
      element.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [gl.domElement, handleContextMenu]);

  return null;
}

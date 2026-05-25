import { useCallback, useState } from "react";

function getUserData(event, userData) {
  return userData || event?.object?.userData || {};
}

function getAnnotationId(annotation, userData) {
  return userData.annotationId || annotation?.id || null;
}

export function createPointerEventPayload(
  type,
  annotation,
  userData,
  originalEvent
) {
  return {
    type,
    annotationId: getAnnotationId(annotation, userData),
    annotation,
    userData,
    originalEvent
  };
}

function getPickRay(event) {
  const ray = event?.ray;
  if (!ray) return null;
  return {
    origin: ray.origin.toArray(),
    direction: ray.direction.toArray()
  };
}

function getLatencyMs(event) {
  const timestamp = event?.nativeEvent?.timeStamp || event?.timeStamp;
  if (!Number.isFinite(timestamp)) return 0;
  return Math.max(0, Math.round(performance.now() - timestamp));
}

function preventContextMenu(event) {
  event?.nativeEvent?.preventDefault?.();
  event?.preventDefault?.();
}

export default function useRaycastPicking({
  onSelectRange,
  onDoubleClickRange,
  onContextMenuRange,
  onBackgroundContextMenu
} = {}) {
  const [hoveredId, setHoveredId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [lastPick, setLastPick] = useState(null);
  const [lastLatencyMs, setLastLatencyMs] = useState(null);
  const [pickRay, setPickRay] = useState(null);

  const handleHover = useCallback((annotation, userData, event) => {
    const resolvedUserData = getUserData(event, userData);
    setHoveredId(getAnnotationId(annotation, resolvedUserData));
    setLastPick(resolvedUserData);
    setLastLatencyMs(getLatencyMs(event));
    setPickRay(getPickRay(event));
  }, []);

  const handleLeave = useCallback(() => {
    setHoveredId(null);
  }, []);

  const handleClick = useCallback(
    (annotation, userData, event) => {
      const resolvedUserData = getUserData(event, userData);
      setSelectedId(getAnnotationId(annotation, resolvedUserData));
      setLastPick(resolvedUserData);
      setLastLatencyMs(getLatencyMs(event));
      setPickRay(getPickRay(event));
      onSelectRange?.(annotation, resolvedUserData, event);
    },
    [onSelectRange]
  );

  const handleDoubleClick = useCallback(
    (annotation, userData, event) => {
      const resolvedUserData = getUserData(event, userData);
      setSelectedId(getAnnotationId(annotation, resolvedUserData));
      setLastPick(resolvedUserData);
      setLastLatencyMs(getLatencyMs(event));
      setPickRay(getPickRay(event));
      onDoubleClickRange?.(
        annotation,
        createPointerEventPayload(
          "double-click",
          annotation,
          resolvedUserData,
          event
        )
      );
    },
    [onDoubleClickRange]
  );

  const handleContextMenu = useCallback(
    (annotation, userData, event) => {
      preventContextMenu(event);
      const resolvedUserData = getUserData(event, userData);
      setLastPick(resolvedUserData);
      setLastLatencyMs(getLatencyMs(event));
      setPickRay(getPickRay(event));
      onContextMenuRange?.(
        annotation,
        createPointerEventPayload(
          "context-menu",
          annotation,
          resolvedUserData,
          event
        )
      );
    },
    [onContextMenuRange]
  );

  const handleBackgroundContextMenu = useCallback(
    event => {
      preventContextMenu(event);
      const backgroundUserData = { kind: "background" };
      setHoveredId(null);
      setLastPick(backgroundUserData);
      setLastLatencyMs(getLatencyMs(event));
      onBackgroundContextMenu?.(
        createPointerEventPayload(
          "background-context-menu",
          null,
          backgroundUserData,
          event
        )
      );
    },
    [onBackgroundContextMenu]
  );

  return {
    hoveredId,
    selectedId,
    lastPick,
    lastLatencyMs,
    pickRay,
    handleHover,
    handleLeave,
    handleClick,
    handleDoubleClick,
    handleContextMenu,
    handleBackgroundContextMenu
  };
}

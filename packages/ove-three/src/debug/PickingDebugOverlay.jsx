import React from "react";

export default function PickingDebugOverlay({
  hoveredId,
  selectedId,
  lastPick,
  lastLatencyMs,
  showPickRay = false
}) {
  if (!showPickRay) return null;

  return (
    <div
      className="ove-three-picking-debug"
      data-testid="ove-three-picking-debug"
    >
      <div>Hovered: {hoveredId || "--"}</div>
      <div>Selected: {selectedId || "--"}</div>
      <div>Kind: {lastPick?.kind || "--"}</div>
      <div>Raycast: {lastLatencyMs ?? "--"}ms</div>
    </div>
  );
}

import React from "react";

export default function PointerPositionDebugOverlay({
  caretPosition,
  pointerPosition,
  selectionRange,
  showPointerPosition = false
}) {
  if (!showPointerPosition) return null;

  return (
    <div
      className="ove-three-pointer-debug"
      data-testid="ove-three-pointer-debug"
    >
      <div>
        Caret: {Number.isFinite(caretPosition) ? caretPosition + 1 : "--"} bp
      </div>
      <div>
        Pointer:{" "}
        {Number.isFinite(pointerPosition?.position)
          ? pointerPosition.position + 1
          : "--"}{" "}
        bp
      </div>
      <div>
        Selection:{" "}
        {selectionRange
          ? `${selectionRange.start + 1}-${selectionRange.end + 1}`
          : "--"}
      </div>
    </div>
  );
}

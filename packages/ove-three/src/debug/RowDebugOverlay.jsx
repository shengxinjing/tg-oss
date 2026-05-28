export default function RowDebugOverlay({ sceneModel }) {
  if (!sceneModel) return null;

  return (
    <div
      className="ove-three-row-debug"
      data-testid="ove-three-row-debug"
      data-visible-start-row={sceneModel.visibleStartRow}
      data-visible-end-row={sceneModel.visibleEndRow}
    >
      <div>Rows</div>
      <strong>
        {sceneModel.visibleStartRow + 1}-{sceneModel.visibleEndRow + 1}
      </strong>
      <span> / {sceneModel.totalRows}</span>
    </div>
  );
}

export default function RowDebugOverlay({ sceneModel }) {
  if (!sceneModel) return null;

  return (
    <div
      className="ove-three-row-debug"
      data-testid="ove-three-row-debug"
      data-visible-start-row={sceneModel.visibleStartRow}
      data-visible-end-row={sceneModel.visibleEndRow}
      data-sequence-case={sceneModel.sequenceCase}
      data-reverse-row-sequence={String(sceneModel.reverseRowSequence)}
      data-show-strand-hints={String(sceneModel.showStrandHints)}
      data-show-dna-base-colors={String(sceneModel.showDnaBaseColors)}
      data-amino-acid-color-mode={sceneModel.aminoAcidColorMode}
    >
      <div>Rows</div>
      <strong>
        {sceneModel.visibleStartRow + 1}-{sceneModel.visibleEndRow + 1}
      </strong>
      <span> / {sceneModel.totalRows}</span>
    </div>
  );
}

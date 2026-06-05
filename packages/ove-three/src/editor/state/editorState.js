export const annotationLayerKeys = [
  "feature",
  "part",
  "primer",
  "cutsite",
  "orf",
  "translation"
];

export function getViewOptions(sequenceData = {}) {
  if (sequenceData.circular === false) return ["linear", "row"];
  return ["circular", "linear", "row"];
}

export function getPreferredView(sequenceData = {}) {
  if (sequenceData.circular === false) {
    return (sequenceData.sequence || "").length > 10000 ? "row" : "linear";
  }

  return "circular";
}

export function getEditorPanelForView(viewType) {
  return viewType === "row" ? "sequence" : viewType;
}

export function resolveEditorViewState({ currentViewType, sequenceData }) {
  const viewOptions = getViewOptions(sequenceData);
  const viewType = viewOptions.includes(currentViewType)
    ? currentViewType
    : getPreferredView(sequenceData);

  return {
    viewType,
    activeEditorPanel: getEditorPanelForView(viewType)
  };
}

export function createEditorState(sequenceData = {}) {
  return {
    ...resolveEditorViewState({
      currentViewType: getPreferredView(sequenceData),
      sequenceData
    }),
    readOnly: false,
    materiallyAvailable: sequenceData.materiallyAvailable !== false
  };
}

export function setAnnotationLayerVisible(
  currentVisibility = {},
  key,
  visible
) {
  const nextVisibility = { ...currentVisibility };
  if (visible) {
    delete nextVisibility[key];
  } else {
    nextVisibility[key] = false;
  }
  return nextVisibility;
}

export function setAllAnnotationLayersVisible(visible) {
  if (visible) return {};

  return annotationLayerKeys.reduce(
    (nextVisibility, key) => ({
      ...nextVisibility,
      [key]: false
    }),
    {}
  );
}

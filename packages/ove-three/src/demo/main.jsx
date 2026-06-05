import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { exportCanvasPng, ThreeDGeneViewer } from "../index";
import {
  commandGroups,
  findCommand,
  isCommandEnabled
} from "../editor/commands/commandRegistry";
import {
  createEditorState,
  getEditorPanelForView,
  getViewOptions,
  resolveEditorViewState,
  setAllAnnotationLayersVisible,
  setAnnotationLayerVisible
} from "../editor/state/editorState";
import {
  changeSequenceCase,
  complementSequence,
  copySelection,
  createSequenceDataHistory,
  cutSelection,
  flipSequenceCase,
  pasteSequence,
  pushSequenceDataHistory,
  redoSequenceDataHistory,
  reverseComplementSequence,
  rotateSequenceToPosition,
  selectAllRange,
  selectInverseRange,
  serializeSequenceData,
  undoSequenceDataHistory
} from "../editor/state/editingState";
import {
  buildAdvancedToolResults,
  buildVersionHistoryRows,
  getAdvancedTools
} from "../editor/tools/advancedTools";
import { fixtureList } from "./fixtures";
import "../style.css";

function getSequenceKind(sequenceData) {
  if (sequenceData.isProtein || sequenceData.proteinSequence) return "protein";
  if (sequenceData.isRna) return "RNA";
  return sequenceData.circular ? "circular DNA" : "linear DNA";
}

function getAnnotationRange(annotation) {
  return `${annotation.start + 1}-${annotation.end + 1}`;
}

function getAnnotationLength(annotation) {
  return Math.max(0, annotation.end - annotation.start + 1);
}

const layerControls = [
  { key: "feature", label: "Features" },
  { key: "part", label: "Parts" },
  { key: "primer", label: "Primers" },
  { key: "cutsite", label: "Restriction sites" },
  { key: "orf", label: "ORFs" },
  { key: "translation", label: "Translations" }
];

const annotationGroups = [
  {
    key: "feature",
    label: "Features",
    sourceKey: "features",
    color: "#60a5fa"
  },
  { key: "part", label: "Parts", sourceKey: "parts", color: "#a855f7" },
  { key: "primer", label: "Primers", sourceKey: "primers", color: "#22d3ee" },
  {
    key: "cutsite",
    label: "Restriction sites",
    sourceKey: "cutsites",
    color: "#f59e0b"
  },
  { key: "orf", label: "ORFs", sourceKey: "orfs", color: "#67e8f9" },
  {
    key: "translation",
    label: "Translations",
    sourceKey: "translations",
    color: "#f472b6"
  }
];

const toolbarCommands = [
  "file.save",
  "file.importSequence",
  "file.exportPng",
  "tools.find"
];

const visibleMenuCommandGroups = commandGroups.filter(
  group => group.id !== "tools"
);

const annotationSourceKeysByType = {
  feature: "features",
  part: "parts",
  primer: "primers",
  cutsite: "cutsites",
  orf: "orfs",
  translation: "translations"
};

function toTestId(value) {
  return String(value || "item")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getAnnotationName(annotation, annotationType) {
  if (annotation.name) return annotation.name;
  if (annotation.enzyme) return annotation.enzyme;
  if (annotationType === "orf" && annotation.frame) {
    return `ORF frame ${annotation.frame}`;
  }
  return annotation.id || annotationType;
}

function getAnnotationItems(sequenceData) {
  return annotationGroups.flatMap(group =>
    (sequenceData[group.sourceKey] || []).map((annotation, index) => {
      const id = annotation.id || `${group.key}-${index}`;
      return {
        ...annotation,
        id,
        annotationType: group.key,
        groupLabel: group.label,
        displayName: getAnnotationName(annotation, group.key),
        color: annotation.color || group.color
      };
    })
  );
}

function getStatusSelectionText(selectedAnnotation, lastEvent) {
  if (selectedAnnotation) {
    return `${selectedAnnotation.displayName || selectedAnnotation.name} ${getAnnotationRange(selectedAnnotation)}`;
  }
  if (lastEvent.startsWith("selection ")) {
    return `Selection ${lastEvent.replace("selection ", "")}`;
  }
  if (lastEvent.startsWith("caret ")) {
    return `Caret ${lastEvent.replace("caret ", "")}`;
  }
  return "No Selection";
}

function matchesAnnotationSearch(annotation, query) {
  if (!query) return true;
  const range = getAnnotationRange(annotation);
  const text = [
    annotation.id,
    annotation.displayName,
    annotation.groupLabel,
    annotation.annotationType,
    annotation.type,
    range
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return text.includes(query);
}

function filterSequenceForViewOptions(
  sequenceData,
  { cutsiteFilter, orfMinSize }
) {
  const cutsiteQuery = cutsiteFilter.trim().toLowerCase();
  const minOrfLength = Math.max(0, Number(orfMinSize) || 0);

  return {
    ...sequenceData,
    cutsites: (sequenceData.cutsites || []).filter(cutsite => {
      if (!cutsiteQuery) return true;
      return String(cutsite.enzyme || cutsite.name || cutsite.id || "")
        .toLowerCase()
        .includes(cutsiteQuery);
    }),
    orfs: (sequenceData.orfs || []).filter(orf => {
      if (!minOrfLength) return true;
      return getAnnotationLength(orf) >= minOrfLength;
    })
  };
}

function getSupportedAnnotationVisibility(annotationsToSupport, withPartTags) {
  const visibility = {};

  if (!withPartTags) visibility.part = false;

  if (annotationsToSupport === "features-only") {
    visibility.part = false;
    visibility.primer = false;
    visibility.cutsite = false;
    visibility.orf = false;
    visibility.translation = false;
  }

  if (annotationsToSupport === "features-primers") {
    visibility.part = false;
    visibility.cutsite = false;
    visibility.orf = false;
    visibility.translation = false;
  }

  return visibility;
}

function getCommandButtonLabel(commandId) {
  return findCommand(commandId)?.label || commandId;
}

function formatRange(range) {
  if (!range) return "none";
  return `${range.start + 1}-${range.end + 1}`;
}

function createSmokeAnnotation(annotationType, sequenceLength) {
  const safeLength = Math.max(1, sequenceLength);
  const start = Math.min(12, safeLength - 1);
  const end = Math.min(start + 12, safeLength - 1);
  const id = `smoke-${annotationType}-${Date.now()}`;
  const base = {
    id,
    name: `Smoke ${annotationType}`,
    start,
    end,
    color: "#facc15"
  };

  if (annotationType === "cutsite") return { ...base, enzyme: "SmokeI" };
  if (annotationType === "orf") return { ...base, frame: 1 };
  if (annotationType === "translation") return { ...base, aminoAcids: "MVP" };
  return base;
}

function updateAnnotationList(sequenceData, annotationType, updater) {
  const sourceKey = annotationSourceKeysByType[annotationType];
  if (!sourceKey) return sequenceData;

  return {
    ...sequenceData,
    [sourceKey]: updater(sequenceData[sourceKey] || [])
  };
}

function formatAdvancedToolResults(results) {
  if (Array.isArray(results)) {
    if (!results.length) return "No results";
    return results
      .map(result =>
        typeof result === "string"
          ? result
          : Object.entries(result)
              .map(([key, value]) => `${key}: ${value}`)
              .join(" · ")
      )
      .join("\n");
  }

  return Object.entries(results || {})
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
}

function DemoApp() {
  const viewerRef = useRef(null);
  const [fixtureIndex, setFixtureIndex] = useState(1);
  const baseSequenceData = fixtureList[fixtureIndex];
  const [sequenceOverride, setSequenceOverride] = useState(null);
  const sequenceData = sequenceOverride || baseSequenceData;
  const initialEditorState = createEditorState(fixtureList[1]);
  const [sequenceHistory, setSequenceHistory] = useState(() =>
    createSequenceDataHistory(fixtureList[1])
  );
  const viewOptions = useMemo(
    () => getViewOptions(sequenceData),
    [sequenceData]
  );
  const annotationItems = useMemo(
    () => getAnnotationItems(sequenceData),
    [sequenceData]
  );
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [recentAnnotations, setRecentAnnotations] = useState([]);
  const [lastEvent, setLastEvent] = useState("none");
  const [lastExport, setLastExport] = useState(null);
  const [showLabelBoxes, setShowLabelBoxes] = useState(false);
  const [showPickRay, setShowPickRay] = useState(false);
  const [showPointerPosition, setShowPointerPosition] = useState(false);
  const [showSearchHits, setShowSearchHits] = useState(false);
  const [rowSequenceCase, setRowSequenceCase] = useState("raw");
  const [reverseRowSequence, setReverseRowSequence] = useState(false);
  const [showRowStrandHints, setShowRowStrandHints] = useState(false);
  const [rowBaseSpacing, setRowBaseSpacing] = useState(1);
  const [showDnaBaseColors, setShowDnaBaseColors] = useState(false);
  const [aminoAcidColorMode, setAminoAcidColorMode] = useState("family");
  const [showRowWarnings, setShowRowWarnings] = useState(false);
  const [showRowChromatogram, setShowRowChromatogram] = useState(false);
  const [showAminoAcidUnitAsCodon, setShowAminoAcidUnitAsCodon] =
    useState(false);
  const [showCircularAxis, setShowCircularAxis] = useState(true);
  const [showCircularAxisNumbers, setShowCircularAxisNumbers] = useState(true);
  const [circularZoom, setCircularZoom] = useState(1);
  const [circularRotation, setCircularRotation] = useState(0);
  const [circularLabelScale, setCircularLabelScale] = useState(1);
  const [circularLabelLineIntensity, setCircularLabelLineIntensity] =
    useState(0.8);
  const [showCircularInternalLabels, setShowCircularInternalLabels] =
    useState(false);
  const [onlyShowCircularOverflowLabels, setOnlyShowCircularOverflowLabels] =
    useState(false);
  const [circularCutsiteFilter, setCircularCutsiteFilter] = useState("");
  const [orfMinSize, setOrfMinSize] = useState("0");
  const [annotationLimit, setAnnotationLimit] = useState("72");
  const [linearZoom, setLinearZoom] = useState(1);
  const [showGcAaPlot, setShowGcAaPlot] = useState(false);
  const [showLinkedSequenceMap, setShowLinkedSequenceMap] = useState(true);
  const [isLinkedSequenceCollapsed, setIsLinkedSequenceCollapsed] =
    useState(false);
  const [linkedSecondaryViewType, setLinkedSecondaryViewType] = useState("row");
  const [showPerformanceStats, setShowPerformanceStats] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSidePanelCollapsed, setIsSidePanelCollapsed] = useState(false);
  const [closedEditorPanel, setClosedEditorPanel] = useState(null);
  const [readOnly, setReadOnly] = useState(initialEditorState.readOnly);
  const [materiallyAvailable, setMateriallyAvailable] = useState(
    initialEditorState.materiallyAvailable
  );
  const [annotationVisibility, setAnnotationVisibility] = useState({});
  const [annotationsToSupport, setAnnotationsToSupport] = useState("all");
  const [withPartTags, setWithPartTags] = useState(true);
  const [allowPanelTabDraggable, setAllowPanelTabDraggable] = useState(true);
  const [massageCmds, setMassageCmds] = useState(false);
  const [alwaysAllowSave, setAlwaysAllowSave] = useState(false);
  const [generatePng, setGeneratePng] = useState(false);
  const [activeCommandGroupId, setActiveCommandGroupId] = useState("file");
  const [clipboardText, setClipboardText] = useState("");
  const [saveStatus, setSaveStatus] = useState("unsaved");
  const [lastSerializedExport, setLastSerializedExport] = useState(null);
  const [findQuery, setFindQuery] = useState("ATGC");
  const [goToInput, setGoToInput] = useState("1");
  const [previewMode, setPreviewMode] = useState(false);
  const [activeAdvancedToolId, setActiveAdvancedToolId] = useState("digest");
  const [annotationSearch, setAnnotationSearch] = useState("");
  const [focusRange, setFocusRange] = useState(null);
  const [viewType, setViewType] = useState(initialEditorState.viewType);
  const [activeEditorPanel, setActiveEditorPanel] = useState(
    initialEditorState.activeEditorPanel
  );
  const renderSequenceData = useMemo(
    () =>
      filterSequenceForViewOptions(sequenceData, {
        cutsiteFilter: circularCutsiteFilter,
        orfMinSize
      }),
    [circularCutsiteFilter, orfMinSize, sequenceData]
  );
  const supportedAnnotationVisibility = useMemo(
    () => getSupportedAnnotationVisibility(annotationsToSupport, withPartTags),
    [annotationsToSupport, withPartTags]
  );
  const effectiveAnnotationVisibility = useMemo(
    () => ({
      ...supportedAnnotationVisibility,
      ...annotationVisibility
    }),
    [annotationVisibility, supportedAnnotationVisibility]
  );
  const searchRanges = useMemo(() => {
    const midpoint = Math.max(0, Math.floor(sequenceData.sequence.length / 2));
    return [
      {
        start: midpoint,
        end: Math.min(midpoint + 32, sequenceData.sequence.length - 1)
      }
    ];
  }, [sequenceData]);
  const findMatches = useMemo(() => {
    const query = findQuery.trim().toLowerCase();
    if (!query) return [];

    const matches = [];
    const searchableSequence = (sequenceData.sequence || "").toLowerCase();
    let start = searchableSequence.indexOf(query);
    while (start >= 0) {
      matches.push({ start, end: start + query.length - 1 });
      start = searchableSequence.indexOf(query, start + 1);
    }
    return matches;
  }, [findQuery, sequenceData]);
  const advancedToolResults = useMemo(
    () =>
      buildAdvancedToolResults(sequenceData, activeAdvancedToolId, {
        history: sequenceHistory,
        query: findQuery
      }),
    [activeAdvancedToolId, findQuery, sequenceData, sequenceHistory]
  );

  useEffect(() => {
    setSequenceOverride(null);
    setSequenceHistory(createSequenceDataHistory(baseSequenceData));
    setSelectedAnnotation(null);
    setRecentAnnotations([]);
    setFocusRange(null);
    setAnnotationVisibility({});
    setAnnotationSearch("");
    setLastEvent("fixture changed");
    setLastExport(null);
    setCircularZoom(1);
    setCircularRotation(0);
    setCircularLabelScale(1);
    setCircularLabelLineIntensity(0.8);
    setShowCircularInternalLabels(false);
    setOnlyShowCircularOverflowLabels(false);
    setRowSequenceCase("raw");
    setReverseRowSequence(false);
    setShowRowStrandHints(false);
    setRowBaseSpacing(1);
    setShowDnaBaseColors(false);
    setAminoAcidColorMode("family");
    setShowRowWarnings(false);
    setShowRowChromatogram(false);
    setCircularCutsiteFilter("");
    setOrfMinSize("0");
    setAnnotationLimit("72");
    setLinearZoom(1);
    setShowGcAaPlot(false);
    setLinkedSecondaryViewType("row");
    setClosedEditorPanel(null);
    setIsFullscreen(false);
    setIsSidePanelCollapsed(false);
    setAnnotationsToSupport("all");
    setWithPartTags(true);
    setAllowPanelTabDraggable(true);
    setMassageCmds(false);
    setAlwaysAllowSave(false);
    setGeneratePng(false);
    setClipboardText("");
    setSaveStatus("unsaved");
    setLastSerializedExport(null);
    setFindQuery("ATGC");
    setGoToInput("1");
    setPreviewMode(false);
    setActiveAdvancedToolId("digest");
    setMateriallyAvailable(baseSequenceData.materiallyAvailable !== false);
    setViewType(currentViewType => {
      const nextEditorState = resolveEditorViewState({
        currentViewType,
        sequenceData: baseSequenceData
      });
      setActiveEditorPanel(nextEditorState.activeEditorPanel);
      return nextEditorState.viewType;
    });
  }, [baseSequenceData]);

  const getCurrentSelection = () => {
    if (focusRange) return { start: focusRange.start, end: focusRange.end };
    if (selectedAnnotation) {
      return { start: selectedAnnotation.start, end: selectedAnnotation.end };
    }
    return null;
  };
  const applySequenceDataChange = (nextSequenceData, eventLabel) => {
    setSequenceHistory(currentHistory =>
      pushSequenceDataHistory(currentHistory, nextSequenceData)
    );
    setSequenceOverride(nextSequenceData);
    setSaveStatus("unsaved");
    setLastEvent(eventLabel);
  };
  const focusSequenceRange = (range, eventLabel) => {
    if (!range) return;
    setSelectedAnnotation(null);
    setFocusRange({
      ...range,
      key: `${eventLabel}:${Date.now()}`
    });
    setLastEvent(eventLabel);
  };
  const addSmokeAnnotation = annotationType => {
    const nextSequenceData = updateAnnotationList(
      sequenceData,
      annotationType,
      annotations => [
        ...annotations,
        createSmokeAnnotation(annotationType, sequenceData.sequence.length)
      ]
    );
    applySequenceDataChange(nextSequenceData, `${annotationType} added`);
  };
  const editSelectedAnnotation = () => {
    if (!selectedAnnotation) return;

    const annotationType = selectedAnnotation?.annotationType || "feature";
    const sourceKey = annotationSourceKeysByType[annotationType];
    if (!sourceKey) return;

    const nextSequenceData = {
      ...sequenceData,
      [sourceKey]: (sequenceData[sourceKey] || []).map(annotation =>
        annotation.id === selectedAnnotation.id
          ? {
              ...annotation,
              name: `${getAnnotationName(annotation, annotationType)} edited`
            }
          : annotation
      )
    };
    applySequenceDataChange(nextSequenceData, `${annotationType} edited`);
  };
  const deleteSelectedAnnotation = () => {
    const annotationType = selectedAnnotation?.annotationType || "feature";
    const sourceKey = annotationSourceKeysByType[annotationType];
    if (!sourceKey || !selectedAnnotation) return;

    const nextSequenceData = {
      ...sequenceData,
      [sourceKey]: (sequenceData[sourceKey] || []).filter(
        annotation => annotation.id !== selectedAnnotation.id
      )
    };
    setSelectedAnnotation(null);
    setFocusRange(null);
    applySequenceDataChange(nextSequenceData, `${annotationType} deleted`);
  };
  const normalizeFocusedAnnotation = annotation => ({
    ...annotation,
    displayName: getAnnotationName(annotation, annotation.annotationType)
  });
  const rememberAnnotation = annotation => {
    if (!annotation?.id) return;
    setRecentAnnotations(currentAnnotations =>
      [
        annotation,
        ...currentAnnotations.filter(current => current.id !== annotation.id)
      ].slice(0, 5)
    );
  };
  const handleSelectRange = annotation => {
    const nextAnnotation = normalizeFocusedAnnotation(annotation);
    setSelectedAnnotation(nextAnnotation);
    rememberAnnotation(nextAnnotation);
    setFocusRange({
      start: annotation.start,
      end: annotation.end,
      key: `${annotation.id}:${Date.now()}`
    });
    setLastEvent(`click ${annotation.id}`);
  };
  const handleAnnotationFocus = annotation => {
    const start = Math.floor(Number(annotation.start));
    const end = Math.floor(Number(annotation.end));
    if (!Number.isFinite(start) || !Number.isFinite(end)) return;

    const nextAnnotation = normalizeFocusedAnnotation(annotation);
    setSelectedAnnotation(nextAnnotation);
    rememberAnnotation(nextAnnotation);
    setFocusRange({
      start,
      end,
      key: `${annotation.id}:${Date.now()}`
    });
    setLastEvent(`focus ${annotation.id || annotation.displayName}`);
  };
  const handleLayerToggle = (layer, visible) => {
    setAnnotationVisibility(currentVisibility =>
      setAnnotationLayerVisible(currentVisibility, layer.key, visible)
    );
    if (!visible && selectedAnnotation?.annotationType === layer.key) {
      setSelectedAnnotation(null);
      setFocusRange(null);
    }
    setLastEvent(`${layer.key} ${visible ? "shown" : "hidden"}`);
  };
  const handleAllLayersVisible = visible => {
    setAnnotationVisibility(setAllAnnotationLayersVisible(visible));
    if (!visible) {
      setSelectedAnnotation(null);
      setFocusRange(null);
    }
    setLastEvent(`all layers ${visible ? "shown" : "hidden"}`);
  };
  const handleRowJump = position => {
    setSelectedAnnotation(null);
    setFocusRange({
      start: position,
      end: position,
      key: `row-jump:${position}:${Date.now()}`
    });
    setLastEvent(`row jump ${position + 1}`);
  };
  const handleClearSelection = () => {
    setSelectedAnnotation(null);
    setFocusRange(null);
    setLastEvent("selection cleared");
  };
  const handleClearRecentAnnotations = () => {
    setRecentAnnotations([]);
    setLastEvent("recent selections cleared");
  };
  const handleViewerSelectionChange = selection => {
    const start = Math.floor(Number(selection?.start));
    const end = Math.floor(Number(selection?.end));
    if (!Number.isFinite(start) || !Number.isFinite(end)) return;

    setSelectedAnnotation(null);
    setFocusRange({
      start,
      end,
      key: `selection:${start}:${end}:${Date.now()}`
    });
    setLastEvent(
      `selection ${Math.min(start, end) + 1}-${Math.max(start, end) + 1}`
    );
  };
  const handleViewChange = nextViewType => {
    if (!viewOptions.includes(nextViewType)) return;

    setViewType(nextViewType);
    setActiveEditorPanel(getEditorPanelForView(nextViewType));
    if (!selectedAnnotation) return;

    setFocusRange({
      start: selectedAnnotation.start,
      end: selectedAnnotation.end,
      key: `${selectedAnnotation.id}:${nextViewType}:${Date.now()}`
    });
  };
  const handleExportPng = () => {
    const fileName = `${sequenceData.name}-${viewType}.png`;
    const result = exportCanvasPng(viewerRef.current, { fileName });
    if (!result) {
      setLastExport({ fileName, byteLength: 0 });
      setLastEvent("export failed");
      return;
    }

    const exportSummary = {
      fileName: result.fileName,
      byteLength: result.byteLength
    };
    setLastExport(exportSummary);
    setLastEvent(`export ${result.fileName}`);
    if (typeof window !== "undefined") {
      window.__oveThreeLastPng = exportSummary;
    }
  };
  const handleCommand = commandId => {
    const commandState = {
      readOnly,
      selection: getCurrentSelection(),
      canUndo: sequenceHistory.past.length > 0,
      canRedo: sequenceHistory.future.length > 0
    };
    if (!isCommandEnabled(commandId, commandState)) {
      setLastEvent(readOnly ? "read-only locked" : `${commandId} unavailable`);
      return;
    }

    if (commandId === "file.save" || commandId === "file.saveAs") {
      setSaveStatus(commandId === "file.save" ? "saved" : "save as ready");
      setLastEvent(findCommand(commandId).label.toLowerCase());
      return;
    }

    if (commandId === "file.importSequence") {
      const importedSequenceData = {
        ...sequenceData,
        name: `${sequenceData.name}_imported`,
        sequence: `${sequenceData.sequence}ATGC`
      };
      applySequenceDataChange(importedSequenceData, "sequence imported");
      return;
    }

    if (commandId === "file.exportPng" || commandId === "file.print") {
      handleExportPng();
      return;
    }

    if (commandId.startsWith("file.export")) {
      const format = commandId.replace("file.export", "").toLowerCase();
      const normalizedFormat = format === "genbank" ? "genbank" : format;
      const text = serializeSequenceData(sequenceData, normalizedFormat);
      setLastSerializedExport({
        format: normalizedFormat,
        byteLength: text.length,
        text
      });
      setLastEvent(`${normalizedFormat} exported`);
      return;
    }

    if (commandId === "edit.undo") {
      const nextHistory = undoSequenceDataHistory(sequenceHistory);
      setSequenceHistory(nextHistory);
      setSequenceOverride(nextHistory.present);
      setLastEvent("undo");
      return;
    }

    if (commandId === "edit.redo") {
      const nextHistory = redoSequenceDataHistory(sequenceHistory);
      setSequenceHistory(nextHistory);
      setSequenceOverride(nextHistory.present);
      setLastEvent("redo");
      return;
    }

    if (commandId === "edit.copy") {
      setClipboardText(copySelection(sequenceData, getCurrentSelection()));
      setLastEvent("copy");
      return;
    }

    if (commandId === "edit.cut") {
      const cut = cutSelection(sequenceData, getCurrentSelection());
      setClipboardText(cut.copiedText);
      applySequenceDataChange(cut.sequenceData, "cut");
      return;
    }

    if (commandId === "edit.paste") {
      applySequenceDataChange(
        pasteSequence(
          sequenceData,
          getCurrentSelection(),
          clipboardText || "ATGC"
        ),
        "paste"
      );
      return;
    }

    if (commandId === "edit.selectAll") {
      focusSequenceRange(selectAllRange(sequenceData), "selection all");
      return;
    }

    if (commandId === "edit.selectInverse") {
      focusSequenceRange(
        selectInverseRange(sequenceData, getCurrentSelection()),
        "selection inverse"
      );
      return;
    }

    if (commandId === "edit.changeCaseUpper") {
      applySequenceDataChange(
        changeSequenceCase(sequenceData, "upper"),
        "upper case"
      );
      return;
    }

    if (commandId === "edit.changeCaseLower") {
      applySequenceDataChange(
        changeSequenceCase(sequenceData, "lower"),
        "lower case"
      );
      return;
    }

    if (commandId === "edit.flipCase") {
      applySequenceDataChange(flipSequenceCase(sequenceData), "flip case");
      return;
    }

    if (commandId === "edit.complement") {
      applySequenceDataChange(complementSequence(sequenceData), "complement");
      return;
    }

    if (commandId === "edit.reverseComplement") {
      applySequenceDataChange(
        reverseComplementSequence(sequenceData),
        "reverse complement"
      );
      return;
    }

    if (commandId === "edit.rotateToCaret") {
      const selection = getCurrentSelection() || { start: 0 };
      applySequenceDataChange(
        rotateSequenceToPosition(sequenceData, selection.start),
        "rotate to caret"
      );
      return;
    }

    if (commandId === "edit.addFeature") return addSmokeAnnotation("feature");
    if (commandId === "edit.editFeature") return editSelectedAnnotation();
    if (commandId === "edit.deleteFeature") return deleteSelectedAnnotation();
    if (commandId === "edit.addPart") return addSmokeAnnotation("part");
    if (commandId === "edit.addPrimer") return addSmokeAnnotation("primer");
    if (commandId === "edit.addCutsite") return addSmokeAnnotation("cutsite");
    if (commandId === "edit.addOrf") return addSmokeAnnotation("orf");
    if (commandId === "edit.addTranslation") {
      return addSmokeAnnotation("translation");
    }

    if (commandId === "view.circular")
      return handleEditorPanelChange("circular");
    if (commandId === "view.linear") return handleEditorPanelChange("linear");
    if (commandId === "view.sequence")
      return handleEditorPanelChange("sequence");
    if (commandId === "view.properties")
      return handleEditorPanelChange("properties");
    if (commandId === "view.genbank") {
      setClosedEditorPanel(null);
      setActiveEditorPanel("genbank");
      setLastEvent("genbank view");
      return;
    }
    if (commandId === "view.preview") {
      setPreviewMode(true);
      setClosedEditorPanel(null);
      setActiveEditorPanel("preview");
      setLastEvent("preview mode");
      return;
    }
    if (commandId === "view.versionHistory") {
      setActiveAdvancedToolId("versionHistory");
      setLastEvent("version history");
      return;
    }

    if (commandId === "tools.find") {
      const match = findMatches[0];
      focusSequenceRange(match, `find ${findQuery}`);
      return;
    }

    if (commandId === "tools.goTo") {
      const position = Math.max(
        0,
        Math.min(Number(goToInput) - 1 || 0, sequenceData.sequence.length - 1)
      );
      focusSequenceRange(
        { start: position, end: position },
        `go to ${position + 1}`
      );
      return;
    }

    if (commandId.startsWith("tools.")) {
      setActiveAdvancedToolId(commandId.replace("tools.", ""));
      setLastEvent(findCommand(commandId).label.toLowerCase());
      return;
    }
  };
  const annotationSearchQuery = annotationSearch.trim().toLowerCase();
  const visibleAnnotationItems = annotationItems.filter(annotation => {
    if (effectiveAnnotationVisibility[annotation.annotationType] === false)
      return false;
    return matchesAnnotationSearch(annotation, annotationSearchQuery);
  });
  const selectedVisibleIndex = visibleAnnotationItems.findIndex(
    annotation => annotation.id === selectedAnnotation?.id
  );
  const annotationResultLabel = `${visibleAnnotationItems.length} ${
    visibleAnnotationItems.length === 1 ? "result" : "results"
  }`;
  const handleStepAnnotation = direction => {
    if (!visibleAnnotationItems.length) return;
    const currentIndex =
      selectedVisibleIndex >= 0 ? selectedVisibleIndex : direction > 0 ? -1 : 0;
    const nextIndex =
      (currentIndex + direction + visibleAnnotationItems.length) %
      visibleAnnotationItems.length;

    handleAnnotationFocus(visibleAnnotationItems[nextIndex]);
  };
  const handleResetAnnotationSearch = () => {
    setAnnotationSearch("");
    setLastEvent("annotation search reset");
  };
  const handleEditorPanelChange = panel => {
    setClosedEditorPanel(null);
    setActiveEditorPanel(panel);
    if (panel === "circular") {
      handleViewChange("circular");
    } else if (panel === "linear") {
      handleViewChange("linear");
    } else if (panel === "sequence") {
      handleViewChange("row");
    }
  };
  const handleCloseActivePanel = () => {
    setClosedEditorPanel(activeEditorPanel);
    setLastEvent(`panel closed ${activeEditorPanel}`);
  };
  const handleReopenPanels = () => {
    setClosedEditorPanel(null);
    setLastEvent("panels reopened");
  };
  const selectionStatus = getStatusSelectionText(selectedAnnotation, lastEvent);
  const circularControlSummary = `Zoom ${circularZoom.toFixed(1)}x · Rotation ${Math.round(circularRotation)}°`;
  const circularLayerSummary = `axis ${
    showCircularAxis ? "on" : "off"
  } · numbers ${showCircularAxisNumbers ? "on" : "off"}`;
  const circularViewOptionSummary = [
    `label ${circularLabelScale.toFixed(1)}x`,
    `line ${circularLabelLineIntensity.toFixed(2)}`,
    showCircularInternalLabels ? "internal labels on" : "internal labels off",
    onlyShowCircularOverflowLabels
      ? "overflow labels only"
      : "all labels allowed",
    circularCutsiteFilter.trim()
      ? `cutsite ${circularCutsiteFilter.trim()}`
      : "cutsite all",
    `ORF ${Math.max(0, Number(orfMinSize) || 0)} bp`,
    `limit ${Math.max(1, Number(annotationLimit) || 1)}`
  ].join(" · ");
  const baseLinearBaseWidth = Math.min(
    0.018,
    44 / Math.max(sequenceData.sequence.length, 1)
  );
  const resolvedLinearBaseWidth = baseLinearBaseWidth * linearZoom;
  const linearFitSummary = `Linear fit ${Math.round(sequenceData.sequence.length * resolvedLinearBaseWidth * 100) / 100} world units`;
  const linearControlSummary = `Zoom ${linearZoom.toFixed(1)}x · limit ${Math.max(1, Number(annotationLimit) || 1)}`;
  const rowCaseLabel =
    rowSequenceCase === "upper"
      ? "uppercase"
      : rowSequenceCase === "lower"
        ? "lowercase"
        : "raw";
  const rowControlSummary = [
    rowCaseLabel,
    reverseRowSequence ? "reverse" : "forward",
    showRowStrandHints ? "5'/3' hints" : "no strand hints",
    showDnaBaseColors ? "base colors" : "plain bases",
    `spacing ${rowBaseSpacing.toFixed(1)}x`,
    `AA ${aminoAcidColorMode}`
  ].join(" · ");
  const annotationsToSupportLabel =
    annotationsToSupport === "features-only"
      ? "features only"
      : annotationsToSupport === "features-primers"
        ? "features + primers"
        : "all annotations";
  const viewOptionsSmokeSummary = [
    annotationsToSupportLabel,
    withPartTags ? "part tags on" : "part tags off",
    allowPanelTabDraggable ? "tabs draggable" : "tabs fixed",
    massageCmds ? "massage commands on" : "massage commands off",
    alwaysAllowSave ? "save always allowed" : "save normal",
    generatePng ? "png ready" : "png manual"
  ].join(" · ");
  const sequencePreview = sequenceData.sequence.slice(0, 24);
  const activePanelClosed = closedEditorPanel === activeEditorPanel;
  const currentSelection = getCurrentSelection();
  const commandState = {
    readOnly,
    selection: currentSelection,
    canUndo: sequenceHistory.past.length > 0,
    canRedo: sequenceHistory.future.length > 0
  };
  const activeCommandGroup =
    visibleMenuCommandGroups.find(group => group.id === activeCommandGroupId) ||
    visibleMenuCommandGroups[0];
  const genbankText = serializeSequenceData(sequenceData, "genbank");
  const advancedTools = getAdvancedTools();
  const versionHistoryRows = buildVersionHistoryRows(sequenceHistory);
  const sharedViewerProps = {
    sequenceData: renderSequenceData,
    onSelectRange: handleSelectRange,
    onDoubleClickRange: annotation =>
      setLastEvent(`double-click ${annotation.id}`),
    onContextMenuRange: annotation =>
      setLastEvent(`right-click ${annotation.id}`),
    onBackgroundContextMenu: () => setLastEvent("right-click background"),
    onCaretPositionChange: position => setLastEvent(`caret ${position + 1}`),
    onSelectionChange: handleViewerSelectionChange,
    annotationVisibility: effectiveAnnotationVisibility,
    focusedAnnotationId: selectedAnnotation?.id ?? null,
    focusRange,
    showLabelBoxes,
    showPickRay,
    showPointerPosition,
    showAminoAcidUnitAsCodon,
    circularLabelScale,
    circularLabelLineOpacity: circularLabelLineIntensity,
    showCircularInternalLabels,
    onlyShowCircularOverflowLabels,
    annotationLimit: Math.max(1, Number(annotationLimit) || 1),
    showCircularAxis,
    showCircularAxisNumbers,
    circularZoom,
    circularRotation,
    onCircularRotationChange: setCircularRotation,
    linearBaseWidth: resolvedLinearBaseWidth,
    rowSequenceCase,
    reverseRowSequence,
    showRowStrandHints,
    rowBaseSpacing,
    showDnaBaseColors,
    showRowWarnings,
    showRowChromatogram,
    aminoAcidColorMode,
    showSceneStats: showPerformanceStats,
    searchRanges: showSearchHits ? searchRanges : [],
    maxDpr: 1.5,
    preserveDrawingBuffer: true
  };
  const linkedPrimaryViewType =
    activeEditorPanel === "linear" ? "linear" : "circular";
  const linkedPrimaryTitle =
    linkedPrimaryViewType === "linear" ? "Linear Map" : "Circular Map";
  const linkedSecondaryTitle =
    linkedSecondaryViewType === "linear" ? "Linear Map" : "Sequence Map";
  const linkedSecondaryRegistryId =
    linkedSecondaryViewType === "linear" ? "secondary-linear" : "sequence";
  const shouldShowLinkedMap =
    (activeEditorPanel === "circular" || activeEditorPanel === "linear") &&
    viewOptions.includes("row") &&
    showLinkedSequenceMap;

  return (
    <main
      className={`ove-three-editor${isFullscreen ? " is-fullscreen" : ""}${
        isSidePanelCollapsed ? " is-side-panel-collapsed" : ""
      }`}
      data-layout-mode={isFullscreen ? "fullscreen" : "split"}
      data-side-panel={isSidePanelCollapsed ? "collapsed" : "open"}
      data-testid="ove-three-editor-shell"
    >
      <header className="ove-three-editor__chrome">
        <div className="ove-three-editor__identity">
          <strong>3D Gene Editor</strong>
          <span>{sequenceData.name}</span>
        </div>
        <nav
          className="ove-three-editor__menu"
          data-testid="ove-three-menu-bar"
        >
          {visibleMenuCommandGroups.map(group => (
            <button
              className={activeCommandGroupId === group.id ? "is-active" : ""}
              data-testid={`ove-three-menu-${group.id}`}
              key={group.id}
              type="button"
              onClick={() => {
                setActiveCommandGroupId(group.id);
                setLastEvent(`${group.label.toLowerCase()} menu`);
              }}
            >
              {group.label}
            </button>
          ))}
        </nav>
        <div
          className="ove-three-editor__toolbar"
          data-testid="ove-three-toolbar"
        >
          {toolbarCommands.map(commandId => (
            <button
              data-testid={`ove-three-toolbar-${toTestId(commandId)}`}
              disabled={!isCommandEnabled(commandId, commandState)}
              key={commandId}
              type="button"
              onClick={() => handleCommand(commandId)}
            >
              {getCommandButtonLabel(commandId)}
            </button>
          ))}
        </div>
        <div className="ove-three-editor__panel-actions">
          <button
            data-testid="ove-three-fullscreen-toggle"
            type="button"
            onClick={() => setIsFullscreen(current => !current)}
          >
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </button>
          <button
            data-testid="ove-three-side-panel-toggle"
            type="button"
            onClick={() => setIsSidePanelCollapsed(current => !current)}
          >
            {isSidePanelCollapsed ? "Show Panel" : "Collapse Panel"}
          </button>
          <button
            data-testid="ove-three-close-active-tab"
            type="button"
            onClick={handleCloseActivePanel}
          >
            Close Tab
          </button>
        </div>
      </header>
      <section
        className="ove-three-editor__command-shelf"
        data-testid="ove-three-command-shelf"
      >
        <strong>{activeCommandGroup.label}</strong>
        <div>
          {activeCommandGroup.commands.map(command => (
            <button
              data-command-id={command.id}
              data-testid={`ove-three-command-${toTestId(command.id)}`}
              disabled={!isCommandEnabled(command.id, commandState)}
              key={command.id}
              type="button"
              onClick={() => handleCommand(command.id)}
            >
              {command.label}
            </button>
          ))}
        </div>
      </section>
      <div className="ove-three-editor__body">
        <section className="ove-three-demo__viewer ove-three-editor__main">
          <div
            className="ove-three-editor__tabs"
            data-testid="ove-three-panel-tabs"
          >
            <button
              className={activeEditorPanel === "circular" ? "is-active" : ""}
              data-testid="ove-three-tab-circular"
              disabled={!viewOptions.includes("circular")}
              type="button"
              onClick={() => handleEditorPanelChange("circular")}
            >
              Circular Map
            </button>
            <button
              className={activeEditorPanel === "linear" ? "is-active" : ""}
              data-testid="ove-three-tab-linear"
              disabled={!viewOptions.includes("linear")}
              type="button"
              onClick={() => handleEditorPanelChange("linear")}
            >
              Linear Map
            </button>
            <button
              className={activeEditorPanel === "sequence" ? "is-active" : ""}
              data-testid="ove-three-tab-sequence"
              disabled={!viewOptions.includes("row")}
              type="button"
              onClick={() => handleEditorPanelChange("sequence")}
            >
              Sequence Map
            </button>
            <button
              className={activeEditorPanel === "properties" ? "is-active" : ""}
              data-testid="ove-three-tab-properties"
              type="button"
              onClick={() => handleEditorPanelChange("properties")}
            >
              Properties
            </button>
          </div>
          <div className="ove-three-editor__view-options">
            {viewType === "circular" && (
              <div className="ove-three-editor__circular-controls">
                <label>
                  <span>Zoom</span>
                  <input
                    data-testid="demo-circular-zoom"
                    max="2.4"
                    min="0.7"
                    onChange={event =>
                      setCircularZoom(Number(event.target.value))
                    }
                    onInput={event =>
                      setCircularZoom(Number(event.target.value))
                    }
                    step="0.1"
                    type="range"
                    value={circularZoom}
                  />
                </label>
                <label>
                  <span>Rotate</span>
                  <input
                    data-testid="demo-circular-rotation"
                    max="359"
                    min="0"
                    onChange={event =>
                      setCircularRotation(Number(event.target.value))
                    }
                    onInput={event =>
                      setCircularRotation(Number(event.target.value))
                    }
                    step="1"
                    type="range"
                    value={circularRotation}
                  />
                </label>
                <span data-testid="demo-circular-control-summary">
                  {circularControlSummary}
                </span>
                <span
                  className="ove-three-editor__layer-summary"
                  data-testid="demo-circular-layer-summary"
                >
                  {circularLayerSummary}
                </span>
                <span
                  className="ove-three-editor__layer-summary"
                  data-testid="demo-circular-view-option-summary"
                >
                  {circularViewOptionSummary}
                </span>
                <div
                  className="ove-three-editor__minimap"
                  data-rotation={String(Math.round(circularRotation))}
                  data-testid="demo-circular-minimap"
                  style={{ "--rotation": `${circularRotation}deg` }}
                >
                  <span style={{ "--zoom": circularZoom }} />
                </div>
                {circularZoom >= 1.8 && (
                  <span
                    className="ove-three-editor__sequence-preview"
                    data-testid="demo-circular-sequence-preview"
                  >
                    Zoomed sequence {sequencePreview}
                  </span>
                )}
              </div>
            )}
            {viewType === "linear" && (
              <div className="ove-three-editor__linear-controls">
                <span
                  className="ove-three-editor__linear-title"
                  data-testid="ove-three-linear-title"
                >
                  {sequenceData.name} · {sequenceData.sequence.length} bp
                </span>
                <label>
                  <span>Linear zoom</span>
                  <input
                    data-testid="demo-linear-zoom"
                    max="2.4"
                    min="0.7"
                    onChange={event =>
                      setLinearZoom(Number(event.target.value))
                    }
                    onInput={event => setLinearZoom(Number(event.target.value))}
                    step="0.1"
                    type="range"
                    value={linearZoom}
                  />
                </label>
                <span data-testid="demo-linear-control-summary">
                  {linearControlSummary}
                </span>
                <span
                  className="ove-three-editor__fit-summary"
                  data-testid="ove-three-linear-fit-summary"
                >
                  {linearFitSummary}
                </span>
              </div>
            )}
            {viewType === "row" && (
              <div className="ove-three-editor__row-controls">
                <label>
                  <span>Case</span>
                  <select
                    data-testid="demo-row-case"
                    value={rowSequenceCase}
                    onChange={event => setRowSequenceCase(event.target.value)}
                  >
                    <option value="raw">Raw</option>
                    <option value="upper">Uppercase</option>
                    <option value="lower">Lowercase</option>
                  </select>
                </label>
                <label>
                  <span>Spacing</span>
                  <input
                    data-testid="demo-row-base-spacing"
                    max="1.6"
                    min="0.8"
                    onChange={event =>
                      setRowBaseSpacing(Number(event.target.value))
                    }
                    onInput={event =>
                      setRowBaseSpacing(Number(event.target.value))
                    }
                    step="0.1"
                    type="range"
                    value={rowBaseSpacing}
                  />
                </label>
                <label>
                  <input
                    data-testid="demo-row-reverse"
                    type="checkbox"
                    checked={reverseRowSequence}
                    onChange={event =>
                      setReverseRowSequence(event.target.checked)
                    }
                  />
                  Reverse
                </label>
                <label>
                  <input
                    data-testid="demo-row-strand-hints"
                    type="checkbox"
                    checked={showRowStrandHints}
                    onChange={event =>
                      setShowRowStrandHints(event.target.checked)
                    }
                  />
                  5'/3'
                </label>
                <label>
                  <input
                    data-testid="demo-row-base-colors"
                    type="checkbox"
                    checked={showDnaBaseColors}
                    onChange={event =>
                      setShowDnaBaseColors(event.target.checked)
                    }
                  />
                  Base colors
                </label>
                <label>
                  <input
                    data-testid="demo-row-warnings"
                    type="checkbox"
                    checked={showRowWarnings}
                    onChange={event => setShowRowWarnings(event.target.checked)}
                  />
                  Warnings
                </label>
                <label>
                  <input
                    data-testid="demo-row-chromatogram"
                    type="checkbox"
                    checked={showRowChromatogram}
                    onChange={event =>
                      setShowRowChromatogram(event.target.checked)
                    }
                  />
                  Chromatogram
                </label>
                <label>
                  <span>AA color</span>
                  <select
                    data-testid="demo-row-aa-color-mode"
                    value={aminoAcidColorMode}
                    onChange={event =>
                      setAminoAcidColorMode(event.target.value)
                    }
                  >
                    <option value="family">Family</option>
                    <option value="hydrophobicity">Hydrophobicity</option>
                  </select>
                </label>
                <button
                  data-testid="demo-row-jump-start"
                  type="button"
                  onClick={() => handleRowJump(0)}
                >
                  Jump Start
                </button>
                <button
                  data-testid="demo-row-jump-end"
                  type="button"
                  onClick={() =>
                    handleRowJump(Math.max(0, sequenceData.sequence.length - 1))
                  }
                >
                  Jump End
                </button>
                <span data-testid="demo-row-control-summary">
                  {rowControlSummary}
                </span>
              </div>
            )}
          </div>
          <div className="ove-three-editor__canvas" ref={viewerRef}>
            {activePanelClosed ? (
              <div
                className="ove-three-editor__closed-panel"
                data-testid="ove-three-closed-panel"
              >
                <strong>{activeEditorPanel} panel closed</strong>
                <button
                  data-testid="ove-three-reopen-panels"
                  type="button"
                  onClick={handleReopenPanels}
                >
                  Reopen panels
                </button>
              </div>
            ) : activeEditorPanel === "properties" ? (
              <div
                className="ove-three-editor__properties-panel"
                data-testid="ove-three-properties-panel"
              >
                <h2>Properties</h2>
                <dl>
                  <div>
                    <dt>Name</dt>
                    <dd data-testid="ove-three-property-name">
                      {sequenceData.name}
                    </dd>
                  </div>
                  <div>
                    <dt>Type</dt>
                    <dd data-testid="ove-three-property-type">
                      {getSequenceKind(sequenceData)}
                    </dd>
                  </div>
                  <div>
                    <dt>Description</dt>
                    <dd>{sequenceData.description || "No description"}</dd>
                  </div>
                  <div>
                    <dt>Circularity</dt>
                    <dd>{sequenceData.circular ? "Circular" : "Linear"}</dd>
                  </div>
                </dl>
                {selectedAnnotation && (
                  <div data-testid="ove-three-annotation-properties">
                    <h3>{selectedAnnotation.displayName}</h3>
                    <p>{selectedAnnotation.annotationType}</p>
                    <p>{getAnnotationRange(selectedAnnotation)}</p>
                  </div>
                )}
                <div data-testid="ove-three-properties-counts">
                  Features {(sequenceData.features || []).length} · Parts{" "}
                  {(sequenceData.parts || []).length} · Primers{" "}
                  {(sequenceData.primers || []).length} · Cutsites{" "}
                  {(sequenceData.cutsites || []).length} · ORFs{" "}
                  {(sequenceData.orfs || []).length} · Translations{" "}
                  {(sequenceData.translations || []).length}
                </div>
              </div>
            ) : activeEditorPanel === "genbank" ? (
              <pre
                className="ove-three-editor__genbank-panel"
                data-testid="ove-three-genbank-view"
              >
                {genbankText}
              </pre>
            ) : previewMode ? (
              <div
                className="ove-three-editor__preview-panel"
                data-testid="ove-three-preview-panel"
              >
                <h2>{sequenceData.name}</h2>
                <p>{sequenceData.sequence.length} bp preview</p>
                <button
                  data-testid="ove-three-open-editor"
                  type="button"
                  onClick={() => {
                    setPreviewMode(false);
                    setLastEvent("open editor");
                  }}
                >
                  Open Editor
                </button>
              </div>
            ) : shouldShowLinkedMap ? (
              <div
                className={`ove-three-linked-map${
                  isLinkedSequenceCollapsed ? " is-sequence-collapsed" : ""
                }`}
                data-testid="ove-three-linked-map-layout"
              >
                <section
                  className="ove-three-linked-map__pane"
                  data-testid={`ove-three-linked-${linkedPrimaryViewType}-pane`}
                >
                  <div className="ove-three-linked-map__pane-title">
                    {linkedPrimaryTitle}
                  </div>
                  <ThreeDGeneViewer
                    {...sharedViewerProps}
                    className="ove-three-linked-map__viewer"
                    viewType={linkedPrimaryViewType}
                    testRegistryId={linkedPrimaryViewType}
                  />
                </section>
                {isLinkedSequenceCollapsed ? (
                  <aside
                    className="ove-three-linked-map__rail"
                    data-testid="ove-three-linked-sequence-rail"
                  >
                    <span>{linkedSecondaryTitle}</span>
                    <button
                      data-testid="ove-three-expand-linked-sequence"
                      type="button"
                      onClick={() => {
                        setIsLinkedSequenceCollapsed(false);
                        setLastEvent("linked sequence map expanded");
                      }}
                    >
                      Expand
                    </button>
                  </aside>
                ) : (
                  <section
                    className="ove-three-linked-map__pane"
                    data-linked-view-type={linkedSecondaryViewType}
                    data-testid="ove-three-linked-sequence-pane"
                  >
                    <div className="ove-three-linked-map__pane-title">
                      <span>{linkedSecondaryTitle}</span>
                      <div
                        className="ove-three-linked-map__switch"
                        aria-label="Linked right view"
                      >
                        <button
                          className={
                            linkedSecondaryViewType === "row" ? "is-active" : ""
                          }
                          data-testid="ove-three-linked-secondary-row"
                          type="button"
                          onClick={() => {
                            setLinkedSecondaryViewType("row");
                            setLastEvent("linked right view sequence");
                          }}
                        >
                          Sequence
                        </button>
                        <button
                          className={
                            linkedSecondaryViewType === "linear"
                              ? "is-active"
                              : ""
                          }
                          data-testid="ove-three-linked-secondary-linear"
                          type="button"
                          onClick={() => {
                            setLinkedSecondaryViewType("linear");
                            setLastEvent("linked right view linear");
                          }}
                        >
                          Linear
                        </button>
                      </div>
                      <button
                        data-testid="ove-three-collapse-linked-sequence"
                        type="button"
                        onClick={() => {
                          setIsLinkedSequenceCollapsed(true);
                          setLastEvent("linked sequence map collapsed");
                        }}
                      >
                        Collapse
                      </button>
                    </div>
                    <ThreeDGeneViewer
                      {...sharedViewerProps}
                      className="ove-three-linked-map__viewer"
                      viewType={linkedSecondaryViewType}
                      rowBasesPerRow={56}
                      rowVisibleRowCount={6}
                      testRegistryId={linkedSecondaryRegistryId}
                    />
                  </section>
                )}
              </div>
            ) : (
              <ThreeDGeneViewer
                {...sharedViewerProps}
                viewType={viewType}
                showSceneStats={showPerformanceStats}
                testRegistryId={viewType}
              />
            )}
            {viewType === "linear" && showGcAaPlot && !activePanelClosed && (
              <div
                className="ove-three-editor__gc-aa-plot"
                data-testid="ove-three-linear-gc-aa-plot"
              >
                GC / AA plot preview
              </div>
            )}
          </div>
        </section>
        <aside className="ove-three-demo__panel">
          <h1>{sequenceData.name}</h1>
          <p data-testid="demo-sequence-summary">
            {sequenceData.sequence.length} bp {getSequenceKind(sequenceData)}
          </p>
          <label className="ove-three-demo__field">
            <span>Fixture</span>
            <select
              data-testid="demo-fixture-select"
              value={fixtureIndex}
              onChange={event => setFixtureIndex(Number(event.target.value))}
            >
              {fixtureList.map((fixture, index) => (
                <option value={index} key={fixture.name}>
                  {fixture.name}
                </option>
              ))}
            </select>
          </label>
          <label className="ove-three-demo__field">
            <span>View</span>
            <select
              data-testid="demo-view-select"
              value={viewType}
              onChange={event => handleViewChange(event.target.value)}
            >
              <option
                value="circular"
                disabled={!viewOptions.includes("circular")}
              >
                Circular
              </option>
              <option value="linear" disabled={!viewOptions.includes("linear")}>
                Linear
              </option>
              <option value="row" disabled={!viewOptions.includes("row")}>
                Row
              </option>
            </select>
          </label>
          <label className="ove-three-demo__toggle">
            <input
              data-testid="demo-linked-sequence-map"
              type="checkbox"
              checked={showLinkedSequenceMap}
              disabled={!viewOptions.includes("row")}
              onChange={event => {
                const shouldShow = event.target.checked;
                setShowLinkedSequenceMap(shouldShow);
                setIsLinkedSequenceCollapsed(false);
                setLastEvent(
                  `linked sequence map ${shouldShow ? "shown" : "hidden"}`
                );
              }}
            />
            Linked Sequence Map
          </label>
          <label className="ove-three-demo__toggle">
            <input
              data-testid="demo-performance-stats"
              type="checkbox"
              checked={showPerformanceStats}
              onChange={event => {
                setShowPerformanceStats(event.target.checked);
                setLastEvent(
                  `performance stats ${event.target.checked ? "shown" : "hidden"}`
                );
              }}
            />
            Performance stats
          </label>
          <section
            className="ove-three-demo__command-status"
            data-testid="ove-three-command-status"
          >
            <h2>Editor Commands</h2>
            <dl>
              <div>
                <dt>Save</dt>
                <dd data-testid="ove-three-save-status">{saveStatus}</dd>
              </div>
              <div>
                <dt>Clipboard</dt>
                <dd data-testid="ove-three-clipboard-status">
                  {clipboardText || "empty"}
                </dd>
              </div>
              <div>
                <dt>Selection</dt>
                <dd data-testid="ove-three-selection-range">
                  {formatRange(currentSelection)}
                </dd>
              </div>
              <div>
                <dt>History</dt>
                <dd data-testid="ove-three-history-status">
                  undo {sequenceHistory.past.length} / redo{" "}
                  {sequenceHistory.future.length}
                </dd>
              </div>
            </dl>
            {lastSerializedExport && (
              <p data-testid="ove-three-serialized-export">
                {lastSerializedExport.format} {lastSerializedExport.byteLength}{" "}
                bytes
              </p>
            )}
            <label className="ove-three-demo__field">
              <span>Find sequence</span>
              <input
                data-testid="ove-three-find-query"
                type="search"
                value={findQuery}
                onChange={event => setFindQuery(event.target.value)}
              />
            </label>
            <div className="ove-three-demo__annotation-tools">
              <button
                data-testid="ove-three-run-find"
                type="button"
                onClick={() => handleCommand("tools.find")}
              >
                Find
              </button>
              <span data-testid="ove-three-find-count">
                {findMatches.length} matches
              </span>
            </div>
            <label className="ove-three-demo__field">
              <span>Go to bp</span>
              <input
                data-testid="ove-three-goto-input"
                min="1"
                type="number"
                value={goToInput}
                onChange={event => setGoToInput(event.target.value)}
              />
            </label>
            <button
              className="ove-three-demo__button"
              data-testid="ove-three-run-goto"
              type="button"
              onClick={() => handleCommand("tools.goTo")}
            >
              Go To
            </button>
          </section>
          <section
            className="ove-three-demo__advanced-tools"
            data-testid="ove-three-advanced-tools"
          >
            <h2>Advanced Tools</h2>
            <label className="ove-three-demo__field">
              <span>Tool</span>
              <select
                data-testid="ove-three-advanced-tool-select"
                value={activeAdvancedToolId}
                onChange={event => setActiveAdvancedToolId(event.target.value)}
              >
                {advancedTools.map(tool => (
                  <option key={tool.id} value={tool.id}>
                    {tool.label}
                  </option>
                ))}
              </select>
            </label>
            <pre data-testid="ove-three-advanced-tool-results">
              {formatAdvancedToolResults(advancedToolResults)}
            </pre>
            <div data-testid="ove-three-version-history-summary">
              {versionHistoryRows.length} version rows
            </div>
          </section>
          <label className="ove-three-demo__toggle">
            <input
              type="checkbox"
              checked={showLabelBoxes}
              onChange={event => setShowLabelBoxes(event.target.checked)}
            />
            Label boxes
          </label>
          <label className="ove-three-demo__toggle">
            <input
              type="checkbox"
              checked={showPickRay}
              onChange={event => setShowPickRay(event.target.checked)}
            />
            Pick debug
          </label>
          <label className="ove-three-demo__toggle">
            <input
              type="checkbox"
              checked={showPointerPosition}
              onChange={event => setShowPointerPosition(event.target.checked)}
            />
            Pointer position
          </label>
          <label className="ove-three-demo__toggle">
            <input
              type="checkbox"
              checked={showSearchHits}
              onChange={event => setShowSearchHits(event.target.checked)}
            />
            Search hits
          </label>
          <label className="ove-three-demo__toggle">
            <input
              type="checkbox"
              checked={showAminoAcidUnitAsCodon}
              onChange={event =>
                setShowAminoAcidUnitAsCodon(event.target.checked)
              }
            />
            Codon display
          </label>
          <label className="ove-three-demo__field">
            <span>Annotations to support</span>
            <select
              data-testid="demo-annotations-to-support"
              value={annotationsToSupport}
              onChange={event => setAnnotationsToSupport(event.target.value)}
            >
              <option value="all">All annotations</option>
              <option value="features-primers">Features + primers</option>
              <option value="features-only">Features only</option>
            </select>
          </label>
          <label className="ove-three-demo__toggle">
            <input
              data-testid="demo-with-part-tags"
              type="checkbox"
              checked={withPartTags}
              onChange={event => setWithPartTags(event.target.checked)}
            />
            Part tags
          </label>
          <label className="ove-three-demo__toggle">
            <input
              data-testid="demo-allow-panel-tab-draggable"
              type="checkbox"
              checked={allowPanelTabDraggable}
              onChange={event =>
                setAllowPanelTabDraggable(event.target.checked)
              }
            />
            Draggable tabs
          </label>
          <label className="ove-three-demo__toggle">
            <input
              data-testid="demo-massage-cmds"
              type="checkbox"
              checked={massageCmds}
              onChange={event => setMassageCmds(event.target.checked)}
            />
            Massage commands
          </label>
          <label className="ove-three-demo__toggle">
            <input
              data-testid="demo-always-allow-save"
              type="checkbox"
              checked={alwaysAllowSave}
              onChange={event => setAlwaysAllowSave(event.target.checked)}
            />
            Always allow save
          </label>
          <label className="ove-three-demo__toggle">
            <input
              data-testid="demo-generate-png"
              type="checkbox"
              checked={generatePng}
              onChange={event => setGeneratePng(event.target.checked)}
            />
            Generate PNG
          </label>
          <p
            className="ove-three-demo__warning"
            data-testid="demo-view-options-smoke-summary"
          >
            {viewOptionsSmokeSummary}
          </p>
          <label className="ove-three-demo__toggle">
            <input
              data-testid="demo-circular-axis"
              type="checkbox"
              checked={showCircularAxis}
              onChange={event => setShowCircularAxis(event.target.checked)}
            />
            Circular axis
          </label>
          <label className="ove-three-demo__toggle">
            <input
              data-testid="demo-circular-axis-numbers"
              type="checkbox"
              checked={showCircularAxisNumbers}
              onChange={event =>
                setShowCircularAxisNumbers(event.target.checked)
              }
            />
            Circular numbers
          </label>
          <label className="ove-three-demo__field">
            <span>Circular label size</span>
            <input
              data-testid="demo-circular-label-size"
              max="1.8"
              min="0.7"
              onChange={event =>
                setCircularLabelScale(Number(event.target.value))
              }
              onInput={event =>
                setCircularLabelScale(Number(event.target.value))
              }
              step="0.1"
              type="range"
              value={circularLabelScale}
            />
          </label>
          <label className="ove-three-demo__field">
            <span>Label line intensity</span>
            <input
              data-testid="demo-circular-label-line-intensity"
              max="1"
              min="0.1"
              onChange={event =>
                setCircularLabelLineIntensity(Number(event.target.value))
              }
              onInput={event =>
                setCircularLabelLineIntensity(Number(event.target.value))
              }
              step="0.05"
              type="range"
              value={circularLabelLineIntensity}
            />
          </label>
          <label className="ove-three-demo__toggle">
            <input
              data-testid="demo-circular-internal-labels"
              type="checkbox"
              checked={showCircularInternalLabels}
              onChange={event =>
                setShowCircularInternalLabels(event.target.checked)
              }
            />
            Circular internal labels
          </label>
          <label className="ove-three-demo__toggle">
            <input
              data-testid="demo-circular-only-overflow-labels"
              type="checkbox"
              checked={onlyShowCircularOverflowLabels}
              onChange={event =>
                setOnlyShowCircularOverflowLabels(event.target.checked)
              }
            />
            Only labels that do not fit
          </label>
          <label className="ove-three-demo__field">
            <span>Cutsite filter</span>
            <input
              data-testid="demo-circular-cutsite-filter"
              type="search"
              value={circularCutsiteFilter}
              onChange={event => setCircularCutsiteFilter(event.target.value)}
              placeholder="EcoRI, HindIII..."
            />
          </label>
          <label className="ove-three-demo__field">
            <span>ORF min size</span>
            <input
              data-testid="demo-circular-orf-min-size"
              min="0"
              type="number"
              value={orfMinSize}
              onChange={event => setOrfMinSize(event.target.value)}
              onInput={event => setOrfMinSize(event.target.value)}
            />
          </label>
          <label className="ove-three-demo__field">
            <span>Annotation limit</span>
            <input
              data-testid="demo-annotation-limit"
              min="1"
              type="number"
              value={annotationLimit}
              onChange={event => setAnnotationLimit(event.target.value)}
              onInput={event => setAnnotationLimit(event.target.value)}
            />
          </label>
          <label className="ove-three-demo__toggle">
            <input
              data-testid="demo-show-gc-aa-plot"
              type="checkbox"
              checked={showGcAaPlot}
              onChange={event => setShowGcAaPlot(event.target.checked)}
            />
            GC / AA plot
          </label>
          <p
            className="ove-three-demo__warning"
            data-testid="demo-circular-warning"
          >
            Annotation display limit {Math.max(1, Number(annotationLimit) || 1)}
          </p>
          <div className="ove-three-demo__layers">
            <h2>Layers</h2>
            <div className="ove-three-demo__annotation-tools">
              <button
                data-testid="demo-show-all-layers"
                type="button"
                onClick={() => handleAllLayersVisible(true)}
              >
                Show All
              </button>
              <button
                data-testid="demo-hide-all-layers"
                type="button"
                onClick={() => handleAllLayersVisible(false)}
              >
                Hide All
              </button>
            </div>
            {layerControls.map(layer => (
              <label className="ove-three-demo__toggle" key={layer.key}>
                <input
                  data-testid={`demo-layer-${layer.key}`}
                  type="checkbox"
                  checked={effectiveAnnotationVisibility[layer.key] !== false}
                  onChange={event =>
                    handleLayerToggle(layer, event.target.checked)
                  }
                />
                {layer.label}
              </label>
            ))}
          </div>
          <button
            className="ove-three-demo__button"
            data-testid="demo-export-png"
            type="button"
            onClick={handleExportPng}
          >
            Export PNG
          </button>
          <div className="ove-three-demo__verification">
            <div>
              <span>Scene rebuild</span>
              <strong data-testid="demo-rebuild-status">
                {sequenceData.name}
              </strong>
            </div>
            <div>
              <span>PNG export</span>
              <strong data-testid="demo-export-status">
                {lastExport
                  ? `${Math.round(lastExport.byteLength / 1024)} KB ready`
                  : "not exported"}
              </strong>
            </div>
            <div>
              <span>Performance target</span>
              <strong>60 FPS small / 30 FPS stress</strong>
            </div>
          </div>
          <div className="ove-three-demo__features">
            <h2>Annotations</h2>
            <label className="ove-three-demo__search">
              <span>Search annotations</span>
              <input
                data-testid="demo-annotation-search"
                type="search"
                value={annotationSearch}
                onChange={event => setAnnotationSearch(event.target.value)}
                placeholder="Name, type, range..."
              />
            </label>
            <div className="ove-three-demo__annotation-tools">
              <span data-testid="demo-annotation-result-count">
                {annotationResultLabel}
              </span>
              <button
                data-testid="demo-prev-annotation"
                type="button"
                disabled={!visibleAnnotationItems.length}
                onClick={() => handleStepAnnotation(-1)}
              >
                Previous
              </button>
              <button
                data-testid="demo-next-annotation"
                type="button"
                disabled={!visibleAnnotationItems.length}
                onClick={() => handleStepAnnotation(1)}
              >
                Next
              </button>
              <button
                data-testid="demo-reset-annotation-search"
                type="button"
                disabled={!annotationSearch}
                onClick={handleResetAnnotationSearch}
              >
                Reset
              </button>
            </div>
            {annotationGroups.map(group => {
              const groupItems = visibleAnnotationItems.filter(
                annotation => annotation.annotationType === group.key
              );
              if (!groupItems.length) return null;

              return (
                <section
                  className="ove-three-demo__annotation-group"
                  key={group.key}
                >
                  <h3>{group.label}</h3>
                  {groupItems.map(annotation => (
                    <button
                      className={`ove-three-demo__feature${
                        selectedAnnotation?.id === annotation.id
                          ? " is-selected"
                          : ""
                      }`}
                      data-testid={`demo-annotation-${toTestId(annotation.id)}`}
                      key={annotation.id}
                      type="button"
                      onClick={() => handleAnnotationFocus(annotation)}
                    >
                      <span
                        className="ove-three-demo__swatch"
                        style={{ background: annotation.color }}
                      />
                      <span>{annotation.displayName}</span>
                      <span className="ove-three-demo__range">
                        {getAnnotationRange(annotation)}
                      </span>
                    </button>
                  ))}
                </section>
              );
            })}
            {!visibleAnnotationItems.length && (
              <p className="ove-three-demo__empty">No annotations match.</p>
            )}
          </div>
          {selectedAnnotation && (
            <section
              className="ove-three-demo__selected-card"
              data-testid="demo-selected-annotation-card"
            >
              <h2>Selected</h2>
              <p data-testid="demo-selected-annotation">
                {selectedAnnotation.displayName || selectedAnnotation.name}
              </p>
              <dl>
                <div>
                  <dt>Type</dt>
                  <dd data-testid="demo-selected-annotation-type">
                    {selectedAnnotation.annotationType}
                  </dd>
                </div>
                <div>
                  <dt>Range</dt>
                  <dd>{getAnnotationRange(selectedAnnotation)}</dd>
                </div>
                <div>
                  <dt>Length</dt>
                  <dd data-testid="demo-selected-annotation-length">
                    {getAnnotationLength(selectedAnnotation)} bp
                  </dd>
                </div>
              </dl>
              <div className="ove-three-demo__selected-actions">
                <button
                  data-testid="demo-selected-focus"
                  type="button"
                  onClick={() => handleAnnotationFocus(selectedAnnotation)}
                >
                  Focus again
                </button>
                <button
                  data-testid="demo-clear-selection"
                  type="button"
                  onClick={handleClearSelection}
                >
                  Clear
                </button>
              </div>
            </section>
          )}
          <section className="ove-three-demo__recent">
            <div className="ove-three-demo__recent-header">
              <h2>Recent selections</h2>
              <button
                data-testid="demo-clear-recent-annotations"
                type="button"
                disabled={!recentAnnotations.length}
                onClick={handleClearRecentAnnotations}
              >
                Clear
              </button>
            </div>
            {recentAnnotations.length ? (
              recentAnnotations.map(annotation => (
                <button
                  className={`ove-three-demo__recent-item${
                    selectedAnnotation?.id === annotation.id
                      ? " is-selected"
                      : ""
                  }`}
                  data-testid={`demo-recent-annotation-${toTestId(
                    annotation.id
                  )}`}
                  key={annotation.id}
                  type="button"
                  onClick={() => handleAnnotationFocus(annotation)}
                >
                  <span>{annotation.displayName}</span>
                  <span>{getAnnotationRange(annotation)}</span>
                </button>
              ))
            ) : (
              <p data-testid="demo-recent-empty">No recent selections</p>
            )}
          </section>
          <p data-testid="demo-last-event">Last event: {lastEvent}</p>
        </aside>
      </div>
      <footer
        className="ove-three-editor__status-bar"
        data-testid="ove-three-status-bar"
      >
        <span>
          {sequenceData.isProtein
            ? "Protein"
            : sequenceData.isRna
              ? "RNA"
              : "DNA"}
        </span>
        <select
          aria-label="Edit mode"
          data-testid="ove-three-edit-mode"
          onChange={event => setReadOnly(event.target.value === "readOnly")}
          value={readOnly ? "readOnly" : "editable"}
        >
          <option value="editable">Editable</option>
          <option value="readOnly">Read Only</option>
        </select>
        <span>{sequenceData.circular ? "Circular" : "Linear"}</span>
        <select
          aria-label="Availability"
          onChange={event =>
            setMateriallyAvailable(event.target.value === "available")
          }
          value={materiallyAvailable ? "available" : "unavailable"}
        >
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
        </select>
        <span>{selectionStatus}</span>
        <button
          data-testid="ove-three-status-select-inverse"
          disabled={!isCommandEnabled("edit.selectInverse", commandState)}
          type="button"
          onClick={() => handleCommand("edit.selectInverse")}
        >
          Select Inverse
        </button>
        <span>Length: {sequenceData.sequence.length} bps</span>
      </footer>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<DemoApp />);

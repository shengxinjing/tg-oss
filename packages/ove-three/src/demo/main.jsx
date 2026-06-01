import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { exportCanvasPng, ThreeDGeneViewer } from "../index";
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

function getViewOptions(sequenceData) {
  if (sequenceData.circular === false) return ["linear", "row"];
  return ["circular", "linear", "row"];
}

function getPreferredView(sequenceData) {
  if (sequenceData.circular === false) {
    return sequenceData.sequence.length > 10000 ? "row" : "linear";
  }

  return "circular";
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

function toTestId(value) {
  return String(value || "item")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function setLayerVisible(currentVisibility, key, visible) {
  const nextVisibility = { ...currentVisibility };
  if (visible) {
    delete nextVisibility[key];
  } else {
    nextVisibility[key] = false;
  }
  return nextVisibility;
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

function DemoApp() {
  const viewerRef = useRef(null);
  const [fixtureIndex, setFixtureIndex] = useState(1);
  const sequenceData = fixtureList[fixtureIndex];
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
  const [showAminoAcidUnitAsCodon, setShowAminoAcidUnitAsCodon] =
    useState(false);
  const [annotationVisibility, setAnnotationVisibility] = useState({});
  const [annotationSearch, setAnnotationSearch] = useState("");
  const [focusRange, setFocusRange] = useState(null);
  const [viewType, setViewType] = useState("circular");
  const searchRanges = useMemo(() => {
    const midpoint = Math.max(0, Math.floor(sequenceData.sequence.length / 2));
    return [
      {
        start: midpoint,
        end: Math.min(midpoint + 32, sequenceData.sequence.length - 1)
      }
    ];
  }, [sequenceData]);

  useEffect(() => {
    setSelectedAnnotation(null);
    setRecentAnnotations([]);
    setFocusRange(null);
    setAnnotationVisibility({});
    setAnnotationSearch("");
    setLastEvent("fixture changed");
    setLastExport(null);
    setViewType(currentViewType =>
      viewOptions.includes(currentViewType)
        ? currentViewType
        : getPreferredView(sequenceData)
    );
  }, [sequenceData, viewOptions]);

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
      setLayerVisible(currentVisibility, layer.key, visible)
    );
    if (!visible && selectedAnnotation?.annotationType === layer.key) {
      setSelectedAnnotation(null);
      setFocusRange(null);
    }
    setLastEvent(`${layer.key} ${visible ? "shown" : "hidden"}`);
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
  const handleViewChange = nextViewType => {
    setViewType(nextViewType);
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
  const annotationSearchQuery = annotationSearch.trim().toLowerCase();
  const visibleAnnotationItems = annotationItems.filter(annotation => {
    if (annotationVisibility[annotation.annotationType] === false) return false;
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

  return (
    <main className="ove-three-demo">
      <section className="ove-three-demo__viewer" ref={viewerRef}>
        <ThreeDGeneViewer
          sequenceData={sequenceData}
          viewType={viewType}
          onSelectRange={handleSelectRange}
          onDoubleClickRange={annotation =>
            setLastEvent(`double-click ${annotation.id}`)
          }
          onContextMenuRange={annotation =>
            setLastEvent(`right-click ${annotation.id}`)
          }
          onBackgroundContextMenu={() => setLastEvent("right-click background")}
          onCaretPositionChange={position =>
            setLastEvent(`caret ${position + 1}`)
          }
          onSelectionChange={selection =>
            setLastEvent(
              `selection ${selection.start + 1}-${selection.end + 1}`
            )
          }
          annotationVisibility={annotationVisibility}
          focusedAnnotationId={selectedAnnotation?.id ?? null}
          focusRange={focusRange}
          showSceneStats
          showLabelBoxes={showLabelBoxes}
          showPickRay={showPickRay}
          showPointerPosition={showPointerPosition}
          showAminoAcidUnitAsCodon={showAminoAcidUnitAsCodon}
          searchRanges={showSearchHits ? searchRanges : []}
          maxDpr={1.5}
          preserveDrawingBuffer
        />
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
        <div className="ove-three-demo__layers">
          <h2>Layers</h2>
          {layerControls.map(layer => (
            <label className="ove-three-demo__toggle" key={layer.key}>
              <input
                data-testid={`demo-layer-${layer.key}`}
                type="checkbox"
                checked={annotationVisibility[layer.key] !== false}
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
                  selectedAnnotation?.id === annotation.id ? " is-selected" : ""
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
    </main>
  );
}

createRoot(document.getElementById("root")).render(<DemoApp />);

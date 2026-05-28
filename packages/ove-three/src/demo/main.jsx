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

function getFeatureRange(feature) {
  return `${feature.start + 1}-${feature.end + 1}`;
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

function DemoApp() {
  const viewerRef = useRef(null);
  const [fixtureIndex, setFixtureIndex] = useState(1);
  const sequenceData = fixtureList[fixtureIndex];
  const viewOptions = useMemo(
    () => getViewOptions(sequenceData),
    [sequenceData]
  );
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [lastEvent, setLastEvent] = useState("none");
  const [lastExport, setLastExport] = useState(null);
  const [showLabelBoxes, setShowLabelBoxes] = useState(false);
  const [showPickRay, setShowPickRay] = useState(false);
  const [showPointerPosition, setShowPointerPosition] = useState(false);
  const [showSearchHits, setShowSearchHits] = useState(false);
  const [showAminoAcidUnitAsCodon, setShowAminoAcidUnitAsCodon] =
    useState(false);
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
    setSelectedFeature(null);
    setLastEvent("fixture changed");
    setLastExport(null);
    setViewType(currentViewType =>
      viewOptions.includes(currentViewType)
        ? currentViewType
        : getPreferredView(sequenceData)
    );
  }, [sequenceData, viewOptions]);

  const handleSelectRange = annotation => {
    setSelectedFeature(annotation);
    setLastEvent(`click ${annotation.id}`);
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
            onChange={event => setViewType(event.target.value)}
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
          {(sequenceData.features || []).map(feature => (
            <div className="ove-three-demo__feature" key={feature.id}>
              <span
                className="ove-three-demo__swatch"
                style={{ background: feature.color }}
              />
              <span>{feature.name}</span>
              <span className="ove-three-demo__range">
                {getFeatureRange(feature)}
              </span>
            </div>
          ))}
        </div>
        {selectedFeature && (
          <p>
            Selected: {selectedFeature.name} ({selectedFeature.start + 1}-
            {selectedFeature.end + 1})
          </p>
        )}
        <p data-testid="demo-last-event">Last event: {lastEvent}</p>
      </aside>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<DemoApp />);

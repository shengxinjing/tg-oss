import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { ThreeDGeneViewer } from "../index";
import demoSequenceData from "./demoSequenceData";
import "../style.css";

function DemoApp() {
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [lastEvent, setLastEvent] = useState("none");
  const [showLabelBoxes, setShowLabelBoxes] = useState(false);
  const [showPickRay, setShowPickRay] = useState(false);
  const [showPointerPosition, setShowPointerPosition] = useState(false);
  const handleSelectRange = annotation => {
    setSelectedFeature(annotation);
    setLastEvent(`click ${annotation.id}`);
  };

  return (
    <main className="ove-three-demo">
      <section className="ove-three-demo__viewer">
        <ThreeDGeneViewer
          sequenceData={demoSequenceData}
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
        />
      </section>
      <aside className="ove-three-demo__panel">
        <h1>{demoSequenceData.name}</h1>
        <p>{demoSequenceData.sequence.length} bp circular DNA</p>
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
        <div className="ove-three-demo__features">
          {demoSequenceData.features.map(feature => (
            <div className="ove-three-demo__feature" key={feature.id}>
              <span
                className="ove-three-demo__swatch"
                style={{ background: feature.color }}
              />
              <span>{feature.name}</span>
              <span className="ove-three-demo__range">
                {feature.start + 1}-{feature.end + 1}
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
        <p>Last event: {lastEvent}</p>
      </aside>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<DemoApp />);

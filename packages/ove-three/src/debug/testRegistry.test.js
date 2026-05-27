import assert from "assert";
import {
  buildAnnotationRegistryEntries,
  buildLabelRegistryEntries,
  countOverlappingLabelBoxes,
  createRegistrySnapshot,
  projectRegistryEntries
} from "./testRegistry";

const sceneModel = {
  sequenceLength: 1000,
  annotations: [
    {
      id: "feature-1",
      name: "Feature 1",
      annotationType: "feature",
      start: 100,
      end: 199,
      segments: [
        {
          start: 100,
          end: 199,
          startAngle: Math.PI / 2,
          endAngle: Math.PI,
          totalAngle: Math.PI / 2
        }
      ]
    },
    {
      id: "cutsite-1",
      name: "EcoRI",
      annotationType: "cutsite",
      start: 240,
      end: 245,
      segments: [
        {
          start: 240,
          end: 245,
          startAngle: Math.PI,
          endAngle: Math.PI + 0.04,
          totalAngle: 0.04
        }
      ]
    },
    {
      id: "primer-1",
      name: "Reverse Primer",
      annotationType: "primer",
      start: 400,
      end: 430,
      forward: false,
      segments: [
        {
          start: 400,
          end: 430,
          startAngle: Math.PI * 1.5,
          endAngle: Math.PI * 1.6,
          totalAngle: Math.PI * 0.1
        }
      ]
    },
    {
      id: "orf-1",
      name: "ORF frame 5",
      annotationType: "orf",
      start: 520,
      end: 820,
      frame: 5,
      forward: false,
      segments: [
        {
          start: 520,
          end: 820,
          startAngle: Math.PI * 1.7,
          endAngle: Math.PI * 1.9,
          totalAngle: Math.PI * 0.2
        }
      ]
    }
  ]
};

describe("testRegistry", () => {
  it("builds annotation entries keyed by id and name", () => {
    const entries = buildAnnotationRegistryEntries(sceneModel, {
      selectedAnnotationId: "feature-1",
      hoveredAnnotationId: "feature-1"
    });
    const snapshot = createRegistrySnapshot({
      annotations: entries,
      selectedAnnotationId: "feature-1",
      hoveredAnnotationId: "feature-1"
    });

    assert.equal(snapshot.annotations["feature-1"].annotationId, "feature-1");
    assert.equal(snapshot.annotationNames["Feature 1"], "feature-1");
    assert.equal(snapshot.annotationNames.EcoRI, "cutsite-1");
    assert.equal(snapshot.annotations["feature-1"].annotationType, "feature");
    assert.equal(snapshot.annotations["feature-1"].selected, true);
    assert.equal(snapshot.annotations["feature-1"].hovered, true);
    assert.equal(snapshot.selectedAnnotationId, "feature-1");
    assert.equal(snapshot.hoveredAnnotationId, "feature-1");
  });

  it("exposes primer direction and ORF frame metadata for canvas tests", () => {
    const entries = buildAnnotationRegistryEntries(sceneModel);
    const snapshot = createRegistrySnapshot({ annotations: entries });

    assert.equal(snapshot.annotations["primer-1"].direction, "reverse");
    assert.equal(snapshot.annotations["orf-1"].frame, 5);
    assert.equal(snapshot.annotations["orf-1"].direction, "reverse");
    assert.equal(snapshot.annotations["orf-1"].color, "#facc15");
  });

  it("builds label entries and reports overlap counts", () => {
    const labels = buildLabelRegistryEntries({
      sceneModel,
      selectedAnnotationId: "feature-1"
    });
    const snapshot = createRegistrySnapshot({ labels });

    assert.equal(snapshot.labels["feature-1"].selected, true);
    assert.equal(snapshot.labelNames["Feature 1"], "feature-1");
    assert.equal(countOverlappingLabelBoxes(labels), 0);
  });

  it("projects registry entries into canvas-relative coordinates", () => {
    const entries = [
      {
        id: "feature-1",
        worldPosition: [0, 0, 0]
      }
    ];

    const projected = projectRegistryEntries(entries, () => ({
      x: 320,
      y: 180,
      clientX: 340,
      clientY: 210
    }));

    assert.equal(projected[0].x, 320);
    assert.equal(projected[0].y, 180);
    assert.equal(projected[0].clientX, 340);
    assert.equal(projected[0].clientY, 210);
  });
});

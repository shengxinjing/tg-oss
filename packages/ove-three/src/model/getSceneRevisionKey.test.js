import assert from "assert";
import getSceneRevisionKey from "./getSceneRevisionKey";

describe("getSceneRevisionKey", () => {
  it("changes when imported sequence content changes", () => {
    const first = getSceneRevisionKey({
      sequenceData: {
        name: "first",
        sequence: "atgc",
        circular: true,
        features: [{ id: "feature-a", start: 0, end: 1 }]
      }
    });
    const second = getSceneRevisionKey({
      sequenceData: {
        name: "second",
        sequence: "atgcatgc",
        circular: true,
        features: [{ id: "feature-a", start: 0, end: 1 }]
      }
    });

    assert.notEqual(first, second);
  });

  it("changes when imported content changes but length stays the same", () => {
    const first = getSceneRevisionKey({
      sequenceData: {
        name: "same-length",
        sequence: "a".repeat(120)
      }
    });
    const second = getSceneRevisionKey({
      sequenceData: {
        name: "same-length",
        sequence: `${"a".repeat(60)}t${"a".repeat(59)}`
      }
    });

    assert.notEqual(first, second);
  });

  it("changes when annotation ids or visibility options change", () => {
    const base = getSceneRevisionKey({
      sequenceData: {
        sequence: "atgc",
        features: [{ id: "feature-a", start: 0, end: 1 }]
      },
      annotationVisibility: { features: true }
    });
    const next = getSceneRevisionKey({
      sequenceData: {
        sequence: "atgc",
        features: [{ id: "feature-b", start: 0, end: 1 }]
      },
      annotationVisibility: { features: false }
    });

    assert.notEqual(base, next);
  });

  it("supports OVE annotation maps", () => {
    const first = getSceneRevisionKey({
      sequenceData: {
        sequence: "atgc",
        features: {
          "feature-a": { id: "feature-a", start: 0, end: 1 }
        }
      }
    });
    const next = getSceneRevisionKey({
      sequenceData: {
        sequence: "atgc",
        features: {
          "feature-b": { id: "feature-b", start: 0, end: 1 }
        }
      }
    });

    assert.notEqual(first, next);
  });
});

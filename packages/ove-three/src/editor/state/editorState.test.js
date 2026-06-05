import { describe, expect, it } from "bun:test";
import {
  createEditorState,
  getEditorPanelForView,
  getPreferredView,
  getViewOptions,
  setAllAnnotationLayersVisible,
  setAnnotationLayerVisible,
  resolveEditorViewState
} from "./editorState";

describe("ove-three editor state", () => {
  const circularSequence = {
    name: "small_circular",
    circular: true,
    sequence: "ATGC".repeat(200)
  };
  const largeLinearSequence = {
    name: "large_linear",
    circular: false,
    sequence: "ATGC".repeat(4000)
  };

  it("keeps circular, linear, and row views available for circular DNA", () => {
    expect(getViewOptions(circularSequence)).toEqual([
      "circular",
      "linear",
      "row"
    ]);
    expect(getPreferredView(circularSequence)).toBe("circular");
    expect(getEditorPanelForView("row")).toBe("sequence");
  });

  it("prefers row view for large linear stress data", () => {
    expect(getViewOptions(largeLinearSequence)).toEqual(["linear", "row"]);
    expect(getPreferredView(largeLinearSequence)).toBe("row");
  });

  it("resolves unsupported views when the fixture changes", () => {
    expect(
      resolveEditorViewState({
        currentViewType: "circular",
        sequenceData: largeLinearSequence
      })
    ).toEqual({
      viewType: "row",
      activeEditorPanel: "sequence"
    });
  });

  it("creates a compact editor state for the demo shell", () => {
    expect(createEditorState(circularSequence)).toMatchObject({
      viewType: "circular",
      activeEditorPanel: "circular",
      readOnly: false,
      materiallyAvailable: true
    });
  });

  it("can show or hide all annotation layers for view options", () => {
    expect(setAllAnnotationLayersVisible(false)).toEqual({
      feature: false,
      part: false,
      primer: false,
      cutsite: false,
      orf: false,
      translation: false
    });
    expect(setAllAnnotationLayersVisible(true)).toEqual({});
  });

  it("keeps individual annotation layer visibility changes minimal", () => {
    expect(setAnnotationLayerVisible({}, "primer", false)).toEqual({
      primer: false
    });
    expect(
      setAnnotationLayerVisible(
        {
          primer: false,
          feature: false
        },
        "primer",
        true
      )
    ).toEqual({
      feature: false
    });
  });
});

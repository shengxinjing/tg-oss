import assert from "assert";
import mapOvePropsToThreeRowProps from "./mapOvePropsToThreeRowProps";

describe("mapOvePropsToThreeRowProps", () => {
  it("maps OVE props into a row Three viewer payload", () => {
    const props = mapOvePropsToThreeRowProps({
      sequenceData: {
        sequence: "atgc",
        circular: false,
        isProtein: true,
        cutsites: [{ id: "cutsite-1", start: 1, end: 1 }],
        translations: [{ id: "translation-1", start: 0, end: 2 }]
      },
      searchLayers: [{ start: 1, end: 2 }]
    });

    assert.equal(props.viewType, "row");
    assert.equal(props.mode, "protein");
    assert.equal(props.sequenceData.sequence, "atgc");
    assert.equal(props.sequenceData.cutsites.length, 1);
    assert.equal(props.sequenceData.translations.length, 1);
    assert.deepEqual(props.searchRanges, [{ start: 1, end: 2 }]);
  });

  it("uses RNA mode for RNA sequences", () => {
    const props = mapOvePropsToThreeRowProps({
      sequenceData: { sequence: "augc", circular: false, isRna: true }
    });

    assert.equal(props.mode, "rna");
  });

  it("routes caret and selection updates back to OVE callbacks", () => {
    let caret;
    let selection;
    const props = mapOvePropsToThreeRowProps({
      sequenceData: { sequence: "atgc", circular: false },
      caretPositionUpdate: value => {
        caret = value;
      },
      selectionLayerUpdate: value => {
        selection = value;
      }
    });

    props.onCaretPositionChange(2);
    props.onSelectionChange({ start: 1, end: 3 });

    assert.equal(caret, 2);
    assert.deepEqual(selection, { start: 1, end: 3, isFromRowView: true });
  });

  it("routes row cutsite and translation events to OVE callbacks", () => {
    const calls = [];
    const props = mapOvePropsToThreeRowProps({
      sequenceData: { sequence: "atgaaataa", circular: false },
      cutsiteClicked: ({ annotation }) =>
        calls.push(`cutsite:${annotation.id}`),
      cutsiteRightClicked: ({ annotation }) =>
        calls.push(`cutsite-menu:${annotation.id}`),
      translationClicked: ({ annotation }) =>
        calls.push(`translation:${annotation.id}`),
      translationDoubleClicked: ({ annotation }) =>
        calls.push(`translation-double:${annotation.id}`),
      translationRightClicked: ({ annotation }) =>
        calls.push(`translation-menu:${annotation.id}`)
    });

    props.onSelectRange({ id: "cutsite-1", annotationType: "cutsite" });
    props.onContextMenuRange(
      { id: "cutsite-1", annotationType: "cutsite" },
      {}
    );
    props.onSelectRange({
      id: "translation-1",
      annotationType: "translation"
    });
    props.onDoubleClickRange(
      { id: "translation-1", annotationType: "translation" },
      {}
    );
    props.onContextMenuRange(
      { id: "translation-1", annotationType: "translation" },
      {}
    );

    assert.deepEqual(calls, [
      "cutsite:cutsite-1",
      "cutsite-menu:cutsite-1",
      "translation:translation-1",
      "translation-double:translation-1",
      "translation-menu:translation-1"
    ]);
  });
});

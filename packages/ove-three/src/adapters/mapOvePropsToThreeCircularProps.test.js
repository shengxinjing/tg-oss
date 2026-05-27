import assert from "assert";
import mapOvePropsToThreeCircularProps from "./mapOvePropsToThreeCircularProps";

describe("mapOvePropsToThreeCircularProps", () => {
  it("routes feature clicks back to OVE callback shape", () => {
    let received;
    const props = mapOvePropsToThreeCircularProps({
      sequenceData: { sequence: "atgc", circular: true },
      featureClicked: value => {
        received = value;
      }
    });
    const annotation = { id: "feature-1", annotationType: "feature" };
    const event = {
      nativeEvent: {
        type: "click",
        target: { closest: () => null }
      }
    };

    props.onSelectRange(annotation, { kind: "annotation" }, event);

    assert.equal(received.annotation, annotation);
    assert.equal(received.event, event.nativeEvent);
    assert.equal(typeof received.event.persist, "function");
    assert.deepEqual(received.userData, { kind: "annotation" });
  });

  it("maps protein sequence data to protein mode", () => {
    const props = mapOvePropsToThreeCircularProps({
      sequenceData: { sequence: "AAAKKK", circular: true, isProtein: true }
    });

    assert.equal(props.mode, "protein");
  });

  it("maps RNA sequence data to RNA mode", () => {
    const props = mapOvePropsToThreeCircularProps({
      sequenceData: { sequence: "augc", circular: true, isRna: true }
    });

    assert.equal(props.mode, "rna");
  });

  it("routes feature context menus to OVE right-click handlers", () => {
    let received;
    const props = mapOvePropsToThreeCircularProps({
      sequenceData: { sequence: "atgc", circular: true },
      featureRightClicked: value => {
        received = value;
      }
    });
    const annotation = { id: "feature-1", annotationType: "feature" };
    const event = {
      nativeEvent: {
        type: "contextmenu",
        target: { closest: () => null }
      }
    };

    props.onContextMenuRange(annotation, {
      userData: { kind: "annotation" },
      originalEvent: event
    });

    assert.equal(received.annotation, annotation);
    assert.equal(received.event, event.nativeEvent);
    assert.equal(typeof received.event.persist, "function");
    assert.deepEqual(received.userData, { kind: "annotation" });
  });
});

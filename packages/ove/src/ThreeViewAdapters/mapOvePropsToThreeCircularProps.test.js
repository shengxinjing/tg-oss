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
    const event = { type: "click" };

    props.onSelectRange(annotation, { kind: "annotation" }, event);

    assert.equal(received.annotation, annotation);
    assert.equal(received.event, event);
    assert.deepEqual(received.userData, { kind: "annotation" });
  });

  it("maps protein sequence data to protein mode", () => {
    const props = mapOvePropsToThreeCircularProps({
      sequenceData: { sequence: "AAAKKK", circular: true, isProtein: true }
    });

    assert.equal(props.mode, "protein");
  });
});

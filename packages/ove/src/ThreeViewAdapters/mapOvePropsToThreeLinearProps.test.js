import assert from "assert";
import mapOvePropsToThreeLinearProps from "./mapOvePropsToThreeLinearProps";

describe("mapOvePropsToThreeLinearProps", () => {
  it("maps OVE props into a linear Three viewer payload", () => {
    const props = mapOvePropsToThreeLinearProps({
      sequenceData: { sequence: "atgc", circular: false, isProtein: true }
    });

    assert.equal(props.viewType, "linear");
    assert.equal(props.mode, "protein");
    assert.equal(props.sequenceData.sequence, "atgc");
  });

  it("uses RNA mode for RNA sequence data", () => {
    const props = mapOvePropsToThreeLinearProps({
      sequenceData: { sequence: "augc", circular: false, isRna: true }
    });

    assert.equal(props.mode, "rna");
  });

  it("routes feature clicks through a DOM-like event", () => {
    let received;
    const props = mapOvePropsToThreeLinearProps({
      sequenceData: { sequence: "atgc", circular: false },
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
});

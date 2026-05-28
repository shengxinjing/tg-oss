import assert from "assert";
import shouldHandlePick, {
  getBestPickableIntersection,
  hasPickableIntersection
} from "./shouldHandlePick";

function object(userData) {
  return { userData };
}

describe("shouldHandlePick", () => {
  it("lets the highest-priority intersection handle the event", () => {
    const feature = { pickable: true, kind: "feature" };
    const cutsite = { pickable: true, kind: "cutsite" };
    const event = {
      intersections: [
        { object: object(feature), distance: 1 },
        { object: object(cutsite), distance: 2 }
      ]
    };

    assert.equal(shouldHandlePick(event, feature), false);
    assert.equal(shouldHandlePick(event, cutsite), true);
  });

  it("uses distance when priorities match", () => {
    const first = { pickable: true, kind: "feature", annotationId: "first" };
    const second = { pickable: true, kind: "feature", annotationId: "second" };
    const event = {
      intersections: [
        { object: object(first), distance: 2 },
        { object: object(second), distance: 1 }
      ]
    };

    assert.equal(shouldHandlePick(event, first), false);
    assert.equal(shouldHandlePick(event, second), true);
  });

  it("detects whether a background context event has a pickable target", () => {
    assert.equal(
      hasPickableIntersection({
        intersections: [{ object: object({ pickable: true, kind: "feature" }) }]
      }),
      true
    );
    assert.equal(
      hasPickableIntersection({
        intersections: [{ object: object({ kind: "background" }) }]
      }),
      false
    );
  });

  it("returns the best pickable intersection for native context menus", () => {
    const feature = { pickable: true, kind: "feature" };
    const primer = { pickable: true, kind: "primer" };
    const best = getBestPickableIntersection({
      intersections: [
        { object: object(feature), distance: 1 },
        { object: object(primer), distance: 2 }
      ]
    });

    assert.equal(best.object.userData, primer);
  });
});

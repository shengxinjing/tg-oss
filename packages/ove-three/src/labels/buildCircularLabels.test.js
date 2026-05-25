import assert from "assert";
import buildCircularLabels from "./buildCircularLabels";

function makeAnnotation(id, overrides = {}) {
  return {
    id,
    name: id,
    annotationType: "feature",
    start: 0,
    end: 99,
    color: "#22c55e",
    segments: [
      {
        start: 0,
        end: 99,
        startAngle: 0,
        endAngle: Math.PI / 2,
        totalAngle: Math.PI / 2
      }
    ],
    ...overrides
  };
}

describe("buildCircularLabels", () => {
  it("builds external labels with leader line positions", () => {
    const result = buildCircularLabels({
      sceneModel: {
        annotations: [makeAnnotation("GFP")]
      }
    });

    assert.equal(result.visible.length, 1);
    assert.equal(result.visible[0].text, "GFP");
    assert.equal(result.visible[0].position.length, 3);
    assert.equal(result.visible[0].leaderStart.length, 3);
    assert.equal(result.visible[0].leaderEnd.length, 3);
  });

  it("keeps selected labels ahead of dense overlapping labels", () => {
    const annotations = [
      makeAnnotation("first", { name: "first-label" }),
      makeAnnotation("selected", { name: "selected-label" })
    ];

    const result = buildCircularLabels({
      sceneModel: { annotations },
      selectedAnnotationId: "selected"
    });

    assert(result.visible.some(label => label.annotationId === "selected"));
    assert(result.hidden.some(label => label.annotationId === "first"));
  });
});

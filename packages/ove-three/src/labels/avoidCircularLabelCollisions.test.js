import assert from "assert";
import avoidCircularLabelCollisions from "./avoidCircularLabelCollisions";

function makeLabel(id, x, y, overrides = {}) {
  return {
    id,
    text: id,
    x,
    y,
    width: 80,
    height: 20,
    priority: 1,
    ...overrides
  };
}

describe("circularLabel collision solver", () => {
  it("keeps labels that do not overlap", () => {
    const labels = [makeLabel("a", 0, 0), makeLabel("b", 120, 0)];

    const result = avoidCircularLabelCollisions(labels);

    assert.deepEqual(
      result.visible.map(label => label.id),
      ["a", "b"]
    );
    assert.deepEqual(result.hidden, []);
  });

  it("hides lower priority overlapping labels", () => {
    const labels = [
      makeLabel("a", 0, 0, { priority: 2 }),
      makeLabel("b", 10, 0, { priority: 1 })
    ];

    const result = avoidCircularLabelCollisions(labels);

    assert.deepEqual(
      result.visible.map(label => label.id),
      ["a"]
    );
    assert.deepEqual(
      result.hidden.map(label => label.id),
      ["b"]
    );
  });

  it("keeps selected labels even when they overlap", () => {
    const labels = [
      makeLabel("a", 0, 0, { priority: 1 }),
      makeLabel("selected", 10, 0, { selected: true, priority: 0 })
    ];

    const result = avoidCircularLabelCollisions(labels);

    assert(result.visible.some(label => label.id === "selected"));
  });

  it("keeps hovered labels even when they overlap", () => {
    const labels = [
      makeLabel("a", 0, 0, { priority: 1 }),
      makeLabel("hovered", 10, 0, { hovered: true, priority: 0 })
    ];

    const result = avoidCircularLabelCollisions(labels);

    assert(result.visible.some(label => label.id === "hovered"));
  });

  it("degrades dense 100 label layouts without returning overlapping visible boxes", () => {
    const labels = Array.from({ length: 100 }, (_, index) =>
      makeLabel(
        `label-${index}`,
        (index % 10) * 24,
        Math.floor(index / 10) * 18
      )
    );

    const result = avoidCircularLabelCollisions(labels);

    assert(result.visible.length < labels.length);
    assert(result.hidden.length > 0);
    assert.equal(result.overlapCount, 0);
  });

  it("caps visible labels after priority sorting", () => {
    const labels = [
      makeLabel("selected", 0, 0, { selected: true, priority: 0 }),
      makeLabel("a", 120, 0, { priority: 1 }),
      makeLabel("b", 240, 0, { priority: 1 })
    ];

    const result = avoidCircularLabelCollisions(labels, {
      maxVisibleLabels: 2
    });

    assert.equal(result.visible.length, 2);
    assert(result.visible.some(label => label.id === "selected"));
    assert.equal(result.hidden.length, 1);
  });
});

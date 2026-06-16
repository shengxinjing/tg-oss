import assert from "assert";
import avoidRowLabelCollisions from "./avoidRowLabelCollisions";

describe("avoidRowLabelCollisions", () => {
  it("stacks overlapping row annotations onto separate levels", () => {
    const annotations = avoidRowLabelCollisions(
      [
        { id: "a", rowIndex: 0, start: 2, end: 8, width: 7 },
        { id: "b", rowIndex: 0, start: 5, end: 12, width: 8 },
        { id: "c", rowIndex: 0, start: 13, end: 15, width: 3 }
      ],
      { baseWidth: 1 }
    );

    assert.deepEqual(
      annotations.map(annotation => [annotation.id, annotation.stack]),
      [
        ["a", 0],
        ["b", 1],
        ["c", 0]
      ]
    );
  });

  it("truncates labels that cannot fit inside the row segment", () => {
    const [annotation] = avoidRowLabelCollisions(
      [
        {
          id: "feature-1",
          name: "VeryLongPromoterName",
          rowIndex: 0,
          start: 1,
          end: 4,
          width: 4
        }
      ],
      { baseWidth: 1 }
    );

    assert.equal(annotation.label, "VeryLongPromoterName");
    assert.equal(annotation.fullLabel, "VeryLongPromoterName");
    assert.equal(annotation.displayLabel, "Ver…");
    assert.equal(annotation.labelFits, false);
    assert.equal(annotation.hideLabel, false);
  });

  it("hides the inline label when the segment is too narrow to read", () => {
    const [annotation] = avoidRowLabelCollisions(
      [{ id: "f", name: "lacZ", rowIndex: 0, start: 1, end: 1, width: 1 }],
      { baseWidth: 1 }
    );

    assert.equal(annotation.hideLabel, true);
    assert.equal(annotation.displayLabel, "");
    assert.equal(annotation.fullLabel, "lacZ");
  });
});

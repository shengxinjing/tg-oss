import assert from "assert";
import normalizeAnnotations from "./normalizeAnnotations";

describe("normalizeAnnotations", () => {
  it("normalizes annotation object maps", () => {
    const input = {
      lac: { name: "lac promoter", start: 10, end: 25 },
      gfp: { id: "gfp-id", name: "GFP", start: 40, end: 90 }
    };

    const result = normalizeAnnotations(input, { annotationType: "feature" });

    assert.equal(result.length, 2);
    assert.equal(result[0].id, "lac");
    assert.equal(result[0].annotationType, "feature");
    assert.equal(result[0].start, 10);
    assert.equal(result[0].end, 25);
    assert.equal(result[0].sourceAnnotation, input.lac);
    assert.equal(result[1].id, "gfp-id");
  });

  it("normalizes annotation arrays", () => {
    const input = [
      { id: "primer-a", start: "5", end: "17" },
      { id: "primer-b", start: 30, end: 42 }
    ];

    const result = normalizeAnnotations(input, { annotationType: "primer" });

    assert.equal(result.length, 2);
    assert.deepEqual(
      result.map(item => [item.id, item.annotationType, item.start, item.end]),
      [
        ["primer-a", "primer", 5, 17],
        ["primer-b", "primer", 30, 42]
      ]
    );
  });

  it("creates stable ids when an annotation has no id", () => {
    const result = normalizeAnnotations(
      [{ name: "missing id", start: 1, end: 3 }],
      { annotationType: "cutsite" }
    );

    assert.equal(result[0].id, "cutsite-0");
  });

  it("does not mutate source annotations", () => {
    const input = [{ id: "orf-a", start: 2, end: 12 }];
    const before = JSON.stringify(input);

    const result = normalizeAnnotations(input, { annotationType: "orf" });

    assert.equal(JSON.stringify(input), before);
    assert.notEqual(result[0], input[0]);
    assert.equal(result[0].sourceAnnotation, input[0]);
  });
});

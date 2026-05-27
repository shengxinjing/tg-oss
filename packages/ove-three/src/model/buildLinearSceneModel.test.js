import assert from "assert";
import buildLinearSceneModel from "./buildLinearSceneModel";

describe("buildLinearSceneModel", () => {
  it("builds sequence metadata and axis ticks", () => {
    const model = buildLinearSceneModel({
      name: "linear test",
      sequence: "atgc".repeat(25),
      circular: false
    });

    assert.equal(model.name, "linear test");
    assert.equal(model.sequenceLength, 100);
    assert.equal(model.sequence, "atgc".repeat(25));
    assert.equal(model.circular, false);
    assert.ok(model.axisTicks.length > 0);
  });

  it("keeps feature, primer, cutsite, and ORF ranges in linear coordinates", () => {
    const model = buildLinearSceneModel({
      sequence: "atgc".repeat(100),
      features: [{ id: "feature-1", name: "GFP", start: 10, end: 50 }],
      primers: [
        {
          id: "primer-1",
          name: "Reverse Primer",
          start: 80,
          end: 110,
          forward: false
        }
      ],
      cutsites: [{ id: "cutsite-1", enzyme: "EcoRI", start: 120, end: 125 }],
      orfs: [
        { id: "orf-1", name: "ORF frame 2", start: 130, end: 260, frame: 2 }
      ]
    });

    assert.deepEqual(
      model.annotations.map(annotation => annotation.annotationType),
      ["feature", "primer", "cutsite", "orf"]
    );
    assert.deepEqual(model.annotations[0].segments[0], {
      annotationId: "feature-1",
      annotationType: "feature",
      start: 10,
      end: 50,
      startX: 80,
      endX: 408,
      width: 328
    });
    assert.equal(model.annotations[1].direction, "reverse");
    assert.equal(model.annotations[3].frame, 2);
  });

  it("splits circular ranges that cross the origin for linear view", () => {
    const model = buildLinearSceneModel({
      sequence: "atgc".repeat(25),
      circular: true,
      features: [{ id: "wrap", name: "Wrap", start: 90, end: 10 }]
    });

    assert.deepEqual(
      model.annotations[0].segments.map(segment => ({
        start: segment.start,
        end: segment.end
      })),
      [
        { start: 90, end: 99 },
        { start: 0, end: 10 }
      ]
    );
  });

  it("applies annotation visibility", () => {
    const model = buildLinearSceneModel(
      {
        sequence: "atgc".repeat(25),
        features: [{ id: "feature-1", name: "GFP", start: 10, end: 50 }],
        primers: [{ id: "primer-1", name: "Primer", start: 60, end: 80 }]
      },
      { annotationVisibility: { primer: false } }
    );

    assert.deepEqual(
      model.annotations.map(annotation => annotation.annotationType),
      ["feature"]
    );
  });

  it("does not return NaN sequence metadata for invalid no-sequence sizes", () => {
    const model = buildLinearSceneModel({
      noSequence: true,
      size: "unknown"
    });

    assert.equal(model.sequenceLength, 0);
    assert.equal(model.sequence.length, 0);
    assert.equal(model.axisTicks.length, 0);
  });
});

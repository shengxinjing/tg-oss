import assert from "assert";
import { mediumCircular } from "../demo/fixtures";
import buildCircularSceneModel from "./buildCircularSceneModel";

describe("buildCircularSceneModel", () => {
  it("builds a basic plasmid circular scene model", () => {
    const model = buildCircularSceneModel(mediumCircular);

    assert.equal(model.name, mediumCircular.name);
    assert.equal(model.sequenceLength, mediumCircular.sequence.length);
    assert.equal(model.circular, true);
    assert(model.annotations.length > 0);
    assert(model.segments.length >= model.annotations.length);
    assert(model.annotations[0].segments.length > 0);
  });

  it("filters features without dropping other visible annotation types", () => {
    const model = buildCircularSceneModel(mediumCircular, {
      featureFilter: feature => feature.type === "CDS"
    });
    const featureAnnotations = model.annotations.filter(
      annotation => annotation.annotationType === "feature"
    );

    assert.equal(featureAnnotations.length, 2);
    assert(featureAnnotations.every(annotation => annotation.type === "CDS"));
    assert(
      model.annotations.some(
        annotation => annotation.annotationType === "primer"
      )
    );
  });

  it("applies annotation visibility", () => {
    const model = buildCircularSceneModel(mediumCircular, {
      annotationVisibility: {
        primer: false,
        cutsite: false
      }
    });

    assert(
      model.annotations.some(
        annotation => annotation.annotationType === "feature"
      )
    );
    assert(
      !model.annotations.some(
        annotation => annotation.annotationType === "primer"
      )
    );
    assert(
      !model.annotations.some(
        annotation => annotation.annotationType === "cutsite"
      )
    );
  });

  it("includes parts when sequence data provides them", () => {
    const model = buildCircularSceneModel({
      ...mediumCircular,
      parts: [
        {
          id: "part-1",
          name: "Part 1",
          type: "part",
          start: 12,
          end: 42,
          color: "#a855f7"
        }
      ]
    });

    const part = model.annotations.find(
      annotation => annotation.annotationType === "part"
    );

    assert(part);
    assert.equal(part.id, "part-1");
    assert.equal(part.segments[0].annotationType, "part");
  });

  it("includes ORFs when sequence data provides them", () => {
    const model = buildCircularSceneModel({
      ...mediumCircular,
      orfs: [
        {
          id: "orf-1",
          name: "ORF frame 1",
          start: 120,
          end: 360,
          frame: 1,
          forward: true
        }
      ]
    });

    const orf = model.annotations.find(
      annotation => annotation.annotationType === "orf"
    );

    assert(orf);
    assert.equal(orf.frame, 1);
    assert.equal(orf.segments[0].annotationType, "orf");
  });

  it("returns an empty circular model for linear sequence data", () => {
    const model = buildCircularSceneModel({
      ...mediumCircular,
      circular: false
    });

    assert.equal(model.circular, false);
    assert.deepEqual(model.annotations, []);
    assert.deepEqual(model.segments, []);
  });

  it("does not mutate source sequence data", () => {
    const sequenceData = structuredClone(mediumCircular);
    const before = JSON.stringify(sequenceData);

    buildCircularSceneModel(sequenceData);

    assert.equal(JSON.stringify(sequenceData), before);
  });
});

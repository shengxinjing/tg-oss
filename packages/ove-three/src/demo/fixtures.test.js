import assert from "assert";
import {
  crossOriginCircular,
  denseAnnotations,
  fixtureList,
  hugeRow,
  largeCircular,
  mediumCircular,
  proteinLike,
  smallCircular
} from "./fixtures";
import generateStressSequenceData from "../perf/generateStressSequenceData";

describe("ove-three demo fixtures", () => {
  it("keeps named fixture sequence lengths stable", () => {
    assert.equal(smallCircular.sequence.length, 128);
    assert.equal(mediumCircular.sequence.length, 2710);
    assert.equal(largeCircular.sequence.length, 12000);
    assert.equal(hugeRow.sequence.length, 50000);
    assert.equal(crossOriginCircular.sequence.length, 2710);
    assert.equal(denseAnnotations.sequence.length, 10000);
    assert.equal(proteinLike.proteinSequence.length, 879);
  });

  it("documents why each fixture exists", () => {
    assert.equal(fixtureList.length, 7);
    fixtureList.forEach(fixture => {
      assert.equal(typeof fixture.description, "string");
      assert(fixture.description.length > 20);
    });
  });

  it("includes a circular annotation that crosses the origin", () => {
    assert(
      crossOriginCircular.features.some(feature => feature.start > feature.end)
    );
  });

  it("includes dense annotation counts for stress testing", () => {
    assert(denseAnnotations.features.length >= 50);
    assert(denseAnnotations.primers.length >= 100);
    assert(denseAnnotations.cutsites.length >= 200);
  });

  it("includes row biological layers in the default demo fixture", () => {
    assert(mediumCircular.cutsites.length > 0);
    assert(mediumCircular.orfs.length > 0);
    assert(mediumCircular.translations.length > 0);
  });

  it("can generate deterministic stress fixtures", () => {
    const stress = generateStressSequenceData({
      sequenceLength: 4096,
      featureCount: 12,
      primerCount: 24,
      cutsiteCount: 48
    });

    assert.equal(stress.sequence.length, 4096);
    assert.equal(stress.features.length, 12);
    assert.equal(stress.primers.length, 24);
    assert.equal(stress.cutsites.length, 48);
  });
});

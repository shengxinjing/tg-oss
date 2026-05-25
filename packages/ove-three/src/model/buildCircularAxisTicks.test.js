import assert from "assert";
import buildCircularAxisTicks from "./buildCircularAxisTicks";

describe("buildCircularAxisTicks", () => {
  it("builds stable major and minor ticks for a plasmid length", () => {
    const ticks = buildCircularAxisTicks({ sequenceLength: 2710 });

    assert(ticks.major.length > 0);
    assert(ticks.minor.length > ticks.major.length);
    assert.deepEqual(ticks.major[0], {
      position: 0,
      label: "1",
      angle: 0
    });
  });

  it("keeps labels upright with a rotation for each tick", () => {
    const ticks = buildCircularAxisTicks({ sequenceLength: 5000 });

    assert(ticks.labels.every(label => Number.isFinite(label.rotation)));
    assert(ticks.labels.every(label => label.rotation >= -Math.PI));
    assert(ticks.labels.every(label => label.rotation <= Math.PI));
  });
});

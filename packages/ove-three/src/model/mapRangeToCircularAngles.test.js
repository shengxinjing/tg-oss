import assert from "assert";
import {
  mapPositionToCircularAngle,
  default as mapRangeToCircularAngles
} from "./mapRangeToCircularAngles";

const round = value => Number(value.toFixed(6));

describe("circularAngles", () => {
  it("maps bp positions to top/right/bottom/left angles", () => {
    const sequenceLength = 100;

    assert.equal(round(mapPositionToCircularAngle(0, sequenceLength)), 0);
    assert.equal(
      round(mapPositionToCircularAngle(25, sequenceLength)),
      round(Math.PI / 2)
    );
    assert.equal(
      round(mapPositionToCircularAngle(50, sequenceLength)),
      round(Math.PI)
    );
    assert.equal(
      round(mapPositionToCircularAngle(75, sequenceLength)),
      round((Math.PI * 3) / 2)
    );
  });

  it("maps a normal range to one angular segment", () => {
    const segments = mapRangeToCircularAngles({
      start: 10,
      end: 20,
      length: 100
    });

    assert.equal(segments.length, 1);
    assert.equal(round(segments[0].startAngle), round(Math.PI * 0.2));
    assert.equal(round(segments[0].endAngle), round(Math.PI * 0.42));
    assert.equal(round(segments[0].totalAngle), round(Math.PI * 0.22));
  });

  it("maps cross-origin ranges without negative angles", () => {
    const segments = mapRangeToCircularAngles({
      start: 90,
      end: 10,
      length: 100
    });

    assert.deepEqual(
      segments.map(segment => [segment.start, segment.end]),
      [
        [90, 99],
        [0, 10]
      ]
    );
    segments.forEach(segment => {
      assert(segment.startAngle >= 0);
      assert(segment.endAngle >= 0);
      assert(segment.totalAngle > 0);
    });
  });

  it("maps joined locations to multiple angular segments", () => {
    const segments = mapRangeToCircularAngles({
      length: 100,
      locations: [
        { start: 5, end: 15 },
        { start: 60, end: 70 }
      ]
    });

    assert.deepEqual(
      segments.map(segment => [segment.start, segment.end]),
      [
        [5, 15],
        [60, 70]
      ]
    );
  });
});

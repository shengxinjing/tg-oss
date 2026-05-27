import assert from "assert";
import buildRowSceneModel from "../model/buildRowSceneModel";
import mapPointToVisibleRowPosition from "./mapPointToVisibleRowPosition";

const sceneModel = buildRowSceneModel(
  {
    sequence: "atgcatgcatgcatgc"
  },
  {
    basesPerRow: 4,
    baseWidth: 0.1,
    rowHeight: 0.8,
    visibleStartRow: 1,
    visibleRowCount: 2,
    overscan: 0
  }
);

describe("mapPointToVisibleRowPosition", () => {
  it("maps a Three.js point to the visible row bp position", () => {
    const result = mapPointToVisibleRowPosition(
      { x: 0.25, y: 0.4 },
      { sceneModel }
    );

    assert.equal(result.rowIndex, 1);
    assert.equal(result.position, 6);
  });

  it("returns null outside visible rows", () => {
    assert.equal(
      mapPointToVisibleRowPosition({ x: 0.1, y: 2 }, { sceneModel }),
      null
    );
  });
});

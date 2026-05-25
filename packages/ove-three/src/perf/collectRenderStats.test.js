import assert from "assert";
import collectRenderStats from "./collectRenderStats";

describe("collectRenderStats", () => {
  it("reads renderer info into stable overlay stats", () => {
    const renderer = {
      info: {
        render: {
          calls: 12,
          triangles: 240
        },
        memory: {
          geometries: 7,
          textures: 3
        }
      }
    };

    const stats = collectRenderStats(renderer, {
      fixtureName: "medium_circular_fixture",
      fps: 58.7,
      objectCount: 19
    });

    assert.deepEqual(stats, {
      fixtureName: "medium_circular_fixture",
      fps: 59,
      drawCalls: 12,
      triangles: 240,
      geometries: 7,
      textures: 3,
      objectCount: 19
    });
  });

  it("uses zero values before the renderer is ready", () => {
    const stats = collectRenderStats(undefined, {
      fixtureName: "pending_fixture"
    });

    assert.deepEqual(stats, {
      fixtureName: "pending_fixture",
      fps: null,
      drawCalls: 0,
      triangles: 0,
      geometries: 0,
      textures: 0,
      objectCount: 0
    });
  });
});

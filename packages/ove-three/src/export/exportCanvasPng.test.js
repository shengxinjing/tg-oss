import assert from "assert";
import exportCanvasPng from "./exportCanvasPng";

describe("exportCanvasPng", () => {
  it("exports the first visible canvas as a PNG data URL", () => {
    const canvas = {
      width: 320,
      height: 180,
      toDataURL: type => `data:${type};base64,abc123`
    };
    const container = {
      querySelector: selector => (selector === "canvas" ? canvas : null)
    };

    const result = exportCanvasPng(container, {
      fileName: "fixture.png",
      download: false
    });

    assert.deepEqual(result, {
      fileName: "fixture.png",
      dataUrl: "data:image/png;base64,abc123",
      byteLength: 6
    });
  });

  it("does not export a zero-size canvas", () => {
    const result = exportCanvasPng(
      {
        querySelector: () => ({
          width: 0,
          height: 0,
          toDataURL: () => "data:image/png;base64,"
        })
      },
      { download: false }
    );

    assert.equal(result, null);
  });
});

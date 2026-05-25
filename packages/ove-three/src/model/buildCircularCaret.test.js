import assert from "assert";
import buildCircularCaret from "./buildCircularCaret";

describe("buildCircularCaret", () => {
  it("builds a caret marker at a sequence position", () => {
    const caret = buildCircularCaret({
      position: 25,
      sequenceLength: 100
    });

    assert.equal(caret.position, 25);
    assert.equal(
      Math.round(caret.angle * 100) / 100,
      Math.round((Math.PI / 2) * 100) / 100
    );
    assert.equal(caret.lineStart.length, 3);
    assert.equal(caret.lineEnd.length, 3);
  });

  it("snaps protein mode caret positions to codon boundaries", () => {
    const caret = buildCircularCaret({
      position: 25,
      sequenceLength: 100,
      mode: "protein"
    });

    assert.equal(caret.position, 24);
  });
});

import { describe, it } from "bun:test";
import assert from "node:assert/strict";
import rowMapStyle from "./rowMapStyle";

describe("rowMapStyle", () => {
  it("keeps row view readable like a flat sequence map (light theme)", () => {
    assert.equal(rowMapStyle.backgroundColor, "#f2f5f2");
    assert.equal(rowMapStyle.forwardTextColor, "#18271f");
    assert.equal(rowMapStyle.complementTextColor, "#8a9a90");
    assert.equal(rowMapStyle.featureStrokeColor, "#111827");
    assert.equal(rowMapStyle.caretColor, "#18271f");
    assert.equal(rowMapStyle.forwardSequenceFontSize, 0.115);
    assert.equal(rowMapStyle.complementSequenceFontSize, 0.09);
    assert.equal(rowMapStyle.strandHintFontSize, 0.078);
    assert.equal(rowMapStyle.complementStrandHintFontSize, 0.072);
    assert(rowMapStyle.baseGuideOpacity <= 0.7);
  });
});

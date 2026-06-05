import { describe, it } from "bun:test";
import assert from "node:assert/strict";
import rowMapStyle from "./rowMapStyle";

describe("rowMapStyle", () => {
  it("keeps row view readable like a flat sequence map", () => {
    assert.equal(rowMapStyle.backgroundColor, "#07111f");
    assert.equal(rowMapStyle.forwardTextColor, "#dbeafe");
    assert.equal(rowMapStyle.complementTextColor, "#64748b");
    assert.equal(rowMapStyle.featureStrokeColor, "#111827");
    assert.equal(rowMapStyle.caretColor, "#f8fafc");
    assert.equal(rowMapStyle.forwardSequenceFontSize, 0.115);
    assert.equal(rowMapStyle.complementSequenceFontSize, 0.09);
    assert.equal(rowMapStyle.strandHintFontSize, 0.078);
    assert.equal(rowMapStyle.complementStrandHintFontSize, 0.072);
    assert(rowMapStyle.baseGuideOpacity <= 0.3);
  });
});

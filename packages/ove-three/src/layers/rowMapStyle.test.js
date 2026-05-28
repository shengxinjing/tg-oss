import { describe, it } from "bun:test";
import assert from "node:assert/strict";
import rowMapStyle from "./rowMapStyle";

describe("rowMapStyle", () => {
  it("keeps row view readable like a flat sequence map", () => {
    assert.equal(rowMapStyle.backgroundColor, "#f8fafc");
    assert.equal(rowMapStyle.forwardTextColor, "#111827");
    assert.equal(rowMapStyle.complementTextColor, "#94a3b8");
    assert.equal(rowMapStyle.featureStrokeColor, "#111827");
    assert(rowMapStyle.baseGuideOpacity <= 0.12);
  });
});

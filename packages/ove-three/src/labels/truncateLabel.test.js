import { describe, expect, it } from "bun:test";
import truncateLabel from "./truncateLabel";

describe("truncateLabel", () => {
  it("leaves short labels unchanged", () => {
    expect(truncateLabel("GFP", 18)).toBe("GFP");
  });

  it("truncates long labels to maxChars with an ellipsis", () => {
    const out = truncateLabel("Very long feature name here", 10);
    expect(out.length).toBe(10);
    expect(out.endsWith("…")).toBe(true);
  });

  it("handles edge maxChars", () => {
    expect(truncateLabel("ABC", 0)).toBe("");
    expect(truncateLabel("ABC", 1)).toBe("…");
  });

  it("coerces nullish input to an empty string", () => {
    expect(truncateLabel(undefined)).toBe("");
    expect(truncateLabel(null)).toBe("");
  });
});

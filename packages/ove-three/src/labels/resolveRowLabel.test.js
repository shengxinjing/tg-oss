import { describe, expect, it } from "bun:test";
import resolveRowLabel from "./resolveRowLabel";

describe("resolveRowLabel", () => {
  it("an empty label hides nothing and shows nothing", () => {
    const out = resolveRowLabel("", { width: 5, baseWidth: 1 });
    expect(out).toMatchObject({
      fullLabel: "",
      fits: false,
      hideLabel: false,
      displayLabel: ""
    });
  });

  it("shows the full name when it fits the segment width", () => {
    const out = resolveRowLabel("lacZ", { width: 10, baseWidth: 1 });
    expect(out.fits).toBe(true);
    expect(out.displayLabel).toBe("lacZ");
    expect(out.fullLabel).toBe("lacZ");
    expect(out.hideLabel).toBe(false);
  });

  it("truncates with the shared ellipsis when the name overflows", () => {
    const out = resolveRowLabel("VeryLongPromoterName", {
      width: 4,
      baseWidth: 1
    });
    expect(out.fits).toBe(false);
    expect(out.hideLabel).toBe(false);
    expect(out.displayLabel).toBe("Ver…");
    expect(out.displayLabel.length).toBeLessThanOrEqual(4);
    // full name is always preserved for hover / title use
    expect(out.fullLabel).toBe("VeryLongPromoterName");
  });

  it("hides the inline label when the segment is too narrow to read", () => {
    const out = resolveRowLabel("lacZ", { width: 1, baseWidth: 1 });
    expect(out.hideLabel).toBe(true);
    expect(out.displayLabel).toBe("");
    expect(out.fullLabel).toBe("lacZ");
  });

  it("guards against a zero baseWidth", () => {
    const out = resolveRowLabel("lacZ", { width: 10, baseWidth: 0 });
    expect(out.hideLabel).toBe(true);
    expect(out.displayLabel).toBe("");
  });
});

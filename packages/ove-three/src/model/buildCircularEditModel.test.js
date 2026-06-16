import { describe, expect, it } from "bun:test";
import buildCircularEditModel, { EDIT_COLORS } from "./buildCircularEditModel";

describe("buildCircularEditModel", () => {
  it("returns empty without edits or sequence length", () => {
    expect(buildCircularEditModel({ edits: [], sequenceLength: 1000 })).toEqual(
      []
    );
    expect(
      buildCircularEditModel({
        edits: [{ start: 0, end: 10 }],
        sequenceLength: 0
      })
    ).toEqual([]);
  });

  it("builds arc segments for a replacement edit", () => {
    const model = buildCircularEditModel({
      edits: [{ id: "e1", type: "replacement", start: 100, end: 200 }],
      sequenceLength: 1000
    });
    expect(model).toHaveLength(1);
    expect(model[0].id).toBe("e1");
    expect(model[0].segments.length).toBeGreaterThan(0);
    expect(Number.isFinite(model[0].segments[0].startAngle)).toBe(true);
  });

  it("colors by edit type", () => {
    const del = buildCircularEditModel({
      edits: [{ type: "deletion", start: 0, end: 5 }],
      sequenceLength: 100
    });
    expect(del[0].color).toBe(EDIT_COLORS.deletion);
  });

  it("splits an origin-spanning edit into two segments", () => {
    const model = buildCircularEditModel({
      edits: [{ start: 95, end: 5 }],
      sequenceLength: 100
    });
    expect(model[0].segments.length).toBe(2);
  });

  it("defaults id and type", () => {
    const model = buildCircularEditModel({
      edits: [{ start: 0, end: 5 }],
      sequenceLength: 100
    });
    expect(model[0].id).toBe("edit-0");
    expect(model[0].type).toBe("replacement");
  });
});

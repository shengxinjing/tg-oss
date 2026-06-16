import { describe, expect, it } from "bun:test";
import buildRowEditSegments from "./buildRowEditSegments";
import { EDIT_COLORS } from "./buildCircularEditModel";

const opts = { sequenceLength: 30, basesPerRow: 10, baseWidth: 1 };

describe("buildRowEditSegments", () => {
  it("returns empty for no edits or empty sequence", () => {
    expect(buildRowEditSegments({ edits: [], ...opts })).toEqual([]);
    expect(
      buildRowEditSegments({ edits: [{ start: 1, end: 2 }], sequenceLength: 0 })
    ).toEqual([]);
  });

  it("maps a single-row deletion to one segment with row-local geometry", () => {
    const [seg, ...rest] = buildRowEditSegments({
      edits: [{ id: "d1", start: 2, end: 5, type: "deletion" }],
      ...opts
    });
    expect(rest).toHaveLength(0);
    expect(seg).toMatchObject({
      id: "d1",
      type: "deletion",
      color: EDIT_COLORS.deletion,
      rowIndex: 0,
      start: 2,
      end: 5,
      localStart: 2,
      width: 4,
      x: 4
    });
  });

  it("splits an edit that spans two rows", () => {
    const segs = buildRowEditSegments({
      edits: [{ id: "r1", start: 8, end: 13 }],
      ...opts
    });
    expect(segs).toHaveLength(2);
    expect(segs[0]).toMatchObject({
      rowIndex: 0,
      start: 8,
      end: 9,
      type: "replacement",
      color: EDIT_COLORS.replacement,
      width: 2,
      x: 9
    });
    expect(segs[1]).toMatchObject({
      rowIndex: 1,
      start: 10,
      end: 13,
      localStart: 0,
      width: 4,
      x: 2
    });
  });

  it("honors a custom color and drops non-finite ranges", () => {
    const segs = buildRowEditSegments({
      edits: [
        { id: "c1", start: 1, end: 1, color: "#123456" },
        { id: "bad", start: "x", end: 4 }
      ],
      ...opts
    });
    expect(segs).toHaveLength(1);
    expect(segs[0]).toMatchObject({ id: "c1", color: "#123456" });
  });
});

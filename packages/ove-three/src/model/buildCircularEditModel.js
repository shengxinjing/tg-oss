import mapRangeToCircularAngles from "./mapRangeToCircularAngles";

export const EDIT_COLORS = {
  deletion: "#e8615f",
  replacement: "#e3a73f",
  insertion: "#35c995"
};

// Turn edit ranges (deletion / replacement / insertion previews) into circular
// arc segments. Origin-spanning edits (start > end) are split into two arcs by
// mapRangeToCircularAngles. Pure — the layer renders the segments.
export default function buildCircularEditModel({
  edits = [],
  sequenceLength = 0
} = {}) {
  if (!Array.isArray(edits) || sequenceLength <= 0) return [];

  return edits
    .filter(
      edit =>
        edit &&
        Number.isFinite(Number(edit.start)) &&
        Number.isFinite(Number(edit.end))
    )
    .map((edit, index) => {
      const type = edit.type || "replacement";
      return {
        id: edit.id || `edit-${index}`,
        type,
        color: edit.color || EDIT_COLORS[type] || EDIT_COLORS.replacement,
        segments: mapRangeToCircularAngles(
          { start: Number(edit.start), end: Number(edit.end) },
          { sequenceLength }
        )
      };
    });
}

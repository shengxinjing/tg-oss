import truncateLabel from "./truncateLabel";

// Decide how a row-view annotation's name renders given the segment's world
// width. Mirrors SVG OVE: names that fit are shown in full; names that overflow
// are truncated with the shared ellipsis; segments too narrow to show even a
// couple characters hide the inline label entirely (so you never get a lone
// "…"). The full name is always preserved for hover / title use.
const MIN_VISIBLE_CHARS = 2;

export default function resolveRowLabel(
  label = "",
  { width = 0, baseWidth = 1 } = {}
) {
  const fullLabel = String(label ?? "");
  const capacity = baseWidth > 0 ? Math.floor(width / baseWidth) : 0;
  const hasLabel = fullLabel.length > 0;
  const hideLabel = hasLabel && capacity < MIN_VISIBLE_CHARS;
  const fits = hasLabel && fullLabel.length <= capacity;

  return {
    fullLabel,
    fits,
    hideLabel,
    displayLabel: hideLabel
      ? ""
      : truncateLabel(fullLabel, Math.max(0, capacity))
  };
}

// Truncate a label to maxChars with an ellipsis so long feature names don't
// overrun the circular/linear maps (matches SVG OVE label truncation). The full
// text is kept separately on the label for hover/title use.
export default function truncateLabel(text = "", maxChars = 18) {
  const str = String(text ?? "");
  if (maxChars <= 0) return "";
  if (str.length <= maxChars) return str;
  if (maxChars === 1) return "…";
  return `${str.slice(0, maxChars - 1)}…`;
}

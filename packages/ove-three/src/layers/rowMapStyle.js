import { cssVar, cssNum } from "../theme/cssVars";

// Structural colors resolve from `--o3-*` tokens so the row/sequence map follows
// the active light/dark theme. Data values (feature stroke/text on colored
// fills, inverse text) and font sizes stay constant across themes.
const rowMapStyle = {
  get backgroundColor() {
    return cssVar("--o3-bg-0", "#f2f5f2");
  },
  get axisColor() {
    return cssVar("--o3-text-2", "#3a4a42");
  },
  get tickColor() {
    return cssVar("--o3-text-3", "#6c7d73");
  },
  get tickLabelColor() {
    return cssVar("--o3-text-3", "#6c7d73");
  },
  get rowLabelColor() {
    return cssVar("--o3-text-2", "#46584e");
  },
  get forwardTextColor() {
    return cssVar("--o3-text-1", "#18271f");
  },
  get complementTextColor() {
    return cssVar("--o3-map-complement", "#8a9a90");
  },
  featureStrokeColor: "#111827",
  featureTextColor: "#111827",
  inverseTextColor: "#ffffff",
  get primerBasesColor() {
    return cssVar("--o3-map-primer", "#0d7d52");
  },
  get cutsiteColor() {
    return cssVar("--o3-map-cutsite", "#d9701a");
  },
  get cutsiteTextColor() {
    return cssVar("--o3-map-cutsite-text", "#9a4d12");
  },
  translationTextColor: "#111827",
  get baseGuideColor() {
    return cssVar("--o3-map-guide", "#c4d0c8");
  },
  get baseGuideOpacity() {
    return cssNum("--o3-map-guide-opacity", 0.6);
  },
  get rowGuideColor() {
    return cssVar("--o3-map-guide", "#c4d0c8");
  },
  get caretColor() {
    return cssVar("--o3-text-1", "#18271f");
  },
  forwardSequenceFontSize: 0.115,
  complementSequenceFontSize: 0.09,
  strandHintFontSize: 0.078,
  complementStrandHintFontSize: 0.072
};

export default rowMapStyle;

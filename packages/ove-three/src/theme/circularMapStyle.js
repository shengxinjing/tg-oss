import { cssVar } from "./cssVars";

// Structural (non-data) colors for the circular map. Data colors (feature /
// primer / part palettes, cutsite orange) stay in their layers. Values resolve
// from `--o3-*` tokens so they switch with the active light/dark theme.
const circularMapStyle = {
  get sceneBackground() {
    return cssVar("--o3-bg-0", "#f2f5f2");
  },
  get backbone() {
    return cssVar("--o3-map-backbone", "#2f7fd6");
  },
  get backboneEmissive() {
    return cssVar("--o3-map-backbone-emissive", "#0a1322");
  },
  get axisRing() {
    return cssVar("--o3-text-3", "#8a978e");
  },
  get axisMajor() {
    return cssVar("--o3-text-2", "#3a4a42");
  },
  get axisNumber() {
    return cssVar("--o3-text-2", "#46584e");
  },
  get textOutline() {
    return cssVar("--o3-bg-0", "#f2f5f2");
  },
  get labelSelected() {
    return cssVar("--o3-text-1", "#18271f");
  },
  get caret() {
    return cssVar("--o3-text-1", "#18271f");
  },
  get cutsiteText() {
    return cssVar("--o3-map-cutsite-text", "#9a4d12");
  }
};

export default circularMapStyle;

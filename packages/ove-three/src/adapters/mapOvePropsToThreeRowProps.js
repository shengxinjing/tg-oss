import mapOvePropsToThreeProps from "./mapOvePropsToThreeProps";

export default function mapOvePropsToThreeRowProps(props = {}) {
  return mapOvePropsToThreeProps(props, {
    viewType: "row",
    includeTranslations: true,
    isRowView: true
  });
}

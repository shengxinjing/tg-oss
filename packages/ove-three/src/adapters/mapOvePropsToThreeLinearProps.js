import mapOvePropsToThreeProps from "./mapOvePropsToThreeProps";

export default function mapOvePropsToThreeLinearProps(props = {}) {
  return mapOvePropsToThreeProps(props, { viewType: "linear" });
}

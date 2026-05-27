import React from "react";
import { ThreeDGeneViewer } from "@teselagen/ove-three";
import "@teselagen/ove-three/style.css";
import withEditorInteractions from "../withEditorInteractions";
import mapOvePropsToThreeLinearProps from "./mapOvePropsToThreeLinearProps";

function ThreeLinearViewAdapter(props) {
  const width = props.width || props.dimensions?.width || 400;
  const height = props.height || props.dimensions?.height || 300;

  return (
    <div
      className="veThreeLinearViewAdapter"
      data-testid="ove-three-linear-view-adapter"
      style={{ width, height, minHeight: 220 }}
    >
      <ThreeDGeneViewer {...mapOvePropsToThreeLinearProps(props)} />
    </div>
  );
}

export default withEditorInteractions(ThreeLinearViewAdapter);

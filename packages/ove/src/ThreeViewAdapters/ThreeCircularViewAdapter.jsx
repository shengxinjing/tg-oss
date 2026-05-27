import React from "react";
import { ThreeDGeneViewer } from "@teselagen/ove-three";
import "@teselagen/ove-three/style.css";
import withEditorInteractions from "../withEditorInteractions";
import mapOvePropsToThreeCircularProps from "./mapOvePropsToThreeCircularProps";

function ThreeCircularViewAdapter(props) {
  const width = props.width || props.dimensions?.width || 400;
  const height = props.height || props.dimensions?.height || 400;

  return (
    <div
      className="veThreeCircularViewAdapter"
      data-testid="ove-three-circular-view-adapter"
      style={{ width, height, minHeight: 300 }}
    >
      <ThreeDGeneViewer {...mapOvePropsToThreeCircularProps(props)} />
    </div>
  );
}

export default withEditorInteractions(ThreeCircularViewAdapter);

import React from "react";
import { ThreeDGeneViewer } from "@teselagen/ove-three";
import "@teselagen/ove-three/style.css";
import withEditorInteractions from "../withEditorInteractions";
import mapOvePropsToThreeRowProps from "./mapOvePropsToThreeRowProps";

function ThreeRowViewAdapter(props) {
  const width = props.width || props.dimensions?.width || 400;
  const height = props.height || props.dimensions?.height || 400;

  return (
    <div
      className="veThreeRowViewAdapter"
      data-testid="ove-three-row-view-adapter"
      style={{ width, height, minHeight: 300 }}
    >
      <ThreeDGeneViewer {...mapOvePropsToThreeRowProps(props)} />
    </div>
  );
}

export default withEditorInteractions(ThreeRowViewAdapter);

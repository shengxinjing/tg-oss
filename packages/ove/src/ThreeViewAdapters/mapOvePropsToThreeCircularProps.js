function getAnnotationHandler(props, annotationType) {
  const handlerMap = {
    feature: props.featureClicked,
    part: props.partClicked,
    primer: props.primerClicked,
    cutsite: props.cutsiteClicked,
    orf: props.orfClicked
  };
  return handlerMap[annotationType];
}

function routeAnnotationEvent(props, annotation, userData, event) {
  const handler = getAnnotationHandler(props, annotation?.annotationType);
  handler?.({ annotation, event, userData });
}

export default function mapOvePropsToThreeCircularProps(props = {}) {
  const { sequenceData = {} } = props;

  return {
    sequenceData,
    className: props.className,
    showSceneStats: !!props.showThreeSceneStats,
    showLabelBoxes: !!props.showThreeLabelBoxes,
    showPickRay: !!props.showThreePickRay,
    showPointerPosition: !!props.showThreePointerPosition,
    mode: sequenceData.isProtein ? "protein" : "dna",
    onSelectRange: (annotation, userData, event) => {
      routeAnnotationEvent(props, annotation, userData, event);
    },
    onDoubleClickRange: (annotation, payload) => {
      routeAnnotationEvent(
        props,
        annotation,
        payload?.userData,
        payload?.originalEvent
      );
    },
    onContextMenuRange: (annotation, payload) => {
      routeAnnotationEvent(
        props,
        annotation,
        payload?.userData,
        payload?.originalEvent
      );
    },
    onBackgroundContextMenu: payload => {
      props.backgroundRightClicked?.({ event: payload?.originalEvent });
    },
    onCaretPositionChange: position => {
      props.caretPositionUpdate?.(position);
    },
    onSelectionChange: selection => {
      props.selectionLayerUpdate?.(selection);
    }
  };
}

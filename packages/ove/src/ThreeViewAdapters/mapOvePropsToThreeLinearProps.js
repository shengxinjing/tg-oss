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

function getAnnotationRightClickHandler(props, annotationType) {
  const handlerMap = {
    feature: props.featureRightClicked,
    part: props.partRightClicked,
    primer: props.primerRightClicked,
    cutsite: props.cutsiteRightClicked,
    orf: props.orfRightClicked
  };
  return handlerMap[annotationType];
}

function noopPersist() {
  return undefined;
}

function getDomEvent(event) {
  const domEvent = event?.nativeEvent || event;
  if (domEvent && !domEvent.persist) domEvent.persist = noopPersist;
  return domEvent;
}

function routeAnnotationEvent(props, annotation, userData, event) {
  const handler = getAnnotationHandler(props, annotation?.annotationType);
  handler?.({ annotation, event: getDomEvent(event), userData });
}

function routeAnnotationRightClickEvent(props, annotation, userData, event) {
  const handler = getAnnotationRightClickHandler(
    props,
    annotation?.annotationType
  );
  handler?.({ annotation, event: getDomEvent(event), userData });
}

function getSequenceData(props) {
  const sequenceData = props.sequenceData || {};

  return {
    ...sequenceData,
    features: sequenceData.filteredFeatures || sequenceData.features,
    parts: sequenceData.filteredParts || sequenceData.parts,
    primers: sequenceData.filteredPrimers || sequenceData.primers,
    cutsites: sequenceData.cutsites || props.cutsites,
    orfs: sequenceData.orfs || props.orfs
  };
}

function getMode(sequenceData) {
  if (sequenceData.isProtein) return "protein";
  if (sequenceData.isRna) return "rna";
  return "dna";
}

export default function mapOvePropsToThreeLinearProps(props = {}) {
  const sequenceData = getSequenceData(props);

  return {
    sequenceData,
    viewType: "linear",
    className: props.className,
    showSceneStats: !!props.showThreeSceneStats,
    showPointerPosition: !!props.showThreePointerPosition,
    annotationVisibility: props.annotationVisibility,
    mode: getMode(sequenceData),
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
      routeAnnotationRightClickEvent(
        props,
        annotation,
        payload?.userData,
        payload?.originalEvent
      );
    },
    onBackgroundContextMenu: payload => {
      props.backgroundRightClicked?.({
        event: getDomEvent(payload?.originalEvent)
      });
    },
    onCaretPositionChange: position => {
      props.caretPositionUpdate?.(position);
    },
    onSelectionChange: selection => {
      props.selectionLayerUpdate?.(selection);
    }
  };
}

const handlersByType = {
  click: {
    feature: "featureClicked",
    part: "partClicked",
    primer: "primerClicked",
    cutsite: "cutsiteClicked",
    translation: "translationClicked",
    orf: "orfClicked"
  },
  doubleClick: {
    cutsite: "cutsiteDoubleClicked",
    translation: "translationDoubleClicked"
  },
  contextMenu: {
    feature: "featureRightClicked",
    part: "partRightClicked",
    primer: "primerRightClicked",
    cutsite: "cutsiteRightClicked",
    translation: "translationRightClicked",
    orf: "orfRightClicked"
  }
};

function noopPersist() {
  return undefined;
}

function getDomEvent(event) {
  const domEvent = event?.nativeEvent || event;
  if (domEvent && !domEvent.persist) domEvent.persist = noopPersist;
  return domEvent;
}

function getMode(sequenceData) {
  if (sequenceData.isProtein) return "protein";
  if (sequenceData.isRna) return "rna";
  return "dna";
}

function getSequenceData(props, includeTranslations) {
  const sequenceData = props.sequenceData || {};

  return {
    ...sequenceData,
    features: sequenceData.filteredFeatures || sequenceData.features,
    parts: sequenceData.filteredParts || sequenceData.parts,
    primers: sequenceData.filteredPrimers || sequenceData.primers,
    cutsites: sequenceData.cutsites || props.cutsites,
    ...(includeTranslations && {
      translations: sequenceData.translations || props.translations
    }),
    orfs: sequenceData.orfs || props.orfs
  };
}

function getHandlerName(props, eventType, annotationType) {
  if (eventType === "doubleClick") {
    return (
      handlersByType.doubleClick[annotationType] ||
      handlersByType.click[annotationType]
    );
  }
  return handlersByType[eventType]?.[annotationType];
}

function routeAnnotationEvent(props, eventType, annotation, userData, event) {
  const handlerName = getHandlerName(
    props,
    eventType,
    annotation?.annotationType
  );
  props[handlerName]?.({
    annotation,
    event: getDomEvent(event),
    userData
  });
}

export default function mapOvePropsToThreeProps(props = {}, options = {}) {
  const sequenceData = getSequenceData(props, options.includeTranslations);

  return {
    sequenceData,
    viewType: options.viewType,
    className: props.className,
    showSceneStats: !!props.showThreeSceneStats,
    showLabelBoxes: !!props.showThreeLabelBoxes,
    showPickRay: !!props.showThreePickRay,
    showPointerPosition: !!props.showThreePointerPosition,
    annotationVisibility: props.annotationVisibility,
    searchRanges: props.searchLayers || props.matchedSearchLayer || [],
    caretPosition: props.caretPosition,
    selectionRange: props.selectionLayer,
    mode: getMode(sequenceData),
    showAminoAcidUnitAsCodon: props.showAminoAcidUnitAsCodon,
    onSelectRange: (annotation, userData, event) => {
      routeAnnotationEvent(props, "click", annotation, userData, event);
    },
    onDoubleClickRange: (annotation, payload) => {
      routeAnnotationEvent(
        props,
        "doubleClick",
        annotation,
        payload?.userData,
        payload?.originalEvent
      );
    },
    onContextMenuRange: (annotation, payload) => {
      routeAnnotationEvent(
        props,
        "contextMenu",
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
      props.selectionLayerUpdate?.(
        options.isRowView ? { ...selection, isFromRowView: true } : selection
      );
    }
  };
}

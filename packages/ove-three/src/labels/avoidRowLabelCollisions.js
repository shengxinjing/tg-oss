import resolveRowLabel from "./resolveRowLabel";

function getLabel(annotation = {}) {
  return annotation.name || annotation.label || annotation.id || "";
}

function getPriority(annotationType) {
  return (
    {
      feature: 0,
      part: 1,
      primer: 2,
      orf: 3
    }[annotationType] ?? 4
  );
}

export default function avoidRowLabelCollisions(
  annotations = [],
  { baseWidth = 1 } = {}
) {
  const occupiedEnds = new Map();

  return [...annotations]
    .sort((a, b) => {
      if (a.rowIndex !== b.rowIndex) return a.rowIndex - b.rowIndex;
      if (a.start !== b.start) return a.start - b.start;
      if (getPriority(a.annotationType) !== getPriority(b.annotationType)) {
        return getPriority(a.annotationType) - getPriority(b.annotationType);
      }
      return a.end - b.end;
    })
    .map(annotation => {
      const rowStacks = occupiedEnds.get(annotation.rowIndex) || [];
      let stack = 0;

      while (
        rowStacks[stack] !== undefined &&
        annotation.start <= rowStacks[stack]
      ) {
        stack += 1;
      }

      rowStacks[stack] = annotation.end;
      occupiedEnds.set(annotation.rowIndex, rowStacks);

      const label = getLabel(annotation);
      const resolved = resolveRowLabel(label, {
        width: annotation.width || 0,
        baseWidth
      });

      return {
        ...annotation,
        stack,
        label,
        fullLabel: resolved.fullLabel,
        labelFits: resolved.fits,
        hideLabel: resolved.hideLabel,
        displayLabel: resolved.displayLabel
      };
    });
}

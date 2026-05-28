function getBox(label) {
  const halfWidth = label.width / 2;
  const halfHeight = label.height / 2;
  return {
    left: label.x - halfWidth,
    right: label.x + halfWidth,
    top: label.y - halfHeight,
    bottom: label.y + halfHeight
  };
}

function boxesOverlap(a, b) {
  return (
    a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top
  );
}

function getPriority(label) {
  let priority = Number(label.priority) || 0;
  if (label.selected) priority += 10000;
  if (label.hovered) priority += 9000;
  return priority;
}

function countOverlaps(labels) {
  let overlapCount = 0;
  const boxes = labels.map(getBox);
  for (let i = 0; i < boxes.length; i += 1) {
    for (let j = i + 1; j < boxes.length; j += 1) {
      if (boxesOverlap(boxes[i], boxes[j])) overlapCount += 1;
    }
  }
  return overlapCount;
}

export default function avoidCircularLabelCollisions(
  labels = [],
  { maxVisibleLabels = Infinity } = {}
) {
  const orderedLabels = labels
    .map((label, index) => ({ label, index, priority: getPriority(label) }))
    .sort((a, b) => b.priority - a.priority || a.index - b.index);

  const visibleItems = [];
  const hidden = [];
  const visibleBoxes = [];

  orderedLabels.forEach(item => {
    const box = getBox(item.label);
    const overlaps = visibleBoxes.some(visibleBox =>
      boxesOverlap(box, visibleBox)
    );
    if (overlaps) {
      hidden.push(item.label);
      return;
    }

    visibleItems.push({ label: { ...item.label, box }, index: item.index });
    visibleBoxes.push(box);
  });

  const cappedVisibleItems = visibleItems.slice(0, maxVisibleLabels);
  const cappedHidden = [
    ...hidden,
    ...visibleItems.slice(maxVisibleLabels).map(item => item.label)
  ];

  cappedVisibleItems.sort((a, b) => a.index - b.index);
  cappedHidden.sort((a, b) => labels.indexOf(a) - labels.indexOf(b));
  const visible = cappedVisibleItems.map(item => item.label);

  return {
    visible,
    hidden: cappedHidden,
    overlapCount: countOverlaps(visible)
  };
}

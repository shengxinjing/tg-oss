// Greedy lane packing: overlapping annotations are placed in separate lanes
// (stacked rows), matching SVG OVE's RowItem behavior. Each annotation gets a
// numeric `lane` (0 = top). Span uses the min start / max end across segments
// so origin-spanning / multi-segment items pack correctly.
export function getSpan(annotation) {
  if (Array.isArray(annotation.segments) && annotation.segments.length) {
    const starts = annotation.segments.map(segment => Number(segment.start));
    const ends = annotation.segments.map(segment => Number(segment.end));
    return { start: Math.min(...starts), end: Math.max(...ends) };
  }
  return {
    start: Number(annotation.start) || 0,
    end: Number(annotation.end) || 0
  };
}

export default function assignLinearLanes(annotations = []) {
  const withSpan = annotations.map((annotation, index) => ({
    index,
    ...getSpan(annotation)
  }));
  withSpan.sort(
    (a, b) => a.start - b.start || a.end - b.end || a.index - b.index
  );

  const laneEnds = []; // last end placed in each lane
  const laneByIndex = new Map();
  withSpan.forEach(item => {
    let lane = laneEnds.findIndex(end => end < item.start);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(item.end);
    } else {
      laneEnds[lane] = item.end;
    }
    laneByIndex.set(item.index, lane);
  });

  return annotations.map((annotation, index) => ({
    ...annotation,
    lane: laneByIndex.get(index)
  }));
}

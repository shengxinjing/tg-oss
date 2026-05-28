import getPickPriority from "./getPickPriority";

export function getPickableIntersections(event) {
  return (event?.intersections || []).filter(
    intersection => intersection.object?.userData?.pickable
  );
}

export function hasPickableIntersection(event) {
  return getPickableIntersections(event).length > 0;
}

export function getBestPickableIntersection(event) {
  const intersections = getPickableIntersections(event);
  if (!intersections.length) return null;

  return intersections.reduce((winner, intersection) => {
    const priority = getPickPriority(intersection.object.userData);
    const winnerPriority = getPickPriority(winner.object.userData);
    if (priority !== winnerPriority) {
      return priority > winnerPriority ? intersection : winner;
    }
    return intersection.distance < winner.distance ? intersection : winner;
  }, intersections[0]);
}

export default function shouldHandlePick(event, userData = {}) {
  const best = getBestPickableIntersection(event);
  if (!best) return true;

  return best.object?.userData === userData;
}

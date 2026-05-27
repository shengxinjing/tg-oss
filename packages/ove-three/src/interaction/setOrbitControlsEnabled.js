export default function setOrbitControlsEnabled(controlsRef, enabled) {
  if (!controlsRef?.current) return false;
  controlsRef.current.enabled = enabled;
  return true;
}

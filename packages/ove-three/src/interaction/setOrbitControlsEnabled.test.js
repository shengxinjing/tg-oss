import assert from "assert";
import setOrbitControlsEnabled from "./setOrbitControlsEnabled";

describe("setOrbitControlsEnabled", () => {
  it("updates an OrbitControls ref synchronously", () => {
    const controlsRef = { current: { enabled: true } };

    assert.equal(setOrbitControlsEnabled(controlsRef, false), true);
    assert.equal(controlsRef.current.enabled, false);

    setOrbitControlsEnabled(controlsRef, true);
    assert.equal(controlsRef.current.enabled, true);
  });

  it("does nothing when controls are not mounted yet", () => {
    assert.equal(setOrbitControlsEnabled({ current: null }, false), false);
  });
});

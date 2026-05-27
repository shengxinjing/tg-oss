import assert from "assert";
import isPrimaryPointerButton from "./isPrimaryPointerButton";

describe("isPrimaryPointerButton", () => {
  it("accepts left mouse button events", () => {
    assert.equal(isPrimaryPointerButton({ button: 0 }), true);
    assert.equal(isPrimaryPointerButton({ nativeEvent: { button: 0 } }), true);
  });

  it("rejects right mouse button events", () => {
    assert.equal(isPrimaryPointerButton({ button: 2 }), false);
    assert.equal(isPrimaryPointerButton({ nativeEvent: { button: 2 } }), false);
  });

  it("uses the buttons bitmask when button is unavailable", () => {
    assert.equal(isPrimaryPointerButton({ buttons: 1 }), true);
    assert.equal(isPrimaryPointerButton({ buttons: 2 }), false);
  });
});

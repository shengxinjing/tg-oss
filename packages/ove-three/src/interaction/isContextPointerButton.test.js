import assert from "assert";
import isContextPointerButton from "./isContextPointerButton";

describe("isContextPointerButton", () => {
  it("accepts right mouse button events", () => {
    assert.equal(isContextPointerButton({ button: 2 }), true);
    assert.equal(isContextPointerButton({ nativeEvent: { button: 2 } }), true);
  });

  it("rejects primary pointer events", () => {
    assert.equal(isContextPointerButton({ button: 0 }), false);
  });
});

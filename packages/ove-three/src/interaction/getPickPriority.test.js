import assert from "assert";
import getPickPriority from "./getPickPriority";

describe("getPickPriority", () => {
  it("prioritizes more specific biological objects above broad features", () => {
    assert(
      getPickPriority({ kind: "cutsite" }) >
        getPickPriority({ kind: "feature" })
    );
    assert(
      getPickPriority({ annotationType: "primer" }) >
        getPickPriority({ annotationType: "part" })
    );
  });

  it("returns zero for non-pickable background data", () => {
    assert.equal(getPickPriority({ kind: "background" }), 0);
  });
});

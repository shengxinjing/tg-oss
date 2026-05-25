import assert from "assert";
import createUserData from "./createUserData";

describe("createUserData", () => {
  it("creates a stable pickable userData shape", () => {
    const userData = createUserData({
      kind: "annotation",
      annotation: {
        id: "feature-1",
        name: "GFP",
        annotationType: "feature",
        start: 10,
        end: 25
      },
      segment: {
        start: 10,
        end: 25
      },
      extra: {
        direction: "forward"
      }
    });

    assert.deepEqual(userData, {
      pickable: true,
      kind: "annotation",
      annotationId: "feature-1",
      annotationType: "feature",
      name: "GFP",
      start: 10,
      end: 25,
      segmentStart: 10,
      segmentEnd: 25,
      direction: "forward"
    });
  });
});

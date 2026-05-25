import assert from "assert";
import { createPointerEventPayload } from "./useRaycastPicking";

describe("useRaycastPicking event payloads", () => {
  it("keeps annotation, userData, original event, and event type together", () => {
    const annotation = { id: "feature-1", name: "GFP" };
    const userData = { annotationId: "feature-1", kind: "annotation" };
    const originalEvent = { type: "dblclick" };

    const payload = createPointerEventPayload(
      "double-click",
      annotation,
      userData,
      originalEvent
    );

    assert.deepEqual(payload, {
      type: "double-click",
      annotationId: "feature-1",
      annotation,
      userData,
      originalEvent
    });
  });
});

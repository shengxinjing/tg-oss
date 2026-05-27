import "cypress-real-events";
import { isString } from "lodash-es";
import toRegexRange from "to-regex-range";
import { insertSequenceDataAtPositionOrRange } from "@teselagen/sequence-utils";
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//

// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => {
//   return originalFn(url, options).then(() => {
//     cy.window().then((win) => {
//       win.sessionStorage.clear();
//     });
//   });
// });

function getCenter(el) {
  const b = el.getBoundingClientRect();
  const x = (b.right - b.left) / 2 + b.left;
  const y = (b.bottom - b.top) / 2 + b.top;
  return [x, y];
}

Cypress.Commands.add("dragBetween", (dragSelector, dropSelector) => {
  const getOrWrap = isString(dragSelector) ? cy.get : cy.wrap;
  cy.clock();
  getOrWrap(dragSelector).then(el => {
    const dragSelectDomEl = el.get(0);
    getOrWrap(dropSelector).then(el2 => {
      const dropSelectDomEl = el2.get(0);
      const [x, y] = getCenter(dragSelectDomEl);
      const [xCenterDrop, yCenterDrop] = getCenter(dropSelectDomEl);
      getOrWrap(dragSelector)
        .trigger(
          "mousedown",
          {
            button: 0,
            clientX: x,
            clientY: y,
            force: true
          },
          { force: true }
        )
        .tick(1000);
      // drag events test for button: 0 and also use the clientX and clientY values - the clientX and clientY values will be specific to your system
      getOrWrap(dragSelector)
        .trigger(
          "mousemove",
          {
            button: 0,
            clientX: x + 10,
            clientY: y + 10,
            force: true
          },
          { force: true }
        ) // We perform a small move event of > 5 pixels this means we don't get dismissed by the sloppy click detection
        .tick(5000); // react-beautiful-dnd has a minimum 150ms timeout before starting a drag operation, so wait at least this long.

      // eslint-disable-next-line cypress/unsafe-to-chain-command
      cy.get("html") // now we perform drags on the whole screen, not just the draggable
        .trigger(
          "mousemove",
          {
            button: 0,
            clientX: xCenterDrop,
            clientY: yCenterDrop,
            force: true
          },
          { force: true }
        )
        .tick(5000);
      cy.get("html").trigger(
        "mouseup",
        {
          // Causes the drop to be run
          button: 0,
          clientX: xCenterDrop,
          clientY: yCenterDrop,
          force: true
        },
        { force: true }
      );
      getOrWrap(dragSelector).trigger(
        "mouseup",
        {
          // Causes the drop to be run
          button: 0,
          clientX: xCenterDrop,
          clientY: yCenterDrop,
          force: true
        },
        { force: true }
      );

      // Can now test the application's post DROP state
    });
  });
});

Cypress.Commands.add("dragBetweenSimple", (dragSelector, dropSelector) => {
  const getOrWrap = selector =>
    isString(selector)
      ? cy.get(selector).then(el => {
          return el.first();
        })
      : cy.wrap(selector);
  getOrWrap(dragSelector)
    .trigger("mousedown", { force: true })
    .trigger("mousemove", 10, 10, { force: true });
  getOrWrap(dropSelector)
    .trigger("mousemove", { force: true })
    .trigger("mouseup", { force: true });
});

Cypress.Commands.add("tgToggle", (type, onOrOff = true) => {
  const command = onOrOff ? "check" : "uncheck";

  return cy.get(`[data-test="${type}"]`)[command]({ force: true });
});

function getRegistryEntry(
  registry,
  collectionName,
  nameCollectionName,
  idOrName
) {
  const idFromName = registry?.[nameCollectionName]?.[idOrName];
  return (
    registry?.[collectionName]?.[idOrName] ||
    registry?.[collectionName]?.[idFromName]
  );
}

const CANVAS_REGISTRY_TIMEOUT = 10000;

function getCanvasRegistryEntry(collectionName, nameCollectionName, idOrName) {
  return cy
    .window({ timeout: CANVAS_REGISTRY_TIMEOUT })
    .should(win => {
      const entry = getRegistryEntry(
        win.Cypress?.oveThreeTestRegistry,
        collectionName,
        nameCollectionName,
        idOrName
      );
      expect(entry).to.not.equal(undefined);
    })
    .then(win =>
      getRegistryEntry(
        win.Cypress.oveThreeTestRegistry,
        collectionName,
        nameCollectionName,
        idOrName
      )
    );
}

Cypress.Commands.add("getCanvasAnnotation", idOrName => {
  return getCanvasRegistryEntry("annotations", "annotationNames", idOrName);
});

Cypress.Commands.add("getCanvasAnnotationByType", annotationType => {
  return cy
    .window({ timeout: CANVAS_REGISTRY_TIMEOUT })
    .should(win => {
      const annotations = Object.values(
        win.Cypress?.oveThreeTestRegistry?.annotations || {}
      );
      expect(
        annotations.find(
          annotation => annotation.annotationType === annotationType
        )
      ).to.not.equal(undefined);
    })
    .then(win => {
      const annotations = Object.values(
        win.Cypress.oveThreeTestRegistry.annotations
      );
      return annotations.find(
        annotation => annotation.annotationType === annotationType
      );
    });
});

Cypress.Commands.add("getCanvasLabel", idOrName => {
  return getCanvasRegistryEntry("labels", "labelNames", idOrName);
});

function shouldCanvasRegistryEntryState(
  collectionName,
  nameCollectionName,
  idOrName,
  expectedState
) {
  return cy.window({ timeout: CANVAS_REGISTRY_TIMEOUT }).should(win => {
    const entry = getRegistryEntry(
      win.Cypress?.oveThreeTestRegistry,
      collectionName,
      nameCollectionName,
      idOrName
    );
    expect(entry).to.not.equal(undefined);
    Object.entries(expectedState).forEach(([key, value]) => {
      expect(entry[key]).to.equal(value);
    });
  });
}

Cypress.Commands.add("shouldCanvasAnnotationState", (idOrName, expectedState) =>
  shouldCanvasRegistryEntryState(
    "annotations",
    "annotationNames",
    idOrName,
    expectedState
  )
);

Cypress.Commands.add("shouldCanvasLabelState", (idOrName, expectedState) =>
  shouldCanvasRegistryEntryState(
    "labels",
    "labelNames",
    idOrName,
    expectedState
  )
);

function getRequiredRegistryAnnotation(registry, annotationId) {
  const annotation = registry?.annotations?.[annotationId];
  expect(annotation).to.not.equal(undefined);
  return annotation;
}

function getRequiredRegistryLabel(registry, annotationId) {
  const label = registry?.labels?.[annotationId];
  expect(label).to.not.equal(undefined);
  return label;
}

Cypress.Commands.add("shouldHaveCanvasSelection", () => {
  return cy.window({ timeout: CANVAS_REGISTRY_TIMEOUT }).should(win => {
    const registry = win.Cypress?.oveThreeTestRegistry;
    const selectedAnnotationId = registry?.selectedAnnotationId;
    expect(typeof selectedAnnotationId).to.equal("string");
    expect(selectedAnnotationId.length).to.be.greaterThan(0);
    getRequiredRegistryAnnotation(registry, selectedAnnotationId);
  });
});

Cypress.Commands.add("shouldHaveCanvasHover", () => {
  return cy.window({ timeout: CANVAS_REGISTRY_TIMEOUT }).should(win => {
    const registry = win.Cypress?.oveThreeTestRegistry;
    const hoveredAnnotationId = registry?.hoveredAnnotationId;
    expect(typeof hoveredAnnotationId).to.equal("string");
    expect(hoveredAnnotationId.length).to.be.greaterThan(0);
    getRequiredRegistryAnnotation(registry, hoveredAnnotationId);
  });
});

Cypress.Commands.add("shouldSelectedCanvasLabelState", expectedState => {
  return cy.window({ timeout: CANVAS_REGISTRY_TIMEOUT }).should(win => {
    const registry = win.Cypress?.oveThreeTestRegistry;
    const label = getRequiredRegistryLabel(
      registry,
      registry?.selectedAnnotationId
    );
    Object.entries(expectedState).forEach(([key, value]) => {
      expect(label[key]).to.equal(value);
    });
  });
});

Cypress.Commands.add("shouldHoveredCanvasLabelState", expectedState => {
  return cy.window({ timeout: CANVAS_REGISTRY_TIMEOUT }).should(win => {
    const registry = win.Cypress?.oveThreeTestRegistry;
    const label = getRequiredRegistryLabel(
      registry,
      registry?.hoveredAnnotationId
    );
    Object.entries(expectedState).forEach(([key, value]) => {
      expect(label[key]).to.equal(value);
    });
  });
});

Cypress.Commands.add("clickCanvasAnnotation", (idOrName, options = {}) => {
  return cy.getCanvasAnnotation(idOrName).then(entry => {
    cy.get(`[data-testid="ove-three-canvas-container"] canvas`).click(
      entry.x,
      entry.y,
      { force: true, ...options }
    );
  });
});

Cypress.Commands.add("hoverCanvasAnnotation", idOrName => {
  return cy.getCanvasAnnotation(idOrName).then(entry => {
    cy.get(`[data-testid="ove-three-canvas-container"] canvas`).trigger(
      "pointermove",
      {
        clientX: entry.clientX,
        clientY: entry.clientY,
        pointerId: 1,
        pointerType: "mouse",
        force: true
      }
    );
  });
});

Cypress.Commands.add("rightClickCanvasAnnotation", (idOrName, options = {}) => {
  return cy.getCanvasAnnotation(idOrName).then(entry => {
    cy.get(`[data-testid="ove-three-canvas-container"] canvas`).rightclick(
      entry.x,
      entry.y,
      { force: true, ...options }
    );
  });
});

Cypress.Commands.add("assertCanvasLabelsDoNotOverlap", () => {
  cy.window({ timeout: CANVAS_REGISTRY_TIMEOUT }).should(win => {
    expect(win.Cypress?.oveThreeTestRegistry?.labelOverlapCount).to.equal(0);
  });
});

/**
 * Triggers a cmd using the Help menu search
 * @memberOf Cypress.Chainable#
 * @name triggerFileCmd
 * @function
 * @param {String} text - the file cmd to trigger
 */

Cypress.Commands.add("triggerFileCmd", (text, { noEnter } = {}) => {
  cy.get("body").type("{meta}/");
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(400);
  cy.focused().type(
    (Cypress.config("isInteractive") ? "" : "            ") +
      `${text}${noEnter ? "" : "{enter}"}`,
    { delay: 40 }
  );
});

/**
 * Uploads a file to an input
 * @memberOf Cypress.Chainable#
 * @name upload_file
 * @function
 * @param {String} selector - element to target
 * @param {String} fileUrl - The file url to upload
 * @param {String} type - content type of the uploaded file
 */

Cypress.Commands.add("uploadFile", (selector, fileUrl, type = "") => {
  return cy.fixture(fileUrl, "base64").then(input => {
    const blob = Cypress.Blob.base64StringToBlob(input);

    const name = fileUrl.split("/").pop();
    return cy.window().then(win => {
      // this is using the File constructor from the application window
      const testFile = new win.File([blob], name, { type });
      const event = { dataTransfer: { files: [testFile], types: ["Files"] } };
      return cy.get(selector).trigger("drop", event);
    });
  });
});

/**
 * Used to find our sequence selection within a range given a tolerance
 * @param {*} min - minimum value for range
 * @param {*} max - maxmimum value for range
 * @param {*} tolerance - tolerance allowed for our start point and interval for selected sequence
 */
Cypress.Commands.add(
  "assertSelectionWithinRange",
  ({ min, max, tolerance }) => {
    const minRange = toRegexRange(min - tolerance, min + tolerance);
    const maxRange = toRegexRange(max - tolerance, max + tolerance);
    const intervalRange = toRegexRange(
      max - min - tolerance,
      max - min + tolerance
    );
    cy.window().then(() => {
      const checkString = new RegExp(
        "Selecting " +
          intervalRange +
          " bps from " +
          minRange +
          " to " +
          maxRange
      );
      cy.contains(checkString);
    });
  }
);

/**
 * Used to find caret within a range with a given tolerance
 * @param {*} min - minimum value for caret search range
 * @param {*} max - maxmimum value for caret search range
 * @param {*} tolerance - tolerance for min and max
 */
// Cypress.Commands.add("getCaretWithinRange", ({min,max,tolerance}) => {
//   const minRange = toRegexRange(min-tolerance,min+tolerance)
//   const maxRange = toRegexRange(max-tolerance,max+tolerance)
//   const checkString = new RegExp(`[title="Caret Between Bases ` + minRange + ` and ` + maxRange + `"]`)
//   cy.get(checkString)
//   });

Cypress.Commands.add("selectRange", (start, end) => {
  cy.log(`selectRange ${start} - ${end}`);
  cy.updateEditor({
    selectionLayer: {
      start: start - 1,
      end: end - 1
    }
  });
});

/**
 * Update the editor
 */
// Cypress.Commands.add("updateEditor", ({min,max,tolerance}) => {
//   const minRange = toRegexRange(min-tolerance,min+tolerance)
//   const maxRange = toRegexRange(max-tolerance,max+tolerance)
//   const checkString = new RegExp(`[title="Caret Between Bases ` + minRange + ` and ` + maxRange + `"]`)
//   cy.get(checkString)
//   });

Cypress.Commands.add("updateEditor", props => {
  cy.log(`updateEditor`);
  cy.window().then(win => {
    const finish = () => {
      win.ove_updateEditor(props);
    };
    if (!win.ove_updateEditor) {
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(100).then(() => {
        finish();
      });
    } else {
      finish();
    }
  });
});

Cypress.Commands.add("deleteRange", (start, end) => {
  cy.window().then(win => {
    const { sequenceData } = win.ove_getEditorState();
    const newSeqData = insertSequenceDataAtPositionOrRange({}, sequenceData, {
      start,
      end
    });
    cy.updateEditor({
      sequenceData: newSeqData
    });
  });
});

Cypress.Commands.add("removeFeatures", () => {
  cy.updateEditor({
    justPassingPartialSeqData: true,
    sequenceData: {
      features: []
    }
  });
});
Cypress.Commands.add("hideCutsites", () => {
  cy.updateEditor({
    annotationVisibility: {
      cutsites: false
    }
  });
});
Cypress.Commands.add("hideParts", () => {
  cy.updateEditor({
    annotationVisibility: {
      parts: false
    }
  });
});
Cypress.Commands.add("selectAlignmentRange", (start, end) => {
  window.Cypress.updateAlignmentSelection({ start: start - 1, end: end - 1 });
});
Cypress.Commands.add("scrollAlignmentToPercent", percent => {
  window.Cypress.scrollAlignmentToPercent(percent);
});
Cypress.Commands.add("closeDialog", () => {
  cy.get(`.bp3-dialog [aria-label="Close"]`).click();
});
Cypress.Commands.add("replaceSelection", sequenceString => {
  cy.get(".veRowViewSelectionLayer")
    .first()
    .trigger("contextmenu", { force: true });
  cy.contains(".bp3-menu-item", "Replace").click();
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(200);
  cy.contains(".bp3-menu-item", "Replace").should("not.exist");
  cy.get(".sequenceInputBubble input").type(
    (Cypress.config("isInteractive") ? "" : "            ") +
      `${sequenceString}{enter}`
  );
});
Cypress.Commands.add("deleteSelection", () => {
  cy.get(
    ".veRowViewSelectionLayer.notCaret:not(.cutsiteLabelSelectionLayer):not(.veSearchLayer)"
  )
    .first()
    .trigger("contextmenu", { force: true });
  cy.contains(".bp3-menu-item", "Cut").click();
});

Cypress.Commands.add("waitForDialogClose", ({ timeout } = {}) => {
  cy.get(".bp3-dialog", {
    timeout: timeout || 40000
  }).should("not.exist");
});

Cypress.Commands.add("waitForMenuClose", ({ timeout } = {}) => {
  cy.get(".bp3-menu", {
    timeout: timeout || 40000
  }).should("not.exist");
});

Cypress.Commands.add("closeDialog", ({ timeout } = {}) => {
  cy.get(".bp3-dialog-close-button").click();
  cy.waitForDialogClose({ timeout: timeout || 40000 });
});
Cypress.Commands.add("hideMenu", () => {
  cy.get(".bp3-popover").invoke("hide");
});

Cypress.Commands.add("closeToasts", () => {
  cy.window().then(win => {
    win.__tgClearAllToasts();
  });
});

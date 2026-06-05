function getCanvas() {
  return cy.get('[data-testid="ove-three-webgl-canvas"] canvas').first();
}

function getCircularCanvas() {
  return cy
    .get('[data-testid="ove-three-linked-circular-pane"]')
    .find('[data-testid="ove-three-webgl-canvas"] canvas');
}

function triggerCircularContextMenu(x, y) {
  return getCircularCanvas().then($canvas => {
    const rect = $canvas[0].getBoundingClientRect();
    const clientX = rect.left + x;
    const clientY = rect.top + y;

    expect(x, "context menu x").to.be.within(0, rect.width);
    expect(y, "context menu y").to.be.within(0, rect.height);

    return cy.window({ timeout: 10000 }).then(win => {
      const openContextMenu = win.Cypress?.oveThreeNativeContextMenus?.circular;

      if (!openContextMenu) {
        return cy.wrap($canvas).rightclick(x, y, { force: true });
      }

      openContextMenu({
        button: 2,
        buttons: 2,
        clientX,
        clientY,
        preventDefault: () => true,
        stopPropagation: () => true
      });
    });
  });
}

function getRegistry(win, viewId = "circular") {
  return (
    win.Cypress?.oveThreeTestRegistries?.[viewId] ||
    win.Cypress?.oveThreeTestRegistry
  );
}

function assertCanvasIsPainted() {
  getCanvas().should($canvas => {
    const canvas = $canvas[0];
    expect(canvas.width).to.be.greaterThan(0);
    expect(canvas.height).to.be.greaterThan(0);
    expect(canvas.toDataURL("image/png").length).to.be.greaterThan(1000);
  });
}

function assertCanvasPixelIsDark(xRatio, yRatio) {
  getCanvas().then($canvas => {
    const canvas = $canvas[0];
    return new Cypress.Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        const sampleCanvas = document.createElement("canvas");
        sampleCanvas.width = image.width;
        sampleCanvas.height = image.height;
        const context = sampleCanvas.getContext("2d");
        context.drawImage(image, 0, 0);
        const x = Math.floor(image.width * xRatio);
        const y = Math.floor(image.height * yRatio);
        const [red, green, blue] = context.getImageData(x, y, 1, 1).data;

        expect(red + green + blue).to.be.lessThan(90);
        resolve();
      };
      image.onerror = reject;
      image.src = canvas.toDataURL("image/png");
    });
  });
}

function getSceneRevision() {
  return cy
    .get('[data-testid="ove-three-canvas-container"]')
    .invoke("attr", "data-scene-revision");
}

function waitForRegistry() {
  return cy.window({ timeout: 10000 }).should(win => {
    expect(getRegistry(win)).to.have.property("annotations");
  });
}

function findVisibleCircularRegistryEntryByType(annotationTypes) {
  let rect;
  const margin = 12;
  const sortByDistanceToCenter = entries =>
    entries.sort(
      (a, b) =>
        Math.hypot(a.x - rect.width / 2, a.y - rect.height / 2) -
        Math.hypot(b.x - rect.width / 2, b.y - rect.height / 2)
    );

  return getCircularCanvas()
    .then($canvas => {
      rect = $canvas[0].getBoundingClientRect();

      return cy.window({ timeout: 10000 }).should(win => {
        const registry = win.Cypress?.oveThreeTestRegistries?.circular;
        const entries = Object.values(registry?.annotations || {}).filter(
          entry => annotationTypes.includes(entry.annotationType)
        );
        const visibleEntry = sortByDistanceToCenter(
          entries.filter(
            entry =>
              entry.x >= margin &&
              entry.x <= rect.width - margin &&
              entry.y >= margin &&
              entry.y <= rect.height - margin
          )
        );

        expect(
          visibleEntry[0],
          JSON.stringify({
            rect: {
              width: rect.width,
              height: rect.height
            },
            annotationTypes,
            entries: entries.map(entry => ({
              id: entry.annotationId,
              type: entry.annotationType,
              x: entry.x,
              y: entry.y
            }))
          })
        ).to.not.equal(undefined);
      });
    })
    .then(win => {
      const registry = win.Cypress.oveThreeTestRegistries.circular;
      return sortByDistanceToCenter(
        Object.values(registry.annotations).filter(
          entry =>
            annotationTypes.includes(entry.annotationType) &&
            entry.x >= margin &&
            entry.x <= rect.width - margin &&
            entry.y >= margin &&
            entry.y <= rect.height - margin
        )
      )[0];
    });
}

function waitForNativeContext(viewId = "circular") {
  return cy.window({ timeout: 10000 }).should(win => {
    const canvas = win.Cypress?.oveThreeNativeContextCanvases?.[viewId];

    expect(canvas?.isConnected).to.eq(true);
    expect(canvas.getBoundingClientRect().width).to.be.greaterThan(0);
    expect(win.Cypress.oveThreeNativeContextMenus?.[viewId]).to.be.a(
      "function"
    );
  });
}

function waitForSelectedAnnotation(annotationId) {
  return cy.window({ timeout: 10000 }).should(win => {
    expect(getRegistry(win)?.selectedAnnotationId).to.equal(annotationId);
  });
}

describe("ove-three demo", () => {
  beforeEach(() => {
    cy.visit("/");
    getCanvas().should("be.visible");
    assertCanvasIsPainted();
  });

  it("rebuilds the scene when the fixture changes", () => {
    cy.get('[data-testid="demo-sequence-summary"]').contains("2710 bp");

    getSceneRevision().then(firstRevision => {
      cy.get('[data-testid="demo-fixture-select"]').select(
        "large_circular_fixture"
      );

      cy.get('[data-testid="demo-sequence-summary"]').contains(
        "12000 bp circular DNA"
      );
      cy.get('[data-testid="demo-rebuild-status"]').contains(
        "large_circular_fixture"
      );
      getSceneRevision().should("not.equal", firstRevision);

      cy.get('[data-testid="demo-fixture-select"]').select(
        "small_circular_fixture"
      );

      cy.get('[data-testid="demo-sequence-summary"]').contains("128 bp");
      cy.get('[data-testid="demo-rebuild-status"]').contains(
        "small_circular_fixture"
      );
      getSceneRevision().should("not.equal", firstRevision);
    });
  });

  it("switches circular, linear, and row views without blanking the canvas", () => {
    getCanvas().should("be.visible");

    cy.get('[data-testid="demo-view-select"]').select("Linear");
    getCanvas().should("be.visible");
    assertCanvasIsPainted();
    assertCanvasPixelIsDark(0.2, 0.2);
    cy.get('[data-testid="ove-three-linked-linear-pane"]').should("be.visible");
    waitForRegistry();
    cy.window().should(win => {
      const annotations = Object.values(getRegistry(win).annotations);
      const yPositions = annotations.map(annotation => annotation.y);
      expect(
        Math.max(...yPositions) - Math.min(...yPositions)
      ).to.be.greaterThan(70);
    });

    cy.get('[data-testid="demo-view-select"]').select("Row");
    cy.get('[data-testid="ove-three-row-view"]').should("be.visible");
    cy.get('[data-testid="ove-three-row-view"]').should(
      "have.css",
      "background-color",
      "rgb(7, 17, 31)"
    );
    cy.get('[data-testid="ove-three-row-debug"]').contains("Rows");
    getCanvas().should("be.visible");
    assertCanvasIsPainted();
    cy.get('[data-testid="ove-three-scene-stats"]').contains("Draw calls");
  });

  it("exports the visible WebGL canvas as a PNG", () => {
    cy.get('[data-testid="demo-export-png"]').click();

    cy.get('[data-testid="demo-export-status"]').contains("KB ready");
    cy.window()
      .its("__oveThreeLastPng.byteLength")
      .should("be.greaterThan", 100);
  });

  it("routes annotation and background interactions to the demo event log", () => {
    findVisibleCircularRegistryEntryByType(["feature", "part", "primer"]).then(
      entry => {
        getCircularCanvas().click(entry.x, entry.y, { force: true });
        cy.get('[data-testid="demo-last-event"]').contains(
          `click ${entry.annotationId}`
        );
      }
    );
    cy.get('[data-testid="demo-clear-selection"]').click();
    cy.get('[data-testid="demo-selected-annotation-card"]').should("not.exist");
    waitForRegistry();
    waitForSelectedAnnotation(null);

    triggerCircularContextMenu(8, 8);
    cy.get('[data-testid="demo-last-event"]').contains(
      "right-click background"
    );
  });

  it("routes right-clicks to feature, primer, and cutsite targets", () => {
    waitForRegistry();
    waitForNativeContext("circular");

    [["feature", "part"], ["primer"], ["cutsite"]].forEach(annotationTypes => {
      findVisibleCircularRegistryEntryByType(annotationTypes).then(entry => {
        triggerCircularContextMenu(entry.x, entry.y);
        cy.get('[data-testid="demo-last-event"]').contains(
          `right-click ${entry.annotationId}`
        );
      });
    });
  });

  it("toggles biological layers from the demo panel", () => {
    waitForRegistry();
    cy.window().should(win => {
      expect(getRegistry(win).annotationNames["lacI promoter"]).to.be.a(
        "string"
      );
    });

    cy.get('[data-testid="demo-layer-feature"]').uncheck();
    cy.get('[data-testid="demo-last-event"]').contains("feature hidden");
    waitForRegistry();
    cy.window().should(win => {
      expect(getRegistry(win).annotationNames["lacI promoter"]).to.equal(
        undefined
      );
    });

    cy.get('[data-testid="demo-layer-feature"]').check();
    cy.get('[data-testid="demo-last-event"]').contains("feature shown");
    waitForRegistry();
    cy.window().should(win => {
      expect(getRegistry(win).annotationNames["lacI promoter"]).to.be.a(
        "string"
      );
    });
  });

  it("keeps the annotation navigator in sync with layer visibility", () => {
    cy.get('[data-testid="demo-annotation-medium-primer-1"]').should("exist");

    cy.get('[data-testid="demo-layer-primer"]').uncheck();
    cy.get('[data-testid="demo-last-event"]').contains("primer hidden");
    cy.get('[data-testid="demo-annotation-medium-primer-1"]').should(
      "not.exist"
    );

    cy.get('[data-testid="demo-layer-primer"]').check();
    cy.get('[data-testid="demo-last-event"]').contains("primer shown");
    cy.get('[data-testid="demo-annotation-medium-primer-1"]').should("exist");
  });

  it("focuses a feature from the side panel and scrolls Row view to it", () => {
    cy.get('[data-testid="demo-view-select"]').select("Row");

    cy.get('[data-testid="demo-annotation-ori"]').click();
    cy.get('[data-testid="demo-last-event"]').contains("focus ori");
    cy.get('[data-testid="demo-selected-annotation"]').contains("ori");
    cy.get('[data-testid="ove-three-row-debug"]').should($debug => {
      const startRow = Number($debug.attr("data-visible-start-row"));
      const endRow = Number($debug.attr("data-visible-end-row"));
      expect(startRow).to.be.at.most(22);
      expect(endRow).to.be.at.least(22);
    });
    assertCanvasIsPainted();
  });

  it("keeps annotation focus when switching between view types", () => {
    cy.get('[data-testid="demo-annotation-ori"]').click();
    cy.get('[data-testid="demo-last-event"]').contains("focus ori");
    waitForRegistry();
    waitForSelectedAnnotation("ori");

    cy.get('[data-testid="demo-view-select"]').select("Linear");
    waitForRegistry();
    waitForSelectedAnnotation("ori");

    cy.get('[data-testid="demo-view-select"]').select("Row");
    cy.get('[data-testid="ove-three-row-debug"]').should($debug => {
      const startRow = Number($debug.attr("data-visible-start-row"));
      const endRow = Number($debug.attr("data-visible-end-row"));
      expect(startRow).to.be.at.most(22);
      expect(endRow).to.be.at.least(22);
    });
    waitForRegistry();
    waitForSelectedAnnotation("ori");
    assertCanvasIsPainted();
  });

  it("focuses primer and cutsite annotations from the side panel", () => {
    waitForRegistry();

    cy.get('[data-testid="demo-annotation-medium-primer-1"]').click();
    cy.get('[data-testid="demo-last-event"]').contains("focus medium-primer-1");
    cy.get('[data-testid="demo-selected-annotation"]').contains(
      "Example Primer 1"
    );
    waitForSelectedAnnotation("medium-primer-1");

    cy.get('[data-testid="demo-annotation-medium-hindiii"]').click();
    cy.get('[data-testid="demo-last-event"]').contains("focus medium-hindiii");
    cy.get('[data-testid="demo-selected-annotation"]').contains("HindIII");
    waitForSelectedAnnotation("medium-hindiii");
  });

  it("filters annotations and clears focused annotation details", () => {
    cy.get('[data-testid="demo-annotation-search"]').type("gfp");

    cy.get('[data-testid="demo-annotation-gfp"]').should("exist");
    cy.get('[data-testid="demo-annotation-laci-promoter"]').should("not.exist");

    cy.get('[data-testid="demo-annotation-gfp"]').click();
    cy.get('[data-testid="demo-selected-annotation-card"]').contains("GFP");
    cy.get('[data-testid="demo-selected-annotation-type"]').contains("feature");
    cy.get('[data-testid="demo-selected-annotation-length"]').contains(
      "720 bp"
    );

    cy.get('[data-testid="demo-selected-focus"]').click();
    cy.get('[data-testid="demo-last-event"]').contains("focus gfp");

    cy.get('[data-testid="demo-clear-selection"]').click();
    cy.get('[data-testid="demo-selected-annotation-card"]').should("not.exist");
    cy.get('[data-testid="demo-last-event"]').contains("selection cleared");
  });

  it("steps through filtered annotations and resets annotation search", () => {
    cy.get('[data-testid="demo-annotation-search"]').type("primer");
    cy.get('[data-testid="demo-annotation-result-count"]').contains(
      "2 results"
    );

    cy.get('[data-testid="demo-prev-annotation"]').click();
    cy.get('[data-testid="demo-selected-annotation"]').contains(
      "Reverse Primer"
    );
    cy.get('[data-testid="demo-last-event"]').contains("focus medium-primer-2");

    cy.get('[data-testid="demo-next-annotation"]').click();
    cy.get('[data-testid="demo-selected-annotation"]').contains(
      "Example Primer 1"
    );
    cy.get('[data-testid="demo-last-event"]').contains("focus medium-primer-1");

    cy.get('[data-testid="demo-next-annotation"]').click();
    cy.get('[data-testid="demo-selected-annotation"]').contains(
      "Reverse Primer"
    );
    cy.get('[data-testid="demo-last-event"]').contains("focus medium-primer-2");

    cy.get('[data-testid="demo-prev-annotation"]').click();
    cy.get('[data-testid="demo-selected-annotation"]').contains(
      "Example Primer 1"
    );

    cy.get('[data-testid="demo-reset-annotation-search"]').click();
    cy.get('[data-testid="demo-annotation-search"]').should("have.value", "");
    cy.get('[data-testid="demo-annotation-laci-promoter"]').should("exist");
    cy.get('[data-testid="demo-last-event"]').contains(
      "annotation search reset"
    );
  });

  it("keeps a recent annotation history and can refocus entries", () => {
    cy.get('[data-testid="demo-annotation-gfp"]').click();
    cy.get('[data-testid="demo-annotation-ori"]').click();

    cy.get('[data-testid="demo-recent-annotation-ori"]').should("exist");
    cy.get('[data-testid="demo-recent-annotation-gfp"]').should("exist");

    cy.get('[data-testid="demo-recent-annotation-gfp"]').click();
    cy.get('[data-testid="demo-selected-annotation"]').contains("GFP");
    cy.get('[data-testid="demo-last-event"]').contains("focus gfp");

    cy.get('[data-testid="demo-clear-recent-annotations"]').click();
    cy.get('[data-testid="demo-recent-empty"]').contains(
      "No recent selections"
    );
    cy.get('[data-testid="demo-last-event"]').contains(
      "recent selections cleared"
    );
  });

  it("shows row search hits and scrolls the row view to the match", () => {
    cy.get('[data-testid="demo-view-select"]').select("Row");
    cy.get('[data-testid="demo-fixture-select"]').select("huge_row_fixture");
    cy.get('[data-testid="demo-sequence-summary"]').contains("50000 bp");
    cy.get('[data-testid="ove-three-row-debug"]').contains("1-");
    cy.contains("Search hits").click();
    cy.get('[data-testid="ove-three-row-debug"]').should($debug => {
      const startRow = Number($debug.attr("data-visible-start-row"));
      const endRow = Number($debug.attr("data-visible-end-row"));
      expect(startRow).to.be.at.most(312);
      expect(endRow).to.be.at.least(312);
    });
    assertCanvasIsPainted();
  });

  it("keeps linear stress fixtures out of circular view", () => {
    cy.get('[data-testid="demo-fixture-select"]').select("huge_row_fixture");

    cy.get('[data-testid="demo-view-select"]').should("have.value", "row");
    cy.get('[data-testid="demo-view-select"] option[value="circular"]').should(
      "be.disabled"
    );
    cy.get('[data-testid="ove-three-row-view"]').should("be.visible");
    assertCanvasIsPainted();
  });

  it("keeps the 200k row fixture scrollable and non-blank", () => {
    cy.get('[data-testid="demo-fixture-select"]').select("row_200k_fixture");

    cy.get('[data-testid="demo-sequence-summary"]').contains("200000 bp");
    cy.get('[data-testid="demo-view-select"]').should("have.value", "row");
    cy.get('[data-testid="ove-three-row-view"]').should("be.visible");
    cy.contains("Search hits").click();
    cy.get('[data-testid="ove-three-row-debug"]').should($debug => {
      const startRow = Number($debug.attr("data-visible-start-row"));
      const endRow = Number($debug.attr("data-visible-end-row"));
      expect(startRow).to.be.at.most(1250);
      expect(endRow).to.be.at.least(1250);
    });
    assertCanvasIsPainted();
  });

  it("renders after mobile resize without losing the canvas", () => {
    cy.viewport(390, 844);
    cy.reload();

    getCanvas().should("be.visible");
    assertCanvasIsPainted();
    cy.get('[data-testid="demo-view-select"]').select("Row");
    cy.get('[data-testid="ove-three-row-view"]').should("be.visible");
    assertCanvasIsPainted();
  });

  it("limits dense circular labels to a readable set", () => {
    cy.get('[data-testid="demo-fixture-select"]').select(
      "dense_annotations_fixture"
    );
    waitForRegistry();

    cy.window().should(win => {
      const labels = Object.values(getRegistry(win).labels);
      expect(labels.length).to.be.at.most(72);
      expect(labels.some(label => label.annotationType === "cutsite")).to.eq(
        false
      );
      expect(getRegistry(win).labelOverlapCount).to.eq(0);
    });
    assertCanvasIsPainted();
  });

  it("keeps development planning copy out of the demo UI", () => {
    cy.contains("Day 50-100").should("not.exist");
    cy.contains("Automation gates").should("not.exist");
    cy.get('[data-testid="demo-verification-checklist"]').should("not.exist");
  });
});

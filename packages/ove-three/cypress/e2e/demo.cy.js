function getCanvas() {
  return cy.get('[data-testid="ove-three-webgl-canvas"] canvas');
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
  return cy.window().should(win => {
    expect(win.Cypress.oveThreeTestRegistry).to.have.property("annotations");
    expect(win.Cypress.oveThreeNativeContextCanvas?.isConnected).to.eq(true);
    expect(
      win.Cypress.oveThreeNativeContextCanvas.getBoundingClientRect().width
    ).to.be.greaterThan(0);
    expect(win.Cypress.oveThreeNativeContextMenu).to.be.a("function");
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
    cy.get('[data-testid="ove-three-scene-stats"]').contains("Draw calls");
    waitForRegistry();
    cy.window().should(win => {
      const annotations = Object.values(
        win.Cypress.oveThreeTestRegistry.annotations
      );
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
      "rgb(248, 250, 252)"
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
    waitForRegistry();
    cy.window().then(win => {
      const registry = win.Cypress.oveThreeTestRegistry;
      const annotationId = registry.annotationNames["lacI promoter"];
      const entry = registry.annotations[annotationId];
      getCanvas().click(entry.x, entry.y, { force: true });
    });
    cy.get('[data-testid="demo-last-event"]').contains("click lacI-promoter");

    getCanvas().rightclick(8, 8, { force: true });
    cy.get('[data-testid="demo-last-event"]').contains(
      "right-click background"
    );
  });

  it("routes right-clicks to feature, primer, and cutsite targets", () => {
    waitForRegistry();

    [
      ["lacI promoter", "lacI-promoter"],
      ["Example Primer 1", "medium-primer-1"],
      ["HindIII", "medium-hindiii"]
    ].forEach(([name, expectedId]) => {
      cy.window().then(win => {
        const registry = win.Cypress.oveThreeTestRegistry;
        const annotationId = registry.annotationNames[name];
        const entry = registry.annotations[annotationId];
        win.Cypress.oveThreeNativeContextMenu(
          new win.MouseEvent("contextmenu", {
            button: 2,
            buttons: 2,
            clientX: entry.clientX,
            clientY: entry.clientY,
            bubbles: true,
            cancelable: true
          })
        );

        const pick = win.Cypress.oveThreeLastNativeContextPick;
        if (pick?.annotationId !== expectedId) {
          throw new Error(JSON.stringify({ name, expectedId, entry, pick }));
        }
      });
      cy.get('[data-testid="demo-last-event"]').contains(
        `right-click ${expectedId}`
      );
    });
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
      const labels = Object.values(win.Cypress.oveThreeTestRegistry.labels);
      expect(labels.length).to.be.at.most(72);
      expect(labels.some(label => label.annotationType === "cutsite")).to.eq(
        false
      );
      expect(win.Cypress.oveThreeTestRegistry.labelOverlapCount).to.eq(0);
    });
    assertCanvasIsPainted();
  });

  it("keeps development planning copy out of the demo UI", () => {
    cy.contains("Day 50-100").should("not.exist");
    cy.contains("Automation gates").should("not.exist");
    cy.get('[data-testid="demo-verification-checklist"]').should("not.exist");
  });
});

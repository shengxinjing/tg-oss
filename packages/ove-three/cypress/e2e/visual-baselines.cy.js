function assertVisibleCanvasPainted() {
  cy.get('[data-testid="ove-three-webgl-canvas"] canvas')
    .filter(":visible")
    .first()
    .should($canvas => {
      const canvas = $canvas[0];

      expect(canvas.width).to.be.greaterThan(0);
      expect(canvas.height).to.be.greaterThan(0);
      expect(canvas.toDataURL("image/png").length).to.be.greaterThan(1000);
    });
}

function captureBaseline(name) {
  assertVisibleCanvasPainted();
  cy.screenshot(`visual-baselines/${name}`, {
    capture: "viewport",
    overwrite: true
  });
}

describe("ove-three visual baselines", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("captures linked circular default baseline", () => {
    cy.get('[data-testid="ove-three-linked-map-layout"]').should("be.visible");
    cy.get('[data-testid="ove-three-linked-circular-pane"]').should(
      "be.visible"
    );
    cy.get('[data-testid="ove-three-linked-sequence-pane"]').should(
      "be.visible"
    );

    captureBaseline("circular-default-linked");
  });

  it("captures linked linear default baseline", () => {
    cy.get('[data-testid="ove-three-tab-linear"]').click();
    cy.get('[data-testid="ove-three-linked-map-layout"]').should("be.visible");
    cy.get('[data-testid="ove-three-linked-linear-pane"]').should("be.visible");
    cy.get('[data-testid="ove-three-linked-sequence-pane"]').should(
      "be.visible"
    );

    captureBaseline("linear-default-linked");
  });

  it("captures dense circular label baseline", () => {
    cy.get('[data-testid="demo-fixture-select"]').select(
      "dense_annotations_fixture"
    );
    cy.contains("label", "Label boxes").find("input").check();
    cy.get('[data-testid="ove-three-linked-circular-pane"]').should(
      "be.visible"
    );

    captureBaseline("dense-circular-labels");
  });

  it("captures huge row baseline", () => {
    cy.get('[data-testid="demo-fixture-select"]').select("huge_row_fixture");
    cy.get('[data-testid="demo-view-select"]').select("Row");
    cy.get('[data-testid="ove-three-row-view"]').should("be.visible");
    cy.get('[data-testid="ove-three-row-debug"]').contains("Rows");

    captureBaseline("row-huge-scroll");
  });

  it("captures 200k row baseline", () => {
    cy.get('[data-testid="demo-fixture-select"]').select("row_200k_fixture");
    cy.get('[data-testid="demo-view-select"]').select("Row");
    cy.get('[data-testid="ove-three-row-view"]').should("be.visible");
    cy.get('[data-testid="ove-three-row-debug"]').contains("Rows");

    captureBaseline("row-200k-scroll");
  });
});

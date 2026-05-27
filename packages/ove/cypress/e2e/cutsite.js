describe("cutsiteInfoView", function () {
  beforeEach(() => {
    cy.visit("");
  });
  it(`meta/cmd clicking a cutsite should cause it to select the recognition site`, () => {
    cy.contains(".veLabelText", "AatII").click({ cmdKey: true });
    cy.contains("Selecting 6 bps from 1 to 6");
  });
  it(`option/alt clicking a cutsite should cause it to select the cutsite bottom snip`, () => {
    cy.contains(".veLabelText", "AatII").click({ altKey: true });
    cy.contains("Caret Between Bases 1 and 2");
  });
  it(`regular clicking a cutsite should cause it to select the cutsite top snip`, () => {
    cy.contains(".veLabelText", "AatII").click();
    cy.contains("Caret Between Bases 5 and 6");
  });
});

describe("three circular cutsite canvas helpers", () => {
  it("clicks a circular cutsite through the canvas registry", () => {
    cy.visit("#/Editor?useThreeCircularView=true");
    cy.get(`[data-testid="ove-three-circular-view-adapter"]`).should("exist");

    cy.getCanvasAnnotation("AatII").should(annotation => {
      expect(annotation.annotationType).to.eq("cutsite");
    });

    cy.clickCanvasAnnotation("AatII");
    cy.contains("Caret Between Bases");
  });
});

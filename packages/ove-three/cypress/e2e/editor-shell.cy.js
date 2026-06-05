describe("ove-three editor shell", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("renders the OVE-style editor shell", () => {
    cy.get('[data-testid="ove-three-editor-shell"]').should("be.visible");
    cy.get('[data-testid="ove-three-menu-bar"]').within(() => {
      cy.contains("File");
      cy.contains("Edit");
      cy.contains("View");
      cy.root().should("not.contain", "Tools");
      cy.root().should("not.contain", "Help");
    });
    cy.get('[data-testid="ove-three-toolbar"]').within(() => {
      cy.contains("Save");
      cy.contains("Import");
      cy.contains("Export");
      cy.contains("Find");
    });
    cy.get('[data-testid="ove-three-status-bar"]').within(() => {
      cy.contains("DNA");
      cy.contains("Editable");
      cy.contains("Circular");
      cy.contains("Length:");
    });
  });

  it("keeps the circular canvas centered while the side panel scrolls", () => {
    cy.get('[data-testid="ove-three-canvas-container"]').should("be.visible");
    cy.window().should(win => {
      const pageHeight = Math.max(
        win.document.documentElement.scrollHeight,
        win.document.body.scrollHeight
      );
      expect(pageHeight).to.be.at.most(win.innerHeight + 2);
    });
    cy.get(".ove-three-demo__panel").should($panel => {
      const panel = $panel[0];
      expect(panel.scrollHeight).to.be.greaterThan(panel.clientHeight);
    });
    cy.get('[data-testid="ove-three-linked-circular-pane"]')
      .find('[data-testid="ove-three-webgl-canvas"] canvas')
      .should($canvas => {
        const canvas = $canvas[0];
        const win = canvas.ownerDocument.defaultView;
        const rect = canvas.getBoundingClientRect();

        expect(rect.top).to.be.lessThan(300);
        expect(rect.bottom).to.be.greaterThan(win.innerHeight - 80);
      });
    cy.window({ timeout: 10000 }).should(win => {
      const registry = win.Cypress?.oveThreeTestRegistries?.circular;
      const annotationId = registry?.annotationNames?.["lacI promoter"];
      const entry = registry?.annotations?.[annotationId];

      expect(entry?.clientY).to.be.greaterThan(80);
      expect(entry?.clientY).to.be.lessThan(win.innerHeight - 60);
    });
  });

  it("switches editor tabs and keeps the view selector in sync", () => {
    cy.get('[data-testid="ove-three-tab-linear"]').click();
    cy.get('[data-testid="demo-view-select"]').should("have.value", "linear");
    cy.get('[data-testid="ove-three-linear-fit-summary"]').should(
      "contain",
      "Linear fit"
    );

    cy.get('[data-testid="ove-three-tab-sequence"]').click();
    cy.get('[data-testid="demo-view-select"]').should("have.value", "row");
    cy.get('[data-testid="ove-three-row-view"]').should("be.visible");

    cy.get('[data-testid="ove-three-tab-circular"]').click();
    cy.get('[data-testid="demo-view-select"]').should("have.value", "circular");
  });

  it("links circular and sequence map selection highlights", () => {
    cy.get('[data-testid="ove-three-linked-map-layout"]').should("be.visible");
    cy.get('[data-testid="ove-three-linked-circular-pane"]').should(
      "be.visible"
    );
    cy.get('[data-testid="ove-three-linked-sequence-pane"]').should(
      "be.visible"
    );

    cy.get('[data-testid="demo-annotation-gfp"]').scrollIntoView().click();
    cy.get('[data-testid="ove-three-selection-range"]').contains("763-1482");
    cy.get('[data-testid="ove-three-linked-circular-pane"]').within(() => {
      cy.get('[data-testid="ove-three-edit-preview"]').contains("763-1482");
    });
    cy.get('[data-testid="ove-three-linked-sequence-pane"]').within(() => {
      cy.get('[data-testid="ove-three-edit-preview"]').contains("763-1482");
    });
  });

  it("keeps the linked sequence map large enough to read", () => {
    cy.get('[data-testid="ove-three-linked-map-layout"]').then($layout => {
      const layoutRect = $layout[0].getBoundingClientRect();

      cy.get('[data-testid="ove-three-linked-sequence-pane"]').should($pane => {
        const paneRect = $pane[0].getBoundingClientRect();

        expect(paneRect.width / layoutRect.width).to.be.greaterThan(0.52);
      });
    });

    cy.get('[data-testid="ove-three-linked-sequence-pane"]').within(() => {
      cy.get('[data-testid="ove-three-row-view"]').should(
        "have.attr",
        "data-bases-per-row",
        "56"
      );
      cy.get('[data-testid="ove-three-row-view"]').should(
        "have.attr",
        "data-visible-row-count",
        "6"
      );
    });
  });

  it("can collapse and expand the linked sequence map", () => {
    cy.get('[data-testid="ove-three-linked-circular-pane"]').then($pane => {
      const linkedPrimaryWidth = $pane[0].getBoundingClientRect().width;

      cy.get('[data-testid="ove-three-collapse-linked-sequence"]').click();
      cy.get('[data-testid="ove-three-linked-map-layout"]').should(
        "be.visible"
      );
      cy.get('[data-testid="demo-linked-sequence-map"]').should("be.checked");
      cy.get('[data-testid="ove-three-linked-sequence-rail"]').should(
        "be.visible"
      );
      cy.get('[data-testid="ove-three-canvas-container"]').should($viewer => {
        expect($viewer[0].getBoundingClientRect().width).to.be.greaterThan(
          linkedPrimaryWidth + 100
        );
      });
    });

    cy.get('[data-testid="ove-three-expand-linked-sequence"]').click();
    cy.get('[data-testid="ove-three-linked-map-layout"]').should("be.visible");
    cy.get('[data-testid="ove-three-linked-sequence-pane"]').should(
      "be.visible"
    );
    cy.get('[data-testid="ove-three-linked-sequence-rail"]').should(
      "not.exist"
    );
  });

  it("can show and hide performance stats in linked map mode", () => {
    cy.get('[data-testid="ove-three-linked-map-layout"]').should("be.visible");
    cy.get('[data-testid="ove-three-scene-stats"]').should(
      "have.length.at.least",
      2
    );
    cy.get('[data-testid="ove-three-linked-circular-pane"]').within(() => {
      cy.get('[data-testid="ove-three-scene-stats"]').contains("Draw calls");
    });
    cy.get('[data-testid="ove-three-linked-sequence-pane"]').within(() => {
      cy.get('[data-testid="ove-three-scene-stats"]').contains("Objects");
    });

    cy.get('[data-testid="demo-performance-stats"]').uncheck();
    cy.get('[data-testid="ove-three-scene-stats"]').should("not.exist");

    cy.get('[data-testid="demo-performance-stats"]').check();
    cy.get('[data-testid="ove-three-scene-stats"]').should(
      "have.length.at.least",
      2
    );
  });

  it("links linear and sequence map selection highlights", () => {
    cy.get('[data-testid="ove-three-tab-linear"]').click();
    cy.get('[data-testid="ove-three-linked-map-layout"]').should("be.visible");
    cy.get('[data-testid="ove-three-linked-linear-pane"]').should("be.visible");
    cy.get('[data-testid="ove-three-linked-sequence-pane"]').should(
      "be.visible"
    );

    cy.get('[data-testid="demo-annotation-gfp"]').scrollIntoView().click();
    cy.get('[data-testid="ove-three-selection-range"]').contains("763-1482");
    cy.get('[data-testid="ove-three-linked-linear-pane"]').within(() => {
      cy.get('[data-testid="ove-three-edit-preview"]').contains("763-1482");
    });
    cy.get('[data-testid="ove-three-linked-sequence-pane"]').within(() => {
      cy.get('[data-testid="ove-three-edit-preview"]').contains("763-1482");
    });
  });

  it("exposes circular view controls and updates their readout", () => {
    cy.get('[data-testid="ove-three-tab-circular"]').click();

    cy.get('[data-testid="demo-circular-zoom"]')
      .invoke("val", 1.8)
      .trigger("input");
    cy.get('[data-testid="demo-circular-rotation"]')
      .invoke("val", 90)
      .trigger("input");

    cy.get('[data-testid="demo-circular-control-summary"]').contains(
      "Zoom 1.8x"
    );
    cy.get('[data-testid="demo-circular-control-summary"]').contains(
      "Rotation 90"
    );
    cy.get('[data-testid="demo-circular-minimap"]').should(
      "have.attr",
      "data-rotation",
      "90"
    );
    cy.get('[data-testid="demo-circular-sequence-preview"]').should(
      "contain",
      "Zoomed sequence"
    );
    cy.get('[data-testid="demo-circular-axis"]').uncheck();
    cy.get('[data-testid="demo-circular-axis-numbers"]').uncheck();
    cy.get('[data-testid="demo-circular-layer-summary"]').contains("axis off");
    cy.get('[data-testid="demo-circular-layer-summary"]').contains(
      "numbers off"
    );
  });

  it("rotates the circular map with the mouse wheel without changing zoom", () => {
    cy.get('[data-testid="ove-three-tab-circular"]').click();
    cy.get('[data-testid="demo-circular-zoom"]').should("have.value", "1");
    cy.get('[data-testid="demo-circular-control-summary"]').contains(
      "Rotation 0"
    );

    cy.get('[data-testid="ove-three-linked-circular-pane"]')
      .find('[data-testid="ove-three-webgl-canvas"] canvas')
      .trigger("wheel", { deltaY: 120, force: true });

    cy.get('[data-testid="demo-circular-zoom"]').should("have.value", "1");
    cy.get('[data-testid="demo-circular-control-summary"]').contains(
      "Rotation 10"
    );
    cy.get('[data-testid="demo-circular-minimap"]').should(
      "have.attr",
      "data-rotation",
      "10"
    );
  });

  it("switches the linked right pane between sequence and linear map", () => {
    cy.get('[data-testid="ove-three-linked-sequence-pane"]')
      .should("have.attr", "data-linked-view-type", "row")
      .within(() => {
        cy.contains("Sequence Map");
        cy.get('[data-testid="ove-three-row-view"]').should("be.visible");
      });

    cy.get('[data-testid="ove-three-linked-secondary-linear"]').click();
    cy.get('[data-testid="ove-three-linked-sequence-pane"]')
      .should("have.attr", "data-linked-view-type", "linear")
      .within(() => {
        cy.contains("Linear Map");
        cy.get('[data-testid="ove-three-row-view"]').should("not.exist");
        cy.get('[data-testid="ove-three-webgl-canvas"] canvas').should(
          "be.visible"
        );
      });

    cy.get('[data-testid="ove-three-linked-secondary-row"]').click();
    cy.get('[data-testid="ove-three-linked-sequence-pane"]')
      .should("have.attr", "data-linked-view-type", "row")
      .within(() => {
        cy.contains("Sequence Map");
        cy.get('[data-testid="ove-three-row-view"]').should("be.visible");
      });
  });

  it("exposes linear map fit and zoom controls", () => {
    cy.get('[data-testid="ove-three-tab-linear"]').click();

    cy.get('[data-testid="demo-linear-zoom"]')
      .invoke("val", 1.6)
      .trigger("input");
    cy.get('[data-testid="demo-linear-control-summary"]').contains("Zoom 1.6x");
    cy.get('[data-testid="ove-three-linear-fit-summary"]').contains(
      "Linear fit"
    );
  });

  it("keeps selection while changing editor panel layout", () => {
    cy.get('button[data-testid^="demo-annotation-"]').first().click();
    cy.get('[data-testid="demo-selected-annotation-card"]')
      .scrollIntoView()
      .should("be.visible");
    cy.get('[data-testid="ove-three-edit-preview"]')
      .first()
      .within(() => {
        cy.contains("Selection");
        cy.contains("Delete preview").should("not.exist");
        cy.contains("Replace preview").should("not.exist");
      });

    cy.get('[data-testid="ove-three-fullscreen-toggle"]').click();
    cy.get('[data-testid="ove-three-editor-shell"]').should(
      "have.attr",
      "data-layout-mode",
      "fullscreen"
    );
    cy.get('[data-testid="ove-three-fullscreen-toggle"]').click();

    cy.get('[data-testid="ove-three-side-panel-toggle"]').click();
    cy.get('[data-testid="ove-three-editor-shell"]').should(
      "have.attr",
      "data-side-panel",
      "collapsed"
    );
    cy.get('[data-testid="ove-three-side-panel-toggle"]').click();
    cy.get('[data-testid="demo-selected-annotation-card"]')
      .scrollIntoView()
      .should("be.visible");

    cy.get('[data-testid="ove-three-close-active-tab"]').click();
    cy.get('[data-testid="ove-three-closed-panel"]').should("be.visible");
    cy.get('[data-testid="ove-three-reopen-panels"]').click();
    cy.get('[data-testid="demo-selected-annotation-card"]')
      .scrollIntoView()
      .should("be.visible");
  });

  it("exposes circular label, cutsite, ORF, and limit options", () => {
    cy.get('[data-testid="ove-three-tab-circular"]').click();

    cy.get('[data-testid="demo-circular-label-size"]')
      .invoke("val", 1.4)
      .trigger("input");
    cy.get('[data-testid="demo-circular-label-line-intensity"]')
      .invoke("val", 0.35)
      .trigger("input");
    cy.get('[data-testid="demo-circular-internal-labels"]').check();
    cy.get('[data-testid="demo-circular-only-overflow-labels"]').check();
    cy.get('[data-testid="demo-circular-cutsite-filter"]').type("EcoRI");
    cy.get('[data-testid="demo-circular-orf-min-size"]').clear().type("120");
    cy.get('[data-testid="demo-annotation-limit"]').clear().type("24");

    cy.get('[data-testid="demo-circular-view-option-summary"]').contains(
      "label 1.4x"
    );
    cy.get('[data-testid="demo-circular-view-option-summary"]').contains(
      "line 0.35"
    );
    cy.get('[data-testid="demo-circular-view-option-summary"]').contains(
      "cutsite EcoRI"
    );
    cy.get('[data-testid="demo-circular-view-option-summary"]').contains(
      "ORF 120 bp"
    );
    cy.get('[data-testid="demo-circular-warning"]').contains(
      "Annotation display limit 24"
    );
  });

  it("exposes linear title, GC/AA plot, and annotation limit controls", () => {
    cy.get('[data-testid="ove-three-tab-linear"]').click();

    cy.get('[data-testid="ove-three-linear-title"]').contains("pUC57");
    cy.get('[data-testid="ove-three-linear-title"]').contains("bp");
    cy.get('[data-testid="demo-show-gc-aa-plot"]').check();
    cy.get('[data-testid="ove-three-linear-gc-aa-plot"]').should("be.visible");
    cy.get('[data-testid="demo-annotation-limit"]').clear().type("18");
    cy.get('[data-testid="demo-linear-control-summary"]').contains("limit 18");
  });

  it("exposes row sequence display controls", () => {
    cy.get('[data-testid="ove-three-tab-sequence"]').click();

    cy.get('[data-testid="demo-row-case"]').select("Lowercase");
    cy.get('[data-testid="demo-row-strand-hints"]').check();
    cy.get('[data-testid="demo-row-reverse"]').check();
    cy.get('[data-testid="demo-row-base-colors"]').check();
    cy.get('[data-testid="demo-row-base-spacing"]')
      .invoke("val", 1.3)
      .trigger("input");
    cy.get('[data-testid="demo-row-aa-color-mode"]').select("Hydrophobicity");

    cy.get('[data-testid="demo-row-control-summary"]').contains("lowercase");
    cy.get('[data-testid="demo-row-control-summary"]').contains("reverse");
    cy.get('[data-testid="demo-row-control-summary"]').contains("5'/3'");
    cy.get('[data-testid="ove-three-row-debug"]').should($debug => {
      expect($debug.attr("data-sequence-case")).to.equal("lower");
      expect($debug.attr("data-reverse-row-sequence")).to.equal("true");
      expect($debug.attr("data-show-strand-hints")).to.equal("true");
      expect($debug.attr("data-show-dna-base-colors")).to.equal("true");
      expect($debug.attr("data-amino-acid-color-mode")).to.equal(
        "hydrophobicity"
      );
    });
  });

  it("exposes row jump and support controls", () => {
    cy.get('[data-testid="ove-three-tab-sequence"]').click();
    cy.get('[data-testid="demo-row-jump-end"]').click();
    cy.get('[data-testid="ove-three-row-debug"]').should($debug => {
      expect(Number($debug.attr("data-visible-start-row"))).to.be.greaterThan(
        0
      );
    });
    cy.get('[data-testid="demo-row-jump-start"]').click();
    cy.get('[data-testid="ove-three-row-debug"]').should(
      "have.attr",
      "data-visible-start-row",
      "0"
    );

    cy.get('[data-testid="demo-annotations-to-support"]').select(
      "Features + primers"
    );
    cy.get('[data-testid="demo-view-options-smoke-summary"]').contains(
      "features + primers"
    );
  });

  it("exposes row warning and chromatogram smoke layers", () => {
    cy.get('[data-testid="ove-three-tab-sequence"]').click();

    cy.get('[data-testid="demo-row-warnings"]').check();
    cy.get('[data-testid="demo-row-chromatogram"]').check();

    cy.get('[data-testid="ove-three-row-warning-layer"]').contains("Warnings");
    cy.get('[data-testid="ove-three-row-chromatogram-layer"]').contains(
      "Chromatogram"
    );
  });

  it("can show and hide all biological layers at once", () => {
    cy.get('[data-testid="demo-hide-all-layers"]').click();
    cy.get('[data-testid="demo-layer-feature"]').should("not.be.checked");
    cy.get('[data-testid="demo-layer-primer"]').should("not.be.checked");
    cy.get('[data-testid="demo-last-event"]').contains("all layers hidden");

    cy.get('[data-testid="demo-show-all-layers"]').click();
    cy.get('[data-testid="demo-layer-feature"]').should("be.checked");
    cy.get('[data-testid="demo-layer-primer"]').should("be.checked");
    cy.get('[data-testid="demo-last-event"]').contains("all layers shown");
  });

  it("runs File menu and toolbar smoke commands", () => {
    cy.get('[data-testid="ove-three-toolbar-file-save"]').click();
    cy.get('[data-testid="ove-three-save-status"]').contains("saved");

    cy.get('[data-testid="ove-three-command-file-saveas"]').click();
    cy.get('[data-testid="ove-three-save-status"]').contains("save as ready");

    cy.get('[data-testid="ove-three-command-file-exportfasta"]').click();
    cy.get('[data-testid="ove-three-serialized-export"]').contains("fasta");
    cy.get('[data-testid="ove-three-command-file-exportgenbank"]').click();
    cy.get('[data-testid="ove-three-serialized-export"]').contains("genbank");
    cy.get('[data-testid="ove-three-command-file-exportjson"]').click();
    cy.get('[data-testid="ove-three-serialized-export"]').contains("json");

    cy.get('[data-testid="ove-three-toolbar-file-importsequence"]').click();
    cy.get('[data-testid="demo-rebuild-status"]').contains("_imported");
    cy.get('[data-testid="demo-last-event"]').contains("sequence imported");
  });

  it("runs Edit commands with selection, history, and read-only locking", () => {
    cy.get('[data-testid="ove-three-menu-edit"]').click();
    cy.get('[data-testid="ove-three-command-edit-selectall"]').click();
    cy.get('[data-testid="ove-three-selection-range"]').contains("1-2710");

    cy.get('[data-testid="ove-three-command-edit-copy"]').click();
    cy.get('[data-testid="ove-three-clipboard-status"]').should(
      "not.contain",
      "empty"
    );

    cy.get('[data-testid="ove-three-command-edit-cut"]').click();
    cy.get('[data-testid="demo-last-event"]').contains("cut");
    cy.get('[data-testid="ove-three-history-status"]').contains("undo 1");

    cy.get('[data-testid="ove-three-command-edit-undo"]').click();
    cy.get('[data-testid="demo-last-event"]').contains("undo");
    cy.get('[data-testid="ove-three-history-status"]').contains("redo 1");

    cy.get('[data-testid="ove-three-command-edit-redo"]').click();
    cy.get('[data-testid="demo-last-event"]').contains("redo");

    cy.get('[data-testid="ove-three-edit-mode"]').select("Read Only");
    cy.get('[data-testid="ove-three-command-edit-paste"]').should(
      "be.disabled"
    );
    cy.get('[data-testid="ove-three-command-edit-copy"]').should(
      "not.be.disabled"
    );
  });

  it("opens Properties, Genbank, and Preview panels from commands", () => {
    cy.get('[data-testid="demo-annotation-ori"]').click();
    cy.get('[data-testid="ove-three-menu-view"]').click();

    cy.get('[data-testid="ove-three-command-view-properties"]').click();
    cy.get('[data-testid="ove-three-properties-panel"]').contains("Properties");
    cy.get('[data-testid="ove-three-property-name"]').contains("pUC57");
    cy.get('[data-testid="ove-three-annotation-properties"]').contains("ori");

    cy.get('[data-testid="ove-three-command-view-genbank"]').click();
    cy.get('[data-testid="ove-three-genbank-view"]').contains("LOCUS");
    cy.get('[data-testid="ove-three-genbank-view"]').contains("ORIGIN");

    cy.get('[data-testid="ove-three-command-view-preview"]').click();
    cy.get('[data-testid="ove-three-preview-panel"]').contains("preview");
    cy.get('[data-testid="ove-three-open-editor"]').click();
    cy.get('[data-testid="demo-last-event"]').contains("open editor");

    cy.get('[data-testid="ove-three-menu-help"]').should("not.exist");
    cy.get('[data-testid="ove-three-menu-tools"]').should("not.exist");
  });

  it("runs Find, Go To, and advanced tool smoke flows", () => {
    cy.get('[data-testid="ove-three-find-query"]').clear().type("ATGC");
    cy.get('[data-testid="ove-three-run-find"]').click();
    cy.get('[data-testid="ove-three-find-count"]').contains("matches");
    cy.get('[data-testid="ove-three-selection-range"]').contains("1-4");

    cy.get('[data-testid="ove-three-goto-input"]').clear().type("120");
    cy.get('[data-testid="ove-three-run-goto"]').click();
    cy.get('[data-testid="ove-three-selection-range"]').contains("120-120");

    cy.get('[data-testid="ove-three-advanced-tool-select"]').select("PCR Tool");
    cy.get('[data-testid="ove-three-advanced-tool-results"]').contains(
      "forwardPrimer"
    );
    cy.get('[data-testid="ove-three-advanced-tool-select"]').select(
      "Digest Tool"
    );
    cy.get('[data-testid="ove-three-advanced-tool-results"]').contains(
      "enzyme"
    );
    cy.get('[data-testid="ove-three-advanced-tool-select"]').select(
      "Alignment View"
    );
    cy.get('[data-testid="ove-three-advanced-tool-results"]').contains("match");
    cy.get('[data-testid="ove-three-advanced-tool-select"]').select(
      "Restriction Enzyme Manager"
    );
    cy.get('[data-testid="ove-three-advanced-tool-results"]').contains(
      "HindIII"
    );
  });

  it("audits protein/RNA/oligo support from advanced tools", () => {
    cy.get('[data-testid="demo-fixture-select"]').select(
      "protein_like_fixture"
    );
    cy.get('[data-testid="ove-three-advanced-tool-select"]').select(
      "Protein Support"
    );
    cy.get('[data-testid="ove-three-advanced-tool-results"]').contains(
      "kind: protein"
    );
    cy.get('[data-testid="ove-three-advanced-tool-results"]').contains(
      "unitLabel: AA"
    );
  });
});

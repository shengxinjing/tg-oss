import assert from "assert";
import buildRowSceneModel, {
  getRowIndexForPosition,
  getScrollTopForPosition
} from "./buildRowSceneModel";

const sequenceData = {
  name: "row_fixture",
  sequence: "atgcatgcatgcatgcatgc",
  circular: false
};

describe("buildRowSceneModel", () => {
  it("builds only the requested visible rows", () => {
    const model = buildRowSceneModel(sequenceData, {
      basesPerRow: 5,
      visibleStartRow: 1,
      visibleRowCount: 2,
      overscan: 0
    });

    assert.equal(model.viewType, "row");
    assert.equal(model.sequenceLength, 20);
    assert.equal(model.totalRows, 4);
    assert.deepEqual(
      model.visibleRows.map(row => [row.rowIndex, row.start, row.end]),
      [
        [1, 5, 9],
        [2, 10, 14]
      ]
    );
  });

  it("includes overscan without exceeding total rows", () => {
    const model = buildRowSceneModel(sequenceData, {
      basesPerRow: 5,
      visibleStartRow: 2,
      visibleRowCount: 4,
      overscan: 1
    });

    assert.deepEqual(
      model.visibleRows.map(row => row.rowIndex),
      [1, 2, 3]
    );
  });

  it("builds forward and complement row text", () => {
    const model = buildRowSceneModel(sequenceData, {
      basesPerRow: 4,
      visibleRowCount: 1,
      overscan: 0
    });

    assert.equal(model.visibleRows[0].sequence, "atgc");
    assert.equal(model.visibleRows[0].complementSequence, "tacg");
  });

  it("builds RNA complement row text", () => {
    const model = buildRowSceneModel(
      {
        sequence: "augc",
        isRna: true
      },
      {
        basesPerRow: 4,
        visibleRowCount: 1,
        overscan: 0,
        mode: "rna"
      }
    );

    assert.equal(model.visibleRows[0].sequence, "augc");
    assert.equal(model.visibleRows[0].complementSequence, "uacg");
  });

  it("builds oligo row data without requiring circular DNA assumptions", () => {
    const model = buildRowSceneModel(
      {
        sequence: "atgcatgc",
        isOligo: true
      },
      {
        basesPerRow: 4,
        visibleRowCount: 2,
        overscan: 0
      }
    );

    assert.equal(model.totalRows, 2);
    assert.equal(model.visibleRows[1].sequence, "atgc");
  });

  it("does not return NaN row counts for invalid no-sequence sizes", () => {
    const model = buildRowSceneModel({
      noSequence: true,
      size: "unknown"
    });

    assert.equal(model.sequenceLength, 0);
    assert.equal(model.totalRows, 0);
    assert.equal(model.visibleRows.length, 0);
  });

  it("does not duplicate axis tick positions at the row end", () => {
    const model = buildRowSceneModel(sequenceData, {
      basesPerRow: 20,
      visibleRowCount: 1,
      overscan: 0
    });
    const tickPositions = model.visibleRows[0].axisTicks.map(
      tick => tick.position
    );

    assert.equal(new Set(tickPositions).size, tickPositions.length);
  });

  it("maps a bp position to its row and scroll top", () => {
    assert.equal(
      getRowIndexForPosition(12, { basesPerRow: 5, sequenceLength: 20 }),
      2
    );
    assert.equal(
      getScrollTopForPosition(12, {
        basesPerRow: 5,
        rowHeightPx: 72,
        sequenceLength: 20
      }),
      144
    );
  });

  it("splits annotations into visible row segments", () => {
    const model = buildRowSceneModel(
      {
        sequence: "atgcatgcatgcatgcatgc",
        features: [
          {
            id: "feature-1",
            name: "Feature One",
            start: 3,
            end: 9,
            color: "#22c55e"
          }
        ],
        primers: [
          {
            id: "primer-1",
            name: "Primer One",
            start: 5,
            end: 7
          }
        ]
      },
      {
        basesPerRow: 5,
        baseWidth: 0.1,
        visibleStartRow: 0,
        visibleRowCount: 2,
        overscan: 0
      }
    );

    assert.deepEqual(
      model.visibleRows.map(row =>
        row.annotations.map(annotation => [
          annotation.id,
          annotation.annotationType,
          annotation.start,
          annotation.end,
          annotation.stack
        ])
      ),
      [
        [["feature-1", "feature", 3, 4, 0]],
        [
          ["feature-1", "feature", 5, 9, 0],
          ["primer-1", "primer", 5, 7, 1]
        ]
      ]
    );
    assert.equal(model.visibleRows[1].annotations[1].bases, "tgc");
  });

  it("builds visible row cutsites with enzyme labels", () => {
    const model = buildRowSceneModel(
      {
        sequence: "atgcatgcatgcatgcatgc",
        cutsites: [
          {
            id: "cutsite-1",
            name: "EcoRI",
            enzyme: "EcoRI",
            start: 6,
            end: 11
          }
        ]
      },
      {
        basesPerRow: 5,
        baseWidth: 0.1,
        visibleStartRow: 1,
        visibleRowCount: 2,
        overscan: 0
      }
    );

    assert.deepEqual(
      model.visibleRows.map(row =>
        row.cutsites.map(cutsite => [
          cutsite.id,
          cutsite.annotationType,
          cutsite.start,
          cutsite.end,
          cutsite.label
        ])
      ),
      [
        [["cutsite-1", "cutsite", 6, 9, "EcoRI"]],
        [["cutsite-1", "cutsite", 10, 11, "EcoRI"]]
      ]
    );
  });

  it("builds visible row translation codons and labels", () => {
    const model = buildRowSceneModel(
      {
        sequence: "atgaaataaatg",
        translations: [
          {
            id: "translation-1",
            name: "Forward translation",
            start: 0,
            end: 8,
            forward: true
          }
        ]
      },
      {
        basesPerRow: 12,
        baseWidth: 0.1,
        visibleStartRow: 0,
        visibleRowCount: 1,
        overscan: 0
      }
    );

    assert.deepEqual(
      model.visibleRows[0].translations[0].codons.map(codon => [
        codon.start,
        codon.end,
        codon.label
      ]),
      [
        [0, 2, "M"],
        [3, 5, "K"],
        [6, 8, "*"]
      ]
    );
    assert.equal(model.visibleRows[0].translations[0].sourceStart, 0);
    assert.equal(model.visibleRows[0].translations[0].sourceEnd, 8);
  });

  it("keeps ORF frame and direction metadata on row annotations", () => {
    const model = buildRowSceneModel(
      {
        sequence: "atgcatgcatgcatgcatgc",
        orfs: [
          {
            id: "orf-1",
            name: "ORF frame 4",
            start: 3,
            end: 12,
            frame: 4,
            forward: false
          }
        ]
      },
      {
        basesPerRow: 20,
        visibleStartRow: 0,
        visibleRowCount: 1,
        overscan: 0
      }
    );

    assert.equal(model.visibleRows[0].annotations[0].annotationType, "orf");
    assert.equal(model.visibleRows[0].annotations[0].frame, 4);
    assert.equal(model.visibleRows[0].annotations[0].direction, "reverse");
  });

  it("can show row translation codon text instead of amino acid letters", () => {
    const model = buildRowSceneModel(
      {
        sequence: "atgaaataaatg",
        translations: [
          {
            id: "translation-1",
            name: "Forward translation",
            start: 0,
            end: 8,
            forward: true
          }
        ]
      },
      {
        basesPerRow: 12,
        showAminoAcidUnitAsCodon: true,
        visibleStartRow: 0,
        visibleRowCount: 1,
        overscan: 0
      }
    );

    assert.deepEqual(
      model.visibleRows[0].translations[0].codons.map(codon => codon.label),
      ["ATG", "AAA", "TAA"]
    );
  });
});

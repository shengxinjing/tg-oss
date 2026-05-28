import generateStressSequenceData from "../perf/generateStressSequenceData";

const dnaAlphabet = "atgc";
const proteinAlphabet = "ACDEFGHIKLMNPQRSTVWY";

function makeSequence(length) {
  return dnaAlphabet
    .repeat(Math.ceil(length / dnaAlphabet.length))
    .slice(0, length);
}

function makeProteinSequence(length) {
  return proteinAlphabet
    .repeat(Math.ceil(length / proteinAlphabet.length))
    .slice(0, length);
}

export const smallCircular = {
  name: "small_circular_fixture",
  description:
    "Tiny circular DNA for fast coordinate smoke tests and simple picking checks.",
  circular: true,
  sequence: makeSequence(128),
  features: [
    {
      id: "small-promoter",
      name: "small promoter",
      type: "promoter",
      start: 8,
      end: 31,
      color: "#8b5cf6"
    },
    {
      id: "small-cds",
      name: "small CDS",
      type: "CDS",
      start: 46,
      end: 96,
      color: "#45d34f"
    }
  ],
  primers: [],
  cutsites: []
};

export const mediumCircular = {
  name: "pUC57_modified",
  description:
    "Default plasmid-sized circular DNA used by the demo viewer and parity screenshots.",
  circular: true,
  sequence: makeSequence(2710),
  features: [
    {
      id: "lacI-promoter",
      name: "lacI promoter",
      type: "promoter",
      start: 87,
      end: 509,
      color: "#8b5cf6"
    },
    {
      id: "lac-operator",
      name: "lac operator",
      type: "operator",
      start: 526,
      end: 548,
      color: "#3b82f6"
    },
    {
      id: "mcs",
      name: "MCS",
      type: "misc_feature",
      start: 654,
      end: 761,
      color: "#f97316"
    },
    {
      id: "gfp",
      name: "GFP",
      type: "CDS",
      start: 762,
      end: 1481,
      color: "#45d34f"
    },
    {
      id: "his6-tag",
      name: "His6 Tag",
      type: "tag",
      start: 1482,
      end: 1500,
      color: "#f5d13d"
    },
    {
      id: "sv40",
      name: "SV40 poly(A) signal",
      type: "misc_signal",
      start: 1538,
      end: 1731,
      color: "#e879f9"
    },
    {
      id: "ori",
      name: "ori",
      type: "origin",
      start: 1811,
      end: 2450,
      color: "#60a5fa"
    },
    {
      id: "ampr",
      name: "AmpR",
      type: "CDS",
      start: 2476,
      end: 2700,
      color: "#84cc16"
    }
  ],
  primers: [
    {
      id: "medium-primer-1",
      name: "Example Primer 1",
      type: "primer",
      start: 210,
      end: 238,
      color: "#22d3ee",
      forward: true
    },
    {
      id: "medium-primer-2",
      name: "Reverse Primer",
      type: "primer",
      start: 1220,
      end: 1252,
      color: "#67e8f9",
      forward: false
    }
  ],
  cutsites: [
    {
      id: "medium-ecori",
      name: "EcoRI",
      enzyme: "EcoRI",
      recognitionSite: "gaattc",
      start: 650,
      end: 655
    },
    {
      id: "medium-hindiii",
      name: "HindIII",
      enzyme: "HindIII",
      recognitionSite: "aagctt",
      start: 230,
      end: 235
    }
  ],
  orfs: [
    {
      id: "orf-frame-1",
      name: "ORF frame 1",
      start: 180,
      end: 540,
      frame: 1,
      forward: true
    },
    {
      id: "orf-frame-2",
      name: "ORF frame 2",
      start: 620,
      end: 980,
      frame: 2,
      forward: true
    },
    {
      id: "orf-frame-3",
      name: "ORF frame 3",
      start: 1060,
      end: 1420,
      frame: 3,
      forward: true
    },
    {
      id: "orf-frame-4",
      name: "ORF frame 4",
      start: 1500,
      end: 1860,
      frame: 4,
      forward: false
    },
    {
      id: "orf-frame-5",
      name: "ORF frame 5",
      start: 1940,
      end: 2300,
      frame: 5,
      forward: false
    },
    {
      id: "orf-frame-6",
      name: "ORF frame 6",
      start: 2380,
      end: 2680,
      frame: 6,
      forward: false
    }
  ],
  translations: [
    {
      id: "translation-gfp",
      name: "GFP translation",
      start: 762,
      end: 839,
      forward: true
    },
    {
      id: "translation-ampr-reverse",
      name: "AmpR reverse translation",
      start: 2476,
      end: 2562,
      forward: false
    }
  ]
};

export const largeCircular = {
  ...generateStressSequenceData({
    name: "large_circular_fixture",
    sequenceLength: 12000,
    featureCount: 24,
    primerCount: 24,
    cutsiteCount: 48
  }),
  description:
    "Large circular DNA for camera framing, label density, and medium performance checks."
};

export const hugeRow = {
  ...generateStressSequenceData({
    name: "huge_row_fixture",
    sequenceLength: 50000,
    featureCount: 80,
    primerCount: 80,
    cutsiteCount: 160,
    circular: false
  }),
  description:
    "Long linear sequence for RowView-style scrolling, line wrapping, and text density checks."
};

export const twoHundredKbRow = {
  ...generateStressSequenceData({
    name: "row_200k_fixture",
    sequenceLength: 200000,
    featureCount: 160,
    primerCount: 160,
    cutsiteCount: 320,
    circular: false
  }),
  description:
    "200k bp linear DNA for virtualized RowView stability, scroll-to-selection, and row spacing drift checks."
};

export const crossOriginCircular = {
  ...mediumCircular,
  name: "cross_origin_circular_fixture",
  description:
    "Circular DNA with annotations crossing index zero for origin-splitting geometry tests.",
  features: [
    ...mediumCircular.features,
    {
      id: "origin-crossing-cds",
      name: "origin crossing CDS",
      type: "CDS",
      start: 2600,
      end: 120,
      color: "#ef4444"
    }
  ]
};

export const denseAnnotations = {
  ...generateStressSequenceData({
    name: "dense_annotations_fixture",
    sequenceLength: 10000,
    featureCount: 60,
    primerCount: 120,
    cutsiteCount: 240
  }),
  description:
    "Dense annotation fixture for object counts, raycast load, label collisions, and FPS budgets."
};

export const proteinLike = {
  name: "protein_like_fixture",
  description:
    "Protein-like sequence data for future translation and protein editor compatibility checks.",
  circular: false,
  sequence: makeSequence(879 * 3),
  proteinSequence: makeProteinSequence(879),
  features: [
    {
      id: "protein-domain-a",
      name: "domain A",
      type: "domain",
      start: 30,
      end: 180,
      color: "#3b82f6"
    },
    {
      id: "protein-domain-b",
      name: "domain B",
      type: "domain",
      start: 310,
      end: 520,
      color: "#8b5cf6"
    }
  ],
  primers: [],
  cutsites: []
};

export const fixtureList = [
  smallCircular,
  mediumCircular,
  largeCircular,
  hugeRow,
  twoHundredKbRow,
  crossOriginCircular,
  denseAnnotations,
  proteinLike
];

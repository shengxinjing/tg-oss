// Amino-acid color palettes for protein / translation / alignment rows, matching
// SVG OVE's AA coloring options. Pure: callers map a residue to a color.
//
// `aminoAcid` may be the sequence-utils AA object ({ value, colorByFamily }) —
// as produced by the codon translator — or a plain residue-letter string (as in
// protein/alignment sequences). `colorMode`:
//   - "family"        : chemical-family grouping (default)
//   - "hydrophobicity": hydrophobic / polar / basic / acidic buckets
//   - "residue"       : a distinct color per amino acid (Clustal/RasMol-style)
//
// Object inputs preserve the original (legacy) per-mode behavior so existing
// translation rows are unchanged; string inputs get the full palettes plus
// alignment-gap ("-" / ".") and stop ("*") handling.

export const AA_GAP_COLOR = "#475569"; // alignment gap ( - / . )
export const AA_STOP_COLOR = "#ef4444"; // stop codon ( * )
const UNKNOWN_COLOR = "#94a3b8";
const FAMILY_FALLBACK = "#22d3ee";

// Chemical family grouping, used when a plain letter (or object without
// colorByFamily) is supplied.
const FAMILY_COLORS = {
  A: "#fb923c",
  V: "#fb923c",
  L: "#fb923c",
  I: "#fb923c",
  M: "#fb923c",
  F: "#f59e0b",
  W: "#f59e0b",
  P: "#f59e0b",
  G: "#f59e0b",
  S: "#38bdf8",
  T: "#38bdf8",
  C: "#38bdf8",
  Y: "#38bdf8",
  N: "#38bdf8",
  Q: "#38bdf8",
  K: "#a78bfa",
  R: "#a78bfa",
  H: "#a78bfa",
  D: "#f87171",
  E: "#f87171"
};

const HYDROPHOBICITY_GROUPS = [
  { residues: "AVILMFWY", color: "#fb923c" },
  { residues: "STNQCGP", color: "#38bdf8" },
  { residues: "KRH", color: "#a78bfa" },
  { residues: "DE", color: "#f87171" }
];

// Distinct color per amino acid (Clustal / RasMol-inspired).
export const AMINO_ACID_RESIDUE_COLORS = {
  A: "#80b3e6",
  R: "#f01505",
  N: "#15c015",
  D: "#c048c0",
  C: "#f08080",
  Q: "#15c015",
  E: "#c048c0",
  G: "#f09048",
  H: "#15a4a4",
  I: "#6ba3d6",
  L: "#6ba3d6",
  K: "#f01505",
  M: "#80b3e6",
  F: "#3a7fc4",
  P: "#e6e600",
  S: "#27a527",
  T: "#27a527",
  W: "#8a52c9",
  Y: "#15a4a4",
  V: "#80b3e6"
};

function residueOf(value) {
  return String(value ?? "")
    .toUpperCase()
    .trim();
}

function specialColor(residue) {
  if (residue === "-" || residue === ".") return AA_GAP_COLOR;
  if (residue === "*") return AA_STOP_COLOR;
  return null;
}

function hydrophobicityColor(residue) {
  const group = HYDROPHOBICITY_GROUPS.find(item =>
    item.residues.includes(residue)
  );
  return group ? group.color : UNKNOWN_COLOR;
}

function residueColor(residue) {
  return AMINO_ACID_RESIDUE_COLORS[residue] || UNKNOWN_COLOR;
}

export default function getAminoAcidColor(aminoAcid, colorMode = "family") {
  // Object inputs come from the codon translator — preserve legacy behavior so
  // existing translation rows are byte-for-byte unchanged.
  if (aminoAcid && typeof aminoAcid === "object") {
    if (colorMode === "hydrophobicity") {
      return hydrophobicityColor(residueOf(aminoAcid.value));
    }
    if (colorMode === "residue") {
      return residueColor(residueOf(aminoAcid.value));
    }
    return aminoAcid.colorByFamily || FAMILY_FALLBACK;
  }

  const residue = residueOf(aminoAcid);
  const special = specialColor(residue);
  if (special) return special;
  if (!residue) return UNKNOWN_COLOR;

  if (colorMode === "hydrophobicity") return hydrophobicityColor(residue);
  if (colorMode === "residue") return residueColor(residue);
  return FAMILY_COLORS[residue] || FAMILY_FALLBACK;
}

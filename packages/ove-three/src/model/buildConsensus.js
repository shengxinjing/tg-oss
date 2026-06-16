// Kyte-Doolittle hydropathy (for the amino-acid property plot).
const HYDROPATHY = {
  A: 1.8,
  R: -4.5,
  N: -3.5,
  D: -3.5,
  C: 2.5,
  Q: -3.5,
  E: -3.5,
  G: -0.4,
  H: -3.2,
  I: 4.5,
  L: 3.8,
  K: -3.9,
  M: 1.9,
  F: 2.8,
  P: -1.6,
  S: -0.8,
  T: -0.7,
  W: -0.9,
  Y: -1.3,
  V: 4.2
};

export function getHydropathy(residue) {
  const value = HYDROPATHY[String(residue || "").toUpperCase()];
  return Number.isFinite(value) ? value : 0;
}

// Per-position consensus across aligned sequences: most-common residue +
// conservation fraction (0–1) + the consensus residue's hydropathy. Gaps ("-")
// are ignored. A single sequence yields conservation 1 at every position.
export default function buildConsensus({ sequences = [] } = {}) {
  const valid = sequences.filter(
    seq => typeof seq === "string" && seq.length > 0
  );
  if (!valid.length) return [];

  const length = Math.max(...valid.map(seq => seq.length));
  const result = [];
  for (let position = 0; position < length; position += 1) {
    const counts = {};
    let total = 0;
    valid.forEach(seq => {
      const residue = (seq[position] || "").toUpperCase();
      if (!residue || residue === "-") return;
      counts[residue] = (counts[residue] || 0) + 1;
      total += 1;
    });

    let residue = "";
    let max = 0;
    Object.entries(counts).forEach(([char, count]) => {
      if (count > max) {
        max = count;
        residue = char;
      }
    });

    result.push({
      position,
      residue,
      conservation: total ? max / total : 0,
      hydropathy: getHydropathy(residue)
    });
  }
  return result;
}

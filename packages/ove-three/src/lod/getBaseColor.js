// DNA/RNA base colors (shared by circular/linear/row base rendering).
export const DNA_BASE_COLORS = {
  a: "#ef4444",
  t: "#3b82f6",
  u: "#3b82f6",
  g: "#f59e0b",
  c: "#22c55e"
};

const FALLBACK = "#94a3b8";

export default function getBaseColor(char, mode = "dna") {
  if (!char) return FALLBACK;
  // Amino-acid coloring is handled by the translation layers; bases use the
  // nucleotide palette. Protein "bases" get a neutral tone here.
  if (mode === "protein") return "#cbd5e1";
  return DNA_BASE_COLORS[String(char).toLowerCase()] || FALLBACK;
}

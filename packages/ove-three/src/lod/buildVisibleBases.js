import getBaseColor from "./getBaseColor";

export const MAX_VISIBLE_BASES = 400;

const COMPLEMENT_DNA = { a: "t", t: "a", g: "c", c: "g" };
const COMPLEMENT_RNA = { a: "u", u: "a", t: "a", g: "c", c: "g" };

function complementOf(char, mode) {
  const lower = String(char).toLowerCase();
  const map = mode === "rna" ? COMPLEMENT_RNA : COMPLEMENT_DNA;
  return map[lower] || "n";
}

// Turn a visible bp window (from getCircularVisibleRange / a row range) into the
// per-base render data: forward char, complement, color. Handles origin wrap.
// When the window is larger than the cap, render the central `maxBases` around
// the focus bp instead of dropping everything — so a readable seq band stays on
// the arc as you zoom (it just doesn't span the whole visible arc until the
// natural window falls under the cap).
export default function buildVisibleBases({
  sequence = "",
  range,
  mode = "dna",
  maxBases = MAX_VISIBLE_BASES
} = {}) {
  if (!sequence || !range || !range.count) return [];

  const len = sequence.length;
  const fullCount = Math.min(range.count, len);
  let start = range.start;
  let count = fullCount;
  if (fullCount > maxBases) {
    count = maxBases;
    const focus = Number.isFinite(range.focusBp)
      ? ((Math.round(range.focusBp) % len) + len) % len
      : (range.start + Math.floor(fullCount / 2)) % len;
    start = (((focus - Math.floor(maxBases / 2)) % len) + len) % len;
  }

  const isProtein = mode === "protein";
  const out = [];
  for (let i = 0; i < count; i += 1) {
    const bp = (start + i) % len;
    const char = sequence[bp];
    out.push({
      bp,
      char,
      complement: isProtein ? null : complementOf(char, mode),
      color: getBaseColor(char, mode)
    });
  }
  return out;
}

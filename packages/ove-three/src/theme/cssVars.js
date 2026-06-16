// Reads design-token CSS custom properties at access time so WebGL map colors
// follow the same `--o3-*` tokens as the DOM chrome. Falls back to the light
// theme value when there is no browser environment (SSR / unit tests) or the
// variable is unset.
export function cssVar(name, fallback) {
  try {
    if (
      typeof window === "undefined" ||
      typeof window.getComputedStyle !== "function" ||
      typeof document === "undefined" ||
      !document.documentElement
    ) {
      return fallback;
    }
    const value = window
      .getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();
    return value || fallback;
  } catch {
    return fallback;
  }
}

export function cssNum(name, fallback) {
  const value = cssVar(name, null);
  const parsed = value == null ? NaN : parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

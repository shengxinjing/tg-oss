export default function measureText(text = "", { fontSize = 12 } = {}) {
  const value = String(text);
  return {
    width: Math.max(fontSize, value.length * fontSize * 0.62),
    height: fontSize * 1.25
  };
}

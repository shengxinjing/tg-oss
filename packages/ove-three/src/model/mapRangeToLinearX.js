function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export default function mapRangeToLinearX(range = {}, { baseWidth = 1 } = {}) {
  const startX = toNumber(range.start) * toNumber(baseWidth);
  const endX = (toNumber(range.end) + 1) * toNumber(baseWidth);

  return {
    startX,
    endX,
    width: Math.max(0, endX - startX)
  };
}

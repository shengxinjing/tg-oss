function toNumber(value) {
  return Number.isFinite(value) ? value : 0;
}

export default function collectRenderStats(
  renderer,
  { fixtureName = "Untitled fixture", fps = null, objectCount = 0 } = {}
) {
  const renderInfo = renderer?.info?.render || {};
  const memoryInfo = renderer?.info?.memory || {};

  return {
    fixtureName,
    fps: fps === null ? null : Math.round(fps),
    drawCalls: toNumber(renderInfo.calls),
    triangles: toNumber(renderInfo.triangles),
    geometries: toNumber(memoryInfo.geometries),
    textures: toNumber(memoryInfo.textures),
    objectCount: toNumber(objectCount)
  };
}

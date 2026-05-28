function getCanvas(target) {
  if (!target) return null;
  if (target.tagName === "CANVAS") return target;
  return target.querySelector?.("canvas") || null;
}

function canExportCanvas(canvas) {
  return canvas && canvas.width > 0 && canvas.height > 0;
}

function getDataUrlByteLength(dataUrl) {
  return dataUrl.split(",")[1]?.length || dataUrl.length;
}

function downloadDataUrl(dataUrl, fileName) {
  if (typeof document === "undefined") return;
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  link.click();
}

export default function exportCanvasPng(
  target,
  { fileName = "ove-three.png", download = true } = {}
) {
  const canvas = getCanvas(target);
  if (!canExportCanvas(canvas)) return null;

  const dataUrl = canvas.toDataURL("image/png");
  if (!dataUrl.startsWith("data:image/png")) return null;

  const result = {
    fileName,
    dataUrl,
    byteLength: getDataUrlByteLength(dataUrl)
  };

  if (download) downloadDataUrl(dataUrl, fileName);
  return result;
}

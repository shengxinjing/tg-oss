const HTML_ESCAPES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;"
};

const escapeHtml = value =>
  String(value ?? "").replace(/[&<>"]/g, c => HTML_ESCAPES[c]);

export const tsvToHtmlTable = tsv => {
  const rows = String(tsv ?? "")
    .split("\n")
    .map(line => {
      const cells = line
        .split("\t")
        .map(v => `<td>${escapeHtml(v)}</td>`)
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");
  return `<table>${rows}</table>`;
};

import { tsvToHtmlTable } from "./tsvToHtmlTable";

describe("tsvToHtmlTable", () => {
  it("wraps a single row in a <table>", () => {
    expect(tsvToHtmlTable("a\tb\tc")).toBe(
      "<table><tr><td>a</td><td>b</td><td>c</td></tr></table>"
    );
  });

  it("splits rows on newline and cells on tab", () => {
    expect(tsvToHtmlTable("h1\th2\n1\t2\nA\tB")).toBe(
      "<table>" +
        "<tr><td>h1</td><td>h2</td></tr>" +
        "<tr><td>1</td><td>2</td></tr>" +
        "<tr><td>A</td><td>B</td></tr>" +
        "</table>"
    );
  });

  it("escapes HTML-significant characters in cell content", () => {
    expect(tsvToHtmlTable('<b>&"x"</b>\tnormal')).toBe(
      "<table><tr><td>&lt;b&gt;&amp;&quot;x&quot;&lt;/b&gt;</td><td>normal</td></tr></table>"
    );
  });

  it("preserves empty cells and empty rows", () => {
    expect(tsvToHtmlTable("a\t\tb\n\nc")).toBe(
      "<table>" +
        "<tr><td>a</td><td></td><td>b</td></tr>" +
        "<tr><td></td></tr>" +
        "<tr><td>c</td></tr>" +
        "</table>"
    );
  });

  it("handles empty/null input", () => {
    expect(tsvToHtmlTable("")).toBe("<table><tr><td></td></tr></table>");
    expect(tsvToHtmlTable(null)).toBe("<table><tr><td></td></tr></table>");
    expect(tsvToHtmlTable(undefined)).toBe("<table><tr><td></td></tr></table>");
  });
});

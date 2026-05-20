import copy from "copy-to-clipboard";
import { tsvToHtmlTable } from "./tsvToHtmlTable";

export const handleCopyHelper = (stringToCopy, jsonToCopy, message) => {
  !window.Cypress &&
    copy(stringToCopy, {
      onCopy: clipboardData => {
        clipboardData.setData("application/json", JSON.stringify(jsonToCopy));
        clipboardData.setData("text/html", tsvToHtmlTable(stringToCopy));
      },
      // keep this so that pasting into spreadsheets works.
      format: "text/plain"
    });
  if (message) {
    window.toastr.success(message);
  }
};

import { describe, expect, it } from "bun:test";
import {
  commandGroups,
  findCommand,
  getCommandCoverage,
  isCommandEnabled,
  listCommands
} from "./commandRegistry";

describe("ove-three command registry", () => {
  it("exposes OVE-style menu groups with queryable commands", () => {
    expect(commandGroups.map(group => group.label)).toEqual([
      "File",
      "Edit",
      "View",
      "Tools"
    ]);

    expect(findCommand("file.save")).toMatchObject({
      id: "file.save",
      label: "Save",
      groupId: "file"
    });
    expect(findCommand("tools.digest")).toMatchObject({
      id: "tools.digest",
      label: "Digest Tool"
    });
  });

  it("covers the planned Day 331-395 editor and advanced tool commands", () => {
    const commandIds = listCommands().map(command => command.id);

    [
      "file.save",
      "file.saveAs",
      "file.importSequence",
      "file.exportFasta",
      "file.exportGenbank",
      "file.exportJson",
      "file.exportPng",
      "edit.undo",
      "edit.redo",
      "edit.cut",
      "edit.copy",
      "edit.paste",
      "edit.selectAll",
      "edit.selectInverse",
      "edit.changeCaseUpper",
      "edit.changeCaseLower",
      "edit.flipCase",
      "edit.complement",
      "edit.reverseComplement",
      "edit.rotateToCaret",
      "view.properties",
      "view.genbank",
      "tools.find",
      "tools.goTo",
      "tools.digest",
      "tools.pcr",
      "tools.alignment",
      "tools.mismatches",
      "tools.enzymeViewer",
      "tools.autoAnnotate",
      "tools.enzymeManager",
      "view.preview",
      "view.versionHistory"
    ].forEach(id => expect(commandIds).toContain(id));

    expect(commandIds).not.toContain("help.hotkeys");
    expect(commandIds).not.toContain("help.commandSearch");

    expect(getCommandCoverage()).toMatchObject({
      total: commandIds.length,
      editable: expect.any(Number),
      readOnlySafe: expect.any(Number)
    });
  });

  it("locks editing commands in read-only mode while keeping safe commands enabled", () => {
    expect(
      isCommandEnabled("edit.cut", {
        readOnly: true,
        selection: { start: 1, end: 3 },
        canUndo: true,
        canRedo: true
      })
    ).toBe(false);
    expect(
      isCommandEnabled("edit.copy", {
        readOnly: true,
        selection: { start: 1, end: 3 }
      })
    ).toBe(true);
    expect(isCommandEnabled("file.exportFasta", { readOnly: true })).toBe(true);
    expect(
      isCommandEnabled("edit.undo", { readOnly: false, canUndo: false })
    ).toBe(false);
    expect(
      isCommandEnabled("edit.redo", { readOnly: false, canRedo: true })
    ).toBe(true);
    expect(isCommandEnabled("edit.editFeature", { readOnly: false })).toBe(
      false
    );
    expect(isCommandEnabled("edit.deleteFeature", { readOnly: false })).toBe(
      false
    );
    expect(
      isCommandEnabled("edit.editFeature", {
        readOnly: false,
        selection: { start: 1, end: 3 }
      })
    ).toBe(true);
  });
});

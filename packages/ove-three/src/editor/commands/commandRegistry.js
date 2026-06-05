export const commandGroups = [
  {
    id: "file",
    label: "File",
    commands: [
      { id: "file.save", label: "Save", readOnlySafe: false },
      { id: "file.saveAs", label: "Save As", readOnlySafe: true },
      {
        id: "file.importSequence",
        label: "Import Sequence",
        readOnlySafe: false
      },
      { id: "file.exportFasta", label: "Export FASTA", readOnlySafe: true },
      { id: "file.exportGenbank", label: "Export Genbank", readOnlySafe: true },
      { id: "file.exportJson", label: "Export JSON", readOnlySafe: true },
      { id: "file.exportPng", label: "Export PNG", readOnlySafe: true },
      { id: "file.print", label: "Print", readOnlySafe: true }
    ]
  },
  {
    id: "edit",
    label: "Edit",
    commands: [
      {
        id: "edit.undo",
        label: "Undo",
        readOnlySafe: false,
        requiresUndo: true
      },
      {
        id: "edit.redo",
        label: "Redo",
        readOnlySafe: false,
        requiresRedo: true
      },
      {
        id: "edit.cut",
        label: "Cut",
        readOnlySafe: false,
        requiresSelection: true
      },
      {
        id: "edit.copy",
        label: "Copy",
        readOnlySafe: true,
        requiresSelection: true
      },
      { id: "edit.paste", label: "Paste", readOnlySafe: false },
      { id: "edit.selectAll", label: "Select All", readOnlySafe: true },
      {
        id: "edit.selectInverse",
        label: "Select Inverse",
        readOnlySafe: true,
        requiresSelection: true
      },
      { id: "edit.changeCaseUpper", label: "Upper Case", readOnlySafe: false },
      { id: "edit.changeCaseLower", label: "Lower Case", readOnlySafe: false },
      { id: "edit.flipCase", label: "Flip Case", readOnlySafe: false },
      { id: "edit.complement", label: "Complement", readOnlySafe: false },
      {
        id: "edit.reverseComplement",
        label: "Reverse Complement",
        readOnlySafe: false
      },
      {
        id: "edit.rotateToCaret",
        label: "Rotate To Caret",
        readOnlySafe: false
      },
      { id: "edit.addFeature", label: "Add Feature", readOnlySafe: false },
      {
        id: "edit.editFeature",
        label: "Edit Feature",
        readOnlySafe: false,
        requiresSelection: true
      },
      {
        id: "edit.deleteFeature",
        label: "Delete Feature",
        readOnlySafe: false,
        requiresSelection: true
      },
      { id: "edit.addPart", label: "Add Part", readOnlySafe: false },
      { id: "edit.addPrimer", label: "Add Primer", readOnlySafe: false },
      { id: "edit.addCutsite", label: "Add Cutsite", readOnlySafe: false },
      { id: "edit.addOrf", label: "Add ORF", readOnlySafe: false },
      {
        id: "edit.addTranslation",
        label: "Add Translation",
        readOnlySafe: false
      }
    ]
  },
  {
    id: "view",
    label: "View",
    commands: [
      { id: "view.circular", label: "Circular Map", readOnlySafe: true },
      { id: "view.linear", label: "Linear Map", readOnlySafe: true },
      { id: "view.sequence", label: "Sequence Map", readOnlySafe: true },
      { id: "view.properties", label: "Properties", readOnlySafe: true },
      { id: "view.genbank", label: "Genbank View", readOnlySafe: true },
      { id: "view.preview", label: "Preview Mode", readOnlySafe: true },
      {
        id: "view.versionHistory",
        label: "Version History",
        readOnlySafe: true
      }
    ]
  },
  {
    id: "tools",
    label: "Tools",
    commands: [
      { id: "tools.find", label: "Find", readOnlySafe: true },
      { id: "tools.goTo", label: "Go To", readOnlySafe: true },
      { id: "tools.digest", label: "Digest Tool", readOnlySafe: true },
      { id: "tools.pcr", label: "PCR Tool", readOnlySafe: true },
      { id: "tools.alignment", label: "Alignment View", readOnlySafe: true },
      { id: "tools.mismatches", label: "Mismatches", readOnlySafe: true },
      { id: "tools.enzymeViewer", label: "Enzyme Viewer", readOnlySafe: true },
      { id: "tools.autoAnnotate", label: "Auto Annotate", readOnlySafe: false },
      {
        id: "tools.enzymeManager",
        label: "Restriction Enzyme Manager",
        readOnlySafe: false
      }
    ]
  }
];

export function listCommands() {
  return commandGroups.flatMap(group =>
    group.commands.map(command => ({
      ...command,
      groupId: group.id,
      groupLabel: group.label
    }))
  );
}

export function findCommand(commandId) {
  return listCommands().find(command => command.id === commandId) || null;
}

export function getCommandCoverage() {
  const commands = listCommands();
  const readOnlySafe = commands.filter(command => command.readOnlySafe).length;

  return {
    total: commands.length,
    editable: commands.length - readOnlySafe,
    readOnlySafe
  };
}

export function isCommandEnabled(commandId, state = {}) {
  const command = findCommand(commandId);
  if (!command) return false;

  if (state.readOnly && !command.readOnlySafe) return false;
  if (command.requiresSelection && !state.selection) return false;
  if (command.requiresUndo && !state.canUndo) return false;
  if (command.requiresRedo && !state.canRedo) return false;

  return true;
}

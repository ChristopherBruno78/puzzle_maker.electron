import { Controller } from "../ToolBox/UIKit/Responder";
import { AboutDialog } from "./Dialogs/About/AboutDialog";
import { EntryDialog } from "./Dialogs/EntryDialog/EntryDialog";
import { AppDocument } from "./Models/AppDocument";

const AppController = new Controller({
  onAbout() {
    new AboutDialog().centerAndOpen(true);
  },
  onShowAddWordEntry() {
    new EntryDialog({
      editMode: -1,
    }).centerAndOpen(true);
  },
  showEditEntryAt(index) {
    const entry = AppDocument.wordEntries.getAt(index);
    new EntryDialog({
      editMode: index,
      entry: { ...entry },
    }).centerAndOpen(true);
  },
});

export { AppController };

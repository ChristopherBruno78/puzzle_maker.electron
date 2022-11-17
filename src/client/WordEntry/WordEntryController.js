import { Controller } from "../../ToolBox/UIKit/Responder";
import { UndoManager } from "../../ToolBox/Foundation/UndoManager";
import { FileChooser } from "../../ToolBox/UIKit/src/File/FileChooser";
import { parseCSVToRows } from "../CSVParser";
import { FileWriter } from "../../ToolBox/UIKit/src/File/FileWriter";
import { AppDocument } from "../Models/AppDocument";

const _trim = function (str) {
  if (str) {
    return str.trim();
  }
  return "";
};

const WordEntryController = new Controller({
  editEntryAt(index, wordClue) {
    const i = AppDocument.wordEntries.findIndex({ word: wordClue.word });
    if (i > -1 && i !== index) {
      return false;
    }
    const entry = AppDocument.wordEntries.getAt(index);
    if (entry.word === wordClue.word && entry.clue === wordClue.clue) {
      return true;
    }
    UndoManager.addAction(
      () => {
        AppDocument.wordEntries.remove(entry, true);
        AppDocument.wordEntries.insertAt(index, wordClue);
      },
      () => {
        AppDocument.wordEntries.remove(wordClue, true);
        AppDocument.wordEntries.insertAt(index, entry);
      }
    );
    return true;
  },
  removeEntryAt(index) {
    const entry = AppDocument.wordEntries.getAt(index);
    UndoManager.addAction(
      () => {
        AppDocument.wordEntries.remove(entry);
      },
      () => {
        AppDocument.wordEntries.insertAt(index, entry);
      }
    );
  },
  addWordEntryBulk(arrayOfWordClues) {
    UndoManager.addAction(
      () => {
        for (const wordClue of arrayOfWordClues) {
          if (AppDocument.wordEntries.findIndex({ word: wordClue.word }) < 0) {
            AppDocument.wordEntries.push(wordClue, true);
          }
        }
        AppDocument.wordEntries.update();
      },
      () => {
        for (const wordClue of arrayOfWordClues) {
          AppDocument.wordEntries.remove(wordClue, true);
        }
        AppDocument.wordEntries.update();
      }
    );
  },
  addWordEntry(wordClue) {
    if (AppDocument.wordEntries.findIndex({ word: wordClue.word }) > -1) {
      return false;
    }
    UndoManager.addAction(
      () => {
        this.outlets.wordEntry.scrollToTop();
        AppDocument.wordEntries.insertAt(0, wordClue);
      },
      () => {
        AppDocument.wordEntries.remove(wordClue);
      },
      "Add Word Entry"
    );
    return true;
  },
  async importCSVFile() {
    const content = await FileChooser.run();
    const rows = parseCSVToRows(content);
    const entries = [];
    for (const row of rows) {
      if (row.length > 0) {
        entries.push({
          word: _trim(row[0]).toUpperCase(),
          clue: _trim(row[1]),
        });
      }
    }
    this.addWordEntryBulk(entries);
  },
  clearWordList() {
    const entries = [...AppDocument.wordEntries];
    if (entries.length > 0) {
      UndoManager.addAction(
        () => {
          AppDocument.wordEntries.clear();
        },
        () => {
          AppDocument.wordEntries.pushAll(entries);
        }
      );
    }
  },
  sortAlphabetically() {
    AppDocument.wordEntries.sort((wc1, wc2) => {
      return wc1.word.localeCompare(wc2.word);
    });
  },
  async exportToCSVFile() {
    let csv = "";
    const entries = AppDocument.wordEntries;
    for (const wordClue of entries) {
      csv += '"' + wordClue.word + '", "' + wordClue.clue + '"\n';
    }
    await FileWriter.run(csv);
  },
});

export { WordEntryController };

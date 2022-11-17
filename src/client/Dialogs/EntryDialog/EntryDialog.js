import { Dialog } from "../../../ToolBox/UIKit/Dialog";
import { ClassNames } from "../../../ToolBox/UIKit/src/utils/ClassNames";
import { MakeRect } from "../../../ToolBox/UIKit/Geometry";
import { TextField } from "../../../ToolBox/UIKit/TextField";
import { TextView } from "../../../ToolBox/UIKit/TextView";
import { Button, Intent } from "../../../ToolBox/UIKit/Button";
import { BindTo } from "../../../ToolBox/Foundation/Binding";
import { Beep } from "../../../ToolBox/UIKit/Beep";
import { Keys } from "../../../ToolBox/UIKit/Keys";
import { EventKeyCode } from "../../../ToolBox/UIKit/src/Events";

import { WordEntryController } from "../../WordEntry/WordEntryController";

import "./style.less";

const EntryDialog = Dialog.extend({
  props: {
    entry: {},
    editMode: -1,
    modal: true,
    resizable: true,
    frame: MakeRect(0, 0, 440, 400),
  },
  className() {
    return ClassNames("entry-dialog", this._super());
  },
  drawContent() {
    return (
      <>
        <label>Word:</label>
        <TextField
          style={{ textTransform: "uppercase" }}
          ref={(e) => (this.priv.we = e)}
          delegate={this}
          onAction={() => (this.priv.ce.focused = true)}
        />
        <label>Clue:</label>
        {
          (this.priv.ce = (
            <TextView
              delegate={this}
              keyPress={(e) => {
                if (EventKeyCode(e) === Keys.Enter) {
                  e.preventDefault();
                  setTimeout(() => {
                    this.processEntry();
                  }, 100);
                }
              }}
              spellcheck={true}
            />
          ))
        }
        <div className={"buttonBar"}>
          <label ref={(e) => (this.priv.msg = e)} />
          <Button
            label={"Cancel"}
            ref={(e) => (this.priv.fb = e)}
            onAction={() => this.close()}
          />
          <Button
            onAction={() => {
              this.processEntry();
            }}
            ref={(e) => (this.priv.ab = e)}
            disabled={BindTo(this.priv.we, "value", (value) => {
              return !(value && value.length > 0);
            })}
            label={"Add"}
            intent={Intent.Primary}
          />
        </div>
      </>
    );
  },
  textDidEndEditing() {
    this.entry.word = this.priv.we.value.trim();
    this.entry.clue = this.priv.ce.value.trim();
  },
  processEntry() {
    if (this.editMode > -1) {
      this._editEntry();
    } else {
      this._addEntry();
    }
  },
  _editEntry() {
    const word = this.priv.we.value.trim().toUpperCase();
    if (word.length > 0) {
      const ret = WordEntryController.editEntryAt(this.editMode, {
        word: word,
        clue: this.priv.ce.value.trim(),
      });
      _handleRet(this, word, ret);
    }
  },
  _addEntry() {
    const word = this.priv.we.value.trim().toUpperCase();
    if (word.length > 0) {
      const ret = WordEntryController.addWordEntry({
        word: word,
        clue: this.priv.ce.value.trim(),
      });
      _handleRet(this, word, ret);
    }
  },
  renderEditMode() {
    if (this.editMode > -1) {
      this.title = "Edit Word & Clue";
      this.priv.ab.label = "Edit";
      this.priv.fb.label = "Cancel";
    } else {
      this.title = "Add Word & Clue";
      this.priv.ab.label = "Add";
      this.priv.fb.label = "Finish";
    }
  },
  renderEntry: function () {
    this.priv.ce.value = this.entry.clue ?? "";
    this.priv.we.value = this.entry.word ?? "";
    this.priv.msg.node.innerHTML = "";
  },
  reset() {
    this.entry = {};
  },
  onOpen() {
    setTimeout(() => {
      if (this.editMode < 0) {
        this.reset();
      }
      this.priv.we.focused = true;
    }, 1);
  },
});

function _handleRet(dialog, word, ret) {
  if (!ret) {
    Beep();
    setTimeout(() => {
      dialog.priv.we.focused = true;
    }, 50);
    dialog.priv.msg.node.innerHTML = `Word "${word}" already in use.`;
    setTimeout(() => {
      dialog.priv.msg.node.className = "shake";
      setTimeout(() => {
        dialog.priv.msg.node.className = "";
      }, 1000);
    }, 100);
  } else {
    dialog.close();
  }
}

export { EntryDialog };

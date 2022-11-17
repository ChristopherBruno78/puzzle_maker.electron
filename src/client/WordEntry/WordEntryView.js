import { ClassNames } from "../../ToolBox/UIKit/src/utils/ClassNames";
import { View } from "../../ToolBox/UIKit/View";
import { Button } from "../../ToolBox/UIKit/Button";
import { MenuButton } from "../../ToolBox/UIKit/MenuButton";
import { Menu, MenuItem, MenuItemSeparator } from "../../ToolBox/UIKit/Menu";
import { ListItem, ListView } from "../../ToolBox/UIKit/ListView";
import { Label } from "../../ToolBox/UIKit/Label";
import { BindTo } from "../../ToolBox/Foundation/Binding";
import { WordEntryController } from "./WordEntryController";

import { AppDocument } from "../Models/AppDocument";

import "./style.less";
import { AppController } from "../AppController";

const WordListItem = ListItem.extend({
  className() {
    return ClassNames("wordlist-item", {
      odd: this.index % 2 !== 0,
    });
  },
  props: {
    word: null,
    clue: null,
  },
  drawContent() {
    return (
      <>
        <table>
          <tr>
            <td className={"bold"}>Word:</td>
            <td className={"break-word"}>{this.word}</td>
          </tr>
          <tr>
            <td className={"bold"}>Clue:</td>
            <td className={"break-word"}>{this.clue}</td>
          </tr>
        </table>
        <div>
          <Button
            intent={"link"}
            label={"Edit"}
            onAction={() => {
              AppController.showEditEntryAt(this.index);
            }}
          />
          <Button
            intent={"link"}
            label={"Remove"}
            onAction={() => {
              WordEntryController.removeEntryAt(this.index);
            }}
          />
        </div>
      </>
    );
  },
  get wordClue() {
    return { word: this.word, clue: this.clue };
  },
});

const WordListView = ListView.extend({
  ObjName: "WordListView",
  className() {
    return ClassNames("wordlist", this._super());
  },
  createItem(wordClue) {
    return new WordListItem(wordClue);
  },
});

const WordEntryView = View.extend({
  ObjName: "WordEntryView",
  className() {
    return "word-entry";
  },
  draw() {
    return (
      <>
        <WordListView
          content={BindTo(AppDocument, "wordEntries")}
          ref={(e) => (this.priv.list = e)}
        >
          <Label
            text={"No Entries"}
            className={"emptyText"}
            displayed={BindTo(AppDocument, "wordEntries.length", (v) => {
              return v === 0;
            })}
          />
        </WordListView>
        <div className={"buttonBar"}>
          <Button
            target={AppController}
            action={"onShowAddWordEntry"}
            icon={"icon-plus-solid"}
            iconOnly={true}
          />
          <MenuButton icon={"icon-bars-solid"} iconOnly={true}>
            <Menu>
              <MenuItem
                label={"Import from CSV"}
                target={WordEntryController}
                action={"importCSVFile"}
              />
              <MenuItem
                label={"Export to CSV ..."}
                target={WordEntryController}
                action={"exportToCSVFile"}
                disabled={BindTo(AppDocument, "wordEntries.length", (v) => {
                  return v === 0;
                })}
              />
              <MenuItemSeparator />
              <MenuItem
                disabled={BindTo(AppDocument, "wordEntries.length", (v) => {
                  return v < 2;
                })}
                label={"Sort Alphabetically"}
                target={WordEntryController}
                action={"sortAlphabetically"}
              />
            </Menu>
          </MenuButton>
          <div style={{ flex: "1" }} />
          <div className={"word-count"}>
            <Label
              text={BindTo(AppDocument, "wordEntries.length", (v) => {
                return "Entry Count: " + v;
              })}
            ></Label>
          </div>
        </div>
      </>
    );
  },
  scrollToTop() {
    this.priv.list.scrollTop = 0;
  },
});

export { WordEntryView };

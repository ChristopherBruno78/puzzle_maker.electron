import { RootView } from "../ToolBox/UIKit/src/View/RootView";
import { MenuBar } from "../ToolBox/UIKit/MenuBar";
import { Menu, MenuItem, MenuItemSeparator } from "../ToolBox/UIKit/Menu";
import { AppController } from "./AppController";
import { WordEntryController } from "./WordEntry/WordEntryController";
import { Toolbar, ToolbarDivider } from "../ToolBox/UIKit/Toolbar";
import { SplitView } from "../ToolBox/UIKit/src/View/SplitView/SplitView";
import { SplitViewFlex } from "../ToolBox/UIKit/src/View/SplitView/SplitViewFlex";
import { WordEntryView } from "./WordEntry/WordEntryView";
import { UndoManager } from "../ToolBox/Foundation/UndoManager";
import { BindTo } from "../ToolBox/Foundation/Binding";
import { ImageButton } from "../ToolBox/UIKit/src/Controls/Button/ImageButton";
import { MakeSize } from "../ToolBox/UIKit/src/utils/Geometry";

import { AppDocument } from "./Models/AppDocument";

import "./Dialogs/About/AboutDialog";
import "./Dialogs/EntryDialog/EntryDialog";

import "./components.less";
import "./style.less";

import newIcon from "./Themes/icons/new.png";
import folderIcon from "./Themes/icons/folder.png";
import gearIcon from "./Themes/icons/gear.png";
import editIcon from "./Themes/icons/edit.png";
import printIcon from "./Themes/icons/print.png";
import bulbOff from "./Themes/icons/bulbOff.png";
import colors from "./Themes/icons/color.png";
import globeIcon from "./Themes/icons/globe.png";
import appIcon from "./Themes/icons/appIcon.png";

const UI = (
  <RootView>
    <Toolbar>
      <>
        <ImageButton
          tooltip="New"
          image={newIcon}
          imageSize={MakeSize(36, 36)}
        />
        <ImageButton
          tooltip="Open"
          image={folderIcon}
          imageSize={MakeSize(28, 28)}
        />
        <ToolbarDivider />
        <ImageButton
          tooltip="Edit"
          image={editIcon}
          imageSize={MakeSize(28, 28)}
        />
        <ImageButton
          disabled={BindTo(AppDocument, "wordEntries.length", (v) => {
            return v === 0;
          })}
          tooltip="Build"
          image={gearIcon}
          imageSize={MakeSize(28, 28)}
        />

        <ToolbarDivider />
        <ImageButton
          tooltip="Share"
          image={globeIcon}
          imageSize={MakeSize(28, 28)}
        />
        <ImageButton
          tooltip="Print"
          image={printIcon}
          imageSize={MakeSize(28, 28)}
        />
      </>
      <>
        <ImageButton
          tooltip="Solve"
          image={bulbOff}
          imageSize={MakeSize(26, 26)}
        />
        <ToolbarDivider />

        <ImageButton
          tooltip="Inspect"
          image={colors}
          imageSize={MakeSize(28, 28)}
        />
      </>
    </Toolbar>
    <div>
      <SplitView
        flex={SplitViewFlex.BottomRight}
        minStaticPaneLength={160}
        staticPaneLength={320}
      >
        <WordEntryView
          ref={(e) => (WordEntryController.outlets.wordEntry = e)}
        />
        <div className={"rightView"}>
          <img src={appIcon} />
        </div>
      </SplitView>
    </div>
  </RootView>
);

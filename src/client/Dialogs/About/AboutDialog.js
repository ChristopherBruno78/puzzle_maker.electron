import { Dialog } from "../../../ToolBox/UIKit/Dialog";
import { MakeRect } from "../../../ToolBox/UIKit/Geometry";
import { ClassNames } from "../../../ToolBox/UIKit/src/utils/ClassNames";

import appIcon from "../../Themes/icons/appIcon.png";
import "./style.less";

const AboutDialog = Dialog.extend({
  props: {
    resizable: false,
    modal: true,
    frame: MakeRect(0, 0, 235, 280),
    title: "About Puzzle Maker",
  },
  className() {
    return ClassNames("about-dialog", this._super());
  },
  drawContent() {
    return (
      <>
        <img
          src={appIcon}
          style={{ marginTop: "26px" }}
          alt={"Puzzle Maker Icon"}
        />
        <div style={{ flex: "1" }} />
        <div>
          <div className={"text"}>
            <label>Puzzle Maker Web</label>
          </div>
          <div className={"text"}>
            <label>&copy; 2022 EduSoftwerks</label>
          </div>
        </div>
      </>
    );
  },
});

export { AboutDialog };

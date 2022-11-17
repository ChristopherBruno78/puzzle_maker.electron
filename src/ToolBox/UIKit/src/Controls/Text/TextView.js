import { _Text } from "./Text";
import { ClassNames } from "../../utils/ClassNames";

const TextView = _Text.extend({
  ObjName: "TextView",
  className() {
    return ClassNames("multiline", this._super());
  },
  draw() {
    return (
      <div className={"tb-ScrollArea"}>
        {
          (this.controlLayer = (
            <textarea rows="1" className={"tb-Text-input"} />
          ))
        }
      </div>
    );
  },
});

export { TextView };

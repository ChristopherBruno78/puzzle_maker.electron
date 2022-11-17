import { TextField } from "./TextField";
import { ClassNames } from "../../utils/ClassNames";
import { Button } from "../Button/Button";
import { Events } from "../../Events";

const SearchField = TextField.extend({
  ObjName: "SearchField",
  init({ prefix, ...props } = {}) {
    this._super({
      prefix: "icon-search-solid",
      ...(props || {}),
    });
    this.on(Events.OnInput, () => {
      setTimeout(() => {
        this.priv.cancelBtn.hidden = this.props.value.length === 0;
      }, 0);
    });
  },
  className() {
    return ClassNames("tb-SearchText", this._super());
  },
  draw() {
    const content = this._super();
    content.push(
      (this.priv.cancelBtn = (
        <Button
          className={"tb-SearchText-reset"}
          hidden={true}
          iconOnly={true}
          icon={"icon-backspace-solid"}
          onAction={() => this.clear()}
        />
      ))
    );
    return content;
  },
  clear() {
    this.value = "";
    this.priv.cancelBtn.hidden = true;
    this.focused = true;
  },
});

export { SearchField };

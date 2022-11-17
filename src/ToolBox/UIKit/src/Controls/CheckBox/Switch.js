import { Control } from "../Control";
import { ClassNames } from "../../utils/ClassNames";
import { Keys } from "../../utils/keys";

import "./style.less";

const Switch = Control.extend({
  ObjName: "Switch",
  init(props) {
    this._super({
      tabindex: 0,
      role: "checkbox",
      ...(props ?? {}),
    });
  },
  className() {
    return ClassNames(
      "tb-Switch",
      "tb-no-select",
      "tb-no-outline",
      {
        "is-checked": this.props.value,
      },
      this._super()
    );
  },
  draw() {
    return (
      <>
        <div className={"indicator"} />
        {(this.labelLayer = <label />)}
      </>
    );
  },
  renderValue() {
    this.node.setAttribute("aria-checked", this.props.value);
    this.renderClassName();
  },
  keyDown(evt) {
    if (this.disabled) return;

    if (evt.code === Keys.Space) {
      this.value = !this.value;
      this.fireAction();
    }
  },
  pointerDown(evt) {
    if (this.disabled) evt.preventDefault();
  },
  onClick() {
    if (this.disabled) return;
    this.value = !this.value;
    this.fireAction();
  },
});

export { Switch };

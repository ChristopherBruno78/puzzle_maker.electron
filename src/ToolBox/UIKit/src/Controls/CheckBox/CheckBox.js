import { ClassNames } from "../../utils/ClassNames";
import { Control } from "../Control";

import "./style.less";
import { Events } from "../../Events";

const CheckBox = Control.extend({
  ObjName: "CheckBox",
  init(props) {
    this._super({
      role: "checkbox",
      ...(props ?? {}),
    });
  },
  className() {
    return ClassNames("tb-Checkbox", "tb-no-outline", this._super());
  },
  draw() {
    const id = this.getId() + "-input";
    return (
      <>
        {(this.controlLayer = <input id={id} type={"checkbox"} />)}
        <div className={"indicator"} />
        {(this.labelLayer = <label className={"tb-no-select"} for={id} />)}
      </>
    );
  },
  renderValue() {
    this.node.setAttribute("aria-checked", this.props.value);
    this.controlLayer.node.checked = this.props.value;
  },
  initCustomEventListeners() {
    this.controlLayer.on(Events.OnChange, () => {
      if (this.disabled) return;
      this.value = this.controlLayer.node.checked;
      this.fireAction();
    });
  },
});

export { CheckBox };

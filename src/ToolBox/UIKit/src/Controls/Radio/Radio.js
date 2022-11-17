import { Control } from "../Control";
import { ClassNames } from "../../utils/ClassNames";
import { Events } from "../../Events";

import "./style.less";

const Radio = Control.extend({
  ObjName: "Radio",
  init(props) {
    this._super({
      role: "radio",
      ...(props ?? {}),
    });
  },
  className() {
    return ClassNames("tb-Radio", "tb-no-outline", this._super());
  },
  draw() {
    const id = this.getId() + "-input";
    return (
      <>
        {(this.controlLayer = <input id={id} type={"radio"} />)}
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

export { Radio };

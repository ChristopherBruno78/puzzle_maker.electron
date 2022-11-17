import { ClassNames } from "../../utils/ClassNames";
import { Control } from "../Control";

import "./style.less";
import { isJSObject } from "../../../../Foundation";

const ComboBox = Control.extend({
  ObjName: "ComboBox",
  props: {
    options: [],
  },
  init(props) {
    this._super({
      role: "listbox",
      ...(props ?? {}),
    });
  },
  className() {
    return ClassNames("tb-ComboBox", this._super());
  },
  addChild(option) {
    const o = {
      value: option.node.value ?? option.node.innerText,
      displayName: option.node.innerText,
    };
    this.props.options.push(o);
  },
  draw() {
    return (this.controlLayer = (
      <select
        onChange={() => {
          this.value = this.controlLayer.node.value;
          this.fireAction();
        }}
        className={"tb-Combo-input tb-no-select"}
      />
    ));
  },
  set selectedIndex(index) {
    this.controlLayer.node.selectedIndex = index;
    this.props.value = this.controlLayer.node.value;
  },
  get selectedIndex() {
    return this.controlLayer.node.selectedIndex;
  },
  renderOptions() {
    this.controlLayer.removeAllSubviews();
    const options = this.props.options;
    for (const option of options) {
      if (isJSObject(option)) {
        this.controlLayer.add(
          <option value={option.value}>{option.displayName}</option>
        );
      } else {
        this.controlLayer.add(
          <option value={option.toString()}>{option.toString()}</option>
        );
      }
    }
  },
  renderValue() {
    this.controlLayer.node.value = this.props.value;
  },
});

export { ComboBox };

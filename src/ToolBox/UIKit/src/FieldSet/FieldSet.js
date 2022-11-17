import { View } from "../View";

import "./style.less";
import { ClassNames } from "../utils/ClassNames";

const FieldSet = View.extend({
  ObjName: "FieldSet",
  props: {
    title: "",
  },
  init({ tagName, ...props } = {}) {
    this._super({
      tagName: "fieldset",
      ...(props ?? {}),
    });
  },
  className() {
    return ClassNames("tb-FieldSet", this._super());
  },
  draw() {
    return (this.legendLayer = <legend />);
  },
  renderTitle() {
    console.log(this.props.title);
    this.legendLayer.node.innerHTML = this.props.title;
  },
});

export { FieldSet };

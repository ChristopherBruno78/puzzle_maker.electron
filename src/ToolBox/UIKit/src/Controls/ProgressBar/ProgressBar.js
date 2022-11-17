import { Control } from "../Control";
import { ClassNames } from "../../utils/ClassNames";

import "./style.less";

const ProgressBar = Control.extend({
  ObjName: "ProgressBar",
  props: {
    indeterminate: false,
    minValue: 0,
    maxValue: 100,
  },
  init(props) {
    this._super({
      role: "progressbar",
      tabindex: -1,
      ...(props ?? {}),
    });
  },
  className() {
    const { indeterminate, value, minValue, maxValue } = this.props;
    return ClassNames(
      "tb-ProgressBar",
      {
        "tb-indeterminate": indeterminate,
        "tb-progress": value > minValue && value < maxValue,
        "tb-complete": value === maxValue,
      },
      this._super()
    );
  },
  draw() {
    return (this.progressLayer = <div />);
  },
  renderIndeterminate() {
    this.renderClassName();
  },
  renderValue() {
    const { indeterminate, value, maxValue } = this.props;
    if (!indeterminate) {
      this.node.setAttribute("aria-valuenow", this.props.value);
      let w = (value / maxValue) * this.node.offsetWidth;
      if (value === maxValue) {
        w += 2.0;
      }
      this.progressLayer.node.style.width = Math.round(w) + "px";
      this.renderClassName();
    }
  },
  renderAriaAttributes: function () {
    if (!this.props.indeterminate) {
      this.node.setAttributes({
        ariaValuemax: this.props.maxValue,
        ariaValuemin: this.props.minValue,
      });
    } else {
      this.node.removeAttribute("aria-valuemin");
      this.node.removeAttribute("aria-valuenow");
      this.node.removeAttribute("aria-valuemax");
    }
    this._super();
  }.observes("minValue", "maxValue", "indeterminate"),
});

export { ProgressBar };

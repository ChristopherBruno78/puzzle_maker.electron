import { Button } from "../Button/Button";
import { ClassNames } from "../../utils/ClassNames";
import { colorByAdjustingBrightness } from "./util";
import { ColorPanel } from "./ColorPanel";

const ColorWell = Button.extend({
  ObjName: "ColorWell",
  props: {
    value: "#000000",
  },
  init({ label, icon, onAction, ...props } = {}) {
    this.priv.colorPanel = new ColorPanel({
      onSelect: (sender) => {
        this.value = sender.color;
      },
    });
    this._super({
      onAction: () => {
        this.priv.colorPanel.color = this.value;
        this.priv.colorPanel.centerAndOpen(true);
      },
      ...(props ?? {}),
    });
  },
  className() {
    return ClassNames("tb-ColorWell", this._super());
  },
  draw() {
    return (this.colorRefLayer = <div className={"tb-ColorWell--color"} />);
  },
  renderValue() {
    this.colorRefLayer.node.style.backgroundColor = this.props.value;
    this.colorRefLayer.node.style.borderColor = colorByAdjustingBrightness(
      this.props.value,
      85
    );
  },
});

export { ColorWell };

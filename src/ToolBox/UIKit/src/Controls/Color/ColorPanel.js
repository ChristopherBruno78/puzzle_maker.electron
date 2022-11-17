import { Dialog } from "../../../Dialog";
import { MakeRect } from "../../utils/Geometry";
import { ClassNames } from "../../utils/ClassNames";
import { calculateContrast, colorByAdjustingBrightness } from "./util";
import { Button } from "../Button/Button";
import { DeckView } from "../../View/DeckView";
import { ColorPicker } from "./ColorPicker";
import { Events, FireEvent } from "../../Events";

const _ColorButton = Button.extend({
  props: {
    color: null,
    panel: null,
  },
  init({ iconOnly, color, ...props } = {}) {
    this._super({
      iconOnly: true,
      color: color.toUpperCase(),
      onAction: () => {
        this.selected = true;
      },
      ...(props ?? {}),
    });
  },
  className() {
    return ClassNames(
      "tb-ColorButton",
      {
        "is-dark": calculateContrast(this.color, "#000000") < 6,
        "is-selected": this.priv.selected,
      },
      this._super()
    );
  },
  set selected(flag) {
    if (this.priv.selected !== flag) {
      this.priv.selected = flag;
      const selectedBtn = this.panel.priv.selBtn;
      if (flag && selectedBtn !== this) {
        if (selectedBtn) {
          selectedBtn.selected = false;
        }
      }
      if (flag) {
        this.panel.color = this.color;
        this.panel.priv.selBtn = this;
        this.icon = "icon-chectb-solid";
        FireEvent(Events.OnSelect, this.props.panel, this.props.panel);
      } else {
        this.icon = null;
      }
      this.renderClassName();
    }
  },
  get selected() {
    return this.priv.selected;
  },
  renderColor() {
    this.node.style.setProperty("background-color", this.color);
    this.node.style.setProperty(
      "border-color",
      colorByAdjustingBrightness(this.color, 75)
    );
  },
});

const ColorPanel = Dialog.extend({
  ObjName: "ColorPanel",
  props: {
    customColors: [],
    color: null,
  },
  init({ resizable, title, frame, ...props } = {}) {
    this.priv.colorBtnSet = new Set();
    this.priv.customBtnSet = new Set();
    this._super({
      resizable: false,
      title: title ?? "Pick a Color",
      frame: MakeRect(0, 0, 422, 300),
      ...(props ?? {}),
    });
  },
  className() {
    return ClassNames("tb-ColorPanel", this._super());
  },
  drawContent() {
    this.priv.colorBtnSet.clear();
    this.customLayer = (
      <div className={"custom"}>
        <Button
          iconOnly={true}
          icon={"icon-plus-solid"}
          style={{ marginRight: "6px" }}
          onAction={() => {
            this.deckView.index = 1;
          }}
        />
      </div>
    );

    return (this.deckView = new DeckView({
      views: [
        <div>
          {_drawPresetColors(this)}
          <div style={{ marginTop: "20px" }}>Custom</div>
          {this.customLayer}
        </div>,
        new ColorPicker({
          onSelect: (sender) => {
            const custom = this.props.customColors;
            if (custom.length === 8) {
              custom.removeAt(0);
            }
            this.props.customColors.push(sender.color);
            this.renderCustomColors();
            this.color = sender.color;
            this.renderColor();

            this.deckView.index = 0;
          },
        }),
      ],
    }));
  },
  open() {
    this.renderColor();
    this.deckView.index = 0;
    this._super();
  },
  renderColor() {
    if (this.props.color) {
      for (const b of this.priv.colorBtnSet) {
        if (b.color === this.color) {
          b.selected = true;
          return;
        }
      }
    }
  },
  renderCustomColors() {
    for (const b of this.priv.customBtnSet) {
      this.customLayer.remove(b);
    }
    this.priv.customBtnSet = new Set();
    for (const b of this.props.customColors) {
      const btn = _colorBtn(this, b);
      this.priv.customBtnSet.add(btn);
      this.customLayer.add(btn);
    }
  },
});

function _drawPresetColors(panel) {
  return (
    <div className={"presets"}>
      <div className={"tb-color-col"}>
        {_colorBtn(panel, "#99c1f1")}
        {_colorBtn(panel, "#62a0ea")}
        {_colorBtn(panel, "#3584e4")}
        {_colorBtn(panel, "#1c71d8")}
        {_colorBtn(panel, "#1a5fb4")}
      </div>
      <div className={"tb-color-col"}>
        {_colorBtn(panel, "#8ff0a4")}
        {_colorBtn(panel, "#57e389")}
        {_colorBtn(panel, "#33d17a")}
        {_colorBtn(panel, "#2ec27e")}
        {_colorBtn(panel, "#208858")}
      </div>
      <div className={"tb-color-col"}>
        {_colorBtn(panel, "#f9f06b")}
        {_colorBtn(panel, "#f8e45c")}
        {_colorBtn(panel, "#f6d32d")}
        {_colorBtn(panel, "#f5c211")}
        {_colorBtn(panel, "#e5a50a")}
      </div>
      <div className={"tb-color-col"}>
        {_colorBtn(panel, "#ffbe6f")}
        {_colorBtn(panel, "#ffa348")}
        {_colorBtn(panel, "#ff7800")}
        {_colorBtn(panel, "#e66100")}
        {_colorBtn(panel, "#c64600")}
      </div>
      <div className={"tb-color-col"}>
        {_colorBtn(panel, "#f66151")}
        {_colorBtn(panel, "#ed333b")}
        {_colorBtn(panel, "#e01b24")}
        {_colorBtn(panel, "#c01c28")}
        {_colorBtn(panel, "#a51d2d")}
      </div>
      <div className={"tb-color-col"}>
        {_colorBtn(panel, "#dc8add")}
        {_colorBtn(panel, "#c061cb")}
        {_colorBtn(panel, "#9141ac")}
        {_colorBtn(panel, "#813d9c")}
        {_colorBtn(panel, "#613583")}
      </div>
      <div className={"tb-color-col"}>
        {_colorBtn(panel, "#cdab8f")}
        {_colorBtn(panel, "#b5835a")}
        {_colorBtn(panel, "#986a44")}
        {_colorBtn(panel, "#865e3c")}
        {_colorBtn(panel, "#63452c")}
      </div>
      <div className={"tb-color-col"}>
        {_colorBtn(panel, "#ffffff")}
        {_colorBtn(panel, "#f6f5f4")}
        {_colorBtn(panel, "#deddda")}
        {_colorBtn(panel, "#c0bfbc")}
        {_colorBtn(panel, "#9a9996")}
      </div>
      <div className={"tb-color-col"}>
        {_colorBtn(panel, "#77767b")}
        {_colorBtn(panel, "#5e5c64")}
        {_colorBtn(panel, "#2b2731")}
        {_colorBtn(panel, "#241f31")}
        {_colorBtn(panel, "#000000")}
      </div>
    </div>
  );
}

function _colorBtn(panel, color) {
  const b = new _ColorButton({
    color: color.toUpperCase(),
    panel: panel,
  });
  panel.priv.colorBtnSet.add(b);
  return b;
}

export { ColorPanel };

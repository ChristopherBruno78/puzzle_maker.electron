import { View } from "../../View/View";
import { ClassNames } from "../../utils/ClassNames";
import { Slider } from "../Slider/Slider";
import { SliderOrientation } from "../Slider/SliderOrientation";
import { TextField } from "../Text";
import { Button } from "../Button/Button";
import { Intent } from "../../Intent";
import { Events, FireEvent } from "../../Events";
import { fromHSL, getHexValue, getHSL, isColor } from "./util";

import "./style.less";

const BG_TRANSPARENCY =
  "linear-gradient(45deg, lightgrey 25%, transparent 25%, transparent 75%, lightgrey 75%) 0 0 / 20px 20px, linear-gradient(45deg, lightgrey 25%, white 25%, white 75%, lightgrey 75%) 10px 10px / 20px 20px";

const SL_PICKER_SIZE = 200.0;

const _SLPicker = View.extend({
  props: {
    hue: 0,
    lightness: 0,
    saturation: 0,
    picker: null,
  },
  init(props) {
    this._super({
      tabindex: 0,
      ...(props ?? {}),
    });
  },
  className() {
    return ClassNames("sl_picker", this._super());
  },
  draw() {
    return (
      <>
        {(this.priv.vline = <div className={"sl_picker_vline"} />)}
        {(this.priv.hline = <div className={"sl_picker_hline"} />)}
      </>
    );
  },
  pointerDown(evt) {
    if (evt.button === 0) {
      evt.preventDefault();
      this.priv.ptDown = true;
      this.node.setPointerCapture(evt.pointerId);
      const bounds = this.node.absoluteBounds();
      _setSLFromPosition(
        this,
        evt.clientX - bounds.origin.x,
        evt.clientY - bounds.origin.y
      );
    }
  },
  pointerMove(evt) {
    if (this.priv.ptDown) {
      const bounds = this.node.absoluteBounds();
      _setSLFromPosition(
        this,
        Math.min(SL_PICKER_SIZE, Math.max(0, evt.clientX - bounds.origin.x)),
        Math.min(SL_PICKER_SIZE, Math.max(0, evt.clientY - bounds.origin.y))
      );
    }
  },
  pointerUp(evt) {
    this.priv.ptDown = false;
    this.node.releasePointerCapture(evt.pointerId);
  },
  renderHue() {
    this.node.style.setProperty(
      "background-color",
      "hsl(" + this.props.hue + ", 100%, 50%)"
    );
  },
  renderSaturation() {
    let saturation = Math.max(0, Math.min(100, this.props.saturation));
    let x = Math.round((saturation * SL_PICKER_SIZE) / 100.0);
    this.priv.vline.node.style.left =
      Math.min(SL_PICKER_SIZE, Math.max(0, x)) + "px";
  },
  renderLightness() {
    let lightness = Math.max(0, Math.min(100, this.props.lightness));
    let y = Math.round(((100 - lightness) * SL_PICKER_SIZE) / 100.0);
    this.priv.hline.node.style.top =
      Math.min(SL_PICKER_SIZE, Math.max(0, y)) + "px";
  },
  _fireDidEnterDocument() {
    this._super();
    _setSLFromPosition(this, 100.0, 100.0);
  },
});

const ColorPicker = View.extend({
  ObjName: "ColorPicker",
  props: {
    color: "#bf4040",
    alpha: 1.0,
  },
  init({ tagName, ...props } = {}) {
    this._super(props ?? {});
  },
  className() {
    return ClassNames("tb-ColorPicker", this._super());
  },
  draw() {
    return (
      <>
        <div className={"tb-ColorSliders"}>
          {
            (this.priv.hue = (
              <Slider
                tooltip={"Hue"}
                className={"picker_hue"}
                showTooltip={false}
                continuous={true}
                onAction={(sender) => {
                  const hue = (sender.value * 360) / 100.0;
                  const { saturation, lightness } = getHSL(this.color);
                  this.props.color = fromHSL(hue, saturation, lightness);
                  this.priv.hue.handleLayer.node.style.setProperty(
                    "background-color",
                    "hsl(" + hue + ", 100%, 50%)"
                  );
                  _updateAlphaSlider(this, hue, saturation, lightness);
                  _updateSLView(this, hue);
                  _updateColor(this);
                  _updateHexColor(this);
                }}
              />
            ))
          }
          {(this.priv.slPicker = new _SLPicker({ picker: this }))}
          {
            (this.priv.alphaSlider = (
              <Slider
                tooltip={"Opacity"}
                showTooltip={false}
                orientation={SliderOrientation.Vertical}
                continuous={true}
                className={"picker_alpha"}
                onAction={(sender) => {
                  this.alpha = (sender.value / 100.0).toFixed(2);
                }}
              />
            ))
          }
        </div>
        <div className={"tb-ColorValue"}>
          <label>Color:</label>
          <div className={"color_display"}>
            {(this.colorDisplayLayer = <div />)}
          </div>
          <label>Hex Value:</label>
          {
            (this.priv.hexValue = (
              <TextField
                onAction={(sender) => {
                  const value = sender.value;
                  let color = null,
                    alpha = 1.0;
                  if (value.length === 7) {
                    color = value;
                  }
                  if (value.length === 9) {
                    color = value.substring(0, 7);
                    alpha = parseInt(value.substring(7, 9), 16) / 255;
                  }

                  if (color && isColor(color)) {
                    this.props.alpha = alpha;
                    this.props.color = color.toUpperCase();
                    this.renderColor();
                  } else {
                    _updateHexColor(this);
                  }
                }}
              />
            ))
          }
          <div style={{ flex: "1" }} />
          <Button
            onAction={() => FireEvent(Events.OnSelect, this, this)}
            intent={Intent.Primary}
            label={"Select"}
          />
        </div>
      </>
    );
  },

  renderColor() {
    if (this.color) {
      const { hue, saturation, lightness } = getHSL(this.color);
      _updateHueSlider(this, hue);
      _updateSLView(this, hue, saturation, lightness);
      _updateColor(this);
      _updateAlphaSlider(this);
      _updateHexColor(this);
    }
  },
  renderAlpha() {
    _updateAlphaSlider(this);
    _updateHexColor(this);
    _updateColor(this);
  },
});

function _updateHueSlider(picker, hue) {
  const hueStr = "hsl(" + hue + ", 100%, 50%)";
  picker.priv.hue.value = Math.round((hue * 100) / 360.0);
  picker.priv.hue.handleLayer.node.style.setProperty(
    "background-color",
    hueStr
  );
}

function _updateAlphaSlider(picker) {
  if (picker.color) {
    const { hue, saturation, lightness } = getHSL(picker.color);
    const hslStr = "hsl(" + hue + ", " + saturation + "%, " + lightness + "%)";
    const transStr = hslStr.replace("hsl", "hsla").replace(")", ", " + "0)");
    const backgroundStyle =
      "linear-gradient(" + hslStr + "," + transStr + "), " + BG_TRANSPARENCY;
    picker.priv.alphaSlider.node.style.setProperty(
      "background",
      backgroundStyle
    );
    picker.priv.alphaSlider.value = picker.alpha * 100;
  }
}

function _updateSLView(picker, hue, sat, l) {
  if (picker.color) {
    picker.priv.slPicker.hue = hue;
    picker.priv.slPicker.saturation = sat;
    picker.priv.slPicker.lightness = l;
  }
}

function _updateColor(picker) {
  picker.colorDisplayLayer.node.style.setProperty(
    "background",
    picker.color + getHexValue(picker.alpha * 255)
  );
}

function _updateHexColor(picker) {
  if (picker.color)
    picker.priv.hexValue.value = picker.color + getHexValue(picker.alpha * 255);
}

function _setSLFromPosition(slpicker, x, y) {
  const pY = 1 - y / SL_PICKER_SIZE;
  const pX = x / SL_PICKER_SIZE;

  slpicker.saturation = Math.round(pX * 100);

  slpicker.lightness = Math.round(pY * 100);

  const picker = slpicker.picker;
  picker.props.color = fromHSL(
    slpicker.hue,
    slpicker.saturation,
    slpicker.lightness
  );
  _updateAlphaSlider(picker);
  _updateHexColor(picker);
  _updateColor(picker);
}

export { ColorPicker };

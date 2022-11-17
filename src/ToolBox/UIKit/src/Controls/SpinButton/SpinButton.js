import { Control } from "../Control";
import { ClassNames } from "../../utils/ClassNames";
import { TextField } from "../Text";
import { Button } from "../Button/Button";

import "./style.less";
import { Events } from "../../Events";

const SpinButton = Control.extend({
  ObjName: "SpinButton",
  props: {
    continuous: true,
    minValue: 0,
    maxValue: 100,
    step: 1,
    value: 0,
  },
  init(props) {
    this._super({
      role: "spinbutton",
      ...(props ?? {}),
    });
  },
  className() {
    return ClassNames("tb-SpinButton", this._super());
  },
  draw() {
    return (
      <div>
        {
          (this.textLayer = (
            <TextField
              onFocus={() => {
                this.focused = true;
              }}
              onBlur={() => {
                this.focused = false;
              }}
              delegate={this}
              tabindex={-1}
            />
          ))
        }
        <div className={"tb-SpinButton-btns"}>
          {
            (this.downBtn = (
              <Button
                className={"down"}
                tooltip={"Spin Down"}
                tabindex={-1}
                iconOnly={true}
                onAction={() => {
                  if (this.disabled) return;
                  this.focused = true;
                  let newValue = Math.max(this.props.minValue, this.value - 1);
                  if (newValue !== this.value) {
                    this.value = newValue;
                    this.fireAction();
                  }
                }}
                icon={"icon-minus-solid"}
              />
            ))
          }
          {
            (this.upBtn = (
              <Button
                className={"up"}
                tooltip={"Spin Up"}
                tabindex={-1}
                onAction={() => {
                  if (this.disabled) return;
                  let newValue = Math.min(this.maxValue, this.value + 1);
                  if (newValue !== this.value) {
                    this.value = newValue;
                    this.fireAction();
                  }
                }}
                iconOnly={true}
                icon={"icon-plus-solid"}
              />
            ))
          }
        </div>
      </div>
    );
  },
  textDidEndEditing() {
    const content = this.textLayer.value;
    const { minValue, maxValue } = this.props;
    try {
      let newValue = Math.max(
        minValue,
        Math.min(maxValue, parseInt(content, 10))
      );
      if (newValue !== this.value) {
        this.value = newValue;
        this.fireAction();
      }
    } catch (e) {
      if (content.length > 0) {
        this.textLayer.value = "";
      }
    }
  },
  renderFocused() {
    this.textLayer.focused = this.props.focused;
  },
  renderAriaAttributes: function () {
    this.node.setAttributes({
      ariaValuemax: this.props.maxValue,
      ariaValuemin: this.props.minValue,
      ariaValuenow: this.props.value,
    });
    this._super();
  }.observes("minValue", "maxValue", "value"),
  renderValue() {
    this.textLayer.value = this.value?.toString();
  },
  renderDisabled() {
    this._super();
    const disabled = this.props.disabled;
    this.textLayer.disabled = disabled;
    this.upBtn.disabled = disabled;
    this.downBtn.disabled = disabled;
  },
  initCustomEventListeners() {
    this.upBtn.on(Events.PointerDown, (evt) => {
      if (this.disabled) return;
      this.focused = true;
      clearTimeout(this.priv.ct);
      clearInterval(this.priv.ct);
      if (evt.button === 0) {
        this.upBtn.node.setPointerCapture(evt.pointerId);
        _startContinuous(this, this.props.step);
      }
    });
    this.upBtn.on(Events.PointerUp, (evt) => {
      _stopContinuous(this);
      this.upBtn.node.releasePointerCapture(evt.pointerId);
    });
    this.downBtn.on(Events.PointerDown, (evt) => {
      if (this.disabled) return;
      this.focused = true;

      clearTimeout(this.priv.ct);
      clearInterval(this.priv.ct);
      if (evt.button === 0) {
        this.downBtn.node.setPointerCapture(evt.pointerId);
        _startContinuous(this, -1 * this.props.step);
      }
    });
    this.downBtn.on(Events.PointerUp, (evt) => {
      _stopContinuous(this);
      this.downBtn.node.releasePointerCapture(evt.pointerId);
    });
  },
});

const continuousSpeed = 80;
const startContinuous = 300;

function _startContinuous(sb, step) {
  if (!sb.priv.ts) {
    sb.priv.ct = setTimeout(() => {
      sb.priv.ct = setInterval(() => {
        sb.priv.ts = true;
        sb.value = sb.value + step;
        sb.fireAction();
      }, continuousSpeed);
    }, startContinuous);
  }
}

function _stopContinuous(sb) {
  clearTimeout(sb.priv.ct);
  clearInterval(sb.priv.ct);
  sb.priv.ts = false;
}

export { SpinButton };

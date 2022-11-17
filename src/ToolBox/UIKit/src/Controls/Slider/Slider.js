import { Control } from "../Control";
import { RootView } from "../../View/RootView";
import { Keys } from "../../utils/keys";
import { debounce } from "../../../../Foundation";
import { ClassNames } from "../../utils/ClassNames";
import { SliderOrientation } from "./SliderOrientation";
import { PopOverOrientation } from "../../PopOver/PopOverOrientation";
import { MakePoint } from "../../utils/Geometry";
import { PopOver } from "../../PopOver/PopOver";

import "./style.less";

const _SliderHandle = Control.extend({
  ObjName: "_SliderHandle",
  props: {
    slider: null,
    position: 0,
  },
  className() {
    return ClassNames("tb-Slider-handle", this._super());
  },
  enable(evt) {
    if (!this.priv.ptDown) {
      _calcValue(this.slider, evt);
      this.node.setPointerCapture(evt.pointerId);
      this.priv.ptDown = true;
      if (this.slider.showTooltip) {
        _showValueTooltip(this.slider);
      }
      if (this.slider.continuous) {
        this.slider.fireAction();
      }
    }
  },
  pointerDown(evt) {
    evt.preventDefault();
    if (this.slider.disabled) {
      return;
    }
    if (evt.button === 0) {
      this.priv.ptDown = true;
      this.node.setPointerCapture(evt.pointerId);
      let rect = this.node.getBoundingClientRect();
      this.priv.mouseDownOffset = MakePoint(
        evt.clientX - this.node.offsetWidth / 2 - rect.left,
        evt.clientY - this.node.offsetHeight / 2 - rect.top
      );
      if (this.slider.showTooltip) {
        _showValueTooltip(this.slider);
      }
      this.active = true;
    }
  },
  pointerMove(evt) {
    if (this.slider.disabled) {
      return;
    }
    if (this.priv.ptDown) {
      _calcValue(this.slider, evt);
      // show tooltip
      if (this.slider.showTooltip) {
        _showValueTooltip(this.slider);
      }
      if (this.slider.continuous) {
        this.slider.fireAction();
      }
    }
  },
  pointerUp(evt) {
    this.priv.ptDown = false;
    this.active = false;
    this.node.releasePointerCapture(evt.pointerId);
    this.slider.priv.tooltipPopOver.close();
    if (this.slider.disabled) {
      return;
    }
    this.slider.fireAction();
  },
  keyDown(evt) {
    const slider = this.slider;
    let oldValue = slider.value;
    if (slider.orientation === SliderOrientation.Vertical) {
      if (evt.code === Keys.ArrowUp) {
        evt.stopPropagation();
        evt.preventDefault();
        slider.value = _stepToNearestAllowedValue(
          slider,
          slider.value + slider.step
        );
      } else if (evt.code === Keys.ArrowDown) {
        evt.stopPropagation();
        evt.preventDefault();
        const oldValue = slider.value;
        slider.value = _stepToNearestAllowedValue(
          slider,
          slider.value - slider.step
        );
      }
    } else {
      if (evt.code === Keys.ArrowLeft) {
        evt.stopPropagation();
        evt.preventDefault();
        slider.value = _stepToNearestAllowedValue(
          slider,
          slider.value - slider.step
        );
      } else if (evt.code === Keys.ArrowRight) {
        evt.stopPropagation();
        evt.preventDefault();
        slider.value = _stepToNearestAllowedValue(
          slider,
          slider.value + slider.step
        );
      }
    }
    if (oldValue !== slider.value) {
      _flashToolTip(slider);
      slider.fireAction();
    }
  },
  renderPosition() {
    if (this.slider.orientation === SliderOrientation.Vertical) {
      this.node.style.top = this.props.position + "px";
    } else {
      this.node.style.left = this.props.position + "px";
    }
  },
});

function _flashToolTip(slider) {
  if (slider.showTooltip) {
    _showValueTooltip(slider);
    slider.priv.htt = debounce(
      () => {
        slider.priv.tooltipPopOver.close();
      },
      500,
      slider.priv.htt
    );
  }
}

function _showValueTooltip(slider) {
  if (slider.tooltipLabelLayer.node.innerHTML !== "" + slider.value) {
    slider.tooltipLabelLayer.node.innerHTML = "" + slider.value;
    let rect = slider.handleLayer.node.getBoundingClientRect();
    if (slider.orientation === SliderOrientation.Vertical) {
      if (RootView.node.offsetWidth - rect.left - 52 > 0) {
        slider.priv.tooltipPopOver.orientation =
          PopOverOrientation.Right_Middle;
      } else {
        slider.priv.tooltipPopOver.orientation = PopOverOrientation.Left_Middle;
      }
      slider.priv.tooltipPopOver.show(slider.handleLayer);
    } else {
      if (rect.top - 40 > 0) {
        slider.priv.tooltipPopOver.orientation = PopOverOrientation.Top_Center;
      } else {
        slider.priv.tooltipPopOver.orientation =
          PopOverOrientation.Bottom_Center;
      }
      slider.priv.tooltipPopOver.show(slider.handleLayer);
    }
  }
}

const _SliderTooltip = PopOver.extend({
  init(slider) {
    this.priv.slider = slider;
    this._super({
      transient: false,
      callout: false,
      borderColor: "rgb(26,41,55)",
      backgroundColor: "rgb(26,41,55)",
    });
  },
  className() {
    return ClassNames(this._super(), "tb-Slider-tip");
  },
  drawContent() {
    return (this.priv.slider.tooltipLabelLayer = <label />);
  },
});

const Slider = Control.extend({
  ObjName: "Slider",
  props: {
    continuous: true,
    minValue: 0,
    maxValue: 100,
    step: 1,
    value: 0,
    showTooltip: true,
    orientation: SliderOrientation.Horizontal,
  },
  init(props) {
    this._super({
      role: "slider",
      tabindex: -1,
      ...(props ?? {}),
    });
  },
  className() {
    return ClassNames(
      "tb-Slider",
      "tb-no-outline",
      this.props.orientation,
      this._super()
    );
  },
  draw() {
    return (
      <>
        {
          (this.rangeLayer = (
            <div className={"tb-Slider-range tb-no-outline"} />
          ))
        }
        {(this.handleLayer = <_SliderHandle slider={this} />)}
      </>
    );
  },
  pointerDown(evt) {
    evt.preventDefault();
    if (this.disabled) {
      return;
    }
    if (evt.button === 0) {
      this.handleLayer.priv.mouseDownOffset = MakePoint(0, 0);
      this.handleLayer.enable(evt);
      this.handleLayer.active = true;
    }
  },
  renderValue() {
    this.props.value = _stepToNearestAllowedValue(this, this.props.value);
    this.node.setAttribute("aria-valuenow", this.props.value);
    _positionKnob(this);
  },
  renderOrientation() {
    this.renderClassName();
  },
  renderAriaAttributes: function () {
    this.node.setAttributes({
      ariaValuemax: this.props.maxValue,
      ariaValuemin: this.props.minValue,
    });
    this._super();
  }.observes("minValue", "maxValue"),
  _fireDidEnterDocument() {
    this._super();
    this.priv.tooltipPopOver = new _SliderTooltip(this);
    setTimeout(() => {
      this.value = Math.max(this.minValue, Math.min(this.maxValue, this.value));
      _positionKnob(this);
    }, 10);
  },
  _fireDidLeaveDocument() {
    this._super();
    this.priv.tooltipPopOver.remove();
  },
});

function _positionKnob(slider) {
  const { maxValue, minValue, value } = slider.props;
  const height = slider.node.offsetHeight,
    width = slider.node.offsetWidth;
  let p = 1.0 - (maxValue - value) / (maxValue - minValue);
  if (slider.orientation === SliderOrientation.Vertical) {
    let y = Math.round((1.0 - p) * (height - 16));
    slider.handleLayer.position = y + 10;
    let rangeValue = height - (y + 10);
    slider.rangeLayer.node.style.height = rangeValue + "px";
  } else {
    let x = Math.round(p * (width - 16));
    slider.handleLayer.position = x + 10;
    slider.rangeLayer.node.style.width = x + 10 + "px";
  }
}

function _valueOfKnobPosition(slider, pos) {
  let p;
  if (slider.orientation === SliderOrientation.Vertical) {
    let h = slider.node.offsetHeight - 20;
    p = Math.max(0, Math.min(1, (h - (pos - 10)) / h));
  } else {
    p = Math.max(0, Math.min(1, (pos - 10) / (slider.node.offsetWidth - 20)));
  }
  let dv = p * (slider.maxValue - slider.minValue) + slider.minValue;
  return _stepToNearestAllowedValue(slider, dv);
}

function _stepToNearestAllowedValue(slider, dv) {
  const { step, minValue, maxValue } = slider.props;
  let m = Math.round(dv / step);
  return Math.min(maxValue, Math.max(minValue, m * step));
}

function _calcValue(slider, evt) {
  const p = slider.handleLayer.priv.mouseDownOffset;
  let rect = slider.node.getBoundingClientRect();

  const offsetX = Math.min(rect.width, evt.clientX - rect.left) - p.x;
  const offsetY = Math.min(rect.height, evt.clientY - rect.top) - p.y;

  let dv;
  if (slider.orientation === SliderOrientation.Vertical) {
    dv = _valueOfKnobPosition(slider, offsetY);
  } else {
    dv = _valueOfKnobPosition(slider, offsetX);
  }
  slider.value = dv;
}

export { Slider };

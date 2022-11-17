import { Control } from "../Control";
import { ClassNames } from "../../utils/ClassNames";
import { Intent } from "../../Intent";
import { Keys } from "../../utils/keys";
import { EventKeyCode } from "../../Events";

import "./style.less";

const Button = Control.extend({
  ObjName: "Button",
  props: {
    icon: null,
    iconOnly: false,
    isToggle: false,
    intent: Intent.Default,
  },
  init({ tagName, ...props } = {}) {
    this._super({
      tagName: "button",
      ...(props || {}),
    });
  },
  className() {
    return ClassNames(
      "tb-Button",
      this.props.intent,
      { "tb-Button--iconOnly": this.props.iconOnly },
      this._super()
    );
  },
  draw() {
    return (
      <div>
        {(this.iconLayer = <i />)}
        {(this.labelLayer = <label />)}
      </div>
    );
  },
  renderIcon() {
    if (this.iconLayer) {
      if (this.icon?.trim().length > 0) {
        this.iconLayer.displayed = true;
        this.iconLayer.node.className = ClassNames("icon-font", this.icon);
      } else {
        this.iconLayer.displayed = false;
      }
    }
  },
  renderAriaAttributes: function () {
    this.node.setAttribute("aria-pressed", this.active);
    this._super();
  }.observes("active"),
  pointerDown(evt) {
    evt.preventDefault();
    if (this.props.disabled) return;
    if (evt.button === 0) _setActive(this, true);
  },
  pointerUp(evt) {
    _setActive(this, false);
    if (this.disabled) return;
    if (evt.button === 0) this.fireAction();
  },
  pointerLeave(evt) {
    if (this.priv.ptDown) {
      _setActive(this, false);
    }
    this._super(evt);
  },
  keyDown(evt) {
    if (this.props.disabled) return;
    const key = EventKeyCode(evt);
    if (key === Keys.Enter || key === Keys.Space) {
      evt.preventDefault();
      _setActive(this, true);
    }
  },
  keyUp(evt) {
    if (this.props.disabled) return;
    const key = EventKeyCode(evt);
    if (key === Keys.Enter || key === Keys.Space) {
      if (this.priv.ptDown) {
        _setActive(this, false);
        this.fireAction();
        this.set("state.hover", false);
      }
    }
  },
});

function _setActive(aButton, flag) {
  if (flag) {
    if (aButton.disabled) return;
    aButton.priv.ptDown = true;
    if (aButton.isToggle) {
      aButton.active = !aButton.active;
    } else {
      aButton.active = true;
    }
  } else {
    if (!aButton.isToggle) {
      aButton.active = false;
    }
    aButton.priv.ptDown = false;
  }
}

export { Button };

import { _Text } from "./Text";
import { ClassNames } from "../../utils/ClassNames";
import {
  initMask,
  maskOnBlur,
  maskOnFocus,
  maskOnKeyDown,
  maskOnKeyUp,
} from "./mask";
import { Keys } from "../../utils/keys";
import { EventKeyCode } from "../../Events";

const TextField = _Text.extend({
  ObjName: "TextField",
  props: {
    mask: null,
    maskPlaceholder: "_",
    secure: false,
    prefix: null,
    suffix: null,
  },
  draw() {
    return (
      <>
        <i ref={(e) => (this.priv.$prefix = e)} />
        {
          (this.controlLayer = (
            <input
              className={"tb-Text-input"}
              type={this.props.secure ? "password" : "text"}
            />
          ))
        }
        <i ref={(e) => (this.priv.$suffix = e)} />
      </>
    );
  },
  keyUp(evt) {
    if (!this.disabled) {
      if (_hasMask(this)) {
        maskOnKeyUp(this, evt);
      }
      const key = EventKeyCode(evt);
      if (key === Keys.Enter) {
        this.fireAction();
      }
    }
  },
  keyDown(evt) {
    if (!this.disabled) {
      if (_hasMask(this)) {
        maskOnKeyDown(this, evt);
      }
    }
  },
  onFocus(evt) {
    if (!this.disabled) {
      if (_hasMask(this)) {
        maskOnFocus(this, evt);
      }
    }
  },
  onBlur(evt) {
    if (_hasMask(this)) {
      maskOnBlur(this);
    }
  },
  renderPrefix() {
    if (this.props.prefix) {
      this.priv.$prefix.displayed = true;
      this.priv.$prefix.styleName = ClassNames(
        "icon-font",
        "prefix",
        this.props.prefix
      );
    } else {
      this.priv.$prefix.displayed = false;
      this.priv.$prefix.styleName = "";
    }
  },
  renderSuffix() {
    if (this.props.suffix) {
      this.priv.$suffix.displayed = true;
      this.priv.$suffix.styleName = ClassNames(
        "icon-font",
        "suffix",
        this.props.suffix
      );
    } else {
      this.priv.$suffix.displayed = false;
      this.priv.$suffix.styleName = "";
    }
  },
  _fireDidEnterDocument() {
    this._super();
    if (_hasMask(this)) {
      initMask(this);
    }
  },
});

function _hasMask(text) {
  return text.props.mask && text.props.mask.length > 0;
}

export { TextField };

import { Control } from "../Control";
import { ClassNames } from "../../utils/ClassNames";
import { Events, FireEvent } from "../../Events";
import { debounce, isMethod } from "../../../../Foundation";

import "./style.less";

const didEndEditingTimeout = 600;

const _Text = Control.extend({
  ObjName: "_Text",
  props: {
    fontSize: 14,
    readOnly: false,
    placeholder: null,
    spellcheck: false,
    delegate: null,
  },
  init({ tagName, ...props } = {}) {
    this._super({
      tagName: "div",
      ...(props || {}),
    });
  },
  className() {
    return ClassNames("tb-Text", this._super());
  },
  select(range) {
    if (this.focused) {
      this.controlLayer.node.setSelectionRange(range.start, range.end);
    } else {
      this.focused = true;
      setTimeout(
        () => this.controlLayer.node.setSelectionRange(range.start, range.end),
        0
      );
    }
  },
  get selectionStart() {
    return this.controlLayer.node.selectionStart;
  },
  get selectionEnd() {
    return this.controlLayer.node.selectionEnd;
  },
  clear() {
    this.value = "";
    FireEvent(Events.OnInput, this.controlLayer);
  },
  renderValue() {
    this.controlLayer.node.value = this.props.value;
  },
  renderInputAttributes: function () {
    const layer = this.controlLayer;
    if (this.props.readOnly) {
      layer.node.setAttribute("readonly", "true");
    } else {
      layer.node.removeAttribute("readonly");
    }
    layer.node.setAttributes({
      spellcheck: this.props.spellcheck,
      placeholder: this.props.placeholder || "",
    });
    if (this.props.name) {
      layer.node.setAttribute("name", this.props.name);
    } else {
      layer.node.removeAttribute("name");
    }
  }.observes("readOnly", "placeholder", "spellcheck", "name"),
  renderFontSize() {
    this.controlLayer.node.style.fontSize = this.props.fontSize + "px";
  },
  initCustomEventListeners() {
    this._super();
    this.controlLayer.on(Events.OnInput, () => {
      _fireTextChangeEvents(this);
    });
  },
});

function _fireTextChangeEvents(text) {
  const delegate = text.props.delegate;
  text.value = text.controlLayer.node.value || "";
  FireEvent(Events.TextChange, delegate, text);
  if (isMethod(text, "textChange")) {
    text.textChange.call(text, text.value);
  }
  text.priv.editTimer = debounce(
    () => {
      FireEvent(Events.TextDidEndEditing, delegate, text);
    },
    didEndEditingTimeout,
    text.priv.editTimer
  );
}

export { _Text, _fireTextChangeEvents };

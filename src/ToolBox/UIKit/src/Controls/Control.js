import "../Element";
import { View } from "../View";
import { ClassNames } from "../utils/ClassNames";
import { isFunction } from "../../../Foundation";
import { Events } from "../Events";

const Control = View.extend({
  ObjName: "Control",
  props: {
    label: "",
    name: null,
    tooltip: null,
    disabled: false,
    value: null,
    focused: false,
    active: false,
    hover: false,
    target: null,
    action: null,
    tabindex: 0,
  },
  className() {
    return ClassNames(
      {
        "is-disabled": this.props.disabled,
        "is-active": this.props.active,
        "is-hover": this.props.hover,
        "is-focused": this.props.focused,
      },
      this._super()
    );
  },
  _render() {
    this._super();
    this.controlLayer.on("focus", () => {
      this.props.focused = true;
      this.renderClassName();
    });
    this.controlLayer.on("blur", () => {
      this.props.focused = false;
      this.renderClassName();
    });
  },
  renderAriaAttributes: function () {
    this.node.setAttribute("aria-disabled", this.disabled);
    this._super();
  }.observes("disabled"),
  renderLabel() {
    const label = this.props.label;
    if (this.labelLayer) {
      if (label?.trim().length > 0) {
        this.labelLayer.displayed = true;
        this.labelLayer.node.innerHTML = label;
        this.node.setAttribute("aria-labelledby", this.labelLayer.getId());
      } else {
        this.node.removeAttribute("aria-labelledby");
        this.labelLayer.displayed = false;
      }
    }
  },
  renderTooltip() {
    if (this.props.tooltip) {
      this.node.setAttributes({
        title: this.props.tooltip,
      });
    }
  },
  renderName() {
    this.controlLayer.node.setAttributes({
      name: this.props.name,
    });
  },
  renderDisabled() {
    if (this.props.disabled) {
      this.controlLayer.node.setAttributes({
        disabled: true,
        tabindex: -1,
      });
      this.focused = false;
    } else {
      this.controlLayer.node.setAttribute("tabindex", this.props.tabindex || 0);
      this.controlLayer.node.removeAttribute("disabled");
    }
  },
  renderFocused() {
    if (this.props.focused) {
      this.controlLayer.node.focus();
    } else {
      this.controlLayer.node.blur();
    }
  },
  renderControlState: function () {
    this.renderClassName();
  }.observes("active", "hover", "disabled", "focused"),
  pointerEnter() {
    this.hover = true;
  },
  pointerLeave() {
    this.hover = false;
  },
  fireAction() {
    const { target, action } = this.props;
    if (target && action) {
      if (isFunction(target[action])) {
        target[action].call(target, this);
        return;
      }
    }
    if (isFunction(this.onAction)) {
      setTimeout(() => {
        this.onAction(this);
      }, 0);
    }
  },
  initCustomEventListeners() {
    this.controlLayer.on(Events.OnFocus, () => {
      this.focused = true;
    });
    this.controlLayer.on(Events.OnBlur, () => {
      this.focused = false;
    });
  },
});

export { Control };

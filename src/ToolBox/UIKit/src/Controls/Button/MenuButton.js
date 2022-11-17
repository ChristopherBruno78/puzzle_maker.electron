import { Button } from "./Button";
import { ClassNames } from "../../utils/ClassNames";
import { hasFocus } from "../../utils/dom";
import { PopOverOrientation } from "../../PopOver/PopOverOrientation";
import { RootView } from "../../View/RootView";
import { Events } from "../../Events";

const MenuButton = Button.extend({
  ObjName: "MenuButton",
  props: {
    dropIcon: "icon-angle-down-regular",
    menu: null,
  },
  init({ isToggle, ...props } = {}) {
    this._super({
      isToggle: true,
      ariaHaspopup: true,
      ...(props || {}),
    });
  },
  className() {
    return ClassNames("tb-MenuButton", this._super());
  },
  addChild(menu) {
    this.menu = menu;
  },
  draw() {
    const content = this._super();
    if (!this.props.iconOnly) {
      content.add((this.dropIconLayer = <i />));
    }
    return content;
  },
  openMenu() {
    const menu = this.props.menu;
    if (menu) {
      const menuNode = menu.priv.popover.node;
      this.priv.buttonHasFocusOnOpen = hasFocus(this.node);
      // remove is-submenu since the main menu can never be a submenu
      menu.priv.popover.node.classList.remove("is-submenu");
      this.active = true;

      let orientation = PopOverOrientation.Bottom_Center;
      let rect = this.node.absoluteBounds();
      let top = rect.origin.y;
      let topOffset = rect.size.height;
      let bottom = top + topOffset + menuNode.offsetHeight;

      if (bottom > RootView.node.offsetHeight) {
        orientation = PopOverOrientation.Top_Center;
      }
      menu.orientation = orientation;

      if (menu.callout) {
        menu.show(this);
      } else {
        if (orientation === PopOverOrientation.Bottom_Center) {
          menu.showAt(
            rect.origin.x,
            rect.origin.y + this.node.offsetHeight + 1
          );
        } else {
          menu.showAt(rect.origin.x, rect.origin.y - menuNode.offsetHeight);
        }
      }
      menu.focus();
    }
  },
  closeMenu() {
    this.menu?.close();
  },
  pointerLeave(evt) {
    this._super(evt);
    if (!this.menu.isOpen()) {
      this.active = false;
    }
  },
  renderDropIcon() {
    if (this.dropIconLayer && this.props.dropIcon) {
      this.dropIconLayer.styleName = ClassNames(
        "icon-font",
        this.props.dropIcon
      );
    }
  },
  renderMenu() {
    if (this.props.menu) {
      this.node.setAttribute("aria-controls", this.props.menu.getId());
      this.props.menu.on(Events.OnClose, () => {
        this.active = false;
      });
    } else {
      this.node.removeAttribute("aria-controls");
    }
  },
  fireAction() {
    if (this.active) {
      this.openMenu();
    } else {
      this.closeMenu();
    }
  },
  _fireDidEnterDocument() {
    this._super();
    _holdFocus(this);
  },
});

function _holdFocus(b) {
  b.menu.on(Events.OnOpen, () => {
    b.priv.initF = b.focused;
  });
  b.menu.on(Events.OnClose, () => {
    b.focused = b.priv.initF;
  });
}

export { MenuButton };

import { Control } from "../Controls/Control";
import { RootView } from "../View/RootView";
import { ClassNames } from "../utils/ClassNames";
import { isUndefinedOrNull } from "../../../Foundation";
import {
  MakePoint,
  PointInsideRect,
  RectGetRight,
  RectOutset,
} from "../utils/Geometry";

const MenuItem = Control.extend({
  ObjName: "MenuItem",
  props: {
    icon: null,
    submenu: null,
    canBeActive: true,
  },
  init({ tagName, ...props } = {}) {
    this._super({
      tagName: "li",
      tabindex: -1,
      ...(props || {}),
    });
  },
  className() {
    const hasIcon = this.props.icon && this.props.icon.trim().length > 0;
    return ClassNames(
      "tb-MenuItem",
      "tb-no-select",
      {
        "tb-MenuItem--hasIcon": hasIcon,
        "tb-MenuItem--noIcon": !hasIcon,
      },
      this._super()
    );
  },
  draw() {
    return (
      <>
        {(this.iconLayer = <i />)}
        {
          (this.labelLayer = (
            <label className={"tb-no-select"} unselectable={"on"} />
          ))
        }
        {
          (this.submenuLayer = (
            <i className={"chevron-right icon-font icon-angle-right-regular"} />
          ))
        }
      </>
    );
  },
  get index() {
    let items = this.priv.menu.props.items;
    let index = 0;
    for (let item of items) {
      if (item === this) {
        return index;
      }
      index++;
    }
    return -1;
  },
  addChild(submenu) {
    this.props.submenu = submenu;
  },
  onClick() {
    if (this.disabled) return;
    this.fireAction();
  },
  pointerEnter() {
    if (this.disabled) return;
    this.active = true;
  },
  pointerLeave(evt) {
    const submenu = this.props.submenu;
    if (submenu) {
      const x = evt.clientX;
      const y = evt.clientY;
      this.active = PointInsideRect(
        MakePoint(x, y),
        RectOutset(submenu.priv.popover.node.absoluteBounds(), 2)
      );
    } else {
      this.active = false;
    }
  },
  renderIcon() {
    if (this.props.icon) {
      this.iconLayer.displayed = true;
      this.iconLayer.styleName = ClassNames("icon-font", this.props.icon);
    } else {
      this.iconLayer.styleName = "";
      this.iconLayer.displayed = false;
    }
  },
  renderSubmenu() {
    const { submenu } = this.props;
    this.submenuLayer.displayed = !isUndefinedOrNull(submenu);
    if (submenu) {
      submenu.priv.supermenu = this.priv.menu;
    }
  },
  renderActive() {
    this.renderClassName();
    const { active, submenu } = this.props;
    const menu = this.priv.menu;
    if (active) {
      menu.activeIndex = this.index;
      if (submenu) {
        submenu.priv.supermenu = this.priv.menu;
        const popover = submenu.priv.popover;
        const node = popover.node;
        let rect = this.node.absoluteBounds();
        node.classList.add("is-submenu");
        popover.zIndex = menu.priv.popover.zIndex + 10;
        let x = RectGetRight(rect) + 2;
        if (x + node.offsetWidth > RootView.node.offsetWidth) {
          x =
            menu.priv.popover.node.absoluteBounds().origin.x - node.offsetWidth;
        }
        submenu.showAt(x, rect.origin.y - 11);
      }
    } else {
      if (submenu) {
        this.submenu.close();
      }
    }
  },
  fireAction() {
    if (this.props.disabled || this.props.submenu) return;
    this._super();
    this.priv.menu.close();
    let supermenu = this.priv.menu.priv.supermenu;
    while (supermenu) {
      supermenu.close();
      supermenu = supermenu.supermenu;
    }
  },
});

export { MenuItem };

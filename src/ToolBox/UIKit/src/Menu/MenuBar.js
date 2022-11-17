import { View } from "../View";
import { ClassNames } from "../utils/ClassNames";
import { MenuButton } from "../Controls/Button/MenuButton";
import { isUndefinedOrNull } from "../../../Foundation";
import { EventKeyCode, Events } from "../Events";
import { Keys } from "../utils/keys";

import "./menubar.less";

const _MenuTitleButton = MenuButton.extend({
  init(props) {
    this._super({
      dropIcon: null,
      menu: props.menu,
      label: props.menu.title,
    });
    this.priv.menubar = props.menubar;
    this.props.menu.styleName = "tb-MenuBar-menu";
  },
  className() {
    return ClassNames("tb-MenuBar-item", this._super());
  },
  draw() {
    let content = this._super();
    content.add(<div className={"indicator"} />);
    return content;
  },
  select() {
    const activeMenu = this.priv.menubar.priv.activeMenu;
    let hasActiveMenu = !isUndefinedOrNull(activeMenu);
    if (hasActiveMenu && activeMenu !== this.menu) {
      activeMenu.close();
      this.active = true;
      setTimeout(() => {
        this.openMenu();
      }, 0);
    }
  },
  pointerEnter() {
    this.select();
  },
  pointerDown(e) {
    if (this.disabled) return;
    setTimeout(() => {
      if (this.menu.isOpen()) {
        this.closeMenu();
      } else {
        this.openMenu();
      }
    }, 1);
    e.stop = this.active;
    this._super(e);
  },
  keyDown(evt) {
    if (this.disabled) return;
    const key = EventKeyCode(evt);
    console.log(key);
    if (key === Keys.Enter || key === Keys.Space) {
      setTimeout(() => {
        if (this.menu.isOpen()) {
          this.closeMenu();
        } else {
          this.openMenu();
        }
      }, 1);
      evt.stop = this.active;
      this._super(evt);
    }
  },
  fireAction() {
    //override
  },
});

const MenuBar = View.extend({
  ObjName: "MenuBar",
  props: {
    menus: [],
  },
  init({ tagName, ...props } = {}) {
    this._super({
      tagName: "div",
      role: "menubar",
      ...(props || {}),
    });
  },
  className() {
    return ClassNames("tb-MenuBar", this._super());
  },
  addChild(menu) {
    this.props.menus.push(menu);
  },
  renderMenus() {
    this.removeAllSubviews();
    const menus = this.props.menus;
    for (const menu of menus) {
      const view = new _MenuTitleButton({
        menu: menu,
        menubar: this,
      });
      menu.on(Events.OnOpen, () => {
        this.priv.activeMenu = menu;
      });
      menu.on(Events.OnClose, () => {
        view.active = false;
        this.priv.activeMenu = null;
      });
      menu.priv.popover.on(Events.KeyDown, (evt) => {
        const code = evt.code;
        if (code === Keys.ArrowRight) {
          const item = this.subviews[_indexOfMenu(this, menu) + 1];
          if (item) {
            view.node.classList.remove("is-hover");
            item.select();
          }
        }
        if (code === Keys.ArrowLeft) {
          const item = this.subviews[_indexOfMenu(this, menu) - 1];
          if (item) {
            view.node.classList.remove("is-hover");
            item.select();
          }
        }
      });
      this.add(view);
    }
  },
});

function _indexOfMenu(menubar, menu) {
  return menubar.props.menus.indexOf(menu);
}

export { MenuBar };

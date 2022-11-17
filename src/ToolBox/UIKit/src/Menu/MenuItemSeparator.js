import { MenuItem } from "./MenuItem";

const MenuItemSeparator = MenuItem.extend({
  ObjName: "MenuItemSeparator",
  init() {
    this._super({
      canBeActive: false,
    });
  },
  className() {
    return "tb-Menu-Separator";
  },
  draw() {
    return [];
  },
  renderIcon: null,
  renderSubmenu: null,
  renderActive: null,
});

export { MenuItemSeparator };

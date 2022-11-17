import { ClassNames } from "../utils/ClassNames";
import { Responder } from "../Responder";
import { PopOver } from "../PopOver/PopOver";
import { RootView } from "../View/RootView";
import { MakePoint } from "../utils/Geometry";
import { Keys } from "../utils/keys";
import { EventKeyCode, Events, FireEvent } from "../Events";

import "./style.less";

const _MenuPopover = PopOver.extend({
  props: {
    menu: null,
  },
  init(props) {
    this._super({
      tagName: "ul",
      callout: props.callout,
      role: "menu",
      tabindex: 0,
      menu: props.menu,
      backgroundColor: "rgba(255, 255, 255, 240)",
      onClose() {
        FireEvent(Events.OnClose, props.menu);
      },
      onOpen() {
        FireEvent(Events.OnOpen, props.menu);
      },
    });
  },
  className() {
    return ClassNames(this._super(), "tb-Menu", "tb-no-outline");
  },
  renderMenu: function () {
    this.contentView.removeAllSubviews();
    const content = this.props.menu.items;
    for (const item of content) {
      this.contentView.add(item);
    }
  }.observes("menu.items"),
  set zIndex(zi) {
    this.priv.zIndex = zi;
    this.node.style.setProperty("z-index", zi);
  },
  get zIndex() {
    return this.priv.zIndex;
  },
  keyDown(evt) {
    const keyCode = EventKeyCode(evt);
    const { menu } = this.props;
    const menuItems = menu.items;
    const activeIndex = menu.activeIndex;
    if (keyCode === Keys.ArrowDown) {
      let i = this.props.menu.activeIndex + 1;
      while (i < menuItems.length) {
        let item = menuItems[i];
        if (item.props.canBeActive && !item.props.disabled) {
          menu.activeIndex = i;
          break;
        }
        i++;
      }
    } else if (keyCode === Keys.ArrowUp) {
      if (activeIndex < 0) {
        menu.activeIndex = menuItems.length - 1; // no active item yet, set to end
      }
      let i = activeIndex - 1;
      while (i > -1) {
        let item = menuItems[i];
        if (item.props.canBeActive && !item.props.disabled) {
          menu.activeIndex = i;
          break;
        }
        i--;
      }
    } else if (keyCode === Keys.ArrowRight) {
      if (activeIndex > -1 && activeIndex < menuItems.length) {
        let sel = menuItems[activeIndex];
        if (sel) {
          if (sel.props.submenu) {
            sel.props.submenu.activeIndex = 0;
          }
        }
      }
    } else if (keyCode === Keys.ArrowLeft) {
      if (menu.priv.supermenu) {
        menu.activeIndex = -1;
        menu.close();
        menu.priv.supermenu.focus();
      }
    } else if (keyCode === Keys.Escape) {
      menu.close();
      if (menu.priv.supermenu) {
        menu.priv.close();
      }
    } else if (keyCode === Keys.Enter) {
      let selected = menuItems[activeIndex];
      if (selected != null) {
        selected.fireAction();
      }
    }
  },
});

const Menu = Responder.extend({
  ObjName: "Menu",
  props: {
    callout: false,
    title: "",
    items: [],
    styleName: null,
  },
  init(props) {
    this._super(props);
    this.priv.popover = new _MenuPopover({
      menu: this,
      callout: props.callout,
    });
    this.renderItems();
  },
  addChild(menuItem) {
    this.addItem(menuItem);
  },
  addItem(menuItem) {
    menuItem.priv.menu = this;
    this.props.items.push(menuItem);
    this.priv.popover.contentView.add(menuItem);
  },
  removeItem(menuItem) {
    const items = this.props.items;
    if (items.indexOf(menuItem) > -1) {
      items.remove(menuItem);
      this.priv.popover.renderMenu();
    }
  },
  clearItems() {
    const items = this.props.items;
    while (items.size() > 0) {
      let item = items[0];
      item.removeFromSuperview();
      items.remove(item);
    }
  },
  set activeIndex(index) {
    let activeIndex = this.priv.activeIndex;
    if (index !== activeIndex) {
      let selItem;
      const items = this.items;
      if (activeIndex > -1 && activeIndex < items.length) {
        selItem = items[activeIndex];
        if (selItem) {
          selItem.active = false;
        }
      }
      this.priv.activeIndex = index;
      if (index > -1 && index < items.length) {
        selItem = items[index];
        if (selItem) {
          selItem.active = true;
          this.priv.popover.node.setAttribute(
            "aria-activedescendant",
            selItem.getId()
          );
          this.focus();
          return;
        }
      }
      this.priv.popover.node.removeAttribute("aria-activedescendant");
    }
  },
  get activeIndex() {
    return this.priv.activeIndex;
  },
  isOpen() {
    return this.priv.popover.isOpen();
  },
  close() {
    this.priv.popover.close();
    if (this.priv.supermenu) {
      this.priv.supermenu.focus();
    }
    this.activeIndex = -1;
  },
  showAt(x, y) {
    const popOver = this.priv.popover,
      frame = popOver.frame;
    let left = Math.min(
      x,
      RootView.node.offsetWidth - popOver.node.offsetWidth
    );
    let top = Math.min(
      y,
      RootView.node.offsetHeight - popOver.node.offsetHeight
    );

    if (frame) {
      frame.origin = MakePoint(left, top);
      popOver.frame = frame;
    } else {
      popOver.node.style.left = left + "px";
      popOver.node.style.top = top + "px";
    }
    this.activeIndex = -1;
    popOver.open();
    this.focus();
  },
  show(alignWith) {
    //validate();
    this.priv.popover.show(alignWith);
    this.focus();
    this.activeIndex = -1;
  },
  remove() {
    this.priv.popover.remove();
  },
  focus() {
    this.priv.popover.node.focus();
  },
  renderCallout: function () {
    this.priv.popover.callout = this.props.callout;
  }.observes("callout"),
  renderItems: function () {
    for (const item of this.props.items) {
      item.priv.menu = this;
    }
  }.observes("items"),
  renderTitle: function () {
    const { title } = this.props;
    if (title && title.length > 0) {
      this.priv.popover.node.setAttribute("aria-label", title);
    }
  }.observes("title"),
  renderStyleName: function () {
    this.priv.popover.styleName = this.props.styleName;
  }.observes("styleName"),
});

export { Menu };

import { View } from "../View";
import { ClassNames } from "../utils/ClassNames";

import "./style.less";
import { EventKeyCode, Events, FireEvent } from "../Events";
import { isUndefinedOrNull } from "../../../Foundation";
import { Keys } from "../utils/keys";
import { OutlineItem } from "./OutlineItem";

const OutlineView = View.extend({
  ObjName: "OutlineView",
  props: {
    items: [],
  },
  init({ tagName, ...props }) {
    this._super({
      tagName: "div",
      role: "tree",
      tabindex: 0,
      ...(props || {}),
    });
  },
  className() {
    return ClassNames("tb-OutlineView", "tb-no-outline", this._super());
  },
  draw() {
    return (this.listLayer = <ul />);
  },
  addChild(item) {
    item.priv.outlineView = this;
    item.priv.parent = this;
    this.props.items.push(item);
    this.listLayer?.add(item);
  },
  expandAll() {
    const items = this.props.items;
    for (const item of items) {
      item.expandAll();
    }
  },
  set selectedItem(item) {
    const selectedItem = this.priv.selectedItem;
    if (item === selectedItem) {
      return;
    }
    if (selectedItem) {
      selectedItem.selected = false;
    }
    this.priv.selectedItem = item;
    if (item) {
      item.selected = true;
      FireEvent(Events.OnSelect, this);
    }
  },
  get selectedItem() {
    return this.priv.selectedItem;
  },
  keyDown(evt) {
    const selectedItem = this.priv.selectedItem;
    const key = EventKeyCode(evt);
    let parent = selectedItem.priv.parent;
    if (isUndefinedOrNull(parent)) {
      parent = this;
    }
    let index = parent.items.indexOf(selectedItem);
    if (key === Keys.Space) {
      if (selectedItem.expanded) {
        selectedItem.expanded = false;
      } else {
        selectedItem.expanded = true;
      }
    } else if (key === Keys.ArrowUp) {
      if (index - 1 > -1) {
        let prev = parent.items[index - 1];
        while (prev != null && prev.expanded && prev.items.length > 0) {
          prev = prev.items[prev.items.length - 1];
        }
        this.selectedItem = prev;
      } else if (parent instanceof OutlineItem) {
        this.selectedItem = parent;
      }
    } else if (key === Keys.ArrowDown) {
      if (selectedItem.expanded && selectedItem.isExpandable) {
        this.selectedItem = selectedItem.items[0];
      } else {
        if (index + 1 < parent.items.length) {
          this.selectedItem = parent.items[index + 1];
        } else {
          let parentParent = parent.priv.parent;
          if (parentParent) {
            let p_index = parentParent.items.indexOf(parent);
            while (p_index + 1 >= parentParent.items.length) {
              parent = parentParent;
              parentParent = parent.getParent();
              p_index = parentParent.items.indexOf(parent);
            }
            this.selectedItem = parentParent.items[p_index + 1];
          }
        }
      }
    }
  },
  renderItems() {
    const items = this.props.items;
    for (const item of items) {
      item.priv.outlineView = this;
      item.priv.parent = this;
    }
    this.listLayer.removeAllSubviews();
    this.listLayer.add(...this.props.items);
  },
});

export { OutlineView };

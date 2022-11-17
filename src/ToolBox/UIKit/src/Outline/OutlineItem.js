import { View } from "../View";
import { ClassNames } from "../utils/ClassNames";
import { Control } from "../Controls/Control";
import { Keys } from "../utils/keys";
import { EventKeyCode } from "../Events";

const _ToggleControl = Control.extend({
  init({ outlineItem, tabindex, ...props } = {}) {
    this.priv.outlineItem = outlineItem;
    this._super({
      tabindex: -1,
      ...(props || {}),
    });
  },
  className() {
    return ClassNames("toggle", this._super());
  },
  pointerDown(evt) {
    evt.preventDefault();
  },
  onClick(evt) {
    const outlineItem = this.priv.outlineItem;
    if (outlineItem.expanded) {
      outlineItem.expanded = false;
    } else {
      outlineItem.expanded = true;
    }
  },
});

const _ContentLayer = View.extend({
  props: {
    item: null,
  },
  className() {
    return "content";
  },
  draw() {
    const item = this.props.item;
    return (
      <>
        {
          (item.toggleLayer = new _ToggleControl({
            outlineItem: item,
          }))
        }
        {(item.iconLayer = <div />)}
        {(item.labelLayer = <div className={"label"} />)}
        {(item.accessoryLayer = <div />)}
      </>
    );
  },
  pointerEnter() {
    this.node.classList.add("is-hover");
  },
  pointerLeave() {
    this.node.classList.remove("is-hover");
  },
  onClick() {
    const item = this.props.item;
    if (item.selectable) {
      item.priv.outlineView.selectedItem = item;
    }
  },
  keyDown(evt) {
    const item = this.props.item;
    const key = EventKeyCode(evt);
    if (key === Keys.Space) {
      if (item.expanded) {
        item.expanded = false;
      } else {
        item.expanded = true;
      }
    } else if (key === Keys.Enter) {
      if (item.selectable) {
        item.priv.outlineView.selectedItem = item;
      }
    }
  },
});

const OutlineItem = View.extend({
  ObjName: "OutlineItem",
  props: {
    expanded: false,
    label: "",
    icon: null,
    accessory: null,
    selected: false,
    selectable: true,
    items: [],
  },
  init({ tagName, expanded, ...props } = {}) {
    this._super({
      tagName: "li",
      role: "treeitem",
      ...(props || {}),
    });
    this.priv.level = 0;
  },
  className() {
    return ClassNames(
      "tb-OutlineItem",
      "tb-no-select",
      {
        "is-selected": this.props.selected,
        "is-expanded": this.props.expanded,
      },
      this._super()
    );
  },
  draw() {
    return (
      <>
        {
          (this.contentLayer = new _ContentLayer({
            item: this,
          }))
        }
        <div className={"collapse"}>{(this.listLayer = <ul />)}</div>
      </>
    );
  },
  addChild(item) {
    item.priv.outlineView = this.priv.outlineView;
    item.priv.parent = this;
    this.props.items.push(item);
    if (this.listLayer) {
      this.listLayer.add(item);
      this.toggleLayer.hidden = !this.isExpandable;
    }
  },
  get isExpandable() {
    return this.props.items.length > 0;
  },
  expandAll() {
    this.expanded = true;
    const items = this.props.items;
    for (const item of items) {
      item.expandAll();
    }
  },
  set level(l) {
    if (this.priv.level !== l) {
      this.contentLayer.node.classList.remove("level-" + this.priv.level);
      this.priv.level = l;
      this.contentLayer.node.classList.add("level-" + this.priv.level);
    }
  },
  get level() {
    return this.priv.level;
  },
  get parentItem() {
    return this.priv.parent;
  },
  renderExpanded() {
    const expanded = this.props.expanded;
    this.node.setAttribute("aria-expanded", expanded);
    if (expanded) {
      let items = this.props.items;
      for (const item of items) {
        item.level = this.level + 1;
        item.priv.outlineView = this.priv.outlineView;
      }
      setTimeout(() => {
        this.listLayer.node.style.transform = "translateY(0);";
      }, 0);
    } else {
      setTimeout(() => {
        this.listLayer.node.style.transform =
          "translateY(-" + this.node.offsetHeight + "px);";
      }, 0);
    }
    this.renderClassName();
  },

  renderLabel() {
    this.labelLayer.node.setAttribute("title", this.props.label);
    this.labelLayer.node.innerHTML = this.props.label;
  },
  renderIcon() {
    if (this.props.icon) {
      this.iconLayer.displayed = true;
      this.iconLayer.styleName = ClassNames("icon-font", this.props.icon);
    } else {
      this.iconLayer.displayed = false;
    }
  },
  renderAccessory() {
    if (this.props.accessory) {
      this.accessoryLayer.displayed = true;
      this.accessoryLayer.styleName = ClassNames(
        "accessory",
        "icon-font",
        this.props.accessory
      );
    } else {
      this.accessoryLayer.displayed = false;
    }
  },
  renderItems() {
    const items = this.props.items;
    for (const item of items) {
      item.priv.outlineView = this.priv.outlineView;
      item.priv.parent = this;
    }
    this.listLayer.removeAllSubviews();
    this.listLayer.add(...items);
    this.toggleLayer.hidden = !this.isExpandable;
  },
  renderSelected() {
    this.renderClassName();
  },
  _fireDidEnterDocument() {
    if (this.props.expanded) {
      this.expand();
    }
    this._super();
  },
});

export { OutlineItem };

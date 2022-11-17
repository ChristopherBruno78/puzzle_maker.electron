import { View } from "../View";
import { ScrollView } from "../View/ScrollView/ScrollView";
import { ClassNames } from "../utils/ClassNames";
import { isFunction } from "../../../Foundation";
import { MakeRange } from "../utils/Geometry";
import { ObservableArray } from "../../../Foundation/src/ObservableArray";

import "./style.less";

const ListView = View.extend({
  ObjName: "ListView",
  props: {
    content: new ObservableArray(),
  },
  init({ tagName, ...props } = {}) {
    this._super(props ?? {});
    this.priv.renderRange = MakeRange(0, Number.MAX_SAFE_INTEGER);
    this.priv.viewsToInsert = [];
  },
  className() {
    return ClassNames("tb-List", this._super());
  },
  draw() {
    return (this.scrollLayer = <ScrollView />);
  },
  _createItem(item, index) {
    if (!isFunction(this.createItem)) {
      throw new Error("ListView must implement createItem");
    }
    const itemView = this.createItem(item);
    itemView.index = index;
    itemView.listView = this;
    itemView.list = this.content;
    itemView.content = item;
    return itemView;
  },
  renderList: function () {
    this.scrollLayer.contentView?.removeFromSuperview();

    const content = this.content;
    const renderRange = this.priv.renderRange;
    let start = Math.max(0, renderRange.start),
      end = Math.min(content.length, renderRange.end),
      i = start;

    this.priv.viewsToInsert = [];
    if (end > start) {
      let item;
      for (; i < end; i++) {
        item = content.getAt(i);
        this.priv.viewsToInsert.push(this._createItem(item, i));
      }
    }
    const contentView = <div />;
    contentView.add(...this.priv.viewsToInsert);
    this.scrollLayer.contentView = contentView;
  }.observes("content.change"),
  set scrollTop(scrollTop) {
    this.scrollLayer.scrollTop = scrollTop;
  },
  set scrollLeft(scrollLeft) {
    this.scrollLayer.scrollLeft = scrollLeft;
  },
});

export { ListView };

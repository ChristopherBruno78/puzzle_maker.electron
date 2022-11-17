import { ListView } from "./ListView";
import { ClassNames } from "../utils/ClassNames";
import { debounce, isFunction } from "../../../Foundation";
import { Events } from "../Events";

const ProgressiveListView = ListView.extend({
  ObjName: "ProgressiveListView",
  init(props) {
    this._super(props);
    this.priv.extension = 300;
    this.priv.batch = 5;
    this.priv.renderRange.end = -1;
  },
  className() {
    return ClassNames("tb-ProgressiveList", this._super());
  },
  get lastVisibleIndex() {
    return Math.min(
      this.content.length,
      _getIndexAtScroll(
        this,
        this.scrollLayer.scrollTop +
          this.node.offsetHeight +
          this.priv.extension
      ) + this.priv.batch
    );
  },
  get firstVisibleIndex() {
    return Math.max(
      0,
      _getIndexAtScroll(
        this,
        this.scrollLayer.scrollTop - this.priv.extension
      ) - this.priv.batch
    );
  },
  _createItem(item, index) {
    if (!isFunction(this.itemHeight)) {
      throw new Error("ProgressListView must implement `itemHeight(index)`.");
    }
    let itemView = this._super(item, index);
    let itemNode = itemView.node;
    itemNode.style.position = "absolute";
    itemNode.style.height = this.itemHeight(index) + "px";
    return itemView;
  },
  renderContent() {
    this._super();
    if (this.content) {
      this.scrollLayer.contentView.node.style.height =
        _sumHeights(this, 0, this.content.length) + "px";
    } else {
      this.scrollLayer.contentView.node.style.height = "0";
    }
    if (this.priv.renderRange.end > -1) {
      _visibleRectDidChange(this);
    }
    _layout(this);
  },
  _fireDidEnterDocument() {
    this._super();
    this.priv.renderRange.end = -1;
    this.scrollLayer.on(Events.OnScroll, () => {
      this.priv.st = debounce(
        () => {
          _visibleRectDidChange(this);
        },
        2,
        this.priv.st
      );
    });
    setTimeout(() => {
      _visibleRectDidChange(this);
    }, 1);
  },
});

function _visibleRectDidChange(list) {
  let start = list.firstVisibleIndex;
  let end = list.lastVisibleIndex;
  const renderRange = list.priv.renderRange;
  console.log("start = " + start);
  console.log("end = " + end);
  if (start !== renderRange.start || end !== renderRange.end) {
    renderRange.start = start;
    renderRange.end = end;
    list.renderContent();
  }
}

function _layout(list) {
  const renderRange = list.priv.renderRange;
  let start = Math.max(0, renderRange.start),
    end = Math.min(list.content.length, renderRange.end),
    i = start;
  for (; i < end; i++) {
    let item = list.priv.viewsToInsert[i - start];
    if (item) {
      let top = _sumHeights(list, 0, i);
      item.node.style.top = top + "px";
    }
  }
}

function _getIndexAtScroll(list, scrollTop) {
  let i = 0,
    len = list.content.length;
  let sum = 0;
  while (i < len) {
    sum += list.itemHeight(i);
    if (sum > scrollTop) {
      return i - 1;
    }
    i++;
  }
  return len;
}

function _sumHeights(list, start, end) {
  let i = start;
  let sum = 0;
  for (; i < end; i++) {
    sum += list.itemHeight(i);
  }
  return sum;
}

export { ProgressiveListView };

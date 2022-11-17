import { ClassNames } from "../../../UIKit/src/utils/ClassNames";
import { View } from "../../../UIKit/src/View/View";

import "./style.less";

const ScrollView = View.extend({
  ObjName: "ScrollView",
  props: {
    contentView: null,
    scrollLeft: 0,
    scrollTop: 0,
  },
  init({ tagName, ...rest } = {}) {
    this._super({
      tagName: "div",
      ...(rest || {}),
    });
  },
  className() {
    return ClassNames("tb-ScrollView", this._super());
  },
  scrollTo: function (x, y) {
    this.node.scrollLeft = x;
    this.node.scrollTop = y;
  },
  drawScrollPosition: function () {
    this.scrollTo(this.props.scrollLeft, this.props.scrollTop);
  }.observes("scrollLeft", "scrollTop"),
  drawContentView() {
    if (this.contentView instanceof View) {
      this.insert(0, this.contentView);
    }
  },
});

export { ScrollView };

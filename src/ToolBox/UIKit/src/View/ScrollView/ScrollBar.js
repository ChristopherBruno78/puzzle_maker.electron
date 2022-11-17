import { View } from "../View";
import { ScrollBarOrientation } from "./ScrollBarOrientation";
import { ClassNames } from "../../utils/ClassNames";
import { Control } from "../../Controls/Control";
import { _padding } from "./constants";
import "./style.less";
import { _calculateHPixelRatio, _calculateVPixelRatio } from "./util";
import { Events, FireEvent } from "../../Events";
import { RootView } from "../RootView";

const ScrollBar = View.extend({
  ObjName: "ScrollBar",
  props: {
    orientation: ScrollBarOrientation.Vertical,
    thumbSize: 0,
    thumbPosition: 0,
    mini: true,
    hidden: true,
  },
  init({ scrollView, ...rest } = {}) {
    this.scrollView = scrollView;

    this._super({
      role: "scrollbar",
      ...(rest || {}),
    });
  },
  className() {
    return ClassNames(
      "tb-ScrollBar",
      "tb-ScrollBar--" + this.props.orientation,
      {
        mini: this.props.mini,
      },
      this._super()
    );
  },
  draw() {
    return (
      <_ScrollBarThumb scrollBar={this} ref={(e) => (this.priv.$thumb = e)} />
    );
  },
  renderThumbSize() {
    if (this.orientation === ScrollBarOrientation.Vertical) {
      this.priv.$thumb.node.style.height = this.props.thumbSize + "px";
    } else {
      this.priv.$thumb.node.style.width = this.props.thumbSize + "px";
    }
  },
  renderThumbPosition() {
    if (this.orientation === ScrollBarOrientation.Vertical) {
      this.priv.$thumb.node.style.top =
        this.props.thumbPosition + _padding + "px";
    } else {
      this.priv.$thumb.node.style.left =
        this.props.thumbPosition + _padding + "px";
    }
  },
  renderMini: function () {
    this.renderClassName();
  },
  renderAriaAttributes: function () {
    if (this.scrollView.contentView) {
      this.node.setAttribute(
        "aria-controls",
        this.scrollView.props.contentView._id
      );
      const valuenow = Math.round(
        100 *
          (this.props.thumbPosition /
            (this.node.offsetHeight -
              2 * _padding -
              this.priv.$thumb.node.offsetHeight))
      );
      this.node.setAttribute("aria-valuenow", valuenow);
    }
    this._super();
  }.observes("thumbPosition", "scrollView.contentView"),
  pointerDown(evt) {
    if (evt.button === 0) {
      evt.preventDefault();
      const { x, y } = this.pointerLocation(evt);
      const $thumb = this.priv.$thumb;
      if (this.orientation === ScrollBarOrientation.Vertical) {
        const pos = Math.min(
          this.node.offsetHeight - _padding - $thumb.node.offsetHeight,
          Math.max(0, y - $thumb.node.offsetHeight / 2)
        );
        this.scrollView.scrollTop =
          pos / _calculateVPixelRatio(this.scrollView);
      } else {
        const pos = Math.min(
          this.node.offsetWidth - _padding - $thumb.node.offsetWidth,
          Math.max(0, x - $thumb.node.offsetWidth / 2)
        );
        this.scrollView.scrollLeft =
          pos / _calculateHPixelRatio(this.scrollView);
      }
      //make the thumb active
      this.priv.ct = setTimeout(() => {
        FireEvent(Events.PointerDown, this.priv.$thumb, evt);
      }, 155);
    }
  },
  pointerUp(evt) {
    clearTimeout(this.priv.ct);
  },
});

const _ScrollBarThumb = Control.extend({
  ObjName: "_ScrollBarThumb",
  init({ scrollBar, ...rest } = {}) {
    this.priv.$scrollBar = scrollBar;
    this._super(rest);
  },
  className() {
    return ClassNames("thumb", this._super());
  },
  onClick(evt) {
    evt.stopPropagation();
  },
  pointerDown(evt) {
    evt.preventDefault();
    if (evt.button === 0) {
      evt.stop = true;
      this.priv.start = this.pointerLocation(evt);
      this.priv.ptDown = true;
      this.active = true;
      this.node.setPointerCapture(evt.pointerId);
      RootView.respondTo("pointerDown", evt);
    }
  },
  pointerUp(evt) {
    clearTimeout(this.priv.$scrollBar.priv.ct);
    this.active = false;
    this.priv.ptDown = false;
    this.node.releasePointerCapture(evt.pointerId);
  },
  pointerMove(evt) {
    evt.stop = true;
    if (this.priv.ptDown) {
      const { x, y } = this.pointerLocation(evt);
      const dx = x - this.priv.start.x,
        dy = y - this.priv.start.y;
      this._postScrollChange(dx, dy);
    }
  },
  _postScrollChange(dx, dy) {
    const scrollBar = this.priv.$scrollBar,
      scrollView = scrollBar.scrollView;
    if (scrollBar.orientation === ScrollBarOrientation.Vertical) {
      const vpr = _calculateVPixelRatio(scrollView);
      scrollView.scrollTop = (scrollBar.thumbPosition + dy) / vpr;
    } else {
      const hpr = _calculateHPixelRatio(scrollView);
      scrollView.scrollLeft = (scrollBar.thumbPosition + dx) / hpr;
    }
  },
});

export { ScrollBar };

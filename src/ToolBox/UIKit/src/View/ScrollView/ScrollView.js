import { ClassNames } from "../../utils/ClassNames";
import { debounce } from "../../../../Foundation";
import { View } from "../View";
import { ScrollBar } from "./ScrollBar";
import { ScrollBarOrientation } from "./ScrollBarOrientation";
import { _delay, _padding, _wheelMovePercent } from "./constants";
import { _addSelectionEvents, _removeSelectionEvents } from "./select";

import {
  _calculateHPixelRatio,
  _calculateVPixelRatio,
  _getHScrollThumbWidth,
  _getVScrollBarHeight,
  _getVScrollThumbHeight,
  _isHScrollVisible,
  _isVScrollVisible,
} from "./util";

import "./style.less";
import { Events, FireEvent } from "../../Events";

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
  addChild(view) {
    this.props.contentView = view;
  },
  draw() {
    return (
      <>
        <div ref={(e) => (this.priv.$content = e)} className={"content"} />
        <ScrollBar
          scrollView={this}
          ref={(e) => (this.priv.$hScroll = e)}
          orientation={ScrollBarOrientation.Horizontal}
        />
        <ScrollBar
          scrollView={this}
          ref={(e) => (this.priv.$vScroll = e)}
          orientation={ScrollBarOrientation.Vertical}
        />
      </>
    );
  },
  scrollTo: function (x, y) {
    const $content = this.priv.$content;
    const $vScroll = this.priv.$vScroll;
    const $hScroll = this.priv.$hScroll;
    if (_isVScrollVisible(this)) {
      const prV = _calculateVPixelRatio(this);
      if (prV > 0) {
        const scrollTopMax =
          $content.node.scrollHeight -
          ($content.node.clientHeight - 2 * _padding);
        this.props.scrollTop = Math.min(scrollTopMax, Math.max(0, y));
        $content.node.scrollTop = this.props.scrollTop;
        $vScroll.thumbPosition = prV * this.props.scrollTop;
        FireEvent(Events.OnScroll, this);
      }
    }
    if (_isHScrollVisible(this)) {
      const prH = _calculateHPixelRatio(this);
      if (prH > 0) {
        const scrollLeftMax =
          $content.node.scrollWidth -
          ($content.node.clientWidth - 2 * _padding);
        this.props.scrollLeft = Math.min(scrollLeftMax, Math.max(0, x));
        $content.node.scrollLeft = this.props.scrollLeft;
        $hScroll.thumbPosition = prH * this.props.scrollLeft;
        FireEvent(Events.OnScroll, this);
      }
    }
  },
  scrollToBottom() {
    const $content = this.priv.$content;
    this.scrollTop = $content.node.scrollHeight - $content.node.clientHeight;
  },
  onWheel(evt) {
    const deltaY =
      _wheelMovePercent * Math.sign(evt.deltaY) * _getVScrollBarHeight(this);
    this.priv.$vScroll.priv.$thumb.active = true;
    this.scrollTo(this.props.scrollLeft, this.props.scrollTop + deltaY);
    this.priv.$vScroll.priv.$thumb.active = false;
  },
  pointerMove(evt) {
    const { x, y } = this.pointerLocation(evt);
    if (x >= this.node.offsetWidth - 25) {
      if (!this.priv.vMove) {
        this.priv.miniTimer = debounce(
          () => {
            this.priv.$vScroll.mini = false;
            this.priv.$hScroll.mini = true;
          },
          _delay,
          this.priv.miniTimer
        );
      }
      this.priv.vMove = true;
    } else {
      this.priv.$vScroll.mini = true;
      this.priv.vMove = false;
      if (y >= this.node.offsetHeight - 25) {
        if (!this.priv.hMove) {
          this.priv.miniTimer = null;
          this.priv.miniTimer = debounce(
            () => {
              this.priv.$hScroll.mini = false;
              this.priv.$vScroll.mini = true;
            },
            _delay,
            this.priv.miniTimer
          );
        }
        this.priv.hMove = true;
      } else {
        clearTimeout(this.priv.miniTimer);
        this.priv.$hScroll.mini = true;
        this.priv.hMove = false;
      }
    }
  },
  pointerOver() {
    clearTimeout(this.priv.showTimer);
    this.priv.hideTimer = debounce(
      () => {
        this.priv.$vScroll.hidden = false;
        this.priv.$hScroll.hidden = false;
      },
      _delay,
      this.priv.hideTimer
    );
  },
  pointerLeave() {
    clearTimeout(this.priv.hideTimer);
    clearTimeout(this.priv.miniTimer);
    this.priv.hMove = false;
    this.priv.vMove = false;
    this.priv.$hScroll.mini = true;
    this.priv.$vScroll.mini = true;
    this.priv.showTimer = debounce(
      () => {
        this.priv.$vScroll.hidden = true;
        this.priv.$hScroll.hidden = true;
      },
      1000,
      this.priv.showTimer
    );
  },
  _fireDidEnterDocument() {
    this._super();
    setTimeout(() => {
      _adjustScrollBars(this);
    }, 25);
    //when the scroll area changes, adjust the bars
    this.priv.oro = new ResizeObserver(() => {
      this.priv.rt = debounce(
        async () => {
          _adjustScrollBars(this);
          this.scrollTo(this.scrollLeft, this.scrollTop);
        },
        10,
        this.priv.rt
      );
    });
    this.priv.oro.observe(this.node);

    _addSelectionEvents(this);
  },
  _fireDidLeaveDocument() {
    this._super();
    this.priv.oro.disconnect();
    _removeSelectionEvents(this);
  },
  renderScrollPosition: function () {
    this.scrollTo(this.props.scrollLeft, this.props.scrollTop);
  }.observes("scrollLeft", "scrollTop"),
  renderContentView() {
    if (this.priv.$content) {
      if (this.contentView instanceof View) {
        this.priv.$content.removeAllSubviews();
        this.priv.$content.insert(0, this.props.contentView);
        if (this.priv.ro) {
          this.priv.ro.disconnect();
          this.priv.ro = null;
        }
        //when the content changes, adjust the scrollbars
        this.priv.ro = new ResizeObserver(() => {
          console.log("FIRING RESIZeOBS");
          _adjustScrollBars(this);
          this.scrollTo(this.scrollLeft, this.scrollTop);
        });
        this.priv.ro.observe(this.contentView.node);
      }
    }
  },
});

function _adjustScrollBars(aScrollView) {
  if (aScrollView.isRendered) {
    const vpr = _calculateVPixelRatio(aScrollView);
    if (vpr > 0) {
      aScrollView.priv.$vScroll.displayed = true;
      aScrollView.priv.$vScroll.thumbSize = _getVScrollThumbHeight(aScrollView);
    } else {
      aScrollView.priv.$vScroll.displayed = false;
    }
    const hpr = _calculateHPixelRatio(aScrollView);
    if (hpr > 0) {
      aScrollView.priv.$hScroll.displayed = true;
      aScrollView.priv.$hScroll.thumbSize = _getHScrollThumbWidth(aScrollView);
    } else {
      aScrollView.priv.$hScroll.displayed = false;
    }
  }
}

export { ScrollView, _adjustScrollBars };

import { getEdge, getPosition, PopOverOrientation } from "./PopOverOrientation";
import { UIObject } from "../UIObject";
import { ClassNames } from "../utils/ClassNames";
import { PopOverPosition } from "./PopOverPosition";
import { PopOverEdge } from "./PopOverEdge";
import { CPViewRenderToNode, View } from "../View";
import { RootView } from "../View/RootView";
import { MakeRect, RectGetBottom, RectGetRight } from "../utils/Geometry";
import { isMethod } from "../../../Foundation";
import { Events, FireEvent } from "../Events";

import "./style.less";

const PopOver = UIObject.extend({
  ObjName: "PopOver",
  props: {
    hidden: true,
    transient: true,
    callout: true,
    backgroundColor: "#ffffff",
    borderColor: "rgba(180, 180, 180, 105)",
    orientation: PopOverOrientation.Bottom_Center,
    frame: null,
  },
  init({ tagName, ...props }) {
    this._super({
      tagName: "div",
      ...(props || {}),
    });
    this.props.tagName = tagName;
    this._render();
  },
  className() {
    return ClassNames("tb-PopOver", this._super());
  },
  _render() {
    this.priv.$calloutLayer = <b>{(this.priv.$triangleLayer = <b />)}</b>;
    CPViewRenderToNode(this.priv.$calloutLayer, this.node);
    this.priv.$contentView = (
      <View tagName={this.props.tagName} styleName={"tb-PopOver-content"} />
    );
    this.priv.$contentView.$nextResponder = this;
    CPViewRenderToNode(this.priv.$contentView, this.node);
    this._super();
    setTimeout(() => {
      RootView.addPopOver(this);
    }, 0);
    this.node.addEventListener(
      "pointerdown",
      (this.priv.pdl = (evt) => {
        evt.stopPropagation();
      })
    );
    this._initEvents();
  },
  show(alignWithView, offsetLeft = 0, offsetTop = 0) {
    const position = getPosition(this.props.orientation),
      edge = getEdge(this.props.orientation);
    let left = 0,
      top = 0;
    const rect = alignWithView.node.absoluteBounds();
    const node = this.node;

    switch (position) {
      case PopOverPosition.Bottom:
        {
          top = RectGetBottom(rect) + 10;
        }
        break;
      case PopOverPosition.Top:
        {
          top = rect.origin.y - node.offsetHeight - 10;
        }
        break;
      case PopOverPosition.Right:
        {
          left = RectGetRight(rect) + 10;
        }
        break;
      case PopOverPosition.Left:
        {
          left = rect.origin.x - node.offsetWidth - 10;
        }
        break;
    }

    switch (edge) {
      case PopOverEdge.Center:
        {
          left = rect.origin.x - (node.offsetWidth - rect.size.width) / 2;
        }
        break;
      case PopOverEdge.Left:
        {
          left = rect.origin.x;
        }
        break;
      case PopOverEdge.Right:
        {
          left = RectGetRight(rect) - node.offsetWidth;
        }
        break;
      case PopOverEdge.Middle:
        {
          top = rect.origin.y - (node.offsetHeight - rect.size.height) / 2;
        }
        break;
      case PopOverEdge.Top:
        {
          top = rect.origin.y;
        }
        break;
      case PopOverEdge.Bottom:
        {
          top = RectGetBottom(rect) - node.offsetHeight;
        }
        break;
    }

    left += offsetLeft;
    top += offsetTop;

    this.node.style.left = left + "px";
    this.node.style.top = top + "px";

    _adjustCallout(this, _adjustPosition(this, left, top), rect);

    const $triangle = this.priv.$triangleLayer.node;

    $triangle.style.backgroundColor = this.props.backgroundColor;
    $triangle.style.borderColor = this.props.borderColor;
    this.node.style.backgroundColor = this.props.backgroundColor;
    this.open();
  },
  open() {
    if (!this.isOpen()) FireEvent(Events.OnOpen, this);
    this.hidden = false;
  },
  close() {
    if (this.isOpen()) FireEvent(Events.OnClose, this);
    this.hidden = true;
  },
  isOpen() {
    return !this.props.hidden;
  },
  get contentView() {
    return this.priv.$contentView;
  },
  drawContent() {
    return [];
  },
  remove() {
    this.node.removeEventListener("pointerdown", this.priv.pdl);
    this._destroyEvents();
    RootView.removePopOver(this);
  },
  renderCallout: function () {
    this.priv.$calloutLayer.styleName = _getCalloutClassName(this);
    this.priv.$triangleLayer.styleName = _getCalloutTriangleClassName(this);
    this.priv.$calloutLayer.displayed = this.props.callout;
  }.observes("orientation"),
  renderContent() {
    if (isMethod(this, "drawContent")) {
      const content = this.drawContent();
      const contentView = this.contentView;
      if (Array.isArray(content)) {
        for (const v of content) {
          contentView.add(v);
        }
      } else {
        contentView.add(content);
      }
    }
  },
  renderFrame: function () {
    const frame = this.props.frame,
      node = this.node;
    if (frame) {
      node.style.left = frame.origin.x + "px";
      node.style.top = frame.origin.y + "px";
      node.style.width = frame.size.width + "px";
      node.style.height = frame.size.height + "px";
    }
  },
});

function _getCalloutClassName(popover) {
  const position = getPosition(popover.props.orientation),
    edge = getEdge(popover.props.orientation);
  return ClassNames("tb-PopOver-callout", {
    "tb-PopOver-callout-none": !popover.props.callout,
    "tb-PopOver-callout--t": position === PopOverPosition.Top,
    "tb-PopOver-callout--b": position === PopOverPosition.Bottom,
    "tb-PopOver-callout--r": position === PopOverPosition.Right,
    "tb-PopOver-callout--l": position === PopOverPosition.Left,
    "tb-PopOver-callout--top": edge === PopOverEdge.Top,
    "tb-PopOver-callout--bottom": edge === PopOverEdge.Bottom,
    "tb-PopOver-callout--right": edge === PopOverEdge.Right,
    "tb-PopOver-callout--left": edge === PopOverEdge.Left,
    "tb-PopOver-callout--middle": edge === PopOverEdge.Middle,
    "tb-PopOver-callout--center": edge === PopOverEdge.Center,
  });
}

function _getCalloutTriangleClassName(popover) {
  const position = getPosition(popover.props.orientation);
  return ClassNames("tb-PopOver-triangle", {
    "tb-PopOver-triangle-none": !popover.props.callout,
    "tb-PopOver-triangle--t": position === PopOverPosition.Top,
    "tb-PopOver-triangle--b": position === PopOverPosition.Bottom,
    "tb-PopOver-triangle--r": position === PopOverPosition.Right,
    "tb-PopOver-triangle--l": position === PopOverPosition.Left,
  });
}

function _adjustPosition(popover, left, top) {
  let deltaLeft = 0;
  let deltaTop = 0;

  const rootNode = RootView.node;
  let gap = rootNode.offsetWidth - left - popover.node.offsetWidth;

  // check right edge
  if (gap < 0) {
    deltaLeft += gap;
    deltaLeft -= 6;
  }

  // check left edge
  gap = left + deltaLeft;
  if (gap < 0) {
    deltaLeft -= gap;
    deltaLeft += 7;
  }

  // check bottom edge
  gap = rootNode.offsetHeight - top - deltaTop - popover.node.offsetHeight;

  if (gap < 0) {
    deltaTop += gap;
    deltaTop -= 7;
  }

  // check top edge
  gap = top + deltaTop;

  if (gap < 0) {
    deltaTop -= gap;
    deltaTop += 7;
  }

  top += deltaTop;
  left += deltaLeft;
  popover.node.style.top = top + "px";
  popover.node.style.left = left + "px";

  return MakeRect(
    left,
    top,
    popover.node.offsetWidth,
    popover.node.offsetHeight
  );
}

function _adjustCallout(popover, popOverRect, viewRect) {
  const position = getPosition(popover.props.orientation),
    edge = getEdge(popover.props.orientation),
    calloutLayer = popover.priv.$calloutLayer;
  const calloutIsAtTopOrBottom =
    position === PopOverPosition.Top || position === PopOverPosition.Bottom;

  calloutLayer.node.removeAttribute("style");

  if (popover.props.callout) {
    let calloutPosition = 0;
    let bounds = RootView.node.absoluteBounds();
    let originX = Math.max(0, viewRect.origin.x),
      originY = Math.max(0, viewRect.origin.y),
      rightX = Math.min(RectGetRight(viewRect), bounds.size.width),
      bottomY = Math.min(RectGetBottom(viewRect), bounds.size.height);

    // calculate target bounds
    let targetBounds = MakeRect(
      originX,
      originY,
      rightX - originX,
      bottomY - originY
    );
    if (calloutIsAtTopOrBottom) {
      let dX = originX - popOverRect.origin.x;
      let maxPos = popOverRect.size.width - 14;
      switch (edge) {
        case PopOverEdge.Right:
          calloutPosition = dX + targetBounds.size.width - 28;
          break;
        case PopOverEdge.Left:
          calloutPosition = 14 + dX;
          break;
        case PopOverEdge.Center:
          calloutPosition = dX + targetBounds.size.width / 2;
          break;
      }
      calloutLayer.node.style.left = Math.min(maxPos, calloutPosition) + "px";
    } else {
      let dY = originY - popOverRect.origin.y;
      let maxPos = popOverRect.size.height - 28;
      switch (edge) {
        case PopOverEdge.Bottom:
          calloutPosition = dY + targetBounds.size.height - 28;
          break;
        case PopOverEdge.Top:
          calloutPosition = 14 + dY;
          break;
        case PopOverEdge.Middle:
          calloutPosition = dY + targetBounds.size.height / 2;
          break;
      }
      calloutLayer.node.style.top = Math.min(maxPos, calloutPosition) + "px";
    }
  }
}

export { PopOver };

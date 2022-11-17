import { MakePoint, MakeRect, MakeSize } from "../utils/Geometry";
import { UIObject } from "../UIObject";
import { ClassNames } from "../utils/ClassNames";
import { CPViewRenderToNode, View } from "../View";
import { RootView } from "../View/RootView";
import { Events, FireEvent } from "../Events";
import { CPMakeDraggable, CPRemoveDraggable } from "../Draggable";
import { CPMakeResizable, CPRemoveResizable } from "../Resizable";
import { Button } from "../Controls/Button/Button";
import { isMethod } from "../../../Foundation";
import { Keys } from "../utils/keys";
import {
  getFirstFocusableElement,
  getLastFocusableElement,
} from "../utils/dom";

import "./style.less";

const titleBarHeight = 42;
var topDialog = null;

const Dialog = UIObject.extend({
  ObjName: "Dialog",
  props: {
    resizable: true,
    draggable: true,
    title: "",
    closable: true,
    hidden: true,
    modal: false,
    frame: MakeRect(0, 0, 400, 300),
    minSize: MakeSize(200, 200),
    maxSize: MakeSize(10000, 10000),
  },
  init({ tagName, ...props } = {}) {
    this._super({
      tagName: "div",
      role: "dialog",
      ...(props || {}),
    });
    this._render();
  },
  get transient() {
    return false;
  },
  className() {
    return ClassNames("tb-Dialog", this._super());
  },
  drawContent() {
    return [];
  },
  _render() {
    const layers = (
      <>
        {
          (this.titleBarLayer = (
            <div className="tb-Dialog-titlebar">
              {this.drawDialogTools()}
              {(this.titleLayer = <label className={"tb-Dialog-title"} />)}
            </div>
          ))
        }
        {
          (this.contentView = (
            <View nextResponder={this} className={"tb-Dialog-content"} />
          ))
        }
      </>
    );

    if (isMethod(this, "drawContent")) {
      const content = this.drawContent();
      if (Array.isArray(content)) {
        for (const v of content) {
          this.contentView.add(v);
        }
      } else {
        this.contentView.add(content);
      }
    }

    for (const layer of layers) {
      CPViewRenderToNode(layer, this.node);
    }
    this.$nextResponder = RootView;
    this._super();
    this.on(Events.PointerDown, () => {
      this.moveToFront();
    });
    this.isRendered = true;
  },
  open() {
    if (!this.isOpen()) {
      _initDialog(this);

      this.moveToFront();
      setTimeout(() => {
        this.hidden = false;
      }, 0);
    }
  },
  isOpen() {
    return this.isInDocument;
  },
  close() {
    FireEvent(Events.OnClose, this);
    _removeDialog(this);
  },
  moveToFront() {
    if (topDialog) {
      topDialog.node.style.zIndex = "30";
    }
    topDialog = this;
    this.node.style.zIndex = "35";
  },
  center() {
    const frame = this.props.frame;
    let nx = (RootView.node.offsetWidth - frame.size.width) / 2;
    let ny = Math.min(
      200,
      Math.round(0.4 * (RootView.node.offsetHeight - frame.size.height))
    );
    this.props.frame = MakeRect(
      nx,
      Math.max(0, ny),
      frame.size.width,
      frame.size.height
    );
    this.renderFrame();
  },
  centerAndOpen(animate) {
    if (animate) {
      this.node.style.transform = "scale(0.4)";
    }
    this.center();
    this.open();
    if (animate) {
      setTimeout(() => {
        this.node.style.transform = "scale(1)";
      }, 20);
    }
  },
  drawDialogTools() {
    return (
      <div className={"tb-Dialog-tools"}>
        {this.props.closable
          ? (this._closeBtn = (
              <Button
                onAction={() => this.close()}
                className={"tb-Dialog-toolBtn tb-Dialog-close"}
                iconOnly={true}
                icon={"icon-times-solid"}
              />
            ))
          : null}
      </div>
    );
  },
  firstFocus() {
    return this._closeBtn;
  },
  dragFinish() {
    this.props.frame.origin = MakePoint(
      this.node.offsetLeft,
      this.node.offsetTop
    );
  },
  onResize() {
    this.props.frame.size = MakeSize(
      this.node.offsetWidth,
      this.node.offsetHeight
    );
    this.contentView.frame = MakeRect(
      0,
      titleBarHeight,
      this.node.offsetWidth,
      this.node.offsetHeight - titleBarHeight
    );
  },
  keyDown(evt) {
    if (evt.code === Keys.Escape) {
      this.close();
    }
  },
  renderDraggable() {
    if (this.props.draggable && !this.priv.dref) {
      this.priv.dref = CPMakeDraggable(this, this.titleBarLayer, true);
    } else {
      CPRemoveDraggable(this.priv.dref);
      delete this.priv.dref;
    }
    this.titleBarLayer.renderClassName();
  },
  renderResizable() {
    if (this.props.resizable && !this.priv.rref) {
      this.priv.rref = CPMakeResizable(this);
    } else {
      CPRemoveResizable(this.priv.rref);
      delete this.priv.rref;
    }
  },
  renderFrame: function () {
    const frame = this.props.frame,
      node = this.node;
    node.style.left = frame.origin.x + "px";
    node.style.top = frame.origin.y + "px";
    node.style.width = frame.size.width + "px";
    node.style.height = frame.size.height + "px";
  },
  renderSizeConstraints: function () {
    if (this.priv.rref) {
      this.priv.rref.maxSize = this.props.maxSize;
      this.priv.rref.minSize = this.props.minSize;
    }
  }.observes("minSize", "maxSize"),
  renderTitle() {
    this.titleLayer.node.innerHTML = this.props.title;
  },
});

var modalDimmerLayer = null;

function _initDialog(aDialog) {
  if (aDialog.props.modal) {
    if (modalDimmerLayer === null) {
      modalDimmerLayer = <div className={"tb-Dialog-modalDimmer"} />;
      RootView.insert(0, modalDimmerLayer);
    }
    aDialog.priv.lastFocus = document.activeElement;
    modalDimmerLayer.node.appendChild(aDialog.node);
  } else {
    if (modalDimmerLayer === null) {
      RootView.node.appendChild(aDialog.node);
    }
  }
  aDialog.contentView._fireDidEnterDocument();
  aDialog.isInDocument = true;

  aDialog.priv.initF = document.activeElement;

  setTimeout(() => {
    _adjustFocusTrap(aDialog);
    aDialog.firstFocus().focused = true;
    FireEvent(Events.OnOpen, aDialog);
  }, 25);

  RootView.node.addEventListener(
    Events.OnResize,
    (aDialog.priv.resizeListener = () => {
      let { x, y } = aDialog.frame.origin;
      let { width, height } = aDialog.frame.size;
      let browserWidth = RootView.node.offsetWidth,
        browserHeight = RootView.node.offsetHeight;
      if (x + width > browserWidth) {
        x = Math.max(0, browserWidth - width);
      }
      if (y + height > browserHeight) {
        y = Math.max(0, browserHeight - height);
      }
      aDialog.frame.origin = MakePoint(x, y);
    })
  );
}

function _adjustFocusTrap(aDialog) {
  const node = aDialog.node;

  aDialog.priv.firstTab = getFirstFocusableElement(node);
  aDialog.priv.lastTab = getLastFocusableElement(node);

  if (aDialog.priv.lastTab && modalDimmerLayer) {
    aDialog.priv.lastTab.addEventListener(
      Events.KeyDown,
      (aDialog.priv.tabListener = function (evt) {
        if (evt.code === Keys.Tab && !evt.shiftKey) {
          evt.preventDefault();
          if (aDialog.priv.firstTab) {
            aDialog.priv.firstTab.focus();
          }
        }
      })
    );
  }
}

function _removeDialog(aDialog) {
  if (aDialog.modal) {
    if (modalDimmerLayer.node.childNodes.length === 1) {
      modalDimmerLayer.removeFromSuperview();
      modalDimmerLayer = null;
    } else {
      aDialog.node.parentNode.removeChild(aDialog.node);
    }
    if (aDialog.priv.lastFocus) {
      aDialog.priv.lastFocus.focus();
    }
  } else {
    RootView.node.removeChild(aDialog.node);
  }
  aDialog.contentView._fireDidLeaveDocument();
  aDialog.isInDocument = false;

  //clean up events
  for (const o of aDialog.priv.events) {
    aDialog.node.removeEventListener(Events[o.eventName], o.listener);
  }
  aDialog.priv.events = [];

  if (aDialog.priv.lastTab) {
    aDialog.priv.lastTab.removeEventListener(
      Events.KeyDown,
      aDialog.priv.tabListener
    );
  }
  if (aDialog.priv.initF) {
    aDialog.priv.initF.focus();
  }

  RootView.node.removeEventListener("resize", aDialog.priv.resizeListener);
}

export { Dialog };

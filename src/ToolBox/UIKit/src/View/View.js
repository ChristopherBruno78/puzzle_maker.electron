import { isFunction, isString } from "../../../Foundation";
import { UIObject } from "../UIObject";

/**
 * View is the workhorse for anything visible in the UI
 */
const View = UIObject.extend({
  ObjName: "View",
  props: {
    tagName: "div",
    styleName: "",
    hidden: false,
    displayed: true,
    subviews: [],
  },
  init(props) {
    this._super(props);
    this.superview = null;
  },
  _render: function () {
    const ui = this.draw();
    if (ui) {
      if (Array.isArray(ui)) {
        this.add(...ui);
      } else if (isString(ui)) {
        this.node.innerHTML = ui;
      } else {
        this.add(ui);
      }
    }
    this._super();
  },
  add(...subviews) {
    for (const sv of subviews) {
      this.insert(this.props.subviews.length, sv);
    }
  },
  /**
   * Same as add, but used during JSX use. Override to implement custom child adding
   * behavior in JSX
   * @param subviews
   */
  addChild(...subviews) {
    this.add(...subviews);
  },
  insert(i, subview) {
    const subviews = this.props.subviews;
    if (subview && isFunction(subview._render)) {
      if (subview instanceof View) {
        subviews.insertAt(i, subview);
        const len = this.subviews.length;
        if (len > 1 && i + 1 < len) {
          const itemAfter = this.subviews[i + 1];
          this.node.insertBefore(subview.node, itemAfter.node);
        } else {
          this.node.appendChild(subview.node);
        }
      }
      /* other responders that implement add() and _render() methods
              can have a view as a superview
             */
      if (!subview.$nextResponder) subview.$nextResponder = this;
      subview.superview = this;
      if (!subview.isRendered) {
        subview._render();
        subview.isRendered = true;
      }
      if (this.isInDocument && isFunction(subview._fireDidEnterDocument)) {
        subview._fireDidEnterDocument();
      }
    }
  },
  remove(subview) {
    this.props.subviews.remove(subview);
    subview.superview = null;
    if (subview.node) {
      this.node.removeChild(subview.node);
    }
    subview._fireDidLeaveDocument();
  },
  removeFromSuperview() {
    this.superview?.remove(this);
  },
  removeAllSubviews() {
    while (this.props.subviews.length > 0) {
      this.props.subviews[0].removeFromSuperview();
    }
  },
  draw() {
    return [];
  },
  _fireDidEnterDocument() {
    if (this.props.subviews) {
      this.props.subviews.forEach((subView) => {
        if (!subView.isInDocument) {
          subView._fireDidEnterDocument();
        }
      });
    }
    this._initEvents();
    this.isInDocument = true;
    setTimeout(() => this.perform("didEnterDocument"), 0);
  },
  _fireDidLeaveDocument() {
    if (this.props.subviews) {
      this.props.subviews.forEach((subView) => {
        if (subView.isInDocument) {
          subView._fireDidLeaveDocument();
        }
      });
    }
    this.isInDocument = false;
    this._destroyEvents();
    setTimeout(() => this.perform("didLeaveDocument"), 0);
  },
});

/**
 * Renders a View to a non-View DOM node
 * @param view
 * @param node
 * @function
 */
function CPViewRenderToNode(view, node) {
  node.appendChild(view.node);
  if (!view.isRendered) {
    view._render();
    view.isRendered = true;
  }
  view._fireDidEnterDocument();
}

function CPViewRemoveFromNode(view, node) {
  node.removeChild(view.node);
  view._fireDidLeaveDocument();
}

export { View, CPViewRenderToNode, CPViewRemoveFromNode };

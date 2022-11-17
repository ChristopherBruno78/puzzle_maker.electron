import { ClassNames } from "../../utils/ClassNames";
import { Responder } from "../../Responder";
import { SplitViewOrientation } from "./SplitViewOrientation";
import { SplitViewFlex } from "./SplitViewFlex";
import { SplitViewDivider } from "./SplitViewDivider";

import "./style.less";

const SplitView = Responder.extend({
  ObjName: "SplitView",
  props: {
    orientation: SplitViewOrientation.Row,
    flex: SplitViewFlex.TopLeft,
    dividerThickness: 14,
    staticPaneLength: 200,
    minStaticPaneLength: 0,
    maxStaticPaneLength: Number.MAX_SAFE_INTEGER,
    leftTopView: null,
    bottomRightView: null,
  },
  init(props) {
    this.priv.$divider = new SplitViewDivider({
      splitView: this,
    });
    this._super(props);
  },
  addChild(view) {
    if (!this.props.leftTopView) {
      this.props.leftTopView = view;
      return;
    }
    if (!this.props.bottomRightView) {
      this.props.bottomRightView = view;
    }
  },
  _render() {
    this.superview.node.appendChild(
      document.createComment("SplitView-" + this._id)
    );
    _initViews(this);
    this.renderStaticPaneLength();
    this.layout();
    this.isRendered = true;
  },
  layout() {
    const leftNode = this.props.leftTopView.node;
    const bottomNode = this.props.bottomRightView.node;
    const divider = this.priv.$divider;
    if (this.props.flex === SplitViewFlex.TopLeft) {
      leftNode.style.flex = "1";
      bottomNode.style.flex = "unset";
      switch (this.props.orientation) {
        case SplitViewOrientation.Row:
          {
            bottomNode.style.width = this.props.staticPaneLength + "px";
            leftNode.style.height = "100%";
            bottomNode.style.height = "100%";
            divider.node.style.width = this.props.dividerThickness + "px";
            divider.node.style.height = "100%";
          }
          break;
        case SplitViewOrientation.Column:
          {
            bottomNode.style.height = this.props.staticPaneLength + "px";
            leftNode.style.width = "100%";
            bottomNode.style.width = "100%";
            divider.node.style.height = this.props.dividerThickness + "px";
            divider.node.style.width = "100%";
          }
          break;
      }
    } else {
      leftNode.style.flex = "unset";
      bottomNode.style.flex = "1";
      switch (this.props.orientation) {
        case SplitViewOrientation.Row:
          {
            leftNode.style.width = this.props.staticPaneLength + "px";
            leftNode.style.height = "100%";
            bottomNode.style.height = "100%";
          }
          break;
        case SplitViewOrientation.Column:
          {
            leftNode.style.height = this.props.staticPaneLength + "px";
            leftNode.style.width = "100%";
            bottomNode.style.width = "100%";
          }
          break;
      }
    }
  },
  renderStaticPaneLength() {
    const {
      minStaticPaneLength,
      maxStaticPaneLength,
      staticPaneLength,
      dividerThickness,
    } = this.props;
    let newLength = Math.max(
      minStaticPaneLength,
      Math.min(maxStaticPaneLength, staticPaneLength)
    );
    const $parentNode = this.superview.node;
    if (this.isInDocument) {
      newLength = Math.min(
        Math.max(newLength, 0),
        (this.props.orientation === SplitViewOrientation.Row
          ? $parentNode.offsetWidth
          : $parentNode.offsetHeight) - dividerThickness
      );
    }
    this.props.staticPaneLength = newLength;
    this.layout();
  },
});

function _initViews(aSplitView) {
  const superview = aSplitView.superview,
    props = aSplitView.props;

  superview.styleName = ClassNames(
    superview.styleName,
    "tb-SplitView",
    "tb-Split--" + props.orientation
  );

  if (props.leftTopView) {
    if (!props.leftTopView.node) {
      props.leftTopView = <div>{props.leftTopView}</div>;
    }
    superview.add(props.leftTopView);
  }

  superview.add(aSplitView.priv.$divider);
  if (props.bottomRightView) {
    if (!props.bottomRightView.node) {
      props.bottomRightView = <div>{props.bottomRightView}</div>;
    }
    superview.add(props.bottomRightView);
  }
}

export { SplitView };

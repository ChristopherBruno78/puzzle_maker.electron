import { View } from "../View";
import { ClassNames } from "../../utils/ClassNames";
import { SplitViewOrientation } from "./SplitViewOrientation";
import { SplitViewFlex } from "./SplitViewFlex";
import { getRelativePointerCoordinates } from "../../utils/dom";

const SplitViewDivider = View.extend({
  ObjName: "SplitViewDivider",
  className() {
    const splitViewProps = this.splitView.props;
    return ClassNames(
      "tb-SplitDivider",
      {
        static:
          splitViewProps.maxStaticPaneLength ===
          splitViewProps.minStaticPaneLength,
      },
      this._super()
    );
  },
  parseProps(props) {
    const { splitView, ...rest } = props;
    this.splitView = splitView;
    this._super(rest);
  },
  draw() {
    const sv = this.splitView,
      dt = sv.props.dividerThickness;
    this.node.style.width =
      sv.props.orientation === SplitViewOrientation.Row ? dt : "100%";
    this.node.style.height =
      sv.props.orientation === SplitViewOrientation.Column ? dt : "100%";
    const sashSize = dt * 0.5;
    const offset = (dt - sashSize - 2) / 2;
    return (
      <div
        className={"sash"}
        style={{
          left:
            sv.orientation === SplitViewOrientation.Row ? offset + "px" : "50%",
          top:
            sv.orientation === SplitViewOrientation.Column
              ? offset + "px"
              : "50%",
          height: sashSize + "px",
          width: sashSize + "px",
        }}
      />
    );
  },
  // touchStart(evt) {
  //   console.log("touchdown");
  //   this.priv.ptDown = true;
  //   this.priv.startLength = this.splitView.staticPaneLength;
  //   this.priv.start = getRelativePointerCoordinates(
  //     evt,
  //     this.splitView.superview.node
  //   );
  //},
  pointerDown(evt) {
    this.node.setPointerCapture(evt.pointerId);
    if (evt.button === 0) {
      evt.preventDefault();
      this.priv.ptDown = true;
      this.priv.startLength = this.splitView.staticPaneLength;
      this.priv.start = getRelativePointerCoordinates(
        evt,
        this.splitView.superview.node
      );
      document.body.style.cursor =
        this.splitView.orientation === SplitViewOrientation.Row
          ? "ew-resize"
          : "ns-resize";
    }
  },
  pointerUp(evt) {
    this.priv.ptDown = false;
    this.node.releasePointerCapture(evt.pointerId);
    document.body.style.cursor = "default";
  },
  pointerMove(evt) {
    if (this.priv.ptDown) {
      let sign = this.splitView.flex === SplitViewFlex.TopLeft ? -1 : 1;
      let orientation = this.splitView.orientation;
      const { x, y } = getRelativePointerCoordinates(
        evt,
        this.splitView.superview.node
      );
      let delta =
        orientation === SplitViewOrientation.Row
          ? x - this.priv.start.x
          : y - this.priv.start.y;
      this.splitView.staticPaneLength = Math.max(
        this.splitView.minStaticPaneLength,
        Math.min(
          this.splitView.maxStaticPaneLength,
          this.priv.startLength + sign * delta
        )
      );
      this.splitView.layout();
    }
  },
});

export { SplitViewDivider };

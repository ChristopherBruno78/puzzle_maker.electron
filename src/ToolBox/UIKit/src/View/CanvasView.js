import { View } from "./View";
import { isFunction } from "../../../Foundation";

const CanvasView = View.extend({
  ObjName: "CanvasView",
  init({ tagName, ...props } = {}) {
    this._super({
      tagName: "canvas",
      ...(props ?? {}),
    });
    if (!isFunction(this.paint)) {
      throw new Error("CanvasView must implement `paint(paintContext)`.");
    }
  },
  _repaint() {
    const ctx = this.node.getContext("2d");
    let ratio = window.devicePixelRatio;
    ctx.clearRect(0, 0, this.node.offsetWidth, this.node.offsetHeight);
    ctx.canvas.height = Math.floor(ratio * this.node.offsetHeight);
    ctx.canvas.width = Math.floor(ratio * this.node.offsetWidth);
    ctx.scale(ratio, ratio);
    this.paint(ctx);
  },
  _fireDidEnterDocument() {
    setTimeout(() => this._repaint(), 1);
    this._super();
  },
});

export { CanvasView };

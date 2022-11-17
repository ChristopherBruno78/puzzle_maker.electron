import { View } from "./View";
import { MakeRect } from "../utils/Geometry";
import { getRelativePointerCoordinates } from "../utils/dom";

View.prototype.bounds = function () {
  const b = this.node.getBoundingClientRect();
  return MakeRect(0, 0, b.width, b.height);
};

View.prototype.pointerLocation = function (evt) {
  return getRelativePointerCoordinates(evt, this.node);
};

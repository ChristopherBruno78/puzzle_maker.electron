import { isUndefinedOrNull } from "../../Foundation/src/Runtime";
import { camelCaseToKebab } from "./utils/dom";
import { MakeRect } from "./utils/Geometry";

Element.prototype.setAttributes = function (attr) {
  Object.keys(attr).forEach((key) => {
    if (!isUndefinedOrNull(attr[key])) {
      this.setAttribute(camelCaseToKebab(key), attr[key]);
    } else {
      this.removeAttribute(camelCaseToKebab(key));
    }
  });
};

Element.prototype.absoluteBounds = function () {
  const b = this.getBoundingClientRect();
  return MakeRect(b.left, b.top, b.width, b.height);
};

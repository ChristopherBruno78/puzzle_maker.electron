import { MakePoint } from "./Geometry";

const isVisible = function (node) {
  if (node) {
    return !(node.style.visibility === "hidden" || node.offsetParent == null);
  }
  return false;
};

const isFocusable = function (node) {
  if (isVisible(node)) {
    if (node.hasAttribute("tabindex")) {
      if (node.hasAttribute("tabindex")) {
        return parseInt(node.getAttribute("tabindex"), 10) > -1;
      }
    }
    let tagName = node.tagName.toLowerCase();
    return (
      tagName === "button" ||
      tagName === "input" ||
      tagName === "select" ||
      tagName === "textarea"
    );
  }
  return false;
};

const getFirstFocusableElement = function (node) {
  let count = node.childElementCount,
    i = 0;
  for (; i < count; i++) {
    const child = node.childNodes.item(i);
    if (child instanceof HTMLElement) {
      if (isFocusable(child)) {
        return child;
      }
      let t = getFirstFocusableElement(child);
      if (t) {
        return t;
      }
    }
  }
  return null;
};

const getLastFocusableElement = function (node) {
  let count = node.childElementCount,
    i = count - 1;
  for (; i >= 0; i--) {
    const child = node.childNodes.item(i);
    if (child instanceof HTMLElement) {
      if (isFocusable(child)) {
        return child;
      }
      let t = getLastFocusableElement(child);
      if (t) {
        return t;
      }
    }
  }
  return null;
};

const getRelativePointerCoordinates = function (pointerEvent, node) {
  const rect = node.getBoundingClientRect();
  return MakePoint(
    pointerEvent.pageX - rect.left,
    pointerEvent.pageY - rect.top
  );
};

const hasFocus = function (node) {
  return node === document.activeElement;
};

const getBrowserScrollBarSize = function () {
  let inner = document.createElement("p");
  inner.style.width = "100%";
  inner.style.height = "200px";
  let outer = document.createElement("div");
  outer.style.position = "absolute";
  outer.style.top = "0px";
  outer.style.left = "0px";
  outer.style.visibility = "hidden";
  outer.style.width = "200px";
  outer.style.height = "150px";
  outer.style.overflow = "hidden";
  outer.appendChild(inner);
  document.body.appendChild(outer);
  let w1 = inner.offsetWidth;
  outer.style.overflow = "scroll";
  let w2 = inner.offsetWidth;
  if (w1 === w2) {
    w2 = outer.clientWidth;
  }
  document.body.removeChild(outer);
  return w1 - w2 + 1;
};

function camelCaseToKebab(aString) {
  return aString
    .split("")
    .map((letter, idx) => {
      return letter.toUpperCase() === letter && letter.toLowerCase() !== letter
        ? `${idx !== 0 ? "-" : ""}${letter.toLowerCase()}`
        : letter;
    })
    .join("");
}

const getOuterWidth = function (node) {
  let style = getComputedStyle(node),
    lm = parseInt(style.marginLeft, 10),
    rm = parseInt(style.marginRight, 10);
  return lm / 2 + node.offsetWidth + rm / 2;
};

export {
  getLastFocusableElement,
  getFirstFocusableElement,
  getOuterWidth,
  isFocusable,
  isVisible,
  getRelativePointerCoordinates,
  getBrowserScrollBarSize,
  hasFocus,
  camelCaseToKebab,
};

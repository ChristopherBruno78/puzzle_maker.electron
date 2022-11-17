import { isUndefinedOrNull } from "../../../Foundation/src/Runtime";

/** Point **/
const MakePoint = function (x, y) {
  return { x: x, y: y };
};

const CopyPoint = function (aPoint) {
  return { x: aPoint.x, y: aPoint.y };
};

const PointEqualsPoint = function (p1, p2) {
  return p1.x === p2.x && p1.y === p2.y;
};

const PointInsideRect = function (pt, rect) {
  return (
    RectGetLeft(rect) <= pt.x &&
    RectGetTop(rect) <= pt.y &&
    RectGetRight(rect) >= pt.x &&
    RectGetBottom(rect) >= pt.y
  );
};

const PointDifference = function (aPoint1, aPoint2) {
  return MakePoint(aPoint1.x - aPoint2.x, aPoint1.y - aPoint2.y);
};

/** Size **/
const MakeSize = function (w, h) {
  return { width: w, height: h };
};

const CopySize = function (aSize) {
  return { width: aSize.width, height: aSize.height };
};

const SizeEqualsSize = function (s1, s2) {
  return s1.width === s2.width && s1.height === s2.height;
};

/** Rectangle **/

const MakeRect = function (x, y, w, h) {
  return { origin: { x: x, y: y }, size: { width: w, height: h } };
};

const CPRectMakeCopy = function (aRect) {
  return {
    origin: CopyPoint(aRect.origin),
    size: CopySize(aRect.size),
  };
};

const CPRectEqualsRect = function (r1, r2) {
  return (
    PointEqualsPoint(r1.origin, r2.origin) && SizeEqualsSize(r1.size, r2.size)
  );
};

const RectZero = function () {
  return MakeRect(0, 0, 0, 0);
};

const RectFromBounds = function (boundsObj, parentBounds) {
  let { left, right, top, bottom, width, height } = boundsObj;

  if (!isUndefinedOrNull(left) && !isUndefinedOrNull(right)) {
    width = parentBounds.size.width - right - left;
  }

  if (!isUndefinedOrNull(top) && !isUndefinedOrNull(bottom)) {
    height = parentBounds.size.height - bottom - top;
  }

  if (
    !isUndefinedOrNull(right) &&
    !isUndefinedOrNull(width) &&
    isUndefinedOrNull(left)
  ) {
    left = parentBounds.size.width - right - width;
  }

  if (
    !isUndefinedOrNull(bottom) &&
    !isUndefinedOrNull(height) &&
    isUndefinedOrNull(top)
  ) {
    top = parentBounds.size.height - bottom - height;
  }

  if (isUndefinedOrNull(left)) {
    left = 0;
  }
  if (isUndefinedOrNull(top)) {
    top = 0;
  }
  if (isUndefinedOrNull(width)) {
    width = 0;
  }
  if (isUndefinedOrNull(height)) {
    height = 0;
  }

  return MakeRect(left, top, width, height);
};

const RectGetLeft = function (rect) {
  return rect.origin.x;
};

const RectGetTop = function (rect) {
  return rect.origin.y;
};

const RectGetRight = function (rect) {
  return rect.origin.x + rect.size.width;
};

const RectGetBottom = function (rect) {
  return rect.origin.y + rect.size.height;
};

const RectOutset = function (rect, outset) {
  return MakeRect(
    rect.origin.x - outset,
    rect.origin.y - outset,
    rect.size.width + 2 * outset,
    rect.size.height + 2 * outset
  );
};

/** Range **/
const MakeRange = function (start, length) {
  return { start: start, end: start + length };
};

const CopyRange = function (aRange) {
  return { start: aRange.start, end: aRange.end };
};

export {
  MakePoint,
  MakeSize,
  MakeRect,
  RectZero,
  CopyPoint,
  CopySize,
  CPRectMakeCopy,
  PointEqualsPoint,
  SizeEqualsSize,
  CPRectEqualsRect,
  RectGetTop,
  RectGetLeft,
  RectGetRight,
  RectGetBottom,
  RectOutset,
  PointInsideRect,
  RectFromBounds,
  PointDifference,
  MakeRange,
};

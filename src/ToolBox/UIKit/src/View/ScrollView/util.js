import { _padding } from "./constants";
import { isUndefinedOrNull } from "../../../../Foundation";

function _isVScrollVisible(aScrollView) {
  if (isUndefinedOrNull(aScrollView.contentView)) return false;
  return (
    aScrollView.contentView.node.offsetHeight > aScrollView.node.offsetHeight
  );
}

function _isHScrollVisible(aScrollView) {
  if (isUndefinedOrNull(aScrollView.contentView)) return false;
  return (
    aScrollView.contentView.node.offsetWidth > aScrollView.node.offsetWidth
  );
}

function _getVScrollBarHeight(aScrollView) {
  let deduct = 0; //deduction for minimum scroll thumb height
  const initH = aScrollView.node.offsetHeight - 2 * _padding;
  const initVpr = initH / aScrollView.priv.$content.node.scrollHeight;
  if (initVpr * initH <= 16) {
    deduct = 16;
  }
  return aScrollView.node.offsetHeight - 2 * _padding - deduct;
}

function _getHScrollBarWidth(aScrollView) {
  let deduct = 0; //deduction for minimum scroll thumb height
  const initW = aScrollView.node.offsetWidth - 2 * _padding;
  const initVpr = initW / aScrollView.priv.$content.node.scrollWidth;
  if (initVpr * initW <= 16) {
    deduct = 16;
  }
  return aScrollView.node.offsetWidth - 2 * _padding - deduct;
}

function _getVScrollThumbHeight(aScrollView) {
  const vpr = _calculateVPixelRatio(aScrollView);
  return Math.max(16, vpr * _getVScrollBarHeight(aScrollView));
}

function _getHScrollThumbWidth(aScrollView) {
  const hpr = _calculateHPixelRatio(aScrollView);
  return Math.max(16, hpr * _getHScrollBarWidth(aScrollView));
}

function _calculateVPixelRatio(aScrollView) {
  if (!_isVScrollVisible(aScrollView)) {
    return 0;
  }
  return (
    _getVScrollBarHeight(aScrollView) /
    aScrollView.priv.$content.node.scrollHeight
  );
}

function _calculateHPixelRatio(aScrollView) {
  if (!_isHScrollVisible(aScrollView)) {
    return 0;
  }

  return (
    _getHScrollBarWidth(aScrollView) / aScrollView.contentView.node.scrollWidth
  );
}

export {
  _calculateHPixelRatio,
  _calculateVPixelRatio,
  _isHScrollVisible,
  _isVScrollVisible,
  _getVScrollBarHeight,
  _getHScrollBarWidth,
  _getHScrollThumbWidth,
  _getVScrollThumbHeight,
};

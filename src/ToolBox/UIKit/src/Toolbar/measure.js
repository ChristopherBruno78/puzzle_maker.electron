import { getOuterWidth } from "../utils/dom";
import { Button } from "../Controls/Button/Button";
import { MenuButton } from "../Controls/Button/MenuButton";
import { MenuItem } from "../Menu/MenuItem";
import { Events, FireEvent } from "../Events";

function _preMeasure(toolbar) {
  let pxWidth = toolbar.node.offsetWidth;

  pxWidth -= 32;

  const leftViews = toolbar.leftLayer.subviews;
  const rightViews = toolbar.rightLayer.subviews;

  for (const v of leftViews) {
    if (v instanceof MenuButton) {
      v.props.menu.callout = true;
    }
  }

  let l = rightViews.length;
  let rWidth = 0;
  for (let i = 0; i < l; i++) {
    rWidth += getOuterWidth(rightViews[i].node);
  }
  pxWidth -= rWidth;
  l = leftViews.length;

  let lWidth = 0;
  for (let i = 0; i < l; i++) {
    let v = leftViews[i];
    _showToolItem(v, true);
    lWidth += getOuterWidth(v.node);
  }
  pxWidth -= lWidth;
  return pxWidth;
}

function _postMeasure(toolbar, pxWidth) {
  const leftViews = toolbar.leftLayer.subviews;
  if (pxWidth < 0) {
    let l;
    pxWidth -= 90;
    l = leftViews.length;

    while (pxWidth < 0 && l > -1) {
      l--;
      if (l > -1) pxWidth += leftViews[l].node.offsetWidth;
    }

    if (leftViews.length - l < 2) {
      l--;
    }
    if (l < 0) {
      l = 0;
    }
    const overflowBtn = toolbar.priv.overflowBtn;

    overflowBtn.menu.items = [];
    let overflowItems = [];
    for (let i = l; i < leftViews.length; i++) {
      let v = leftViews[i];
      if (v !== overflowBtn) {
        if (v instanceof Button) {
          const b = v;
          let menuItemConfig = {
            icon: b.props.icon,
            label: b.props.label,
            disabled: b.props.disabled,
          };

          if (b instanceof MenuButton) {
            menuItemConfig.submenu = b.props.menu;
            b.props.menu.callout = false;
            menuItemConfig.submenu.priv.supermenu = overflowBtn.priv.menu;
          }
          let item = new MenuItem(menuItemConfig);
          item.on(Events.OnClick, () => FireEvent(Events.OnClick, b));
          overflowItems.push(item);
        }
        _showToolItem(v, false);
      }
    }
    overflowBtn.menu.items = overflowItems;
  }
}

function doMeasure(toolbar) {
  const overflowBtn = toolbar.priv.overflowBtn;
  _showToolItem(overflowBtn, false);
  const m = _preMeasure(toolbar);
  if (m < 0) {
    _postMeasure(toolbar, m);
    _showToolItem(overflowBtn, overflowBtn.menu.items.length > 0);
  } else {
    _showToolItem(overflowBtn, false);
  }
}

function _showToolItem(item, flag) {
  if (flag) {
    item.displayed = true;
    item.node.style.display = "inline-block";
  } else {
    item.displayed = false;
  }
}

export { doMeasure };

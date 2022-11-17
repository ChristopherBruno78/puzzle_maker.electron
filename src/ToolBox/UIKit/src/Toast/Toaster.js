import { ToasterPosition } from "./ToasterPosition";
import { View } from "../View";
import { ClassNames } from "../utils/ClassNames";
import { ToasterAnimationState } from "./ToasterAnimationState";

import "./style.less";

const Toaster = View.extend({
  ObjName: "Toaster",
  props: {
    position: ToasterPosition.Bottom_Right,
  },
  className() {
    let p = this.props.position;
    return ClassNames("tb-Toast-container", {
      top:
        p === ToasterPosition.Top_Left ||
        p === ToasterPosition.Top_Center ||
        p === ToasterPosition.Top_Right,
      left:
        p === ToasterPosition.Top_Left ||
        p === ToasterPosition.Bottom_Left ||
        p === ToasterPosition.Top_Center ||
        p === ToasterPosition.Bottom_Center,
      right:
        p === ToasterPosition.Top_Right ||
        p === ToasterPosition.Bottom_Right ||
        p === ToasterPosition.Top_Center ||
        p === ToasterPosition.Bottom_Center,
      bottom:
        p === ToasterPosition.Bottom_Left ||
        p === ToasterPosition.Bottom_Center ||
        p === ToasterPosition.Bottom_Right,
    });
  },
  toast(view) {
    const sp = O("span", null, view);
    const p = this.props.position;
    if (
      p === ToasterPosition.Top_Left ||
      p === ToasterPosition.Top_Center ||
      p === ToasterPosition.Top_Right
    ) {
      this.insert(0, sp);
    } else {
      this.add(sp);
    }
    _setAnimationState(this, ToasterAnimationState.Enter);
    setTimeout(() => {
      _setAnimationState(this, ToasterAnimationState.Appear);
    }, 25);
  },
  closeAllToasts() {
    const subviews = this.subviews;
    for (const view of subviews) {
      const toasts = view.subviews;
      for (const toast of toasts) {
        toasts.close(true);
      }
    }
  },
  renderPosition() {
    this.renderClassName();
  },
});

function _setAnimationState(toaster, state) {
  const currentAnimationState = toaster.priv.as;
  const subviews = toaster.subviews;
  for (const view of subviews) {
    const toasts = view.subviews;
    if (toasts.length > 0) {
      let first = toasts[0];
      if (first) {
        if (currentAnimationState) {
          first.node.classList.remove(currentAnimationState);
        }
        if (state) {
          first.node.classList.add(state);
        }
      }
    }
  }
  toaster.priv.as = state;
}

export { Toaster };

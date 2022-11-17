import { View } from "./View";

import "./style.less";

const _RootView = View.extend({
  ObjName: "RootView",
  init() {
    this._super({
      tagName: "body",
    });
    this.node = document.body;
    this.priv.popovers = [];
    this._fireDidEnterDocument();
    window.addEventListener("resize", (evt) => {
      this.closeAllPopOvers();
    });
  },
  addPopOver(popover) {
    this.priv.popovers.push(popover);
    this.node.appendChild(popover.node);
  },
  removePopOver(popover) {
    this.priv.popovers.remove(popover);
    this.node.removeChild(popover.node);
  },
  closeAllPopOvers() {
    for (const popover of this.priv.popovers) {
      if (popover.transient) {
        popover.perform("close");
      }
    }
  },
  pointerDown() {
    this.closeAllPopOvers();
  },
});

//Singleton
const RootView = new _RootView();

export { RootView };

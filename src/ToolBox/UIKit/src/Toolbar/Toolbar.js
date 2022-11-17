import { View } from "../View";
import { ClassNames } from "../utils/ClassNames";

import "./style.less";
import { MenuButton } from "../Controls/Button/MenuButton";
import { debounce } from "../../../Foundation";
import { doMeasure } from "./measure";
import { Menu } from "../Menu/Menu";

const Toolbar = View.extend({
  ObjName: "Toolbar",
  props: {
    leftViews: null,
    rightViews: null,
    hidden: true,
  },
  init({ tagName, ...props } = {}) {
    this._super({
      tagName: "div",
      role: "toolbar",
      ...(props || {}),
    });
    this.priv.overflowBtn = new MenuButton({
      styleName: "tb-overflow-btn",
      displayed: false,
      label: "More",
      menu: new Menu({
        callout: true,
        items: [],
      }),
    });
  },
  className() {
    return ClassNames("tb-Toolbar", this._super());
  },
  draw() {
    return (
      <>
        {
          (this.leftLayer = (
            <div className={"tb-Toolbar-section tb-Toolbar-section--left"} />
          ))
        }
        {
          (this.rightLayer = (
            <div className={"tb-Toolbar-section tb-Toolbar-section--right"} />
          ))
        }
      </>
    );
  },
  addChild(child) {
    if (!this.props.leftViews) {
      this.props.leftViews = child;
      return;
    }
    if (!this.props.rightViews) {
      this.props.rightViews = child;
    }
  },
  renderLeftViews() {
    const leftViews = this.props.leftViews;
    this.leftLayer.removeAllSubviews();
    if (leftViews) {
      for (const v of leftViews) {
        this.leftLayer.add(v);
      }
    }
  },
  renderRightViews() {
    const rightViews = this.props.rightViews;
    this.rightLayer.removeAllSubviews();
    if (rightViews) {
      for (const v of rightViews) {
        this.rightLayer.add(v);
      }
    }
  },
  _fireDidEnterDocument() {
    this.leftLayer.add(this.priv.overflowBtn);
    this.priv.ro = new ResizeObserver(() => {
      this.priv.rt = debounce(
        () => {
          doMeasure(this);
          this.hidden = false;
        },
        10,
        this.priv.rt
      );
    });
    this.priv.ro.observe(this.node);
    this._super();
  },
  _fireDidLeaveDocument() {
    this._super();
    this.priv.ro.disconnect();
  },
});

export { Toolbar };

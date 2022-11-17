import "./Element";
import { ClassNames } from "./utils/ClassNames";
import { Responder } from "./Responder";
import {
  getMethods,
  isFunction,
  isProperty,
  isUndefinedOrNull,
  uncapitalizeString,
} from "../../Foundation";
import { camelCaseToKebab } from "./utils/dom";
import {
  EventIsNative,
  Events,
  FireEvent,
  LookupEventName,
  NativeEvents,
} from "./Events";
import { _parseProps } from "../../Foundation/src/CPObject/CPObject+(Object)";
import { CopyPoint, MakePoint, PointDifference } from "./utils/Geometry";

/**An abstract class to support View and Dialog
 * @abstract
 */
const UIObject = Responder.extend({
  ObjName: "UIObject",
  props: {
    tagName: "div",
    styleName: "",
    hidden: false,
    displayed: true,
  },
  init(props) {
    this._super(props);
    if (this.node && this._id) {
      this.node.setAttribute("id", this.props.id ?? this._id);
    }
    this.isInDocument = false;
    this.priv.events = [];
    this.priv.draggable = false;
    this.controlLayer = this;
  },
  parseProps(props) {
    this.node = document.createElement(props.tagName || "div");
    const { style, className, layout, contentEditable, ...rest } = props;
    if (style) {
      const styleProps = Object.keys(style);
      styleProps.forEach((styleProp) => {
        this.node.style.setProperty(
          camelCaseToKebab(styleProp),
          style[styleProp]
        );
      });
    }
    if (className) {
      this.styleName = className;
    }
    if (layout) {
      this.props.layout = layout;
    }
    if (contentEditable) {
      this.node.setAttribute("contentEditable", contentEditable);
    }

    let attrs = {},
      objProps = {};
    for (const key in rest) {
      if (isProperty(this, key) || isFunction(rest[key])) {
        objProps[key] = rest[key];
      } else {
        attrs[key] = rest[key];
      }
    }
    Object.keys(attrs).forEach((attrProp) => {
      this.node.setAttribute(camelCaseToKebab(attrProp), attrs[attrProp]);
    });

    _observeRenderMethods(this);
    _parseProps(this, objProps);
    _addUIObjectObservers(this);
  },
  className() {
    return ClassNames(
      {
        "tb-hidden": this.props.hidden,
        "tb-not-displayed": !this.props.displayed,
        "tb-draggable": this.priv.draggable,
      },
      this.props.styleName
    );
  },
  renderAriaAttributes: function () {
    this.node.setAttribute("aria-hidden", this.hidden || !this.displayed);
  }.observes("hidden", "displayed"),
  renderClassName: function () {
    const node = this.node;
    if (node) {
      const cn = this.className();
      if (cn && cn.length > 0) {
        this.node.className = cn;
      } else {
        this.node.removeAttribute("class");
      }
    }
  }.observes("styleName", "hidden", "displayed"),
  _render: function () {
    const methods = this.priv.renderFns; //_observerRenderMethods must be called first
    if (methods) {
      methods.forEach((m) => {
        if (this[m]) {
          this[m].call(this);
        }
      });
    }
  },
  on(eventType, listener) {
    if (EventIsNative(eventType)) {
      this.controlLayer.node.addEventListener(eventType, listener);
    }
    return this._super(eventType, listener);
  },
  off(eventRef) {
    if (EventIsNative(eventRef.eventType)) {
      this.controlLayer.node.removeEventListener(
        eventRef.eventType,
        eventRef.listener
      );
    }
    this._super(eventRef);
  },
  _initEvents() {
    this.perform("initCustomEventListeners");
    _addEvents(this);
  },
  _destroyEvents() {
    _removeEvents(this);
  },
});

function _addUIObjectObservers(aView) {
  const methods = getMethods(aView);
  for (const m of methods) {
    const func = aView[m];
    const observers = func ? func._observers : undefined;
    if (func && observers && observers.size > 0) {
      if (func.name.startsWith("render")) {
        for (const o of observers) {
          aView.addObserver(aView, o, function () {
            if (aView.isRendered) {
              aView[m].call(aView);
            }
          });
        }
      } else {
        for (const o of observers) {
          aView.addObserver(aView, o, m);
        }
      }
    }
  }
}

function _observeRenderMethods(uiObj) {
  const methods = getMethods(uiObj);
  uiObj.priv.renderFns = []; //cache the draw methods
  methods.forEach((m) => {
    if (m.startsWith("render") && m.length > 7) {
      const property = uncapitalizeString(m.substring(6));
      if (!isUndefinedOrNull(uiObj[m])) {
        if (isProperty(uiObj, property)) {
          uiObj[m].observes(property);
        }
        uiObj.priv.renderFns.push(m);
      }
    }
  });
}

function _addEvents(uiObject) {
  for (const event in NativeEvents) {
    const SEL = uncapitalizeString(event);
    const eventType = NativeEvents[event];
    if (uiObject.respondsTo(SEL)) {
      const o = {
        eventType: eventType,
        listener: function (evt) {
          evt.stopPropagation();
          uiObject.respondToEvent(eventType, evt);
        },
      };
      uiObject.priv.events.push(o);
      uiObject.controlLayer.node.addEventListener(eventType, o.listener);
    }
  }
}

function _removeEvents(uiObj) {
  for (const o of uiObj.priv.events) {
    const eventName = LookupEventName(o.eventType);
    if (NativeEvents[eventName])
      uiObj.controlLayer.node.removeEventListener(
        NativeEvents[eventName],
        o.listener
      );
  }
  uiObj.priv.events = [];
  uiObj.removeAllObservers();
}

export { UIObject };

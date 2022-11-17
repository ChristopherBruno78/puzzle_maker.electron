import {
  isFunction,
  isUndefinedOrNull,
  uncapitalizeString,
} from "../../Foundation";
import { Keys } from "./utils/keys";

const NativeEvents = {
  /* EventName : eventType */
  PointerDown: "pointerdown",
  PointerUp: "pointerup",
  PointerOut: "pointerout",
  PointerOver: "pointerover",
  PointerMove: "pointermove",
  PointerLeave: "pointerleave",
  PointerEnter: "pointerenter",
  TouchStart: "touchstart",
  TouchMove: "touchmove",
  TouchEnd: "touchend",
  ContextMenu: "contextmenu",
  KeyDown: "keydown",
  KeyUp: "keyup",
  KeyPress: "keypress",
  OnFocus: "focus",
  OnBlur: "blur",
  OnResize: "resize",
  OnChange: "change",
  OnClick: "click",
  DoubleClick: "dblclick",
  OnInput: "input",
  OnScroll: "scroll",
  OnWheel: "wheel",
};

const CustomEvents = {
  ResizeStart: "resizestart",
  ResizeFinish: "resizefinish",
  DragStart: "dragstart",
  OnDrag: "drag",
  DragFinish: "dragfinish",
  OnClose: "close",
  OnOpen: "open",
  OnAction: "action",
  OnSelect: "select",
  TextChange: "textchange",
  TextDidEndEditing: "textdidendediting",
  SwipeUp: "swipeup",
  SwipeDown: "swipedown",
  SwipeLeft: "swipeleft",
  SwipeRight: "swiperight",
  OnTap: "tap",
};

const Events = { ...NativeEvents, ...CustomEvents };

const rCPEvents = {};
for (const evtName in Events) {
  rCPEvents[Events[evtName]] = evtName;
}

const RegisterEvent = function (registerObj) {
  Events[registerObj.name] = registerObj.type;
  rCPEvents[registerObj.type] = registerObj.name;
};

const LookupEventName = function (eventType) {
  return rCPEvents[eventType];
};

const FireEvent = function (eventType, target, arg) {
  if (target) {
    if (isFunction(target.respondToEvent)) {
      target.respondToEvent(eventType, arg);
    } else {
      const eventName = LookupEventName(eventType);
      const SEL = uncapitalizeString(eventName);
      if (target.respondsTo(SEL)) {
        target.perform(SEL, arg);
      }
    }
  }
};

const EventIsNative = function (eventType) {
  return !isUndefinedOrNull(NativeEvents[LookupEventName(eventType)]);
};

const EventKeyCode = function (evt) {
  if (evt.code === "NumpadEnter") {
    return Keys.Enter;
  }
  return evt.code;
};

export {
  Events,
  NativeEvents,
  CustomEvents,
  FireEvent,
  LookupEventName,
  RegisterEvent,
  EventIsNative,
  EventKeyCode,
};

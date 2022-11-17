import { CPObject, uncapitalizeString } from "../../Foundation";
import { LookupEventName } from "./Events";

/**
 * Responder an abstract class that is the base class the responder chain.
 * A Responder is able to receive events and respond to them;
 */
const Responder = CPObject.extend({
  ObjName: "Responder",
  init({ nextResponder, ...props } = {}) {
    this.$nextResponder = nextResponder;
    this.priv.events = {};
    this._super(props ?? {});
  },
  respondToEvent(eventType, arg) {
    const eventName = LookupEventName(eventType);
    const SEL = uncapitalizeString(eventName);
    this.respondTo(SEL, arg);
    const eventRefs = this.priv.events[eventType];
    if (eventRefs) {
      for (const ref of eventRefs) {
        ref.listener.call(this, arg);
      }
    }
  },
  respondTo(SEL, arg) {
    if (this.respondsTo(SEL)) {
      this.perform(SEL, arg);
    }
    if (!arg || !arg.stop) {
      this.sendToNextResponder(SEL, arg);
    }
  },
  sendToNextResponder(SEL, arg) {
    if (this.$nextResponder) {
      this.$nextResponder.respondTo(SEL, arg);
    }
  },
  /**
   * Add event listening on the fly. Events will automatically
   * be cleaned up if the view is removed from the DOM
   * @param eventType
   * @param listener
   * @returns @eventRef
   */
  on(eventType, listener) {
    if (!this.priv.events[eventType]) {
      this.priv.events[eventType] = [];
    }
    const eventRef = {
      eventType: eventType,
      listener: listener,
    };
    this.priv.events[eventType].push(eventRef);
    return eventRef;
  },
  /**
   * Remove event listening on the fly
   * @param eventRef
   */
  off(eventRef) {
    const eventType = eventRef.eventType;
    if (this.priv.events[eventType]) {
      this.priv.events[eventType].remove(eventRef);
    }
  },
});

const Delegate = Responder.extend({
  ObjName: "Delegate",
});

const Controller = Responder.extend({
  ObjName: "Controller",
  init(props) {
    this._super(props);
    this.outlets = {};
  },
});

export { Responder, Delegate, Controller };

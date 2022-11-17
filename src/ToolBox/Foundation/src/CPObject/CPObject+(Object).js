import {
  createObject,
  getClass,
  getMethods,
  getUuid,
  isBinding,
  isMethod,
  isProperty,
} from "../Runtime";
import { CPObject } from "./CPObject";

CPObject.prototype.perform = function (selName) {
  if (this.respondsTo(selName)) {
    return this[selName].apply(this, Array.from(arguments).slice(1));
  }
};

CPObject.prototype.respondsTo = function (selName) {
  return isMethod(this, selName);
};

CPObject.prototype.copy = function () {
  const shell = createObject(getClass(this.ObjName), this.props);
  shell._id = getUuid("ui");
  return shell;
};

CPObject.prototype.getId = function () {
  return this._id;
};

CPObject.prototype.init = function (props) {
  this.parseProps(props);
};

CPObject.prototype.parseProps = function (instanceProps) {
  _parseProps(this, instanceProps);
  _addObservers(this);
};

function _parseProps(obj, propsObject) {
  for (const p in propsObject) {
    const value = propsObject[p];
    if (isBinding(value)) {
      const binding = value;
      binding.props.fromObject = obj;
      binding.props.fromPath = p;
      binding.bind();
      obj.set(p, binding.value);
    } else if (isProperty(obj, p)) {
      obj.set(p, value);
    } else {
      obj[p] = value;
    }
  }
}

function _addObservers(anObject) {
  const methods = getMethods(anObject);
  for (const m of methods) {
    const func = anObject[m];
    const observers = func._observers;
    if (func && observers && observers.size > 0) {
      for (const o of observers) {
        anObject.addObserver(anObject, o, m);
      }
    }
  }
}

export { _parseProps };

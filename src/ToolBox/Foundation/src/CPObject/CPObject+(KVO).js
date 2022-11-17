import { CPObject } from "./CPObject";
import { isFunction, isProperty } from "../Runtime";

const _RunKVOProcessor = function (subject, key) {
  if (subject.priv.observers) {
    const observers = subject.priv.observers[key];
    if (observers) {
      observers.forEach((observer) => {
        const newValue = subject.get(observer.keyPath);
        if (observer.cachedValue !== newValue) {
          observer.cachedValue = newValue;
          const methodName = observer.action || "didChangeValueForKey";
          if (isFunction(methodName)) {
            methodName.call(observer.target, observer.keyPath);
          } else {
            observer.target.perform(methodName, observer.keyPath);
          }
        }
      });
    }
  }
};

CPObject.prototype.get = function (aKeyPath) {
  if (!aKeyPath) return;

  let firstDotIndex = aKeyPath.indexOf(".");
  if (firstDotIndex < 0) {
    if (isProperty(this, aKeyPath)) {
      return this.props[aKeyPath];
    }
  }
  let firstKeyComponent = aKeyPath.substring(0, firstDotIndex),
    remainingKeyPath = aKeyPath.substring(firstDotIndex + 1),
    value = this.get(firstKeyComponent);

  if (value instanceof CPObject) {
    return value.get(remainingKeyPath);
  }
};

CPObject.prototype.set = function (aKeyPath, aValue) {
  if (!aKeyPath) return;

  const firstDotIndex = aKeyPath.indexOf(".");

  if (firstDotIndex < 0) {
    this.props[aKeyPath] = aValue;
    _RunKVOProcessor(this, aKeyPath);
    return;
  }
  const firstKeyComponent = aKeyPath.substring(0, firstDotIndex),
    remainingKeyPath = aKeyPath.substring(firstDotIndex + 1),
    value = this.get(firstKeyComponent);

  if (value instanceof CPObject) {
    return value.set(remainingKeyPath);
  }
};

CPObject.prototype.addObserver = function (anObserver, aKeyPath, selName) {
  if (!aKeyPath) return;

  const firstDotIndex = aKeyPath.indexOf(".");

  if (firstDotIndex < 0) {
    if (!this.priv.observers) {
      this.priv.observers = {};
    }
    if (!this.priv.observers[aKeyPath]) {
      this.priv.observers[aKeyPath] = [];
    }
    this.priv.observers[aKeyPath].push({
      target: anObserver,
      action: selName,
      keyPath: aKeyPath,
      cachedValue: this.get(aKeyPath),
    });

    return;
  }

  const firstKeyComponent = aKeyPath.substring(0, firstDotIndex),
    remainingKeyPath = aKeyPath.substring(firstDotIndex + 1),
    value = this.get(firstKeyComponent);

  if (value instanceof CPObject) {
    value.addObserver(anObserver, remainingKeyPath, selName);
  }
};

CPObject.prototype.removeObserver = function (anObserver, aKeyPath) {
  if (!aKeyPath) return;

  const firstDotIndex = aKeyPath.indexOf(".");

  if (firstDotIndex < 0) {
    if (this.priv.observers) {
      const observers = this.priv.observers[aKeyPath];
      observers.splice(
        observers.findIndex((item) => item.target === anObserver),
        1
      );
      if (this.priv.observers[aKeyPath].length === 0) {
        delete this.priv.observers[aKeyPath];
      }
      if (Object.keys(this.priv.observers).length === 0) {
        delete this.priv.observers;
      }
    }
    return;
  }

  const firstKeyComponent = aKeyPath.substring(0, firstDotIndex),
    remainingKeyPath = aKeyPath.substring(firstDotIndex + 1),
    value = this.get(firstKeyComponent);

  if (value instanceof CPObject) {
    value.removeObserver(anObserver, remainingKeyPath);
  }
};

CPObject.prototype.removeAllObservers = function () {
  delete this.priv.observers;
};

Function.prototype.observes = function (...props) {
  if (!this._observers) this._observers = new Set();
  this._observers.addAll(props);
  return this;
};

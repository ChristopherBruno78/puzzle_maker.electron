import {
  createObject,
  getClass,
  getUuid,
  isFunction,
  isGetter,
  isSetter,
  registerClass,
} from "../Runtime";
import "../Set";

let fnTest = /xyz/.test(function () {
  let xyz = null;
  xyz;
})
  ? /\b_super\b/
  : /.*/;

// The base CPObject implementation (does nothing)
function CPObject() {}

// Create a new CPObject that inherits from this class
CPObject.extend = function (classProps) {
  let _super = this.prototype;

  // Set up the prototype to inherit from the base class
  // (but without running the init constructor)
  let proto = Object.create(_super);

  // Copy the properties over onto the new prototype
  for (let name in classProps) {
    // Check if we're overwriting an existing function
    const superMethod = _super[name];
    if (
      !isGetter(classProps, name) &&
      !isSetter(classProps, name) &&
      isFunction(classProps[name]) &&
      isFunction(superMethod) &&
      fnTest.test(classProps[name])
    ) {
      proto[name] = (function (name, fn) {
        const retFn = function () {
          let tmp = this._super;
          // Add a new ._super() method that is the same method
          // but on the super-class
          this._super = superMethod;

          // The method only need to be bound temporarily, so we
          // remove it when we're done executing
          let ret = fn.apply(this, arguments);
          this._super = tmp;
          return ret;
        };

        const superObservers = superMethod._observers;
        const fnObservers = fn._observers;
        const superMethodObservers =
          isFunction(superMethod) && superObservers && superObservers.size > 0;
        const methodObservers = fnObservers && fnObservers.size > 0;
        //attach observers to new function
        if (superMethodObservers || methodObservers) {
          retFn._observers = new Set();
          if (superMethodObservers) {
            retFn._observers.addAll(superObservers);
          }
          if (methodObservers) {
            retFn._observers.addAll(fnObservers);
          }
        }
        return retFn;
      })(name, classProps[name]);
    } else if (isGetter(classProps, name) || isSetter(classProps, name)) {
      let getter = Object.getOwnPropertyDescriptor(classProps, name);
      Object.defineProperty(proto, name, getter);
    } else {
      proto[name] = classProps[name];
    }
  }

  const _init = (anObject) => {
    _createProps(anObject);
    anObject.priv = {};
    anObject._id = getUuid("ui");
  };
  // The new constructor
  let newClass =
    typeof proto.init === "function"
      ? proto.hasOwnProperty("init")
        ? function () {
            _init(this);
            this.init.apply(this, arguments);
          } // All construction is actually done in the init method
        : function SubClass() {
            _init(this);
            _super.init.apply(this, arguments);
          }
      : function Class() {
          _init(this);
        };
  proto.constructor = newClass;
  // Populate our constructed prototype object
  newClass.prototype = proto;
  newClass.prototype.isa = newClass;

  // And make this class extendable
  newClass.extend = CPObject.extend;
  //private internally used
  newClass.prototype._super = _super;

  newClass.isSubclassOfClass = function (aClass) {
    return newClass.prototype instanceof aClass;
  };
  newClass.prototype.defaultProps = Object.assign(
    Object.assign({}, _super.defaultProps),
    classProps.props || {}
  );
  if (classProps.ObjName) {
    newClass.ObjName = classProps.ObjName;
    return registerClass(newClass);
  }
  return newClass;
};

/**
 * Creates the instance props object from the defautProps
 * @param aClass
 * @private
 */
function _createProps(aClass) {
  const defaultProps = aClass.defaultProps;
  aClass.props = {};
  for (const p in defaultProps) {
    const value = defaultProps[p];
    aClass.props[p] = _cloneObject(value);
    Object.defineProperty(aClass, p, {
      enumerable: defaultProps.propertyIsEnumerable(p),
      configurable: false,
      get: function () {
        return this.get(p);
      },
      set: function (v) {
        this.set(p, v);
      },
    });
  }
}

function _cloneObject(anObject) {
  if (isFunction(anObject)) {
    return null;
  }
  if (Array.isArray(anObject)) {
    let arr = [];
    for (const obj of anObject) {
      const clone = _cloneObject(obj);
      if (clone) arr.push(clone);
    }
    return arr;
  }
  if (anObject instanceof CPObject && anObject.ObjName) {
    return createObject(getClass(anObject.ObjName), anObject.props);
  }
  return anObject;
}

export { CPObject, _cloneObject };

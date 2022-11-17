const isProperty = function (aClass, attr) {
  return (
    aClass &&
    aClass.props &&
    Object.hasOwn(aClass.props, attr) &&
    !isFunction(aClass.props[attr])
  );
};

const isState = function (aClass, attr) {
  return (
    aClass &&
    aClass.state &&
    Object.hasOwn(aClass.state, attr) &&
    !isFunction(aClass.state[attr])
  );
};

const isBinding = function (obj) {
  return obj && obj.ObjName && obj.ObjName === "Binding";
};

/**
 * Determine if {@param attr} is a method on {@param aClass}
 * @param aClass
 * @param attr
 * @returns {boolean}
 */
const isMethod = function (aClass, attr) {
  return (
    !isSetter(aClass, attr) &&
    !isGetter(aClass, attr) &&
    isFunction(aClass[attr]) &&
    ["_super", "_id", "constructor", "ObjName", "init", "isa"].indexOf(attr) < 0
  );
};

const isJSObject = function (obj) {
  return obj && typeof obj === "object" && !Array.isArray(obj);
};

const isString = function (obj) {
  return (obj && typeof obj === "string") || obj instanceof String;
};

const isFunction = function (obj) {
  return obj && typeof obj === "function";
};

const isUndefinedOrNull = function (obj) {
  return obj === null || obj === undefined;
};

const isGetter = function (obj, prop) {
  const des = Object.getOwnPropertyDescriptor(obj, prop);
  if (des) {
    return !!des["get"];
  }
  return false;
};

const isSetter = function (obj, prop) {
  const des = Object.getOwnPropertyDescriptor(obj, prop);
  if (des) {
    return !!des["set"];
  }
  return false;
};

let UUID = 0;

const getUuid = function (/*String*/ prefix) {
  return prefix + "-" + ++UUID;
};

const getMethods = function (anObject) {
  let methods = new Set();
  //top level functions
  Object.keys(anObject).forEach((selName) => {
    if (isMethod(anObject, selName)) {
      methods.add(selName);
    }
  });
  //super class functions
  let that = Object.getPrototypeOf(anObject);
  while (that) {
    Object.keys(that).forEach((selName) => {
      if (isMethod(that, selName)) {
        methods.add(selName);
      }
    });
    that = that._super;
  }

  return methods;
};

const Object_Map = {};

const registerClass = function (aClass) {
  if (aClass.ObjName) {
    Object_Map[aClass.ObjName] = aClass;
  }
  return aClass;
};

const getClass = function (aClassName) {
  if (aClassName && Object_Map[aClassName]) {
    return Object_Map[aClassName];
  }
  return null;
};

const getNameOfClass = function (aClass) {
  return aClass.ObjName;
};

const createObject = function (theClass, props) {
  if (theClass.prototype.isa) {
    return new theClass(props);
  }
};

export {
  isProperty,
  isState,
  isMethod,
  isFunction,
  isString,
  isJSObject,
  isGetter,
  isSetter,
  isUndefinedOrNull,
  isBinding,
  registerClass,
  getClass,
  getNameOfClass,
  getMethods,
  getUuid,
  createObject,
};

import {
  createObject,
  getClass,
  getNameOfClass,
  isFunction,
  isString,
  isUndefinedOrNull,
} from "../../../Foundation";
import { View } from "./View";

/**
 * The object factory method
 * @param tagNameOrClass - if a string tag name is passed, a view with
 * that tag name is created
 * @param props - object props
 * @param children - children of the object. Object must implement addChild
 * @returns the created object
 * @function
 */
window.O = function (tagNameOrClass, props, ...children) {
  if (isUndefinedOrNull(tagNameOrClass)) {
    return children;
  }
  const { innerHTML, nodes } = _parseChildren(...children);
  let cpObj;
  const { ref, ...rest } = props || {};

  if (isString(tagNameOrClass)) {
    cpObj = new View({
      tagName: tagNameOrClass,
      ...(rest || {}),
    });
    if (innerHTML) {
      cpObj.node.innerHTML = innerHTML;
    }
  } else {
    if (!isFunction(tagNameOrClass)) {
      cpObj = tagNameOrClass;
    } else {
      cpObj = createObject(
        getClass(getNameOfClass(tagNameOrClass)),
        rest || {}
      );
    }
  }
  if (cpObj) {
    if (nodes && nodes.length > 0) {
      if (isFunction(cpObj.addChild)) {
        for (const child of nodes) {
          cpObj.addChild(child);
        }
      } else {
        throw new Error(`${cpObj.ObjName} must implement "addChild".`);
      }
    }
    if (isFunction(ref)) {
      ref(cpObj);
    }
    return cpObj;
  }
};

function _parseChildren(...children) {
  let _setInnerHtml = null,
    _children = null;

  if (children.length > 0 && isString(children[0])) {
    _setInnerHtml = children.join(" ");
  } else {
    _children = children;
  }
  return {
    innerHTML: _setInnerHtml,
    nodes: _children,
  };
}

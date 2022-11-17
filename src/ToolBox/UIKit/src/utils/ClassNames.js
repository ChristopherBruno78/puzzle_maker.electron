import { isJSObject, isString } from "../../../Foundation/src/Runtime";

/**
 * Generates a class name from a list of string or objects.
 * Objects have the format { className : boolean condition }, where
 * when boolean condition is true, the className is added
 * @param classNames
 * @returns {string}
 * @function
 */
const ClassNames = function (...classNames) {
  const names = [];
  for (const cn of classNames) {
    if (isString(cn)) {
      names.push(cn);
    } else if (isJSObject(cn)) {
      const keys = Object.keys(cn);
      for (const key of keys) {
        if (cn[key] === true) {
          names.push(key);
        }
      }
    }
  }
  return names.join(" ").trim();
};

export { ClassNames };

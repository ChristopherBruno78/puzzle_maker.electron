const capitalizeString = function (aStr) {
  if (aStr && aStr.length > 0) {
    return aStr.substring(0, 1).toUpperCase() + aStr.substring(1);
  }
  return aStr;
};

const uncapitalizeString = function (aStr) {
  if (aStr && aStr.length > 0) {
    return aStr.substring(0, 1).toLowerCase() + aStr.substring(1);
  }
  return aStr;
};

export { capitalizeString, uncapitalizeString };

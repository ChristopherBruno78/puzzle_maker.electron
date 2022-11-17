const Keys = {
  ArrowUp: "ArrowUp",
  ArrowDown: "ArrowDown",
  ArrowLeft: "ArrowLeft",
  ArrowRight: "ArrowRight",
  Backspace: "Backspace",
  Delete: "Delete",
  Enter: "Enter",
  Escape: "Escape",
  ShiftLeft: "ShiftLeft",
  ShiftRight: "ShiftRight",
  Space: "Space",
  Tab: "Tab",
};

const IsAlphaNumeric = function (code) {
  return code.match(/^[0-9a-zA-Z]+$/);
};

export { Keys, IsAlphaNumeric };

import { View } from "./View";

const Label = View.extend({
  ObjName: "Label",
  props: {
    text: "",
  },
  init({ tagName, ...props } = {}) {
    this._super({
      tagName: "label",
      ...(props ?? {}),
    });
  },
  renderText() {
    this.node.innerHTML = this.text;
  },
});

export { Label };

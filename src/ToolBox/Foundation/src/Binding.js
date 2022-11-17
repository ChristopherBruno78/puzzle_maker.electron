import { CPObject } from "./CPObject";
import { isFunction } from "./Runtime";

const Binding = CPObject.extend({
  ObjName: "Binding",
  props: {
    fromObject: null,
    fromPath: null,
    toObject: null,
    toPath: null,
  },
  bind() {
    if (this.toObject && this.fromObject && this.fromPath && this.toPath) {
      this.toObject.addObserver(this.fromObject, this.toPath, () => {
        this.fromObject.set(this.fromPath, this.value);
      });
    }
  },
  get value() {
    const v = this.toObject.get(this.toPath);
    return isFunction(this.transform) ? this.transform(v) : v;
  },
});

const BindTo = function (toObject, toPath, transform) {
  return new Binding({
    toObject: toObject,
    toPath: toPath,
    transform: transform,
  });
};

export { Binding, BindTo };

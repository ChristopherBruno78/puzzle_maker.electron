import { CPObject } from "./CPObject";
import { findIndex } from "lodash-es";

const ObservableArray = CPObject.extend({
  ObjName: "ObservableArray",
  props: {
    change: false,
    length: 0,
  },
  init() {
    this.data = [];
  },
  push(anObject, silent) {
    this.data.push(anObject);
    this._update(silent);
  },
  pushAll(anArray, silent) {
    this.data = this.data.concat(anArray);
    this._update(silent);
  },
  insertAt(index, item, silent) {
    this.data.insertAt(index, item);
    this._update(silent);
  },
  pop(silent) {
    this.data.pop();
    this._update(silent);
  },
  remove(anObject, silent) {
    this.data.remove(anObject);
    this._update(silent);
  },
  removeAt(index, silent) {
    this.remove(this.data.indexOf(index), silent);
  },
  getAt(index) {
    return this.data[index];
  },
  findIndex(predicate) {
    return findIndex(this.data, predicate);
  },
  sort(comparator, silent) {
    this.data.sort(comparator);
    this._update(silent);
  },
  setAt(index, val, silent) {
    data[index] = val;
    if (!silent) {
      this.change = !this.change;
    }
  },
  clear(silent) {
    this.data = [];
    this._update(silent);
  },
  update() {
    this._update();
  },
  _update(silent) {
    if (!silent) {
      this.length = this.data.length;
      this.change = !this.change;
    }
  },
});

Object.assign(ObservableArray.prototype, {
  [Symbol.iterator]() {
    let values = this.data;
    let index = 0;
    return {
      next() {
        if (index < values.length) {
          let val = values[index];
          index++;
          return { value: val, done: false };
        } else return { done: true };
      },
    };
  },
});

export { ObservableArray };

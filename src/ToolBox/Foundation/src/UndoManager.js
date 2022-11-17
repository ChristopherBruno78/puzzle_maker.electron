import { CPObject } from "./CPObject";
import { isFunction } from "./Runtime";

const _UndoManager = CPObject.extend({
  props: {
    canUndo: false,
    canRedo: false,
  },
  init() {
    this._super();
    this.priv.undoStack = [];
    this.priv.redoStack = [];
  },
  addAction(action, undo, name) {
    if (isFunction(action)) {
      action();
    }
    this.priv.undoStack.push({
      action: action,
      undo: undo,
      name: name,
    });
    this.priv.redoStack = [];
    this._update();
  },
  _update() {
    this.canRedo = this.priv.redoStack.length > 0;
    this.canUndo = this.priv.undoStack.length > 0;
  },
  undo() {
    if (this.canUndo) {
      const action = this.priv.undoStack.pop();
      action.undo();
      this.priv.redoStack.push(action);
      this._update();
    }
  },
  redo() {
    if (this.canRedo) {
      const action = this.priv.redoStack.pop();
      action.action();
      this.priv.undoStack.push(action);
      this._update();
    }
  },
  get nextUndoAction() {
    return this.priv.undoStack[this.priv.undoStack.length - 1];
  },
  get nextRedoAction() {
    return this.priv.redoStack[this.priv.redoStack.length - 1];
  },
});

const UndoManager = new _UndoManager();

export { UndoManager };

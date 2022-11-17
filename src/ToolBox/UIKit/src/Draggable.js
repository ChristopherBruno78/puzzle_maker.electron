import { Events, FireEvent } from "./Events";
import { isUndefinedOrNull } from "../../Foundation/src/Runtime";

const Draggable = function (layer, handle, constrain, initEvent) {
  this.dragLayer = layer;
  if (isUndefinedOrNull(handle)) {
    handle = this.dragLayer;
  }

  this.dragHandle = handle;
  this.dragCount = 0;
  this.constrainInsideParent = constrain;
  this.dragHandle.priv.draggable = true;
  this.dragLayer.node.style.position = "absolute";
  if (initEvent) {
    this.pointerDown(initEvent);
  }
  addEventListeners(this);
};

Draggable.prototype.pointerDown = function (evt) {
  this.isPtDown = true;
  const rect = this.dragHandle.node.getBoundingClientRect();
  this.startX = evt.clientX - rect.x;
  this.startY = evt.clientY - rect.y;
  this.dragHandle.node.setPointerCapture(evt.pointerId);
};

Draggable.prototype.pointerUp = function (evt) {
  this.isPtDown = false;
  this.dragHandle.node.releasePointerCapture(evt.pointerId);
  if (this.dragCount >= 0) {
    FireEvent(Events.DragFinish, this.dragLayer);
  }
  this.dragCount = 0;
  this.isDragStarted = false;
};

Draggable.prototype.pointerMove = function (evt) {
  if (this.isPtDown) {
    const $parent = this.dragLayer.node.parentNode;
    const pRect = $parent.getBoundingClientRect();
    let x = evt.clientX - pRect.x - this.startX;
    let y = evt.clientY - pRect.y - this.startY;
    if (this.constrainInsideParent) {
      x = Math.max(
        0,
        Math.min(x, $parent.offsetWidth - this.dragLayer.node.offsetWidth)
      );
      y = Math.max(
        0,
        Math.min(y, $parent.offsetHeight - this.dragLayer.node.offsetHeight - 1)
      );
    }
    this.dragLayer.node.style.left = x + "px";
    this.dragLayer.node.style.top = y + "px";
    this.dragCount++;
    if (this.dragCount) {
      if (!this.isDragStarted) {
        this.isDragStarted = true;
        FireEvent(Events.DragStart, this.dragLayer);
      }
      FireEvent(Events.OnDrag, this.dragLayer);
    }
  }
};

const addEventListeners = function (draggable) {
  const handle = draggable.dragHandle;

  handle.pdl = handle.on(Events.PointerDown, function (evt) {
    evt.preventDefault();
    if (evt.button === 0) {
      draggable.pointerDown(evt);
    }
  });

  handle.pul = handle.on(Events.PointerUp, function (evt) {
    draggable.pointerUp(evt);
  });

  handle.pml = handle.on(Events.PointerMove, function (evt) {
    draggable.pointerMove(evt);
  });
};

const CPMakeDraggable = function (view, handle, constrain, initEvent) {
  if (view.priv.draggable) return;
  return new Draggable(view, handle, constrain, initEvent);
};

const CPRemoveDraggable = function (draggable) {
  if (draggable) {
    const handle = draggable.dragHandle;
    const vNode = draggable.dragLayer.node;
    const hNode = handle.node;
    hNode.classList.remove("tb-draggable");
    handle.priv.draggable = false;
    handle.off(handle.pdl);
    handle.off(handle.pul);
    handle.off(handle.pml);
    handle.off(handle.tdl);
    vNode.style.removeProperty("position");
    vNode.style.removeProperty("top");
    vNode.style.removeProperty("left");
  }
};

export { CPMakeDraggable, CPRemoveDraggable };

import { Events, FireEvent } from "./Events";

import resize_img from "../Themes/images/ResizeIndicator.png";

const Resizable = function (layer, min, max) {
  this.resizeLayer = layer;
  this.minSize = min || { width: 50, height: 50 };
  this.maxSize = max || {
    width: Number.MAX_SAFE_INTEGER,
    height: Number.MAX_SAFE_INTEGER,
  };

  this.resizeLayer.node.classList.add("tb-resizable");

  this.resizeHandle = document.createElement("div");
  this.resizeHandle.className = "tb-Resize-handle";
  this.resizeHandle.style.setProperty("touch-action", "none");
  this.resizeHandle.style.backgroundImage = "url(" + resize_img + ")";

  this.resizeHandle.addEventListener(
    Events.PointerDown,
    (this.resizeHandle.pdl = (evt) => {
      this.resizeHandle.setPointerCapture(evt.pointerId);
      this.ptDown = true;
      const rect = this.resizeHandle.getBoundingClientRect();
      this.startX = evt.clientX - rect.x;
      this.startY = evt.clientY - rect.y;
    })
  );

  this.resizeHandle.addEventListener(
    Events.PointerUp,
    (this.resizeHandle.pul = (evt) => {
      this.ptDown = false;
      this.resizeHandle.releasePointerCapture(evt.pointerId);
      this.dragCount = 0;
      this.dragStarted = false;
      FireEvent(Events.ResizeFinish, this.resizeLayer);
    })
  );

  this.resizeHandle.addEventListener(
    Events.PointerMove,
    (this.resizeHandle.pml = (evt) => {
      if (this.ptDown) {
        let x = evt.clientX + this.startX;
        let y = evt.clientY + this.startY;
        this.resizeLayer.node.style.width =
          Math.max(
            this.minSize.width,
            Math.min(this.maxSize.width, x - this.resizeLayer.node.offsetLeft)
          ) + "px";

        this.resizeLayer.node.style.height =
          Math.max(
            this.minSize.height,
            Math.min(this.maxSize.height, y - this.resizeLayer.node.offsetTop)
          ) + "px";

        this.dragCount++;
        if (!this.dragStarted) {
          this.dragStarted = true;
          FireEvent(Events.ResizeStart, this.resizeLayer);
        } else if (this.dragStarted) {
          FireEvent(Events.OnResize, this.resizeLayer);
        }
      }
    })
  );
  this.resizeLayer.node.appendChild(this.resizeHandle);
};

const CPMakeResizable = function (view, min, max) {
  if (view.node.classList.contains("tb-resizable")) return;
  return new Resizable(view, min, max);
};

const CPRemoveResizable = function (resizable) {
  if (resizable) {
    const handle = resizable.resizeHandle;
    handle.removeEventListener(Events.PointerDown, handle.pdl);
    handle.removeEventListener(Events.PointerUp, handle.pul);
    handle.removeEventListener(Events.PointerMove, handle.pml);
    handle.parentNode.removeChild(handle);
  }
};

export { CPMakeResizable, CPRemoveResizable };

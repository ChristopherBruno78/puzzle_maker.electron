const el = document.createElement("div");

el.id = "text-metrics";
el.style.visibility = "hidden";
el.style.display = "none";
el.style.overflowY = "auto";
el.style.height = "auto";

el.setAttributes({
  ariaHidden: "true",
  role: "none",
});

document.body.appendChild(el);

const TextMetrics = {
  start() {
    el.style.display = "block";
  },
  set className(cn) {
    el.className = cn;
  },
  set text(text) {
    el.innerText = text;
  },
  set width(w) {
    el.style.width = w + "px";
  },
  set height(h) {
    el.style.height = h + "px";
  },
  set lineHeight(lh) {
    this._lh = lh;
    el.style.lineHeight = lh;
  },
  set fontSize(fs) {
    this._fs = fs;
    el.style.fontSize = fs + "px";
  },
  get height() {
    let h = 0;
    const lines = el.innerHTML.split("<br>");
    if (lines.length > 0) {
      h = this._lh * this._fs;
    }
    return el.scrollHeight + h;
  },
  get width() {
    return el.scrollWidth;
  },
  end() {
    el.style.display = "none";
    el.innerText = "";
    el.className = "";
    delete this._lh;
    delete this._fs;
  },
};

export { TextMetrics };

import { View } from "../View";

const ListItem = View.extend({
  ObjName: "ListItem",
  props: {
    content: null,
    list: null,
    index: 0,
  },
  set index(idx) {
    this.priv.index = idx;
  },
  get index() {
    return this.priv.index;
  },
  drawContent() {
    throw new Error("drawContent must be implemented for ListItem");
  },
  renderContent() {
    const views = this.drawContent();
    if (Array.isArray(views)) {
      for (const view of views) {
        this.add(view);
      }
    } else {
      this.add(views);
    }
  },
});

export { ListItem };

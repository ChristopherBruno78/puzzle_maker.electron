import { View } from "./View";
import { Responder } from "../Responder";
import { Events, FireEvent } from "../Events";

const DeckView = Responder.extend({
  ObjName: "DeckView",
  props: {
    index: 0,
    views: [],
  },
  parseProps(props) {
    this.props.index = props.index || 0;
    if (Array.isArray(props.views)) {
      for (const v of props.views) {
        v.$nextResponder = this;
        this.props.views.push(v);
      }
    }
    this._super();
  },
  addChild(view) {
    this.props.views.push(view);
  },
  insert(i, view) {
    this.props.views.insertAt(i, view);
  },
  remove(index) {
    let i = index;
    const views = this.props.views;
    if (index instanceof View) {
      i = views.indexOf(index);
    }
    if (i > -1 && i < views.length) {
      let view = views[i];
      view.removeFromSuperview();
      views.remove(view);
      if (this.props.index === i) {
        this.index = -1;
      }
    }
  },
  _render() {
    this.superview.node.appendChild(
      document.createComment("DeckView-" + this._id)
    );
    this.renderIndex(false);
  },
  renderIndex: function (fireEvent) {
    const superview = this.superview;
    superview.removeAllSubviews();
    superview.add(this.props.views[this.props.index]);
    if (fireEvent) FireEvent(Events.OnChange, this);
  }.observes("index"),
  _fireDidEnterDocument() {
    this.perform("didEnterDocument");
  },
  _fireDidLeaveDocument() {
    this.perform("didLeaveDocument");
  },
});

export { DeckView };

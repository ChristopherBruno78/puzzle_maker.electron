import { Intent } from "../Intent";
import { View } from "../View";
import { ClassNames } from "../utils/ClassNames";
import { Button } from "../Controls/Button/Button";
import { Events, FireEvent } from "../Events";
import { ToasterAnimationState } from "./ToasterAnimationState";

const Toast = View.extend({
  ObjName: "Toast",
  props: {
    intent: Intent.Default,
    icon: null,
    lifespan: 5,
    closable: true,
    content: <div />,
  },
  init(props) {
    console.log("p = ");
    console.log(props);
    this._super({
      role: "dialog",
      ...(props ?? {}),
    });
  },
  className() {
    return ClassNames(
      "tb-Toast",
      {
        intent: this.props.intent !== Intent.Default,
      },
      this.props.intent,
      {
        "tb-Toast--hasIcon": this.props.icon ?? false,
      },
      this._super()
    );
  },
  draw() {
    return (
      <>
        {(this.iconLayer = <i />)}
        <div className={"tb-Toast-content"}>
          {(this.contentLayer = <div className={"message"} />)}
        </div>
        {
          (this.closeBtn = (
            <Button
              intent={this.props.intent}
              className={"close"}
              icon={"icon-times-solid"}
              iconOnly={true}
              onAction={() => {
                this.close(false);
              }}
            />
          ))
        }
      </>
    );
  },
  close(noAnimation) {
    this.node.classList.remove(ToasterAnimationState.Appear);

    if (!noAnimation) {
      this.node.classList.add(ToasterAnimationState.Exit);
      setTimeout(() => {
        if (this.isInDocument) {
          this.node.classList.remove(ToasterAnimationState.Exit);
          this.superview.removeFromSuperview();
          FireEvent(Events.OnClose, this);
        }
      }, 400);
      clearTimeout(this.priv.lst /** life span timer **/);
    } else {
      this.superview.removeFromSuperview();
    }
  },
  renderClose() {
    this.closeBtn.displayed = this.props.closable;
  },
  renderContent() {
    this.contentLayer.removeAllSubviews();
    if (this.props.content) {
      this.contentLayer.add(this.props.content);
    }
  },
  renderIcon() {
    if (this.props.icon) {
      this.iconLayer.displayed = true;
      this.iconLayer.node.className = ClassNames(
        "icon",
        "icon-font",
        this.props.icon
      );
    } else {
      this.iconLayer.displayed = false;
      this.iconLayer.node.removeAttribute("class");
    }
  },
  _fireDidEnterDocument() {
    if (this.props.lifespan > -1) {
      this.priv.lst = setTimeout(() => {
        this.close(false);
      }, this.props.lifespan * 1000);
    }
    this._super();
  },
});

export { Toast };

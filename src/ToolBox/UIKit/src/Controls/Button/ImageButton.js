import { Button } from "./Button";

const ImageButton = Button.extend({
  ObjName: "ImageButton",
  props: {
    imageSize: { width: 48, height: 48 },
    image: null,
  },
  init({ iconOnly, ...props } = {}) {
    this._super({
      iconOnly: true,
      ...(props || {}),
    });
  },
  draw() {
    return (
      <div style={{ justifyContent: "center" }}>
        <img
          alt={this.props.label}
          width={this.props.imageSize.width}
          height={this.props.imageSize.height}
          src={this.props.image}
        />
      </div>
    );
  },
});

export { ImageButton };

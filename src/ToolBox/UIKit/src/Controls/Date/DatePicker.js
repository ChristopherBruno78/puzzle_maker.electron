import { Control } from "../Control";
import { TextField } from "../Text";
import { PopOver } from "../../PopOver/PopOver";
import { PopOverOrientation } from "../../PopOver/PopOverOrientation";
import { CalendarView } from "./CalendarView";
import { isValidDate } from "./util";
import { ClassNames } from "../../utils/ClassNames";
import { Button } from "../Button/Button";
import { Intent } from "../../Intent";
import { RootView } from "../../View/RootView";
import { Events, FireEvent } from "../../Events";

const _CalendarPopOver = PopOver.extend({
  props: {
    datepicker: null,
  },
  init(props) {
    this._super({
      transient: true,
      orientation: PopOverOrientation.Bottom_Center,
      ...(props ?? {}),
    });
  },
  drawContent() {
    const { minDate, maxDate } = this.datepicker.props;
    return (
      <div className={"tb-DatePicker-Calendar"}>
        {
          (this.datepicker.priv.calendar = (
            <CalendarView
              onAction={(sender) => {
                if (this.datepicker.value !== sender.value) {
                  this.datepicker.value = sender.value;
                  FireEvent(Events.OnChange, this.datepicker);
                }
                this.close();
              }}
              minDate={minDate}
              maxDate={maxDate}
            />
          ))
        }
      </div>
    );
  },
});

const DatePicker = Control.extend({
  ObjName: "DatePicker",
  props: {
    editable: true,
    format: "MM/dd/yyyy",
    minDate: null,
    maxDate: null,
  },
  init(props) {
    this._super(props);
    this.priv.input = new TextField({
      mask: "99/99/9999", //TODO: support other date formats, default is MM/dd/YYYY
      delegate: this,
    });
    this.priv.calendarPopOver = new _CalendarPopOver({
      datepicker: this,
    });
  },
  textDidEndEditing() {
    let v = _checkIsValidDate(this.priv.input.value);
    if (v && v !== this.value) {
      this.value = v;
      FireEvent(Events.OnChange, this);
    }
  },
  className() {
    return ClassNames("tb-DatePicker", this._super());
  },
  draw() {
    return (
      <>
        {this.priv.input}
        <Button
          className={"tb-calendar-icon"}
          iconOnly={true}
          icon={"icon-calendar-alt-solid"}
          tooltip={"Show Calendar"}
          intent={Intent.Info}
          onAction={() => this.showCalendar()}
        />
      </>
    );
  },
  showCalendar() {
    const calendarPopOver = this.priv.calendarPopOver;
    let rect = this.priv.input.node.absoluteBounds();
    let offsetY = rect.origin.y + rect.size.height;

    if (
      offsetY + calendarPopOver.node.offsetHeight >
      RootView.node.offsetHeight
    ) {
      calendarPopOver.orientation = PopOverOrientation.Top_Center;
    } else {
      calendarPopOver.orientation = PopOverOrientation.Bottom_Center;
    }

    this.priv.calendar.value = this.value;
    calendarPopOver.show(this, 0, 2);
  },
  hideCalendar() {
    this.priv.calendarPopOver.close();
  },
  renderValue() {
    if (this.props.value) {
      this.priv.input.value = this.props.value.toLocaleString("default", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      });
    }
  },
});

function _checkIsValidDate(text) {
  const d = new Date(text);
  if (isValidDate(d)) {
    return d;
  }
}

export { DatePicker };

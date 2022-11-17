import { Control } from "../Control";
import { ClassNames } from "../../utils/ClassNames";
import { Keys } from "../../utils/keys";
import { EventKeyCode } from "../../Events";
import {
  addDaysToDate,
  addMonthsToDate,
  copyDate,
  getDaysBetween,
  isSameDate,
  isSameMonthAndYear,
  isToday,
  setToFirstDayOfMonth,
} from "./util";
import { Button } from "../Button/Button";
import { ComboBox } from "../ComboBox/ComboBox";

import "./style.less";

const _DateCell = Control.extend({
  props: {
    calendar: null,
    today: false,
    selected: false,
  },
  init(props) {
    this._super({
      tagName: "td",
      ...(props ?? {}),
    });
  },
  className() {
    return ClassNames(
      "tb-Calendar-DayCell",
      {
        "is-today": this.props.today,
        "is-selected": this.props.selected,
      },
      this._super()
    );
  },
  draw() {
    return (this.labelLayer = <label />);
  },
  pointerDown(evt) {
    evt.preventDefault();
  },
  onClick() {
    if (this.disabled) return;
    this.calendar.value = this.value;
    this.calendar.fireAction();
  },
  keyPress(evt) {
    const key = EventKeyCode(evt);
    if (key === Keys.Enter || key === Keys.Space) {
      this.calendar.value = this.value;
      this.calendar.fireAction();
    }
  },
  renderLabO() {
    this.labelLayer.node.innerText = this.value.getDate().toString();
  },
  renderSelected() {
    this.renderClassName();
  },
});

const CalendarView = Control.extend({
  ObjName: "CalendarView",
  props: {
    displayedMonth: new Date(),
    minDate: null,
    maxDate: null,
  },
  init(props) {
    this._super({
      tabindex: -1,
      ...(props ?? {}),
    });
    this.priv.calendarModel = new CalendarModO();
    this.priv.selectedDateCell = null;
  },
  className() {
    return ClassNames("tb-Calendar", "tb-no-outline", this._super());
  },
  draw() {
    return (
      <>
        <div className={"tb-Calendar-Controls"}>
          {
            (this.prevBtn = (
              <Button
                className={"prevMonth"}
                iconOnly={true}
                icon={"icon-angle-left-regular"}
                onAction={() => {
                  let prevMonth = copyDate(this.displayedMonth);
                  addMonthsToDate(prevMonth, -1);
                  this.displayedMonth = prevMonth;
                }}
              />
            ))
          }
          {
            (this.monthSelect = (
              <ComboBox
                onAction={() => {
                  let nextMonth = copyDate(this.displayedMonth);
                  let index = this.monthSelect.selectedIndex;
                  nextMonth.setMonth(index);
                  setToFirstDayOfMonth(nextMonth);
                  this.displayedMonth = nextMonth;
                }}
                options={this.priv.calendarModel.monthOfYearNames}
              />
            ))
          }
          {
            (this.yearSelect = (
              <ComboBox
                onAction={() => {
                  let nextMonth = copyDate(this.displayedMonth);
                  let year = parseInt(this.yearSelect.value, 10);
                  nextMonth.setFullYear(year);
                  setToFirstDayOfMonth(nextMonth);
                  this.displayedMonth = nextMonth;
                }}
              />
            ))
          }
          {
            (this.nextBtn = (
              <Button
                className={"nextMonth"}
                icon={"icon-angle-right-regular"}
                iconOnly={true}
                onAction={() => {
                  let nextMonth = copyDate(this.displayedMonth);
                  addMonthsToDate(nextMonth, 1);
                  this.displayedMonth = nextMonth;
                }}
              />
            ))
          }
        </div>
      </>
    );
  },
  renderDisplayedMonth() {
    const { minDate, maxDate } = this.props;
    const displayedMonth = copyDate(this.displayedMonth);
    this.priv.calendarModel.setCurrentMonth(displayedMonth);

    this.displayedMonthLayer?.removeFromSuperview();
    this.dateCellCache = [];

    let i = 0;
    let weeks = [];
    let month = displayedMonth;
    let day = this.priv.calendarModel.getCurrentFirstDayOfFirstWeek();

    for (; i < 6; i++) {
      let week = [];
      let j = 0;
      for (; j < 7; j++) {
        let d = copyDate(day);
        let isDisabled = d.getMonth() !== month.getMonth();
        if (!isDisabled) {
          isDisabled = getDaysBetween(d, minDate) < 0;
        }
        if (!isDisabled) {
          isDisabled = getDaysBetween(d, maxDate) > 0;
        }

        let cell = new _DateCell({
          calendar: this,
          today: isToday(d),
          disabled: isDisabled || this.props.disabled,
          value: d,
        });

        week.push(cell);
        this.dateCellCache.push(cell);
        addDaysToDate(day, 1);
      }

      weeks.push(O("tr", null, ...week));
    }

    weeks.insertAt(
      0,
      O(
        "tr",
        { className: "tb-Calendar-DayLabel" },
        O("td", null, "Sun"),
        O("td", null, "Mon"),
        O("td", null, "Tue"),
        O("td", null, "Wed"),
        O("td", null, "Thur"),
        O("td", null, "Fri"),
        O("td", null, "Sat")
      )
    );
    this.displayedMonthLayer = <table className={"tb-Month"} />;
    this.displayedMonthLayer.add(...weeks);
    this.add(this.displayedMonthLayer);
    this.monthSelect.selectedIndex = displayedMonth.getMonth();
    this.yearSelect.selectedIndex = this.yearSelect.options.indexOf(
      displayedMonth.getFullYear()
    );
  },
  renderValue() {
    if (this.value && !isSameMonthAndYear(this.value, this.displayedMonth)) {
      this.displayedMonth = this.value;
    }
    const selectedCell = this.priv.selectedDateCell;
    for (const dateCell of this.dateCellCache) {
      if (isSameDate(this.value, dateCell.value)) {
        if (selectedCell) {
          selectedCell.selected = false;
        }
        this.priv.selectedDateCell = dateCell;
        this.priv.selectedDateCell.selected = true;
      }
    }
  },
  renderYears: function () {
    this.yearSelect.options = _getAvailableYears(this);
    this.yearSelect.selectedIndex = this.yearSelect.options.indexOf(
      this.displayedMonth.getFullYear()
    );
  }.observes("minDate", "maxDate", "value"),
});

function _getAvailableYears(calendarView) {
  let value = calendarView.value ?? new Date();

  let start = value.getFullYear() - 10;
  if (calendarView.minDate) {
    start = Math.min(calendarView.minDate.getFullYear(), start);
  }
  let end = value.getFullYear() + 10;
  if (calendarView.maxDate) {
    end = Math.max(calendarView.maxDate.getFullYear(), end);
  }
  const years = [];
  for (; start <= end; start++) {
    years.push(start);
  }
  return years;
}

export { CalendarView };

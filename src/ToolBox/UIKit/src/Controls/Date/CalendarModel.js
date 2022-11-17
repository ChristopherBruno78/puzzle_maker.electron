import {
  addDaysToDate,
  getStartingDayOfWeek,
  setToFirstDayOfMonth,
} from "./util";

const WEEKS_IN_MONTH = 6;
const DAYS_IN_WEEK = 7;
const MONTHS_IN_YEAR = 12;
const MAX_DAYS_IN_MONTH = 32;

function CalendarModel() {
  this.currentMonth = new Date();
  setToFirstDayOfMonth(this.currentMonth);

  const dayOfWeekNames = [];
  const dayOfMonthNames = [];
  const monthOfYearNames = [];

  // Finding day of week names
  let date = new Date();
  for (let i = 1; i <= DAYS_IN_WEEK; i++) {
    date.setDate(i);
    let dayOfWeek = date.getDay();
    dayOfWeekNames[dayOfWeek] = date.toLocaleString("default", {
      weekday: "short",
    });
  }

  // Finding day of month names
  date.setMonth(1);
  for (let i = 1; i < MAX_DAYS_IN_MONTH; ++i) {
    date.setDate(i);
    dayOfMonthNames.push(date.toLocaleString("default", { day: "numeric" }));
  }
  // finding month names
  date.setDate(1);
  for (let i = 0; i < MONTHS_IN_YEAR; i++) {
    date.setMonth(i);
    monthOfYearNames.push(date.toLocaleString("default", { month: "long" }));
  }

  this.dayOfWeekNames = dayOfWeekNames;
  this.dayOfMonthNams = dayOfMonthNames;
  this.monthOfYearNames = monthOfYearNames;
}

CalendarModel.prototype.getCurrentFirstDayOfFirstWeek = function () {
  let wkDayOfMonth1st = this.currentMonth.getDay();
  let start = getStartingDayOfWeek();
  if (wkDayOfMonth1st === start) {
    // always return a copy to allow SimpleCalendarView to adjust first
    // display date
    return new Date(this.currentMonth.getTime());
  } else {
    let d = new Date(this.currentMonth.getTime());
    let offset =
      wkDayOfMonth1st - start > 0
        ? wkDayOfMonth1st - start
        : DAYS_IN_WEEK - (start - wkDayOfMonth1st);
    addDaysToDate(d, -offset);
    return d;
  }
};

CalendarModel.prototype.setCurrentMonth = function (date) {
  this.currentMonth.setMonth(date.getMonth());
  this.currentMonth.setFullYear(date.getFullYear());
};

export {
  CalendarModel,
  WEEKS_IN_MONTH,
  DAYS_IN_WEEK,
  MONTHS_IN_YEAR,
  MAX_DAYS_IN_MONTH,
};

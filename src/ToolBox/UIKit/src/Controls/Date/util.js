const firstDayOfWeekend = 6;
const lastDayOfWeekend = 0;
const startingDay = 0;

export const isValidDate = function (date) {
  return !isNaN(date.getTime());
};

/**
 * Adds the given number of days to a date.
 *
 * @param date
 * @param days number of days
 */
export function addDaysToDate(date, days) {
  date.setDate(date.getDate() + days);
}

/**
 * gets the number of days in a given year, month
 * @param year
 * @param month
 * @returns {number|number}
 */
function getDaysInMonth(year, month) {
  return [
    31,
    isLeapYear(year) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ][month];
}

/**
 * Returns boolean testing for a leap year
 * @param year
 * @returns {boolean}
 */
export function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Adds the given number of months to a date.
 *
 * @param date   the date
 * @param months number of months
 */
export function addMonthsToDate(date, months) {
  if (months !== 0) {
    let n = date.getDate();
    date.setDate(1);
    date.setMonth(date.getMonth() + months);
    date.setDate(
      Math.min(n, getDaysInMonth(date.getFullYear(), date.getMonth()))
    );
    return date;
  }
}

/**
 * Adds the given number of years to a date.
 *
 * @param date  the date
 * @param years number of years
 */
export function addYearsToDate(date, years) {
  if (years !== 0) {
    let year = date.getFullYear();
    year += years;
    date.setFullYear(year);
  }
}

/**
 * Copies a date.
 *
 * @param date the date
 * @return the copy
 */
export function copyDate(date) {
  if (!date) {
    return null;
  }
  let newDate = new Date();
  newDate.setTime(date.getTime());
  return newDate;
}

/**
 * Returns the date that occurs first
 *
 * @param date1
 * @param date2
 * @return Date
 */
export function getEarliest(date1, date2) {
  if (getDaysBetween(date1, date2) < 0) {
    return date2;
  }

  return date1;
}

/**
 * Returns the date that occurs last
 *
 * @param date1
 * @param date2
 * @return Date
 */
export function getLatest(date1, date2) {
  if (getDaysBetween(date1, date2) > 0) {
    return date2;
  }

  return date1;
}

/**
 * Returns the number of days between the two dates. Time is ignored.
 *
 * @param start  starting date
 * @param finish ending date
 * @return the different
 */
export function getDaysBetween(start, finish) {
  if (start == null || finish == null) {
    return 0;
  }

  // Convert the dates to the same time
  start = copyDate(start);
  resetTime(start);
  finish = copyDate(finish);
  resetTime(finish);

  let aTime = start.getTime();
  let bTime = finish.getTime();

  // long adjust = 60 * 60 * 1000;
  // adjust = (bTime > aTime) ? adjust : -adjust;

  return (aTime - bTime) / (24 * 60 * 60 * 1000);
}

/**
 * Returns the day of the week on which week starts in the current locale. The range between 0 for
 * Sunday and 6 for Saturday.
 *
 * @return the day of the week
 */
export function getStartingDayOfWeek() {
  return startingDay;
}

/**
 * Check if two dates represent the same date of the same year, even if they have different times.
 *
 * @param date0 a date
 * @param date1 a second date
 * @return true if the dates are the same
 */
export function isSameDate(date0, date1) {
  if (date0 == null || date1 == null) {
    return false;
  }

  return (
    date0.getFullYear() === date1.getFullYear() &&
    date0.getMonth() === date1.getMonth() &&
    date0.getDate() === date1.getDate()
  );
}

export function isSameMonthAndYear(date0, date1) {
  if (date0 == null || date1 == null) {
    return false;
  }
  return (
    date0.getFullYear() === date1.getFullYear() &&
    date0.getMonth() === date1.getMonth()
  );
}

/**
 * Sets a date object to be at the beginning of the month and no time specified.
 *
 * @param date the date
 */
export function setToFirstDayOfMonth(date) {
  resetTime(date);
  date.setDate(1);
}

/**
 * Is a day in the week a weekend?
 *
 * @param dayOfWeek day of week
 * @return is the day of week a weekend?
 */
export function isWeekend(dayOfWeek) {
  return dayOfWeek === firstDayOfWeekend || dayOfWeek === lastDayOfWeekend;
}

export function isToday(date) {
  const today = new Date();
  return (
    today.getMonth() === date.getMonth() &&
    today.getFullYear() === date.getFullYear() &&
    today.getDate() === date.getDate()
  );
}

/**
 * Resets the date to have no time modifiers. Note that the hour might not be zero if the time
 * hits a DST transition date.
 *
 * @param date the date
 */
export function resetTime(date) {
  const msec = resetMilliseconds(date.getTime());
  date.setTime(msec);
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
}

export function resetMilliseconds(msec) {
  let offset = msec % 1000;
  // Normalize if time is before epoch
  if (offset < 0) {
    offset += 1000;
  }
  return msec - offset;
}

export function getFirstDayOfCurrentMonth() {
  let d = new Date();
  setToFirstDayOfMonth(d);
  return d;
}

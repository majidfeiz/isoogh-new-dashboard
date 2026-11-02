import DateObject from "react-date-object";
import gregorian from "react-date-object/calendars/gregorian";
import persian from "react-date-object/calendars/persian";
import persianFa from "react-date-object/locales/persian_fa";
import moment from "moment";

const TEHRAN_OFFSET = "+03:30";
const ISO_BOUNDARY = /^\d{4}-\d{2}-\d{2}T00:00:00(?:\.000)?\+03:30$/;
const latinDigits = (value) => String(value || "")
  .replace(/[۰-۹]/g, (digit) => "۰۱۲۳۴۵۶۷۸۹".indexOf(digit))
  .replace(/[٠-٩]/g, (digit) => "٠١٢٣٤٥٦٧٨٩".indexOf(digit));

const addDays = (date, days) => {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
};

const toGregorianDate = (value) => latinDigits(new DateObject(value).convert(gregorian).format("YYYY-MM-DD"));
const boundary = (date) => `${date}T00:00:00.000${TEHRAN_OFFSET}`;

export const isValidCallQueueRange = ({ from, to } = {}) =>
  Boolean(from && to && ISO_BOUNDARY.test(from) && ISO_BOUNDARY.test(to) && moment.parseZone(from).valueOf() < moment.parseZone(to).valueOf());

export function callQueueRangeFromDates(values) {
  if (!Array.isArray(values) || !values[0] || values.length > 2) return null;
  const dates = [toGregorianDate(values[0]), toGregorianDate(values[1] || values[0])].sort();
  return { from: boundary(dates[0]), to: boundary(addDays(dates[1], 1)) };
}

export function callQueueRangeToDates(range) {
  if (!isValidCallQueueRange(range)) return [];
  const toPersian = (date) => new DateObject({ date, format: "YYYY-MM-DD", calendar: gregorian }).convert(persian).setLocale(persianFa);
  return [toPersian(range.from.slice(0, 10)), toPersian(addDays(range.to.slice(0, 10), -1))];
}

export function formatCallQueueRange(range) {
  const dates = callQueueRangeToDates(range);
  if (!dates.length) return "همه زمان‌ها";
  const [from, to] = dates.map((date) => date.format("YYYY/MM/DD"));
  return from === to ? from : `${from} تا ${to}`;
}

const tehranToday = (now) => moment(now).utcOffset(210).format("YYYY-MM-DD");

export function callQueueRangePreset(name, now = Date.now()) {
  const today = tehranToday(now);
  if (name === "today") return { from: boundary(today), to: boundary(addDays(today, 1)) };
  if (name === "7days") return { from: boundary(addDays(today, -6)), to: boundary(addDays(today, 1)) };
  if (name === "month") {
    const current = new DateObject({ date: today, format: "YYYY-MM-DD", calendar: gregorian }).convert(persian);
    const start = toGregorianDate(new DateObject({ year: current.year, month: current.month.number, day: 1, calendar: persian }));
    const nextMonth = current.month.number === 12
      ? new DateObject({ year: current.year + 1, month: 1, day: 1, calendar: persian })
      : new DateObject({ year: current.year, month: current.month.number + 1, day: 1, calendar: persian });
    return { from: boundary(start), to: boundary(toGregorianDate(nextMonth)) };
  }
  return { from: null, to: null };
}


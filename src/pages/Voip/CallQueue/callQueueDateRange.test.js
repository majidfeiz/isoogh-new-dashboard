import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import { callQueueRangeFromDates, callQueueRangePreset, callQueueRangeToDates, formatCallQueueRange, isValidCallQueueRange } from "./callQueueDateRange.js";

const jalali = (date) => new DateObject({ date, format: "YYYY/MM/DD", calendar: persian });

test("converts one full Jalali day to Tehran ISO boundaries with an exclusive end", () => {
  expect(callQueueRangeFromDates([jalali("1405/08/10")])).toEqual({
    from: "2026-11-01T00:00:00.000+03:30",
    to: "2026-11-02T00:00:00.000+03:30",
  });
});

test("a multi-day range includes the entire selected last day", () => {
  const range = callQueueRangeFromDates([jalali("1405/08/10"), jalali("1405/08/12")]);
  expect(range).toEqual({ from: "2026-11-01T00:00:00.000+03:30", to: "2026-11-04T00:00:00.000+03:30" });
  expect(formatCallQueueRange(range)).toBe("۱۴۰۵/۰۸/۱۰ تا ۱۴۰۵/۰۸/۱۲");
});

test("restores the Persian picker values from URL ISO boundaries", () => {
  const values = callQueueRangeToDates({ from: "2026-11-01T00:00:00.000+03:30", to: "2026-11-02T00:00:00.000+03:30" });
  expect(values.map((value) => value.format("YYYY/MM/DD"))).toEqual(["۱۴۰۵/۰۸/۱۰", "۱۴۰۵/۰۸/۱۰"]);
});

test("rejects partial, reversed and date-only API ranges", () => {
  expect(isValidCallQueueRange({ from: "2026-11-01T00:00:00.000+03:30", to: null })).toBe(false);
  expect(isValidCallQueueRange({ from: "2026-11-02T00:00:00.000+03:30", to: "2026-11-01T00:00:00.000+03:30" })).toBe(false);
  expect(isValidCallQueueRange({ from: "2026-11-01", to: "2026-11-02" })).toBe(false);
});

test("today and seven-day shortcuts use Tehran calendar days", () => {
  const now = Date.parse("2026-11-01T20:45:00.000Z");
  expect(callQueueRangePreset("today", now)).toEqual({ from: "2026-11-02T00:00:00.000+03:30", to: "2026-11-03T00:00:00.000+03:30" });
  expect(callQueueRangePreset("7days", now)).toEqual({ from: "2026-10-27T00:00:00.000+03:30", to: "2026-11-03T00:00:00.000+03:30" });
});


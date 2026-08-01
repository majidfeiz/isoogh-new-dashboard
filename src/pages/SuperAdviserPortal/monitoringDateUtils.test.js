import {
  formatMonitoringDate,
  monitoringApiDate,
  monitoringDateObject,
} from "./monitoringDateUtils.js";

test("shows the monitoring filter date in Jalali and keeps Gregorian API format", () => {
  const pickerValue = monitoringDateObject("2026-08-01");
  expect(pickerValue.format("YYYY/MM/DD")).toBe("۱۴۰۵/۰۵/۱۰");
  expect(monitoringApiDate(pickerValue)).toBe("2026-08-01");
  expect(formatMonitoringDate("2026-08-01")).toBe("۱۴۰۵/۰۵/۱۰");
});

test("handles an empty monitoring date", () => {
  expect(monitoringDateObject("")).toBeNull();
  expect(monitoringApiDate(null)).toBe("");
  expect(formatMonitoringDate("")).toBe("—");
});

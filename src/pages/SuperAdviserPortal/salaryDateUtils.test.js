import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import {
  buildSalaryRequestFilters,
  effectiveSalaryRangeLabel,
  salaryRangeParams,
} from "./salaryDateUtils.js";

test("converts a Jalali range to Tehran ISO boundaries with an exclusive end", () => {
  const range = [
    new DateObject({ date: "1405/07/01", format: "YYYY/MM/DD", calendar: persian }),
    new DateObject({ date: "1405/07/30", format: "YYYY/MM/DD", calendar: persian }),
  ];
  const params = salaryRangeParams(range);
  expect(params).toEqual({
    from: "2026-09-23T00:00:00.000+03:30",
    to: "2026-10-23T00:00:00.000+03:30",
  });
  expect(new URLSearchParams(params).toString()).toContain("%2B03%3A30");
});

test("custom range replaces year/month and clearing it restores the monthly fallback", () => {
  const range = [
    new DateObject({ date: "1405/07/01", format: "YYYY/MM/DD", calendar: persian }),
    new DateObject({ date: "1405/07/30", format: "YYYY/MM/DD", calendar: persian }),
  ];
  expect(buildSalaryRequestFilters({
    year: 1405, month: 7, dateRange: range, adviserId: "2", supportFormId: "10",
  })).toEqual({
    from: "2026-09-23T00:00:00.000+03:30",
    to: "2026-10-23T00:00:00.000+03:30",
    adviserId: "2",
    supportFormId: "10",
  });
  expect(buildSalaryRequestFilters({
    year: 1405, month: 7, dateRange: [], adviserId: "", supportFormId: "",
  })).toEqual({ year: 1405, month: 7, adviserId: "", supportFormId: "" });
});

test("uses effective response boundaries as the displayed Jalali report range", () => {
  expect(effectiveSalaryRangeLabel(
    "2026-09-23T00:00:00+03:30",
    "2026-10-23T00:00:00+03:30"
  )).toBe("۱۴۰۵/۰۷/۰۱ تا ۱۴۰۵/۰۷/۳۰");
  expect(effectiveSalaryRangeLabel(
    "2026-09-22T20:30:00.000Z",
    "2026-10-22T20:30:00.000Z"
  )).toBe("۱۴۰۵/۰۷/۰۱ تا ۱۴۰۵/۰۷/۳۰");
});

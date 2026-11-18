import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import { errorState, formatData, importLogDatePickerValue, importLogDateToIso, mergeQuery, paramsToObject, progressPercent } from "./importLogUtils.js";

describe("import log utilities", () => {
  test("syncs allowlisted filters from URL and keeps latin API values", () => {
    const params = new URLSearchParams("status=failed&page=3&rowNumber=۱۲&ignored=x");
    expect(paramsToObject(params, ["status", "page"])).toEqual({ status: "failed", page: "3" });
  });

  test("changing a filter resets page while pagination preserves it", () => {
    expect(mergeQuery("page=4&status=success", { status: "failed" }).get("page")).toBeNull();
    expect(mergeQuery("page=4", { page: 5 }, false).get("page")).toBe("5");
  });

  test("guards progress division by zero", () => {
    expect(progressPercent(4, 0)).toBe(0);
    expect(progressPercent(5, 10)).toBe(50);
  });

  test("renders JSON, legacy text, scalar and null safely", () => {
    expect(formatData({ html: "<b>x</b>" })).toContain('"html": "<b>x</b>"');
    expect(formatData("legacy text")).toBe("legacy text");
    expect(formatData(12)).toBe("12");
    expect(formatData(null)).toBe("null");
  });

  test("has independent 403 and scoped 404 states", () => {
    expect(errorState({ response: { status: 403 } }).status).toBe(403);
    expect(errorState({ response: { status: 404 } }, true).message).toBe("رکورد یافت نشد یا دسترسی ندارید.");
  });

  test("converts a Jalali day to Tehran midnight ISO and restores it for the picker", () => {
    const jalali = new DateObject({ date: "1405/08/10", format: "YYYY/MM/DD", calendar: persian });
    const iso = importLogDateToIso(jalali);
    expect(iso).toBe("2026-10-31T20:30:00.000Z");
    expect(importLogDatePickerValue(iso).format("YYYY/MM/DD")).toBe("۱۴۰۵/۰۸/۱۰");
  });

  test("clears invalid or empty import-log dates instead of sending malformed values", () => {
    expect(importLogDateToIso(null)).toBe("");
    expect(importLogDatePickerValue("not-a-date")).toBeNull();
  });
});

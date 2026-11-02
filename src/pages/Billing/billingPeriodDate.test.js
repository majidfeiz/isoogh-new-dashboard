import { formatBillingDateOnly, formatBillingDateOnlyLabel, formatBillingPeriodRange, parseBillingDateOnly } from "./billingPeriodDate.js";

test("parses date-only values without constructing a timezone-aware Date", () => {
  expect(parseBillingDateOnly("2026-09-23")).toEqual({ year: 2026, month: 9, day: 23 });
  expect(formatBillingDateOnly("2026-09-23")).toMatch(/۰۰:۰۰$/);
  expect(formatBillingDateOnly("2026-09-23")).not.toContain("۰۳:۳۰");
});

test("renders a billing month explicitly from start-of-day through end-of-day", () => {
  const range = formatBillingPeriodRange("2026-09-23", "2026-10-22");
  expect(range).toMatch(/۰۰:۰۰ تا .*۲۳:۵۹$/);
  expect(range).not.toContain("۰۳:۳۰");
});

test("does not parse timestamps or invalid date-only values implicitly", () => {
  expect(formatBillingDateOnly("2026-09-23T00:00:00.000Z")).toBe("—");
  expect(formatBillingDateOnly(null)).toBe("—");
});

test("renders invoice header date-only values without an artificial Tehran time", () => {
  const label = formatBillingDateOnlyLabel("2026-11-02");
  expect(label).toBe("۱۴۰۵/۰۸/۱۱");
  expect(label).not.toMatch(/۰۳:۳۰|۰۰:۰۰/);
});

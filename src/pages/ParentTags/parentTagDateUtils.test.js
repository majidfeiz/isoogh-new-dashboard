import { formatParentTagJalaliDateTime } from "./parentTagDateUtils.js"

test("formats parent tag creation timestamps as Jalali date and time", () => {
  expect(formatParentTagJalaliDateTime("2025-03-20T10:15:00")).toBe("1403/12/30 10:15")
})

test("handles missing and invalid parent tag timestamps", () => {
  expect(formatParentTagJalaliDateTime(null)).toBe("—")
  expect(formatParentTagJalaliDateTime("not-a-date")).toBe("not-a-date")
})

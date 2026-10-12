import { createDefaultJalaliMonthRange, previousJalaliMonthDate } from "./jalaliDateOnly.js"

test("uses Tehran today and one calendar Jalali month before it", () => {
  expect(createDefaultJalaliMonthRange("Asia/Tehran", new Date("2026-10-12T12:00:00.000Z"))).toEqual({
    startDate: "1405/06/20", endDate: "1405/07/20",
  })
})

test("Tehran timezone controls today across the UTC day boundary", () => {
  expect(createDefaultJalaliMonthRange("Asia/Tehran", new Date("2026-10-11T21:00:00.000Z")).endDate).toBe("1405/07/20")
})

test.each([
  [{ year: 1405, month: 1, day: 31 }, { year: 1404, month: 12, day: 29 }],
  [{ year: 1404, month: 1, day: 30 }, { year: 1403, month: 12, day: 30 }],
  [{ year: 1405, month: 7, day: 31 }, { year: 1405, month: 6, day: 31 }],
])("subtracts a calendar month and clamps at Esfand/year boundaries", (today, expected) => {
  expect(previousJalaliMonthDate(today)).toEqual(expected)
})

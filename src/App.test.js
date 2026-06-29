import { toGregorian } from "jalaali-js"

// Tests for Tehran timezone ISO string builder (used in VoIP Analytics)
function toIso(date, endOfDay = false) {
  return `${date}T${endOfDay ? "23:59:59" : "00:00:00"}+03:30`
}

function jalaliToTehranISO(jy, jm, jd, endOfDay = false) {
  const { gy, gm, gd } = toGregorian(jy, jm, jd)
  const pad = (n) => String(n).padStart(2, "0")
  const time = endOfDay ? "23:59:59" : "00:00:00"
  return `${gy}-${pad(gm)}-${pad(gd)}T${time}+03:30`
}

test("toIso appends Tehran offset to YYYY-MM-DD", () => {
  expect(toIso("2026-06-22")).toBe("2026-06-22T00:00:00+03:30")
  expect(toIso("2026-06-22", true)).toBe("2026-06-22T23:59:59+03:30")
})

test("jalaliToTehranISO converts Jalali date to Gregorian ISO with Tehran offset", () => {
  // 1405/04/01 → 2026-06-22
  expect(jalaliToTehranISO(1405, 4, 1)).toBe("2026-06-22T00:00:00+03:30")
  // 1405/04/31 → 2026-07-22
  expect(jalaliToTehranISO(1405, 4, 31, true)).toBe("2026-07-22T23:59:59+03:30")
})

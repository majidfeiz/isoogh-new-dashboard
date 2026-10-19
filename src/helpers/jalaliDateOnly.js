import DateObject from "react-date-object"
import persian from "react-date-object/calendars/persian"
import persianFa from "react-date-object/locales/persian_fa"
import { jalaaliMonthLength } from "jalaali-js"

export const toLatinDigits = (value) => String(value ?? "")
  .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
  .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))

export function normalizeJalaliDateOnly(value) {
  if (!value) return ""
  if (typeof value === "object" && value.year && value.month && value.day) {
    const month = value.month?.number ?? value.month
    return `${toLatinDigits(value.year).padStart(4, "0")}/${toLatinDigits(month).padStart(2, "0")}/${toLatinDigits(value.day).padStart(2, "0")}`
  }
  const normalized = toLatinDigits(value).trim().replace(/-/g, "/")
  if (!/^\d{4}\/\d{2}\/\d{2}$/.test(normalized)) return ""
  const parsed = new DateObject({ date: normalized, format: "YYYY/MM/DD", calendar: persian })
  return parsed.isValid ? normalized : ""
}

export function jalaliDateObject(value) {
  const normalized = normalizeJalaliDateOnly(value)
  if (!normalized) return null
  return new DateObject({ date: normalized, format: "YYYY/MM/DD", calendar: persian }).setLocale(persianFa)
}

export const isJalaliDateRangeValid = (start, end) => {
  const from = normalizeJalaliDateOnly(start)
  const to = normalizeJalaliDateOnly(end)
  return !from || !to || from <= to
}

const padDatePart = (value) => String(value).padStart(2, "0")

export function previousJalaliMonthDate({ year, month, day }) {
  const targetMonth = month === 1 ? 12 : month - 1
  const targetYear = month === 1 ? year - 1 : year
  return {
    year: targetYear,
    month: targetMonth,
    day: Math.min(day, jalaaliMonthLength(targetYear, targetMonth)),
  }
}

export function createDefaultJalaliMonthRange(timeZone = "Asia/Tehran", now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US-u-ca-persian", {
    timeZone, year: "numeric", month: "numeric", day: "numeric",
  }).formatToParts(now)
  const value = (type) => Number(parts.find((part) => part.type === type)?.value)
  const end = { year: value("year"), month: value("month"), day: value("day") }
  if (!end.year || !end.month || !end.day) throw new Error("محاسبه تاریخ امروز تهران ناموفق بود")
  const start = previousJalaliMonthDate(end)
  const format = (date) => `${date.year}/${padDatePart(date.month)}/${padDatePart(date.day)}`
  return { startDate: format(start), endDate: format(end) }
}

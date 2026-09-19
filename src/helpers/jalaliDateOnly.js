import DateObject from "react-date-object"
import persian from "react-date-object/calendars/persian"
import persianFa from "react-date-object/locales/persian_fa"

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

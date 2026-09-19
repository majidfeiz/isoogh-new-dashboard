import moment from "moment-jalaali"

export function formatParentTagJalaliDateTime(value) {
  if (!value) return "—"
  const nativeDate = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(nativeDate.getTime())) return String(value)
  return moment(nativeDate).format("jYYYY/jMM/jDD HH:mm")
}

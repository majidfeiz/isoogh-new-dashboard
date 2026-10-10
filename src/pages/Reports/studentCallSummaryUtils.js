import { toGregorian } from "jalaali-js"

export const STUDENT_CALL_SUMMARY_SORT_FIELDS = [
  "username", "studentName", "totalConversationSeconds", "totalCalls",
  "successfulCalls", "unsuccessfulCalls", "adviserName",
]
export const STUDENT_CALL_SUMMARY_DEBOUNCE_MS = 400

export const defaultStudentCallSummaryQuery = () => ({
  schoolId: "", from: "", to: "", search: "", page: 1, limit: 10,
  sortBy: "studentName", sortOrder: "ASC",
})

export function parseStudentCallSummaryQuery(params) {
  const defaults = defaultStudentCallSummaryQuery()
  const page = Number(params.get("page"))
  const limit = Number(params.get("limit"))
  const sortBy = params.get("sortBy")
  const sortOrder = params.get("sortOrder")
  const from = params.get("from") || ""
  const to = params.get("to") || ""
  return {
    ...defaults,
    schoolId: params.get("schoolId") || "",
    from: from && to ? from : "",
    to: from && to ? to : "",
    search: params.get("search") || "",
    page: Number.isInteger(page) && page > 0 ? page : 1,
    limit: [10, 25, 50, 100].includes(limit) ? limit : 10,
    sortBy: STUDENT_CALL_SUMMARY_SORT_FIELDS.includes(sortBy) ? sortBy : defaults.sortBy,
    sortOrder: ["ASC", "DESC"].includes(sortOrder) ? sortOrder : defaults.sortOrder,
  }
}

export function serializeStudentCallSummaryQuery(query) {
  const params = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value !== "" && value != null) params.set(key, String(value))
  })
  return params
}

const pad = (value) => String(value).padStart(2, "0")
export function jalaliDateToTehranIso(dateObject, addDays = 0) {
  if (!dateObject) return ""
  const gregorian = toGregorian(dateObject.year, dateObject.month.number, dateObject.day)
  const date = new Date(Date.UTC(gregorian.gy, gregorian.gm - 1, gregorian.gd + addDays))
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}T00:00:00+03:30`
}

export function buildStudentCallSummaryRange(fromDate, toDate) {
  if (!fromDate && !toDate) return { from: "", to: "", error: "" }
  if (!fromDate || !toDate) return { from: "", to: "", error: "هر دو تاریخ شروع و پایان را انتخاب کنید." }
  const from = jalaliDateToTehranIso(fromDate)
  const to = jalaliDateToTehranIso(toDate, 1)
  if (Date.parse(from) >= Date.parse(to)) return { from: "", to: "", error: "تاریخ شروع نمی‌تواند بعد از تاریخ پایان باشد." }
  return { from, to, error: "" }
}

export function formatStudentCallDuration(value) {
  const seconds = Math.max(0, Math.floor(Number(value) || 0))
  return [Math.floor(seconds / 3600), Math.floor((seconds % 3600) / 60), seconds % 60]
    .map((part) => String(part).padStart(2, "0")).join(":")
}

export const studentCallSummaryErrorMessage = (error) => {
  const status = error?.response?.status
  if (status === 403) return "شما اجازه مشاهده این گزارش را ندارید."
  if (status === 400) return "بازه زمانی یا ورودی‌های گزارش معتبر نیستند."
  return "دریافت گزارش با خطا مواجه شد. لطفاً دوباره تلاش کنید."
}

export const rowNumber = (page, limit, rowIndex) => (page - 1) * limit + rowIndex + 1

export function logInconsistentCallTotals(items = [], logger = console.error) {
  items.forEach((item) => {
    if (Number(item.successfulCalls) + Number(item.unsuccessfulCalls) !== Number(item.totalCalls)) {
      logger("[student-call-summary] inconsistent call totals", { studentId: item.studentId })
    }
  })
  return items
}

export function saveStudentCallSummaryBlob(blob, documentRef = document, urlApi = window.URL) {
  const url = urlApi.createObjectURL(blob)
  const link = documentRef.createElement("a")
  link.href = url
  link.download = "student-call-summary.xlsx"
  documentRef.body.appendChild(link)
  link.click()
  link.remove()
  urlApi.revokeObjectURL(url)
}

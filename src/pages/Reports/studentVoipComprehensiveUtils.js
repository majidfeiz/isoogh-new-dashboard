import moment from "moment-jalaali"

export const STUDENT_VOIP_SORT_FIELDS = [
  "studentName", "username", "phone", "ssn", "province", "gender",
  "successfulDurationSeconds", "successfulCalls", "avgSuccessfulDurationSeconds",
  "successfulRatioPercent", "totalCalls", "adviserName", "headAdviserName",
]
export const STUDENT_VOIP_DEBOUNCE_MS = 400

export function defaultStudentVoipQuery() {
  return {
    formId: "",
    from: moment().startOf("jMonth").format("YYYY-MM-DD"),
    to: moment().endOf("jMonth").format("YYYY-MM-DD"),
    schoolId: "",
    search: "",
    page: 1,
    limit: 10,
    sortBy: "studentName",
    sortOrder: "ASC",
  }
}

export function parseStudentVoipQuery(params) {
  const defaults = defaultStudentVoipQuery()
  const page = Number(params.get("page"))
  const limit = Number(params.get("limit"))
  const sortBy = params.get("sortBy")
  const sortOrder = params.get("sortOrder")
  return {
    formId: params.get("formId") || "",
    from: params.get("from") || defaults.from,
    to: params.get("to") || defaults.to,
    schoolId: params.get("schoolId") || "",
    search: params.get("search") || "",
    page: Number.isInteger(page) && page > 0 ? page : defaults.page,
    limit: Number.isInteger(limit) && limit > 0 && limit <= 100 ? limit : defaults.limit,
    sortBy: STUDENT_VOIP_SORT_FIELDS.includes(sortBy) ? sortBy : defaults.sortBy,
    sortOrder: sortOrder === "ASC" || sortOrder === "DESC" ? sortOrder : defaults.sortOrder,
  }
}

export function serializeStudentVoipQuery(query) {
  const params = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value !== "" && value != null) params.set(key, String(value))
  })
  return params
}

export function resetStudentVoipView(query) {
  return { ...query, schoolId: "", search: "", page: 1 }
}

export function toggleStudentVoipSort(query, field) {
  return {
    ...query,
    sortBy: field,
    sortOrder: query.sortBy === field && query.sortOrder === "ASC" ? "DESC" : "ASC",
    page: 1,
  }
}

export function scheduleStudentVoipSearch(callback, value) {
  const timer = setTimeout(() => callback(value), STUDENT_VOIP_DEBOUNCE_MS)
  return () => clearTimeout(timer)
}

export function hasRequiredStudentVoipFilters(query) {
  return Boolean(query.formId && query.from && query.to)
}

export function formatStudentVoipDuration(seconds) {
  if (seconds == null || seconds === "") return "—"
  const total = Math.max(0, Math.round(Number(seconds) || 0))
  return [Math.floor(total / 3600), Math.floor((total % 3600) / 60), total % 60]
    .map((part) => String(part).padStart(2, "0")).join(":")
}

export function formatStudentVoipPercent(value) {
  if (value == null || value === "") return "—"
  return `${Number(value).toLocaleString("fa-IR", { maximumFractionDigits: 1 })}٪`
}

export function studentVoipViewState({ hasFilters, loading, error, itemCount }) {
  if (!hasFilters) return "missing-filters"
  if (loading) return "loading"
  if (error) return "error"
  return itemCount ? "ready" : "empty"
}

export function uniqueStudentRows(items = []) {
  const seen = new Set()
  return items.filter((item) => {
    const key = String(item.studentId)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function canViewStudentVoipReport(permissions = []) {
  return permissions.includes("reports.student-voip-comprehensive.index")
}

export function canExportStudentVoipReport(permissions = []) {
  return permissions.includes("reports.student-voip-comprehensive.export")
}

export function saveStudentVoipBlob(blob, documentRef = document, urlApi = window.URL) {
  const objectUrl = urlApi.createObjectURL(blob)
  const link = documentRef.createElement("a")
  link.href = objectUrl
  link.download = "student-voip-comprehensive.xlsx"
  documentRef.body.appendChild(link)
  link.click()
  link.remove()
  urlApi.revokeObjectURL(objectUrl)
  return link.download
}

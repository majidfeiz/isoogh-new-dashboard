import moment from "moment-jalaali"

export const FORM_SORT_FIELDS = [
  "formTitle", "assignedStudents", "completedStudents", "remainingStudents",
  "progressPercent", "totalCalls", "answeredCalls", "uniqueStudents",
  "totalDurationSeconds", "avgDurationSeconds",
]
export const STATUS_SORT_FIELDS = [
  "label", "totalDurationSeconds", "avgDurationSeconds", "uniqueStudents", "totalCalls", "percent",
]
export const SEARCH_DEBOUNCE_MS = 400

export function defaultComprehensiveQuery() {
  return {
    from: moment().startOf("jMonth").format("YYYY-MM-DD") + "T00:00:00+03:30",
    to: moment().add(1, "jMonth").startOf("jMonth").format("YYYY-MM-DD") + "T00:00:00+03:30",
    formIds: "",
    schoolId: "",
    search: "",
    statusSearch: "",
    page: 1,
    limit: 10,
    sortBy: "formTitle",
    sortOrder: "ASC",
    statusSortBy: "totalCalls",
    statusSortOrder: "DESC",
  }
}

export function parseComprehensiveQuery(params) {
  const defaults = defaultComprehensiveQuery()
  const page = Number(params.get("page"))
  const limit = Number(params.get("limit"))
  const sortBy = params.get("sortBy")
  const statusSortBy = params.get("statusSortBy")
  const sortOrder = params.get("sortOrder")
  const statusSortOrder = params.get("statusSortOrder")
  return {
    ...defaults,
    from: params.get("from") || defaults.from,
    to: params.get("to") || defaults.to,
    formIds: params.get("formIds") || "",
    schoolId: params.get("schoolId") || "",
    search: params.get("search") || "",
    statusSearch: params.get("statusSearch") || "",
    page: Number.isInteger(page) && page > 0 ? page : 1,
    limit: Number.isInteger(limit) && limit > 0 && limit <= 100 ? limit : 10,
    sortBy: FORM_SORT_FIELDS.includes(sortBy) ? sortBy : defaults.sortBy,
    sortOrder: sortOrder === "ASC" || sortOrder === "DESC" ? sortOrder : defaults.sortOrder,
    statusSortBy: STATUS_SORT_FIELDS.includes(statusSortBy) ? statusSortBy : defaults.statusSortBy,
    statusSortOrder: statusSortOrder === "ASC" || statusSortOrder === "DESC"
      ? statusSortOrder : defaults.statusSortOrder,
  }
}

export function serializeComprehensiveQuery(query) {
  const params = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value !== "" && value != null) params.set(key, String(value))
  })
  return params
}

export function normalizeFormIds(values) {
  return values.map((value) => String(value)).filter(Boolean).join(",")
}

export function toggleSort(currentField, currentOrder, field) {
  return {
    field,
    order: currentField === field && currentOrder === "ASC" ? "DESC" : "ASC",
  }
}

export function withDebouncedSearch(query, key, value) {
  return { ...query, [key]: value.trim(), page: 1 }
}

export function scheduleDebouncedSearch(callback, value, delay = SEARCH_DEBOUNCE_MS) {
  const timer = setTimeout(() => callback(value), delay)
  return () => clearTimeout(timer)
}

export function formatReportDuration(seconds) {
  if (seconds == null || seconds === "") return "—"
  const total = Math.max(0, Math.round(Number(seconds) || 0))
  return [Math.floor(total / 3600), Math.floor((total % 3600) / 60), total % 60]
    .map((part) => String(part).padStart(2, "0")).join(":")
}

export function comprehensiveViewState({ loading, error, formsCount, statusesCount, chartCount }) {
  if (loading) return "loading"
  if (error) return "error"
  return formsCount + statusesCount + chartCount === 0 ? "empty" : "ready"
}

export function progressValue(value) {
  return Math.min(100, Math.max(0, Number(value) || 0))
}

export function canViewComprehensiveReport(permissions = []) {
  return permissions.includes("reports.contact-forms-comprehensive.index")
}

export function canExportComprehensiveReport(permissions = []) {
  return permissions.includes("reports.contact-forms-comprehensive.export")
}

export function saveComprehensiveReportBlob(
  blob,
  documentRef = document,
  urlApi = window.URL
) {
  const objectUrl = urlApi.createObjectURL(blob)
  const link = documentRef.createElement("a")
  link.href = objectUrl
  link.download = "contact-forms-comprehensive.xlsx"
  documentRef.body.appendChild(link)
  link.click()
  link.remove()
  urlApi.revokeObjectURL(objectUrl)
  return link.download
}

export function chartColor(item, index) {
  const key = String(item?.disposition || item?.key || "").toUpperCase()
  if (key === "ANSWERED") return "#34c38f"
  if (key === "BUSY") return "#f1b44c"
  if (key === "MISSED" || key === "NO_ANSWER") return "#f46a6a"
  return ["#556ee6", "#50a5f1", "#74788d", "#6f42c1", "#20c997"][index % 5]
}

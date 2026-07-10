import moment from "moment-jalaali"

export const SORT_FIELDS = [
  "adviserName", "adviserNumber", "headAdviserName", "totalStudents",
  "remainingStudents", "totalDurationSeconds", "avgDurationSeconds",
  "avgStudentDurationSeconds", "totalCalls", "incomingCalls", "answeredCalls",
  "missedCalls", "busyCalls",
]

export function defaultReportQuery() {
  return {
    from: moment().startOf("jMonth").format("YYYY-MM-DD"),
    to: moment().endOf("jMonth").format("YYYY-MM-DD"),
    schoolId: "",
    search: "",
    sortBy: "totalCalls",
    sortOrder: "DESC",
    page: 1,
    limit: 10,
  }
}

export function parseReportQuery(searchParams) {
  const defaults = defaultReportQuery()
  const sortBy = searchParams.get("sortBy")
  const sortOrder = searchParams.get("sortOrder")
  const page = Number(searchParams.get("page"))
  const limit = Number(searchParams.get("limit"))
  return {
    from: searchParams.get("from") || defaults.from,
    to: searchParams.get("to") || defaults.to,
    schoolId: searchParams.get("schoolId") || "",
    search: searchParams.get("search") || "",
    sortBy: SORT_FIELDS.includes(sortBy) ? sortBy : defaults.sortBy,
    sortOrder: sortOrder === "ASC" || sortOrder === "DESC" ? sortOrder : defaults.sortOrder,
    page: Number.isInteger(page) && page > 0 ? page : defaults.page,
    limit: Number.isInteger(limit) && limit > 0 && limit <= 100 ? limit : defaults.limit,
  }
}

export function serializeReportQuery(query) {
  const params = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value !== "" && value != null) params.set(key, String(value))
  })
  return params
}

export function nextSort(query, field) {
  return {
    sortBy: field,
    sortOrder: query.sortBy === field && query.sortOrder === "ASC" ? "DESC" : "ASC",
    page: 1,
  }
}

export function withSearch(query, search) {
  return { ...query, search: search.trim(), page: 1 }
}

export function formatDuration(seconds) {
  if (seconds == null || seconds === "") return "—"
  const total = Math.max(0, Math.round(Number(seconds) || 0))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const secs = total % 60
  return [hours, minutes, secs].map((value) => String(value).padStart(2, "0")).join(":")
}

export function reportTableState({ loading, error, itemCount }) {
  if (loading) return "loading"
  if (error) return "error"
  return itemCount > 0 ? "ready" : "empty"
}

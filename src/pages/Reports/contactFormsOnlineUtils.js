export const ONLINE_SORT_FIELDS = [
  "headAdviserName", "adviserName", "adviserNumber", "totalStudents",
  "totalCallsPercent", "successfulCallsPercent", "totalConversationSeconds",
  "successfulFormsPercent", "incompleteFormsPercent", "averageFormCompletionPercent",
]
export const ONLINE_SEARCH_DEBOUNCE_MS = 400

export function defaultOnlineQuery() {
  return {
    formId: "",
    schoolId: "",
    search: "",
    page: 1,
    limit: 10,
    sortBy: "headAdviserName",
    sortOrder: "ASC",
  }
}

export function isOnlineSortField(value) {
  return ONLINE_SORT_FIELDS.includes(value) || /^question:\d+$/.test(value || "")
}

export function parseOnlineQuery(params) {
  const defaults = defaultOnlineQuery()
  const page = Number(params.get("page"))
  const limit = Number(params.get("limit"))
  const sortBy = params.get("sortBy")
  const sortOrder = params.get("sortOrder")
  return {
    formId: params.get("formId") || "",
    schoolId: params.get("schoolId") || "",
    search: params.get("search") || "",
    page: Number.isInteger(page) && page > 0 ? page : defaults.page,
    limit: Number.isInteger(limit) && limit > 0 && limit <= 100 ? limit : defaults.limit,
    sortBy: isOnlineSortField(sortBy) ? sortBy : defaults.sortBy,
    sortOrder: sortOrder === "ASC" || sortOrder === "DESC" ? sortOrder : defaults.sortOrder,
  }
}

export function serializeOnlineQuery(query) {
  const params = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value !== "" && value != null) params.set(key, String(value))
  })
  return params
}

export function resetOnlineView(query) {
  return { ...defaultOnlineQuery(), formId: query.formId, page: 1 }
}

export function toggleOnlineSort(query, field) {
  return {
    ...query,
    sortBy: field,
    sortOrder: query.sortBy === field && query.sortOrder === "ASC" ? "DESC" : "ASC",
    page: 1,
  }
}

export function scheduleOnlineSearch(callback, value) {
  const timer = setTimeout(() => callback(value), ONLINE_SEARCH_DEBOUNCE_MS)
  return () => clearTimeout(timer)
}

export function formatOnlineDuration(seconds) {
  if (seconds == null || seconds === "") return "—"
  const total = Math.max(0, Math.round(Number(seconds) || 0))
  return [Math.floor(total / 3600), Math.floor((total % 3600) / 60), total % 60]
    .map((part) => String(part).padStart(2, "0")).join(":")
}

export function formatOnlinePercent(value) {
  if (value == null || value === "") return "—"
  return `${Number(value).toLocaleString("fa-IR", { maximumFractionDigits: 1 })}٪`
}

export function sortedQuestions(questions = []) {
  return [...questions].sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
}

export function flattenOnlineGroups(groups = []) {
  return groups.flatMap((group) => [group.head, ...(group.advisers || [])].filter(Boolean))
}

export function onlineViewState({ formId, loading, error, groupCount }) {
  if (!formId) return "no-form"
  if (loading) return "loading"
  if (error) return "error"
  return groupCount ? "ready" : "empty"
}

export function canViewOnlineReport(permissions = []) {
  return permissions.includes("reports.contact-forms-online.index")
}

export function canExportOnlineReport(permissions = []) {
  return permissions.includes("reports.contact-forms-online.export")
}

export function saveOnlineReportBlob(blob, documentRef = document, urlApi = window.URL) {
  const objectUrl = urlApi.createObjectURL(blob)
  const link = documentRef.createElement("a")
  link.href = objectUrl
  link.download = "contact-forms-online.xlsx"
  documentRef.body.appendChild(link)
  link.click()
  link.remove()
  urlApi.revokeObjectURL(objectUrl)
  return link.download
}

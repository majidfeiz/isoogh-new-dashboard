import moment from "moment-jalaali"

export const INACTIVE_ADVISER_SORT_FIELDS = [
  "adviserName", "adviserNumber", "phone", "headAdviserName",
  "assignedStudents", "lastCallAt", "inactiveHours",
]
export const INACTIVE_ADVISER_DEBOUNCE_MS = 400

export function defaultInactiveAdvisersQuery() {
  return {
    search: "",
    schoolId: "",
    page: 1,
    limit: 10,
    sortBy: "inactiveHours",
    sortOrder: "DESC",
  }
}

export function parseInactiveAdvisersQuery(params) {
  const defaults = defaultInactiveAdvisersQuery()
  const page = Number(params.get("page"))
  const limit = Number(params.get("limit"))
  const sortBy = params.get("sortBy")
  const sortOrder = params.get("sortOrder")
  return {
    search: params.get("search") || "",
    schoolId: params.get("schoolId") || "",
    page: Number.isInteger(page) && page > 0 ? page : defaults.page,
    limit: Number.isInteger(limit) && limit > 0 && limit <= 100 ? limit : defaults.limit,
    sortBy: INACTIVE_ADVISER_SORT_FIELDS.includes(sortBy) ? sortBy : defaults.sortBy,
    sortOrder: sortOrder === "ASC" || sortOrder === "DESC" ? sortOrder : defaults.sortOrder,
  }
}

export function serializeInactiveAdvisersQuery(query) {
  const params = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value !== "" && value != null) params.set(key, String(value))
  })
  return params
}

export function toggleInactiveAdvisersSort(query, field) {
  return {
    ...query,
    sortBy: field,
    sortOrder: query.sortBy === field && query.sortOrder === "ASC" ? "DESC" : "ASC",
    page: 1,
  }
}

export function scheduleInactiveAdvisersSearch(callback, value) {
  const timer = setTimeout(() => callback(value), INACTIVE_ADVISER_DEBOUNCE_MS)
  return () => clearTimeout(timer)
}

export function isAdminUser(user) {
  return (user?.roles || []).some((role) => {
    const name = String(role?.name || role?.slug || role?.label || "").toLowerCase()
    return ["admin", "super_admin", "super-admin", "super admin"].includes(name)
  })
}

export function formatJalaliDateTime(value) {
  if (!value) return "بدون سابقه تماس"
  const date = moment(value)
  return date.isValid() ? date.format("jYYYY/jMM/jDD HH:mm") : "—"
}

export function formatInactiveHours(hours, lastCallAt) {
  if (hours == null && !lastCallAt) return "بدون سابقه تماس"
  if (hours == null) return "—"
  const total = Math.max(0, Math.floor(Number(hours) || 0))
  const days = Math.floor(total / 24)
  const remainder = total % 24
  if (days && remainder) return `${days.toLocaleString("fa-IR")} روز و ${remainder.toLocaleString("fa-IR")} ساعت`
  if (days) return `${days.toLocaleString("fa-IR")} روز`
  return `${remainder.toLocaleString("fa-IR")} ساعت`
}

export function hasNoCallHistory(row) {
  return row?.lastCallAt == null && row?.inactiveHours == null
}

export function inactiveAdvisersViewState({ loading, error, itemCount }) {
  if (loading) return "loading"
  if (error) return "error"
  return itemCount ? "ready" : "empty"
}

export function canViewInactiveAdvisers(permissions = []) {
  return permissions.includes("reports.inactive-advisers.index")
}

export function canExportInactiveAdvisers(permissions = []) {
  return permissions.includes("reports.inactive-advisers.export")
}

export function saveInactiveAdvisersBlob(blob, documentRef = document, urlApi = window.URL) {
  const objectUrl = urlApi.createObjectURL(blob)
  const link = documentRef.createElement("a")
  link.href = objectUrl
  link.download = "inactive-advisers.xlsx"
  documentRef.body.appendChild(link)
  link.click()
  link.remove()
  urlApi.revokeObjectURL(objectUrl)
  return link.download
}

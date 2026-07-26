import moment from "moment-jalaali"

export const LIST_SORT_FIELDS = ["studentName", "ssn", "phone", "tags"]
export const CALL_SORT_FIELDS = ["calledAt", "formTitle", "status", "durationSeconds", "adviserName", "headAdviserName"]

const positiveInt = (value, fallback, max = Infinity) => {
  const number = Number(value)
  return Number.isInteger(number) && number > 0 && number <= max ? number : fallback
}

export function parseRecordQuery(params, detail = false) {
  const allowed = detail ? CALL_SORT_FIELDS : LIST_SORT_FIELDS
  const defaultSort = detail ? "calledAt" : "studentName"
  const sortBy = params.get("sortBy")
  const sortOrder = params.get("sortOrder")
  return {
    search: params.get("search") || "",
    tagId: detail ? "" : params.get("tagId") || "",
    formId: params.get("formId") || "",
    schoolId: detail ? "" : params.get("schoolId") || "",
    page: positiveInt(params.get("page"), 1),
    limit: positiveInt(params.get("limit"), 10, 100),
    sortBy: allowed.includes(sortBy) ? sortBy : defaultSort,
    sortOrder: sortOrder === "ASC" || sortOrder === "DESC" ? sortOrder : "ASC",
  }
}

export function serializeRecordQuery(query, detail = false) {
  const params = new URLSearchParams()
  const keys = detail
    ? ["search", "formId", "page", "limit", "sortBy", "sortOrder"]
    : ["search", "tagId", "formId", "schoolId", "page", "limit", "sortBy", "sortOrder"]
  keys.forEach((key) => {
    const value = query[key]
    if (value !== "" && value != null) params.set(key, String(value))
  })
  return params
}

export function resetRecordQuery(detail = false) {
  return parseRecordQuery(new URLSearchParams(), detail)
}

export function toggleRecordSort(query, field) {
  return {
    ...query,
    sortBy: field,
    sortOrder: query.sortBy === field && query.sortOrder === "ASC" ? "DESC" : "ASC",
    page: 1,
  }
}

export const globalRowNumber = (page, limit, rowIndex) => (page - 1) * limit + rowIndex + 1

export function getStudentRecordId(student) {
  const value = student?.studentId ?? student?.student_id ?? student?.id
  return value == null || value === "" ? null : value
}

export function getContactCallId(call) {
  const value = call?.callId ?? call?.call_id ?? call?.id ?? call?.historyId ?? call?.history_id
  return value == null || value === "" ? null : value
}

export function isAllowedReportUser(user) {
  return (user?.roles || []).some((role) => {
    const value = String(role?.name || role?.slug || role?.label || role || "").toLowerCase().replace(/[\s-]/g, "_")
    return ["admin", "super_admin", "manager"].includes(value)
  })
}

export function isAdminReportUser(user) {
  return (user?.roles || []).some((role) => {
    const value = String(role?.name || role?.slug || role?.label || role || "").toLowerCase().replace(/[\s-]/g, "_")
    return ["admin", "super_admin"].includes(value)
  })
}

export function formatDuration(seconds) {
  const total = Math.max(0, Math.floor(Number(seconds) || 0))
  const hours = String(Math.floor(total / 3600)).padStart(2, "0")
  const minutes = String(Math.floor((total % 3600) / 60)).padStart(2, "0")
  const remaining = String(total % 60).padStart(2, "0")
  return `${hours}:${minutes}:${remaining}`
}

export function formatRecordDate(value) {
  if (!value) return "—"
  const date = moment(value)
  return date.isValid() ? date.format("jYYYY/jMM/jDD HH:mm") : "—"
}

export function formStatus(status) {
  if (status === "completed") return { label: "تکمیل‌شده", color: "success" }
  if (status === "pending") return { label: "در انتظار تکمیل", color: "warning" }
  return { label: status || "نامشخص", color: "secondary" }
}

export function callStatus(status, label) {
  const normalized = String(status || "").toUpperCase()
  if (["ANSWERED", "SUCCESS", "COMPLETED"].includes(normalized)) return { label: label || "پاسخ داده شده", color: "success" }
  if (["MISSED", "NO_ANSWER", "FAILED", "BUSY"].includes(normalized)) return { label: label || "ناموفق", color: "danger" }
  return { label: label || status || "نامشخص", color: "secondary" }
}

export function saveRecordBlob(blob, documentRef = document, urlApi = window.URL) {
  const objectUrl = urlApi.createObjectURL(blob)
  const link = documentRef.createElement("a")
  link.href = objectUrl
  link.download = "student-contact-records.xlsx"
  documentRef.body.appendChild(link)
  link.click()
  link.remove()
  urlApi.revokeObjectURL(objectUrl)
  return link.download
}

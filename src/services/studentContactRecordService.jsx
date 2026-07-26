import { apiGet } from "../helpers/httpClient.jsx"
import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx"

export function buildStudentContactRecordParams(params = {}, includePagination = true) {
  const query = new URLSearchParams()
  const keys = ["search", "tagId", "formId", "schoolId", "sortBy", "sortOrder"]
  if (includePagination) keys.push("page", "limit")
  keys.forEach((key) => {
    const value = params[key]
    if (value !== "" && value != null) query.set(key, String(value))
  })
  return query
}

const unwrap = (response) => response?.data?.data ?? response?.data ?? {}

export async function getStudentContactRecords(params = {}, signal) {
  const response = await apiGet(getApiUrl(API_ROUTES.reports.studentContactRecords), {
    params: buildStudentContactRecordParams(params),
    signal,
    timeout: 30000,
  })
  const data = unwrap(response)
  return {
    items: data?.items || [],
    meta: data?.meta || { page: params.page || 1, limit: params.limit || 10, total: 0, lastPage: 1 },
  }
}

export async function exportStudentContactRecords(params = {}) {
  const response = await apiGet(getApiUrl(API_ROUTES.reports.studentContactRecordsExport), {
    params: buildStudentContactRecordParams(params, false),
    responseType: "blob",
    timeout: 60000,
  })
  return response.data
}

export async function getStudentContactRecord(studentId, params = {}, signal) {
  const response = await apiGet(getApiUrl(API_ROUTES.reports.studentContactRecord(studentId)), {
    params: buildStudentContactRecordParams(params),
    signal,
    timeout: 30000,
  })
  const data = unwrap(response)
  return {
    student: data?.student || null,
    summary: data?.summary || {},
    forms: data?.forms || [],
    calls: data?.calls || [],
    meta: data?.meta || { page: params.page || 1, limit: params.limit || 10, total: 0, lastPage: 1 },
  }
}

export async function getStudentContactCallAnswers(studentId, callId, signal) {
  const response = await apiGet(
    getApiUrl(API_ROUTES.reports.studentContactCallAnswers(studentId, callId)),
    { signal, timeout: 30000 }
  )
  const data = unwrap(response)
  return {
    call: data?.call || null,
    answers: Array.isArray(data?.answers) ? data.answers : [],
  }
}

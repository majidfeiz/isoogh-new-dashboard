import { apiGet } from "../helpers/httpClient.jsx"
import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx"

export function buildStudentCallSummaryParams(params = {}, includePagination = true) {
  const query = new URLSearchParams()
  const keys = ["schoolId", "from", "to", "search", "sortBy", "sortOrder"]
  if (includePagination) keys.push("page", "limit")
  keys.forEach((key) => {
    const value = params[key]
    if (value !== "" && value != null) query.set(key, String(value))
  })
  return query
}

const unwrap = (response) => response?.data?.data ?? response?.data ?? {}

export async function getStudentCallSummary(params = {}, signal) {
  const response = await apiGet(getApiUrl(API_ROUTES.reports.studentCallSummary), {
    params: buildStudentCallSummaryParams(params), signal, timeout: 30000,
  })
  const data = unwrap(response)
  return {
    items: data?.items || [],
    meta: data?.meta || { page: params.page || 1, limit: params.limit || 10, total: 0, lastPage: 1 },
  }
}

export async function exportStudentCallSummary(params = {}) {
  const response = await apiGet(getApiUrl(API_ROUTES.reports.studentCallSummaryExport), {
    params: buildStudentCallSummaryParams(params, false), responseType: "blob", timeout: 60000,
  })
  return response.data
}

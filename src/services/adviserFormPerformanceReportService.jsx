import { apiGet } from "../helpers/httpClient.jsx"
import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx"

const unwrap = (response) => response?.data?.data ?? response?.data ?? {}

const cleanSearch = (value) => String(value ?? "").trim() || undefined

const selectionParams = ({ schoolId, formId, studentSearch, adviserSearch } = {}) => Object.fromEntries(
  Object.entries({
    schoolId: schoolId == null || schoolId === "" ? undefined : schoolId,
    formId: formId == null || formId === "" ? undefined : formId,
    studentSearch: cleanSearch(studentSearch),
    adviserSearch: cleanSearch(adviserSearch),
  }).filter(([, value]) => value !== undefined)
)

export async function getAdviserFormPerformanceSchools(signal) {
  const response = await apiGet(getApiUrl(API_ROUTES.adviserFormPerformanceReports.schools), { signal })
  const data = unwrap(response)
  return Array.isArray(data) ? data : data?.items || []
}

export async function getAdviserFormPerformanceForms(schoolId, signal) {
  const response = await apiGet(getApiUrl(API_ROUTES.adviserFormPerformanceReports.forms), {
    params: { schoolId }, signal,
  })
  const data = unwrap(response)
  return Array.isArray(data) ? data : data?.items || []
}

export async function getAdviserFormPerformanceReport({ schoolId, formId, studentSearch, adviserSearch, page = 1, limit = 15 }, signal) {
  const response = await apiGet(getApiUrl(API_ROUTES.adviserFormPerformanceReports.list), {
    params: { ...selectionParams({ schoolId, formId, studentSearch, adviserSearch }), page, limit }, signal, timeout: 30000,
  })
  const data = unwrap(response)
  return {
    school: data?.school || null,
    form: data?.form || null,
    questions: Array.isArray(data?.questions) ? data.questions : [],
    rows: Array.isArray(data?.rows) ? data.rows : [],
    meta: data?.meta || { page, limit, total: 0, lastPage: 1 },
  }
}

export async function exportAdviserFormPerformanceReport({ schoolId, formId, studentSearch, adviserSearch }) {
  const response = await apiGet(getApiUrl(API_ROUTES.adviserFormPerformanceReports.export), {
    params: selectionParams({ schoolId, formId, studentSearch, adviserSearch }), responseType: "blob", timeout: 60000,
  })
  return { blob: response.data, contentDisposition: response.headers?.["content-disposition"] || "" }
}

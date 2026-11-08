// src/services/reportService.jsx
import { apiGet } from "../helpers/httpClient.jsx"
import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx"
import { toGregorian } from "jalaali-js"

const reportInflight = new Map()
const reportCache = new Map()
const REPORT_CACHE_MS = 30_000

const zonedOffsetMs = (instant, timeZone) => {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "longOffset", hour: "2-digit" }).formatToParts(instant)
  const match = parts.find((part) => part.type === "timeZoneName")?.value?.match(/GMT([+-])(\d{2}):(\d{2})/)
  if (!match) return 0
  const minutes = Number(match[2]) * 60 + Number(match[3])
  return (match[1] === "-" ? -minutes : minutes) * 60_000
}

export function jalaliBoundaryToIso(value, timeZone = "Asia/Tehran") {
  const match = String(value || "").replace(/-/g, "/").match(/^(\d{4})\/(\d{2})\/(\d{2})$/)
  if (!match) return value || undefined
  const gregorian = toGregorian(Number(match[1]), Number(match[2]), Number(match[3]))
  const utcGuess = Date.UTC(gregorian.gy, gregorian.gm - 1, gregorian.gd)
  const first = utcGuess - zonedOffsetMs(new Date(utcGuess), timeZone)
  const instant = utcGuess - zonedOffsetMs(new Date(first), timeZone)
  return new Date(instant).toISOString()
}

export function reportQueryKey(endpoint, params = {}) {
  return [endpoint, params.schoolId || "all", params.from || "", params.to || "", params.page || "", params.limit || "", params.search || ""].join("|")
}

export function runReportQuery(key, request, { force = false } = {}) {
  const cached = reportCache.get(key)
  if (!force && cached && Date.now() - cached.at < REPORT_CACHE_MS) return Promise.resolve(cached.data)
  if (!force && reportInflight.has(key)) return reportInflight.get(key)
  const promise = request().then((data) => { reportCache.set(key, { data, at: Date.now() }); return data }).finally(() => reportInflight.delete(key))
  reportInflight.set(key, promise)
  return promise
}

export const clearReportCache = (predicate = () => true) => { for (const key of reportCache.keys()) if (predicate(key)) reportCache.delete(key) }

function buildParams({ from, to, schoolId } = {}) {
  return {
    from: jalaliBoundaryToIso(from),
    to: jalaliBoundaryToIso(to),
    schoolId: schoolId || undefined,
  }
}

function unwrap(response) {
  const payload = response?.data
  return payload?.data ?? payload ?? {}
}

function buildAdviserCallParams({
  from,
  to,
  schoolId,
  search,
  sortBy,
  sortOrder,
  page,
  limit,
} = {}) {
  const params = new URLSearchParams()
  if (from) params.set("from", from)
  if (to) params.set("to", to)
  if (schoolId) params.set("schoolId", String(schoolId))
  if (search) params.set("search", search)
  if (sortBy) params.set("sortBy", sortBy)
  if (sortOrder) params.set("sortOrder", sortOrder)
  if (page != null) params.set("page", String(page))
  if (limit != null) params.set("limit", String(limit))
  return params
}

export async function getReportsOverview({ from, to, schoolId, signal } = {}) {
  const res = await apiGet(getApiUrl(API_ROUTES.reports.overview), {
    params: buildParams({ from, to, schoolId }),
    signal, silent: true,
  })
  return unwrap(res)
}

export async function getReportsCallsTrend({ from, to, schoolId, signal } = {}) {
  const res = await apiGet(getApiUrl(API_ROUTES.reports.callsTrend), {
    params: buildParams({ from, to, schoolId }),
    signal, silent: true,
  })
  return unwrap(res)
}

export async function getReportsCallsByAdviser({
  from,
  to,
  schoolId,
  page = 1,
  limit = 10,
  search = "",
  sortBy = "totalCalls",
  sortOrder = "DESC",
} = {}) {
  const res = await apiGet(getApiUrl(API_ROUTES.reports.callsByAdviser), {
    params: buildAdviserCallParams({
      from, to, schoolId, page, limit, search, sortBy, sortOrder,
    }),
    timeout: 30000,
  })
  return unwrap(res)
}

export async function exportReportsCallsByAdviser({
  from,
  to,
  schoolId,
  search = "",
  sortBy = "totalCalls",
  sortOrder = "DESC",
} = {}) {
  const res = await apiGet(getApiUrl(API_ROUTES.reports.callsByAdviserExport), {
    params: buildAdviserCallParams({
      from, to, schoolId, search, sortBy, sortOrder,
    }),
    responseType: "blob",
    timeout: 60000,
  })
  return res.data
}

function buildComprehensiveParams(params, includePagination = true) {
  const query = new URLSearchParams()
  const keys = [
    "from", "to", "formIds", "schoolId", "search", "statusSearch",
    "sortBy", "sortOrder", "statusSortBy", "statusSortOrder",
  ]
  if (includePagination) keys.push("page", "limit")
  keys.forEach((key) => {
    const value = params[key]
    if (value !== "" && value != null) query.set(key, String(value))
  })
  return query
}

export async function getContactFormsComprehensiveReport(params = {}, signal) {
  const query = buildComprehensiveParams(params)
  const res = await apiGet(getApiUrl(API_ROUTES.reports.contactFormsComprehensive), {
    params: query,
    signal,
    timeout: 30000,
  })
  const data = unwrap(res)
  return {
    summary: data?.summary || {},
    statuses: data?.statuses || [],
    chart: data?.chart || [],
    forms: data?.forms || [],
    meta: data?.meta || { page: params.page || 1, limit: params.limit || 10, total: 0, lastPage: 1 },
  }
}

export async function exportContactFormsComprehensiveReport(params = {}) {
  const res = await apiGet(getApiUrl(API_ROUTES.reports.contactFormsComprehensiveExport), {
    params: buildComprehensiveParams(params, false),
    responseType: "blob",
    timeout: 60000,
  })
  return res.data
}

function buildContactFormsOnlineParams(params, includePagination = true) {
  const query = new URLSearchParams()
  const keys = ["formId", "schoolId", "search", "sortBy", "sortOrder"]
  if (includePagination) keys.push("page", "limit")
  keys.forEach((key) => {
    const value = params[key]
    if (value !== "" && value != null) query.set(key, String(value))
  })
  return query
}

export async function getContactFormsOnlineReport(params = {}, signal) {
  const res = await apiGet(getApiUrl(API_ROUTES.reports.contactFormsOnline), {
    params: buildContactFormsOnlineParams(params),
    signal,
    timeout: 30000,
  })
  const data = unwrap(res)
  return {
    form: data?.form || null,
    questions: data?.questions || [],
    groups: data?.groups || [],
    meta: data?.meta || {
      page: params.page || 1,
      limit: params.limit || 10,
      totalGroups: 0,
      totalAdvisers: 0,
      lastPage: 1,
    },
  }
}

export async function exportContactFormsOnlineReport(params = {}) {
  const res = await apiGet(getApiUrl(API_ROUTES.reports.contactFormsOnlineExport), {
    params: buildContactFormsOnlineParams(params, false),
    responseType: "blob",
    timeout: 60000,
  })
  return res.data
}

function buildStudentVoipParams(params, includePagination = true) {
  const query = new URLSearchParams()
  const keys = ["formId", "from", "to", "schoolId", "search", "sortBy", "sortOrder"]
  if (includePagination) keys.push("page", "limit")
  keys.forEach((key) => {
    const value = params[key]
    if (value !== "" && value != null) query.set(key, String(value))
  })
  return query
}

export async function getStudentVoipComprehensiveReport(params = {}, signal) {
  const res = await apiGet(getApiUrl(API_ROUTES.reports.studentVoipComprehensive), {
    params: buildStudentVoipParams(params),
    signal,
    timeout: 30000,
  })
  const data = unwrap(res)
  return {
    form: data?.form || null,
    items: data?.items || [],
    meta: data?.meta || {
      page: params.page || 1,
      limit: params.limit || 10,
      total: 0,
      lastPage: 1,
    },
  }
}

export async function exportStudentVoipComprehensiveReport(params = {}) {
  const res = await apiGet(getApiUrl(API_ROUTES.reports.studentVoipComprehensiveExport), {
    params: buildStudentVoipParams(params, false),
    responseType: "blob",
    timeout: 60000,
  })
  return res.data
}

function buildInactiveAdvisersParams(params, includePagination = true) {
  const query = new URLSearchParams()
  const keys = ["search", "schoolId", "sortBy", "sortOrder"]
  if (includePagination) keys.push("page", "limit")
  keys.forEach((key) => {
    const value = params[key]
    if (value !== "" && value != null) query.set(key, String(value))
  })
  return query
}

export async function getInactiveAdvisersReport(params = {}, signal) {
  const res = await apiGet(getApiUrl(API_ROUTES.reports.inactiveAdvisers), {
    params: buildInactiveAdvisersParams(params),
    signal,
    timeout: 30000,
  })
  const data = unwrap(res)
  return {
    generatedAt: data?.generatedAt || null,
    cutoffAt: data?.cutoffAt || null,
    items: data?.items || [],
    meta: data?.meta || {
      page: params.page || 1,
      limit: params.limit || 10,
      total: 0,
      lastPage: 1,
    },
  }
}

export async function exportInactiveAdvisersReport(params = {}) {
  const res = await apiGet(getApiUrl(API_ROUTES.reports.inactiveAdvisersExport), {
    params: buildInactiveAdvisersParams(params, false),
    responseType: "blob",
    timeout: 60000,
  })
  return res.data
}

function buildSupportFormAnswersParams(params, includePagination = true) {
  const query = new URLSearchParams()
  const keys = ["from", "to", "studentName", "adviserName", "adviserNumber", "ssn", "studentUsername"]
  if (includePagination) keys.push("page", "limit")
  keys.forEach((key) => {
    const value = params[key]
    if (value !== "" && value != null) query.set(key, String(value))
  })
  return query
}

export async function getSupportFormAnswersReport(params = {}, signal) {
  const res = await apiGet(getApiUrl(API_ROUTES.reports.supportFormAnswers), {
    params: buildSupportFormAnswersParams(params),
    signal,
    timeout: 30000,
  })
  const data = unwrap(res)
  return {
    items: data?.items || [],
    meta: data?.meta || {
      page: params.page || 1,
      limit: params.limit || 10,
      total: 0,
      lastPage: 1,
    },
  }
}

export async function exportSupportFormAnswersReport(params = {}) {
  const res = await apiGet(getApiUrl(API_ROUTES.reports.supportFormAnswersExport), {
    params: buildSupportFormAnswersParams(params, false),
    responseType: "blob",
    timeout: 60000,
  })
  return res.data
}

function buildAdviserPerformanceParams(params, includePagination = true) {
  const query = new URLSearchParams()
  const keys = ["formId", "schoolId", "studentSearch", "adviserSearch"]
  if (includePagination) keys.push("page", "limit")
  keys.forEach((key) => {
    const value = params?.[key]
    if (value !== "" && value != null) query.set(key, String(value))
  })
  return query
}

export async function getAdviserPerformanceSchools(signal) {
  const res = await apiGet(getApiUrl(API_ROUTES.reports.adviserPerformanceSchools), { signal })
  const data = unwrap(res)
  return Array.isArray(data) ? data : data?.items || []
}

export async function getAdviserPerformanceForms(schoolId, signal) {
  const res = await apiGet(getApiUrl(API_ROUTES.reports.adviserPerformanceForms), {
    params: new URLSearchParams({ schoolId: String(schoolId) }),
    signal,
  })
  const data = unwrap(res)
  return Array.isArray(data) ? data : data?.items || []
}

export async function getAdviserPerformanceReport(params = {}, signal) {
  const res = await apiGet(getApiUrl(API_ROUTES.reports.adviserPerformance), {
    params: buildAdviserPerformanceParams(params),
    signal,
    timeout: 30000,
  })
  const data = unwrap(res)
  const rows = Array.isArray(data?.rows) ? data.rows : []
  return {
    school: data?.school || null,
    form: data?.form || null,
    questions: Array.isArray(data?.questions) ? data.questions : [],
    rows,
    meta: data?.meta || {
      page: params.page || 1,
      limit: params.limit || 15,
      total: rows.length,
      lastPage: 1,
    },
  }
}

export async function exportAdviserPerformanceReport(params = {}) {
  const res = await apiGet(getApiUrl(API_ROUTES.reports.adviserPerformanceExport), {
    params: buildAdviserPerformanceParams(params, false),
    responseType: "blob",
    timeout: 60000,
  })
  return res.data
}

export async function getReportsCallsByHour({ from, to, schoolId, signal } = {}) {
  const res = await apiGet(getApiUrl(API_ROUTES.reports.callsByHour), {
    params: buildParams({ from, to, schoolId }),
    signal, silent: true,
  })
  return unwrap(res)
}

export async function getReportsStudentsCoverage({ from, to, schoolId, signal } = {}) {
  const res = await apiGet(getApiUrl(API_ROUTES.reports.studentsCoverage), {
    params: buildParams({ from, to, schoolId }),
    signal, silent: true,
  })
  return unwrap(res)
}

export async function getReportsUncontactedStudents({
  from,
  to,
  schoolId,
  page = 1,
  limit = 10,
  signal,
} = {}) {
  const res = await apiGet(getApiUrl(API_ROUTES.reports.uncontactedStudents), {
    params: { ...buildParams({ from, to, schoolId }), page, limit },
    signal, silent: true,
  })
  return unwrap(res)
}

export async function exportReportsUncontactedStudents({ from, to, schoolId, search = "" } = {}) {
  const res = await apiGet(getApiUrl(API_ROUTES.reports.uncontactedStudentsExport), {
    params: { ...buildParams({ from, to, schoolId }), search: search || undefined },
    responseType: "blob",
  })
  const disposition = res.headers?.["content-disposition"] || ""
  const encoded = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1]
  const plain = disposition.match(/filename="?([^";]+)"?/i)?.[1]
  let filename = "uncontacted-students.csv"
  try { filename = decodeURIComponent(encoded || plain || filename) } catch { /* keep fallback */ }
  return { blob: res.data, filename }
}

export async function getReportsFormsStatus({ from, to, schoolId, signal } = {}) {
  const res = await apiGet(getApiUrl(API_ROUTES.reports.formsStatus), {
    params: buildParams({ from, to, schoolId }),
    signal, silent: true,
  })
  return unwrap(res)
}

export async function getReportsMonthlyComparison({ from, to, schoolId, signal } = {}) {
  const res = await apiGet(getApiUrl(API_ROUTES.reports.monthlyComparison), {
    params: buildParams({ from, to, schoolId }),
    signal, silent: true,
  })
  return unwrap(res)
}

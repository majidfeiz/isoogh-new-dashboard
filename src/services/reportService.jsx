// src/services/reportService.jsx
import { apiGet } from "../helpers/httpClient.jsx"
import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx"

function buildParams({ from, to, schoolId } = {}) {
  return {
    from: from || undefined,
    to: to || undefined,
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

export async function getReportsOverview({ from, to, schoolId } = {}) {
  const res = await apiGet(getApiUrl(API_ROUTES.reports.overview), {
    params: buildParams({ from, to, schoolId }),
    timeout: 30000,
  })
  return unwrap(res)
}

export async function getReportsCallsTrend({ from, to, schoolId } = {}) {
  const res = await apiGet(getApiUrl(API_ROUTES.reports.callsTrend), {
    params: buildParams({ from, to, schoolId }),
    timeout: 30000,
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

export async function getReportsCallsByHour({ from, to, schoolId } = {}) {
  const res = await apiGet(getApiUrl(API_ROUTES.reports.callsByHour), {
    params: buildParams({ from, to, schoolId }),
    timeout: 30000,
  })
  return unwrap(res)
}

export async function getReportsStudentsCoverage({ from, to, schoolId } = {}) {
  const res = await apiGet(getApiUrl(API_ROUTES.reports.studentsCoverage), {
    params: buildParams({ from, to, schoolId }),
    timeout: 30000,
  })
  return unwrap(res)
}

export async function getReportsUncontactedStudents({
  from,
  to,
  schoolId,
  page = 1,
  limit = 10,
} = {}) {
  const res = await apiGet(getApiUrl(API_ROUTES.reports.uncontactedStudents), {
    params: { ...buildParams({ from, to, schoolId }), page, limit },
    timeout: 30000,
  })
  return unwrap(res)
}

export async function getReportsFormsStatus({ from, to, schoolId } = {}) {
  const res = await apiGet(getApiUrl(API_ROUTES.reports.formsStatus), {
    params: buildParams({ from, to, schoolId }),
    timeout: 30000,
  })
  return unwrap(res)
}

export async function getReportsMonthlyComparison({ from, to, schoolId } = {}) {
  const res = await apiGet(getApiUrl(API_ROUTES.reports.monthlyComparison), {
    params: buildParams({ from, to, schoolId }),
    timeout: 30000,
  })
  return unwrap(res)
}

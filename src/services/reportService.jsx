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
  sortBy = "totalCalls",
  sortOrder = "DESC",
} = {}) {
  const res = await apiGet(getApiUrl(API_ROUTES.reports.callsByAdviser), {
    params: { ...buildParams({ from, to, schoolId }), page, limit, sortBy, sortOrder },
    timeout: 30000,
  })
  return unwrap(res)
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

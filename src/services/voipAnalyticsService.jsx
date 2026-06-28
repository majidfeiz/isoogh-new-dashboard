// src/services/voipAnalyticsService.jsx
import { apiGet } from "../helpers/httpClient.jsx"
import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx"
import { getAccessToken } from "../helpers/authStorage.jsx"

function buildParams({ from, to, schoolId } = {}) {
  return {
    from: from || undefined,
    to: to || undefined,
    school_id: schoolId || undefined,
  }
}

function unwrap(response) {
  const payload = response?.data
  return payload?.data ?? payload ?? {}
}

export async function getVoipAnalyticsSummary({ from, to, schoolId } = {}) {
  const res = await apiGet(getApiUrl(API_ROUTES.voipAnalytics.summary), {
    params: buildParams({ from, to, schoolId }),
    timeout: 30000,
  })
  return unwrap(res)
}

export async function getVoipAnalyticsDurationMismatch({ from, to, schoolId } = {}) {
  const res = await apiGet(getApiUrl(API_ROUTES.voipAnalytics.durationMismatch), {
    params: buildParams({ from, to, schoolId }),
    timeout: 30000,
  })
  return unwrap(res)
}

export async function getVoipAnalyticsFailedFiles({ from, to, schoolId } = {}) {
  const res = await apiGet(getApiUrl(API_ROUTES.voipAnalytics.failedFiles), {
    params: buildParams({ from, to, schoolId }),
    timeout: 30000,
  })
  return unwrap(res)
}

export async function getVoipAnalyticsOrphanedCalls({ from, to, schoolId } = {}) {
  const res = await apiGet(getApiUrl(API_ROUTES.voipAnalytics.orphanedCalls), {
    params: buildParams({ from, to, schoolId }),
    timeout: 30000,
  })
  return unwrap(res)
}

export async function getVoipAnalyticsNullCallGroup({ from, to, schoolId } = {}) {
  const res = await apiGet(getApiUrl(API_ROUTES.voipAnalytics.nullCallGroup), {
    params: buildParams({ from, to, schoolId }),
    timeout: 30000,
  })
  return unwrap(res)
}

export async function getVoipAnalyticsUnansweredAnswers({ from, to, schoolId } = {}) {
  const res = await apiGet(getApiUrl(API_ROUTES.voipAnalytics.unansweredAnswers), {
    params: buildParams({ from, to, schoolId }),
    timeout: 30000,
  })
  return unwrap(res)
}

// exportParams: { from, to, school_id? } — all ISO strings already, URLSearchParams encodes + as %2B
export async function downloadVoipAnalyticsCsv(exportPath, exportParams, filename) {
  const baseUrl = getApiUrl(exportPath)
  const params = new URLSearchParams()
  if (exportParams.from) params.set("from", exportParams.from)
  if (exportParams.to) params.set("to", exportParams.to)
  if (exportParams.school_id) params.set("school_id", exportParams.school_id)

  const fullUrl = `${baseUrl}?${params.toString()}`
  const token = getAccessToken()

  const res = await fetch(fullUrl, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok || !res.body) throw new Error(await res.text())

  const reader = res.body.getReader()
  const chunks = []
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
  }

  const bom = new Uint8Array([0xef, 0xbb, 0xbf])
  const blob = new Blob([bom, ...chunks], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.parentNode.removeChild(link)
  URL.revokeObjectURL(link.href)
}

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
const normalizeContactCall = (call = {}) => ({
  ...call,
  direction: call.direction === "incoming" ? "incoming" : "outbound",
  calledAt: call.calledAt ?? call.startedAt ?? call.started_at,
  endedAt: call.endedAt ?? call.ended_at,
  durationSeconds: call.durationSeconds ?? call.duration_seconds,
  formId: call.formId ?? call.form_id ?? call.supportForm?.formId ?? call.support_form?.form_id,
  formTitle: call.formTitle ?? call.form_title ?? call.supportForm?.title ?? call.support_form?.title,
  src: call.src ?? call.source ?? "",
  dst: call.dst ?? call.destination ?? "",
  audioFiles: Array.isArray(call.audioFiles ?? call.audio_files) ? (call.audioFiles ?? call.audio_files) : [],
})

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
    calls: (data?.calls || []).map(normalizeContactCall),
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

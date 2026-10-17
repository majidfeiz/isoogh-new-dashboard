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
    params: buildStudentCallSummaryParams({ ...params, limit: 15 }), signal, timeout: 60000,
  })
  const data = unwrap(response)
  return {
    items: data?.items || [],
    meta: data?.meta || { page: params.page || 1, limit: 15, total: 0, lastPage: 1 },
  }
}

export const STUDENT_CALL_SUMMARY_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
export const STUDENT_CALL_SUMMARY_FILENAME = "student-call-summary.xlsx"

const downloadBlob = (blob, filename, documentRef, urlApi) => {
  const objectUrl = urlApi.createObjectURL(blob)
  const link = documentRef.createElement("a")
  link.href = objectUrl
  link.download = filename
  documentRef.body.appendChild(link)
  link.click()
  link.remove()
  urlApi.revokeObjectURL(objectUrl)
}

export async function streamStudentCallSummaryExport(params = {}, options = {}) {
  const {
    signal, onProgress = () => {}, request = apiGet,
    documentRef = document, urlApi = window.URL,
  } = options
  onProgress({ status: "connecting", loadedBytes: 0, totalBytes: null, filename: STUDENT_CALL_SUMMARY_FILENAME })
  let loadedBytes = 0
  try {
    const response = await request(getApiUrl(API_ROUTES.reports.studentCallSummaryExport), {
      params: buildStudentCallSummaryParams(params, false),
      responseType: "blob",
      signal,
      timeout: 0,
      onDownloadProgress: (event) => {
        loadedBytes = Number(event.loaded) || 0
        const totalBytes = Number.isFinite(event.total) && event.total > 0 ? event.total : null
        onProgress({ status: loadedBytes > 0 ? "streaming" : "connecting", loadedBytes, totalBytes, filename: STUDENT_CALL_SUMMARY_FILENAME })
      },
    })
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError")
    const blob = response.data instanceof Blob ? response.data : new Blob([response.data], { type: STUDENT_CALL_SUMMARY_MIME })
    loadedBytes = blob.size
    downloadBlob(blob, STUDENT_CALL_SUMMARY_FILENAME, documentRef, urlApi)
    onProgress({ status: "completed", loadedBytes, totalBytes: blob.size || null, filename: STUDENT_CALL_SUMMARY_FILENAME })
    return { filename: STUDENT_CALL_SUMMARY_FILENAME, loadedBytes, totalBytes: blob.size || null }
  } catch (error) {
    const errorBlob = error?.response?.data
    if (errorBlob instanceof Blob) {
      try {
        const parsed = JSON.parse(await errorBlob.text())
        error.response.data = parsed
      } catch { /* keep the original request error */ }
    }
    throw error
  }
}

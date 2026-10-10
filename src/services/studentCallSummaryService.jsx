import { apiGet } from "../helpers/httpClient.jsx"
import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx"
import { getAccessToken } from "../helpers/authStorage.jsx"

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

export const STUDENT_CALL_SUMMARY_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
export const STUDENT_CALL_SUMMARY_FILENAME = "student-call-summary.xlsx"

export function studentCallSummaryFilename(disposition = "") {
  const encoded = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1]
  if (encoded) {
    try { return decodeURIComponent(encoded).replace(/[\\/]/g, "_") }
    catch { /* use the plain filename or fallback */ }
  }
  const plain = disposition.match(/filename\s*=\s*"?([^";]+)"?/i)?.[1]?.trim()
  return plain ? plain.replace(/[\\/]/g, "_") : STUDENT_CALL_SUMMARY_FILENAME
}

async function responseError(response) {
  let message = "دریافت خروجی با خطا مواجه شد."
  try {
    const data = await response.json()
    const value = data?.message
    message = Array.isArray(value) ? value.join("، ") : value || message
  } catch { /* response is not JSON */ }
  const error = new Error(message)
  error.status = response.status
  throw error
}

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
    signal, onProgress = () => {}, fetchImpl = fetch,
    windowRef = window, documentRef = document, urlApi = window.URL,
  } = options
  const query = buildStudentCallSummaryParams(params, false)
  const url = `${getApiUrl(API_ROUTES.reports.studentCallSummaryExport)}?${query.toString()}`
  onProgress({ status: "connecting", loadedBytes: 0, totalBytes: null, filename: STUDENT_CALL_SUMMARY_FILENAME })
  const token = getAccessToken()
  const response = await fetchImpl(url, { headers: token ? { Authorization: `Bearer ${token}` } : {}, signal })
  const contentType = response.headers.get("Content-Type") || ""
  if (!response.ok || contentType.includes("application/json")) return responseError(response)
  if (contentType && !contentType.includes(STUDENT_CALL_SUMMARY_MIME) && !contentType.includes("application/octet-stream")) {
    return responseError(response)
  }
  if (!response.body?.getReader) throw new Error("مرورگر امکان دریافت جریانی فایل را ندارد.")

  const filename = studentCallSummaryFilename(response.headers.get("Content-Disposition") || "")
  const contentLength = Number(response.headers.get("Content-Length"))
  const totalBytes = Number.isFinite(contentLength) && contentLength > 0 ? contentLength : null
  const picker = typeof windowRef.showSaveFilePicker === "function" ? windowRef.showSaveFilePicker.bind(windowRef) : null
  let writable = null
  let memoryFallback = !picker
  if (picker) {
    const handle = await picker({ suggestedName: filename, types: [{ description: "Excel", accept: { [STUDENT_CALL_SUMMARY_MIME]: [".xlsx"] } }] })
    writable = await handle.createWritable()
  }
  const chunks = []
  const reader = response.body.getReader()
  let loadedBytes = 0
  onProgress({ status: "streaming", loadedBytes, totalBytes, filename, memoryFallback })
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (signal?.aborted) throw new DOMException("Aborted", "AbortError")
      loadedBytes += value.byteLength
      if (writable) await writable.write(value)
      else chunks.push(value)
      onProgress({ status: "streaming", loadedBytes, totalBytes, filename, memoryFallback })
    }
    if (totalBytes != null && loadedBytes !== totalBytes) throw new Error("دریافت فایل پیش از تکمیل جریان متوقف شد.")
    if (writable) await writable.close()
    else downloadBlob(new Blob(chunks, { type: STUDENT_CALL_SUMMARY_MIME }), filename, documentRef, urlApi)
    onProgress({ status: "completed", loadedBytes, totalBytes, filename, memoryFallback })
    return { filename, loadedBytes, totalBytes, memoryFallback }
  } catch (error) {
    try { await reader.cancel(error) } catch { /* already closed */ }
    if (writable?.abort) {
      try { await writable.abort(error) } catch { /* best effort cleanup */ }
    }
    throw error
  }
}

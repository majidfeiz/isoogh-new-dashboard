import { apiGet } from "../helpers/httpClient.jsx"
import { buildStudentCallSummaryParams, getStudentCallSummary, streamStudentCallSummaryExport } from "./studentCallSummaryService.jsx"

jest.mock("../helpers/httpClient.jsx", () => ({ apiGet: jest.fn() }))
beforeEach(() => apiGet.mockReset())

test("serializes list filters with fixed page size and 60 second timeout", async () => {
  const data = { items: [{ studentId: 12 }], meta: { page: 2, limit: 15, total: 30, lastPage: 2 } }
  apiGet.mockResolvedValue({ data: { data } })
  const controller = new AbortController()
  await expect(getStudentCallSummary({ schoolId: 4, search: "علی", page: 2, limit: 100 }, controller.signal)).resolves.toEqual(data)
  expect(Object.fromEntries(apiGet.mock.calls[0][1].params)).toEqual({ schoolId: "4", search: "علی", page: "2", limit: "15" })
  expect(apiGet.mock.calls[0][1]).toEqual(expect.objectContaining({ signal: controller.signal, timeout: 60000 }))
})

test("omits empty optional values", () => {
  expect(Object.fromEntries(buildStudentCallSummaryParams({ schoolId: 2, from: "", to: null, page: 1, limit: 15 }))).toEqual({ schoolId: "2", page: "1", limit: "15" })
})

const exportOptions = (request = apiGet, onProgress = jest.fn()) => {
  const link = { click: jest.fn(), remove: jest.fn() }
  return { request, onProgress, documentRef: { createElement: jest.fn(() => link), body: { appendChild: jest.fn() } }, urlApi: { createObjectURL: jest.fn(() => "blob:xlsx"), revokeObjectURL: jest.fn() }, link }
}

test("downloads blob with filters, no pagination, no timeout, and real progress", async () => {
  const progress = jest.fn()
  const blob = new Blob([new Uint8Array(5)])
  const request = jest.fn(async (url, config) => {
    config.onDownloadProgress({ loaded: 2 })
    config.onDownloadProgress({ loaded: 5, total: 5 })
    return { data: blob }
  })
  const options = exportOptions(request, progress)
  await expect(streamStudentCallSummaryExport({ schoolId: 4, search: "علی", sortBy: "studentName", sortOrder: "ASC", page: 3, limit: 100 }, options)).resolves.toEqual({ filename: "student-call-summary.xlsx", loadedBytes: 5, totalBytes: 5 })
  expect(Object.fromEntries(request.mock.calls[0][1].params)).toEqual({ schoolId: "4", search: "علی", sortBy: "studentName", sortOrder: "ASC" })
  expect(request.mock.calls[0][1]).toEqual(expect.objectContaining({ responseType: "blob", timeout: 0 }))
  expect(progress).toHaveBeenCalledWith(expect.objectContaining({ status: "streaming", loadedBytes: 2, totalBytes: null }))
  expect(progress).toHaveBeenLastCalledWith(expect.objectContaining({ status: "completed", loadedBytes: 5, totalBytes: 5 }))
  expect(options.link.download).toBe("student-call-summary.xlsx")
})

test("aborted exports never create a partial download", async () => {
  const controller = new AbortController()
  const options = exportOptions(jest.fn((url, config) => {
    config.onDownloadProgress({ loaded: 2 })
    controller.abort()
    const error = new Error("Aborted")
    error.name = "AbortError"
    return Promise.reject(error)
  }))
  await expect(streamStudentCallSummaryExport({ schoolId: 1 }, { ...options, signal: controller.signal })).rejects.toMatchObject({ name: "AbortError" })
  expect(options.urlApi.createObjectURL).not.toHaveBeenCalled()
})

test("parses a JSON error blob and never downloads it", async () => {
  const errorBlob = new Blob([], { type: "application/json" })
  errorBlob.text = jest.fn().mockResolvedValue(JSON.stringify({ message: "بازه نامعتبر است" }))
  const error = { response: { status: 422, data: errorBlob } }
  const options = exportOptions(jest.fn().mockRejectedValue(error))
  await expect(streamStudentCallSummaryExport({ schoolId: 1 }, options)).rejects.toMatchObject({ response: { data: { message: "بازه نامعتبر است" } } })
  expect(options.urlApi.createObjectURL).not.toHaveBeenCalled()
})

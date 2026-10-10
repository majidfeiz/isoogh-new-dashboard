import { apiGet } from "../helpers/httpClient.jsx"
import {
  buildStudentCallSummaryParams, getStudentCallSummary,
  streamStudentCallSummaryExport, studentCallSummaryFilename,
} from "./studentCallSummaryService.jsx"

jest.mock("../helpers/httpClient.jsx", () => ({ apiGet: jest.fn() }))

beforeEach(() => apiGet.mockReset())

test("serializes list filters and unwraps items/meta", async () => {
  const data = { items: [{ studentId: 12 }], meta: { page: 2, limit: 25, total: 30, lastPage: 2 } }
  apiGet.mockResolvedValue({ data: { data } })
  const controller = new AbortController()
  await expect(getStudentCallSummary({ schoolId: 4, from: "2026-10-01T00:00:00+03:30", to: "2026-10-02T00:00:00+03:30", search: "علی", sortBy: "totalCalls", sortOrder: "DESC", page: 2, limit: 25 }, controller.signal)).resolves.toEqual(data)
  expect(apiGet.mock.calls[0][0]).toBe("http://127.0.0.1:8040/reports/student-call-summary")
  expect(Object.fromEntries(apiGet.mock.calls[0][1].params)).toEqual({ schoolId: "4", from: "2026-10-01T00:00:00+03:30", to: "2026-10-02T00:00:00+03:30", search: "علی", sortBy: "totalCalls", sortOrder: "DESC", page: "2", limit: "25" })
  expect(apiGet.mock.calls[0][1].signal).toBe(controller.signal)
})

test("omits empty optional values", () => {
  expect(Object.fromEntries(buildStudentCallSummaryParams({ schoolId: 2, from: "", to: null, page: 1, limit: 10 }))).toEqual({ schoolId: "2", page: "1", limit: "10" })
})

const streamResponse = (chunks, headers = {}) => {
  let index = 0
  return {
    ok: true, status: 200, headers: new Headers(headers),
    body: { getReader: () => ({
      read: jest.fn(async () => index < chunks.length ? { done: false, value: chunks[index++] } : { done: true }),
      cancel: jest.fn(),
    }) },
  }
}

const fallbackOptions = (fetchImpl, onProgress = jest.fn()) => {
  const link = { click: jest.fn(), remove: jest.fn() }
  return {
    fetchImpl, onProgress, windowRef: {},
    documentRef: { createElement: jest.fn(() => link), body: { appendChild: jest.fn() } },
    urlApi: { createObjectURL: jest.fn(() => "blob:xlsx"), revokeObjectURL: jest.fn() },
    link,
  }
}

test("streams export filters without pagination, reads filename and reports exact progress", async () => {
  const progress = jest.fn()
  const response = streamResponse([new Uint8Array(2), new Uint8Array(3)], {
    "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "Content-Length": "5",
    "Content-Disposition": "attachment; filename*=UTF-8''%DA%AF%D8%B2%D8%A7%D8%B1%D8%B4.xlsx",
  })
  const options = fallbackOptions(jest.fn().mockResolvedValue(response), progress)
  await expect(streamStudentCallSummaryExport({ schoolId: 4, search: "علی", sortBy: "studentName", sortOrder: "ASC", page: 3, limit: 100 }, options)).resolves.toEqual(expect.objectContaining({ filename: "گزارش.xlsx", loadedBytes: 5, totalBytes: 5, memoryFallback: true }))
  const requestedUrl = options.fetchImpl.mock.calls[0][0]
  expect(requestedUrl).toContain("schoolId=4")
  expect(requestedUrl).not.toMatch(/page=|limit=/)
  expect(progress.mock.calls.map(([value]) => value.status)).toEqual(["connecting", "streaming", "streaming", "streaming", "completed"])
  expect(progress).toHaveBeenLastCalledWith(expect.objectContaining({ status: "completed", loadedBytes: 5, totalBytes: 5 }))
  expect(options.link.download).toBe("گزارش.xlsx")
})

test("uses indeterminate progress without Content-Length", async () => {
  const progress = jest.fn()
  const options = fallbackOptions(jest.fn().mockResolvedValue(streamResponse([new Uint8Array(4)])), progress)
  await streamStudentCallSummaryExport({ schoolId: 1 }, options)
  expect(progress).toHaveBeenCalledWith(expect.objectContaining({ status: "streaming", loadedBytes: 4, totalBytes: null }))
})

test("writes directly through File System Access without creating a Blob", async () => {
  const writable = { write: jest.fn(), close: jest.fn(), abort: jest.fn() }
  const showSaveFilePicker = jest.fn().mockResolvedValue({ createWritable: jest.fn().mockResolvedValue(writable) })
  const createObjectURL = jest.fn()
  await streamStudentCallSummaryExport({ schoolId: 1 }, {
    fetchImpl: jest.fn().mockResolvedValue(streamResponse([new Uint8Array([1, 2])], { "Content-Disposition": "attachment; filename=custom.xlsx" })),
    windowRef: { showSaveFilePicker }, documentRef: {}, urlApi: { createObjectURL }, onProgress: jest.fn(),
  })
  expect(showSaveFilePicker).toHaveBeenCalledWith(expect.objectContaining({ suggestedName: "custom.xlsx" }))
  expect(writable.write).toHaveBeenCalledTimes(1)
  expect(writable.close).toHaveBeenCalled()
  expect(createObjectURL).not.toHaveBeenCalled()
})

test("aborts an incomplete stream and never reports completed", async () => {
  const controller = new AbortController()
  const progress = jest.fn((state) => { if (state.status === "streaming" && state.loadedBytes === 2) controller.abort() })
  const options = fallbackOptions(jest.fn().mockResolvedValue(streamResponse([new Uint8Array(2), new Uint8Array(2)])), progress)
  await expect(streamStudentCallSummaryExport({ schoolId: 1 }, { ...options, signal: controller.signal })).rejects.toMatchObject({ name: "AbortError" })
  expect(progress).not.toHaveBeenCalledWith(expect.objectContaining({ status: "completed" }))
})

test("does not complete when the stream is shorter than Content-Length", async () => {
  const progress = jest.fn()
  const options = fallbackOptions(jest.fn().mockResolvedValue(streamResponse([new Uint8Array(2)], { "Content-Length": "5" })), progress)
  await expect(streamStudentCallSummaryExport({ schoolId: 1 }, options)).rejects.toThrow("پیش از تکمیل")
  expect(progress).not.toHaveBeenCalledWith(expect.objectContaining({ status: "completed" }))
  expect(options.urlApi.createObjectURL).not.toHaveBeenCalled()
})

test("rejects JSON errors before writing them into a file", async () => {
  const response = { ok: false, status: 403, headers: new Headers({ "Content-Type": "application/json" }), json: jest.fn().mockResolvedValue({ message: "عدم دسترسی" }) }
  const options = fallbackOptions(jest.fn().mockResolvedValue(response))
  await expect(streamStudentCallSummaryExport({ schoolId: 1 }, options)).rejects.toMatchObject({ status: 403, message: "عدم دسترسی" })
  expect(options.urlApi.createObjectURL).not.toHaveBeenCalled()
})

test("sanitizes Content-Disposition filenames and has a fixed fallback", () => {
  expect(studentCallSummaryFilename("attachment; filename=../bad.xlsx")).toBe(".._bad.xlsx")
  expect(studentCallSummaryFilename()).toBe("student-call-summary.xlsx")
})

import { apiGet } from "../helpers/httpClient.jsx"
import { buildStudentCallSummaryParams, exportStudentCallSummary, getStudentCallSummary } from "./studentCallSummaryService.jsx"

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

test("export returns a blob and never sends page or limit", async () => {
  const blob = new Blob(["xlsx"])
  apiGet.mockResolvedValue({ data: blob })
  await expect(exportStudentCallSummary({ schoolId: 4, search: "علی", sortBy: "studentName", sortOrder: "ASC", page: 3, limit: 100 })).resolves.toBe(blob)
  const config = apiGet.mock.calls[0][1]
  expect(config.responseType).toBe("blob")
  expect(Object.fromEntries(config.params)).toEqual({ schoolId: "4", search: "علی", sortBy: "studentName", sortOrder: "ASC" })
})

test("omits empty optional values", () => {
  expect(Object.fromEntries(buildStudentCallSummaryParams({ schoolId: 2, from: "", to: null, page: 1, limit: 10 }))).toEqual({ schoolId: "2", page: "1", limit: "10" })
})

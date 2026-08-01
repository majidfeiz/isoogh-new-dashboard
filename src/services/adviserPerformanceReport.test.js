import { apiGet } from "../helpers/httpClient.jsx"
import {
  exportAdviserPerformanceReport,
  getAdviserPerformanceForms,
  getAdviserPerformanceReport,
  getAdviserPerformanceSchools,
} from "./reportService.jsx"

jest.mock("../helpers/httpClient.jsx", () => ({ apiGet: jest.fn() }))

beforeEach(() => apiGet.mockReset())

test("loads schools, forms and the wrapped paginated report", async () => {
  const controller = new AbortController()
  apiGet
    .mockResolvedValueOnce({ data: { data: [{ id: 2, title: "مجموعه" }] } })
    .mockResolvedValueOnce({ data: { data: [{ id: 14, title: "فرم" }] } })
    .mockResolvedValueOnce({ data: { data: {
      school: { id: 2, title: "مجموعه" }, form: { id: 14, title: "فرم" },
      questions: [{ id: 7, title: "سؤال", order: 1 }],
      rows: [{ studentId: 9, adviserName: null, answers: { "7": "پاسخ" } }],
      meta: { page: 2, limit: 15, total: 20, lastPage: 2 },
    } } })

  await expect(getAdviserPerformanceSchools(controller.signal)).resolves.toHaveLength(1)
  await expect(getAdviserPerformanceForms(2, controller.signal)).resolves.toHaveLength(1)
  const result = await getAdviserPerformanceReport({ schoolId: 2, formId: 14, page: 2, limit: 15 }, controller.signal)
  expect(result.rows[0].answers["7"]).toBe("پاسخ")
  expect(result.meta).toEqual({ page: 2, limit: 15, total: 20, lastPage: 2 })
  expect(apiGet.mock.calls[2][1].signal).toBe(controller.signal)
  expect(Object.fromEntries(apiGet.mock.calls[2][1].params)).toEqual({ schoolId: "2", formId: "14", page: "2", limit: "15" })
})

test("exports active filters without pagination", async () => {
  const blob = new Blob(["xlsx"])
  apiGet.mockResolvedValue({ data: blob })
  await expect(exportAdviserPerformanceReport({
    schoolId: 2, formId: 14, studentSearch: "علی", adviserSearch: "رضا", page: 3, limit: 50,
  })).resolves.toBe(blob)
  const config = apiGet.mock.calls[0][1]
  expect(config.responseType).toBe("blob")
  expect(Object.fromEntries(config.params)).toEqual({
    formId: "14", schoolId: "2", studentSearch: "علی", adviserSearch: "رضا",
  })
  expect(config.params.has("page")).toBe(false)
  expect(config.params.has("limit")).toBe(false)
})

import { apiGet } from "../helpers/httpClient.jsx"
import {
  exportAdviserFormPerformanceReport,
  getAdviserFormPerformanceForms,
  getAdviserFormPerformanceReport,
  getAdviserFormPerformanceSchools,
} from "./adviserFormPerformanceReportService.jsx"

jest.mock("../helpers/httpClient.jsx", () => ({ apiGet: jest.fn() }))

beforeEach(() => apiGet.mockReset())

test("uses the independent adviser-form-performance-reports endpoints", async () => {
  apiGet
    .mockResolvedValueOnce({ data: { data: [{ id: 1, title: "مجموعه" }] } })
    .mockResolvedValueOnce({ data: { data: [{ id: 2, title: "فرم" }] } })
    .mockResolvedValueOnce({ data: { data: { questions: [], rows: [], meta: { page: 2, limit: 25, total: 50, lastPage: 2 } } } })
  await getAdviserFormPerformanceSchools()
  await getAdviserFormPerformanceForms(1)
  const report = await getAdviserFormPerformanceReport({ schoolId: 1, formId: 2, page: 2, limit: 25 })
  expect(apiGet.mock.calls.map(([url]) => url)).toEqual([
    "http://127.0.0.1:8040/adviser-form-performance-reports/schools",
    "http://127.0.0.1:8040/adviser-form-performance-reports/forms",
    "http://127.0.0.1:8040/adviser-form-performance-reports",
  ])
  expect(apiGet.mock.calls[2][1].params).toEqual({ schoolId: 1, formId: 2, page: 2, limit: 25 })
  expect(report.meta.lastPage).toBe(2)
})

test("export sends only the active school and form and exposes response headers", async () => {
  const blob = new Blob(["xlsx"])
  apiGet.mockResolvedValue({ data: blob, headers: { "content-disposition": "attachment; filename=report.xlsx" } })
  await expect(exportAdviserFormPerformanceReport({ schoolId: 7, formId: 8, page: 4, limit: 100 }))
    .resolves.toEqual({ blob, contentDisposition: "attachment; filename=report.xlsx" })
  expect(apiGet.mock.calls[0][1].params).toEqual({ schoolId: 7, formId: 8 })
  expect(apiGet.mock.calls[0][1].responseType).toBe("blob")
})

test("trims active searches and omits empty searches from report and export", async () => {
  apiGet
    .mockResolvedValueOnce({ data: { data: { rows: [], questions: [], meta: { page: 1, limit: 15, total: 0, lastPage: 1 } } } })
    .mockResolvedValueOnce({ data: new Blob(["xlsx"]), headers: {} })
  await getAdviserFormPerformanceReport({
    schoolId: 7, formId: 8, studentSearch: "  علی  ", adviserSearch: "   ", page: 1, limit: 15,
  })
  await exportAdviserFormPerformanceReport({ schoolId: 7, formId: 8, studentSearch: " علی ", adviserSearch: " رضا " })
  expect(apiGet.mock.calls[0][1].params).toEqual({ schoolId: 7, formId: 8, studentSearch: "علی", page: 1, limit: 15 })
  expect(apiGet.mock.calls[1][1].params).toEqual({ schoolId: 7, formId: 8, studentSearch: "علی", adviserSearch: "رضا" })
  expect(apiGet.mock.calls[1][1].params).not.toHaveProperty("page")
  expect(apiGet.mock.calls[1][1].params).not.toHaveProperty("limit")
})

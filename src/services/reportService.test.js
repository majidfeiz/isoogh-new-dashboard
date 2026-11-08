import { apiGet } from "../helpers/httpClient.jsx"
import {
  exportReportsCallsByAdviser,
  exportContactFormsComprehensiveReport,
  exportContactFormsOnlineReport,
  exportStudentVoipComprehensiveReport,
  exportInactiveAdvisersReport,
  getContactFormsComprehensiveReport,
  getContactFormsOnlineReport,
  getStudentVoipComprehensiveReport,
  getInactiveAdvisersReport,
  getReportsCallsByAdviser,
  getReportsOverview,
  getReportsUncontactedStudents,
  exportReportsUncontactedStudents,
  jalaliBoundaryToIso,
  reportQueryKey,
  runReportQuery,
} from "./reportService.jsx"

jest.mock("../helpers/httpClient.jsx", () => ({ apiGet: jest.fn() }))

beforeEach(() => apiGet.mockReset())

test("converts Jalali Tehran boundaries in the API layer and sends a half-open range", async () => {
  expect(jalaliBoundaryToIso("1405/08/01")).toBe("2026-10-22T20:30:00.000Z")
  apiGet.mockResolvedValue({ data: { data: { totalCalls: 1 } } })
  await getReportsOverview({ schoolId: 94, from: "1405/08/01", to: "1405/09/01" })
  expect(apiGet.mock.calls[0][1]).toEqual(expect.objectContaining({ params: {
    schoolId: 94,
    from: jalaliBoundaryToIso("1405/08/01"),
    to: jalaliBoundaryToIso("1405/09/01"),
  } }))
  expect(apiGet.mock.calls[0][1]).not.toHaveProperty("timeout")
  expect(new Date(apiGet.mock.calls[0][1].params.from).getTime()).toBeLessThan(new Date(apiGet.mock.calls[0][1].params.to).getTime())
})

test("coalesces StrictMode-equivalent requests for one stable report key", async () => {
  let resolve
  const request = jest.fn(() => new Promise((done) => { resolve = done }))
  const key = reportQueryKey("overview", { schoolId: 94, from: "1405/08/01", to: "1405/09/01" })
  const first = runReportQuery(key, request)
  const second = runReportQuery(key, request)
  expect(request).toHaveBeenCalledTimes(1)
  resolve({ ok: true })
  await expect(Promise.all([first, second])).resolves.toEqual([{ ok: true }, { ok: true }])
})

test("uses server pagination for uncontacted students and exports without page or limit", async () => {
  apiGet.mockResolvedValueOnce({ data: { data: { items: [{ studentId: 1 }], meta: { page: 3, limit: 10, total: 22, lastPage: 3 } } } })
  const result = await getReportsUncontactedStudents({ schoolId: 94, from: "1405/08/01", to: "1405/09/01", page: 3, limit: 10 })
  expect(result.meta.total).toBe(22)
  expect(apiGet.mock.calls[0][1].params).toEqual(expect.objectContaining({ schoolId: 94, page: 3, limit: 10 }))
  apiGet.mockResolvedValueOnce({ data: new Blob(["csv"]), headers: { "content-disposition": "attachment; filename=students.csv" } })
  await expect(exportReportsUncontactedStudents({ schoolId: 94, from: "1405/08/01", to: "1405/09/01" })).resolves.toEqual(expect.objectContaining({ filename: "students.csv" }))
  expect(apiGet.mock.calls[1][1].params).not.toHaveProperty("page")
  expect(apiGet.mock.calls[1][1].params).not.toHaveProperty("limit")
})

test("maps the wrapped calls-by-adviser response", async () => {
  const data = { items: [{ adviserId: 12, adviserName: "فاطمه روشن" }], meta: { total: 1 } }
  apiGet.mockResolvedValue({ data: { data } })

  await expect(getReportsCallsByAdviser({ page: 2, search: "فاطمه" })).resolves.toEqual(data)
  expect(apiGet.mock.calls[0][0]).toBe("http://127.0.0.1:8040/reports/calls-by-adviser")
  expect(Object.fromEntries(apiGet.mock.calls[0][1].params)).toEqual(expect.objectContaining({
    page: "2",
    search: "فاطمه",
  }))
})

test("maps comprehensive KPI, statuses, chart, forms and pagination", async () => {
  const data = {
    summary: { formsCount: 2, progressPercent: 50 },
    statuses: [{ key: "OTHER:FAILED", label: "سایر: FAILED" }],
    chart: [{ key: "ANSWERED", label: "پاسخ داده شده", value: 4, percent: 80 }],
    forms: [{ formId: 12, formTitle: "پیگیری" }],
    meta: { page: 1, limit: 10, total: 1, lastPage: 1 },
  }
  apiGet.mockResolvedValue({ data: { data } })
  const result = await getContactFormsComprehensiveReport({
    from: "2026-07-01T00:00:00.000+03:30",
    to: "2026-07-09T00:00:00.000+03:30",
    formIds: "12,18",
    page: 1,
  })
  expect(result).toEqual(data)
  expect(result.meta).toEqual({ page: 1, limit: 10, total: 1, lastPage: 1 })
  expect(result.statuses[0].label).toBe("سایر: FAILED")
  expect(result.chart[0]).toEqual(expect.objectContaining({ value: 4, percent: 80 }))
  expect(apiGet.mock.calls[0][1].params.get("from")).toBe("2026-07-01T00:00:00.000+03:30")
  expect(apiGet.mock.calls[0][1].params.toString()).toContain("%2B03%3A30")
  expect(apiGet.mock.calls[0][1].params.get("formIds")).toBe("12,18")
})

test("passes AbortController signal to comprehensive report request", async () => {
  apiGet.mockResolvedValue({ data: { data: {} } })
  const controller = new AbortController()
  await getContactFormsComprehensiveReport({}, controller.signal)
  expect(apiGet.mock.calls[0][1].signal).toBe(controller.signal)
})

test("downloads comprehensive Excel blob with exact active filters and no pagination", async () => {
  const blob = new Blob(["xlsx"])
  apiGet.mockResolvedValue({ data: blob })
  const filters = {
    from: "2026-07-01",
    to: "2026-07-08",
    formIds: "12,18",
    schoolId: "4",
    search: "پیگیری",
    sortBy: "progressPercent",
    sortOrder: "DESC",
    statusSearch: "پاسخ",
    statusSortBy: "percent",
    statusSortOrder: "ASC",
    page: 3,
    limit: 25,
  }

  await expect(exportContactFormsComprehensiveReport(filters)).resolves.toBe(blob)
  expect(apiGet.mock.calls[0][0]).toBe("http://127.0.0.1:8040/reports/contact-forms-comprehensive/export")
  const config = apiGet.mock.calls[0][1]
  expect(config.responseType).toBe("blob")
  expect(Object.fromEntries(config.params)).toEqual({
    from: filters.from,
    to: filters.to,
    formIds: filters.formIds,
    schoolId: filters.schoolId,
    search: filters.search,
    statusSearch: filters.statusSearch,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    statusSortBy: filters.statusSortBy,
    statusSortOrder: filters.statusSortOrder,
  })
  expect(config.params.has("page")).toBe(false)
  expect(config.params.has("limit")).toBe(false)
})

test("maps online report hierarchy, dynamic questions and grouped pagination", async () => {
  const data = {
    form: { id: 10, title: "هفتگی" },
    questions: [{ id: 501, required: true, sortKey: "question:501" }],
    groups: [{
      head: { rowType: "head", questionPercentages: { "501": 98 } },
      advisers: [{ rowType: "adviser", adviserId: 15 }],
    }],
    meta: { page: 2, limit: 10, totalGroups: 4, totalAdvisers: 25, lastPage: 2 },
  }
  apiGet.mockResolvedValue({ data: { data } })
  const controller = new AbortController()
  await expect(getContactFormsOnlineReport({ formId: 10, schoolId: 4, page: 2 }, controller.signal)).resolves.toEqual(data)
  expect(apiGet.mock.calls[0][1].signal).toBe(controller.signal)
  expect(apiGet.mock.calls[0][1].params.get("formId")).toBe("10")
  expect(apiGet.mock.calls[0][1].params.get("schoolId")).toBe("4")
})

test("downloads online Excel with active filters and without pagination", async () => {
  const blob = new Blob(["xlsx"])
  apiGet.mockResolvedValue({ data: blob })
  const filters = {
    formId: "10",
    schoolId: "4",
    search: "بهزاد",
    sortBy: "question:501",
    sortOrder: "DESC",
    page: 3,
    limit: 25,
  }
  await expect(exportContactFormsOnlineReport(filters)).resolves.toBe(blob)
  expect(apiGet.mock.calls[0][0]).toBe("http://127.0.0.1:8040/reports/contact-forms-online/export")
  const config = apiGet.mock.calls[0][1]
  expect(config.responseType).toBe("blob")
  expect(Object.fromEntries(config.params)).toEqual({
    formId: "10",
    schoolId: "4",
    search: "بهزاد",
    sortBy: "question:501",
    sortOrder: "DESC",
  })
  expect(config.params.has("page")).toBe(false)
  expect(config.params.has("limit")).toBe(false)
})

test("maps student VoIP rows and pagination and passes abort signal", async () => {
  const data = {
    form: { id: 10, title: "هفتگی" },
    items: [{ studentId: 20, studentName: "سید امیرمحمد", successfulCalls: 9 }],
    meta: { page: 1, limit: 10, total: 10496, lastPage: 1050 },
  }
  apiGet.mockResolvedValue({ data: { data } })
  const controller = new AbortController()
  const result = await getStudentVoipComprehensiveReport({
    formId: 10,
    from: "2026-07-01",
    to: "2026-07-08",
    page: 1,
  }, controller.signal)
  expect(result).toEqual(data)
  expect(apiGet.mock.calls[0][1].signal).toBe(controller.signal)
  expect(apiGet.mock.calls[0][1].params.get("from")).toBe("2026-07-01")
  expect(result.meta.total).toBe(10496)
})

test("downloads student VoIP Excel with active filters and no pagination", async () => {
  const blob = new Blob(["xlsx"])
  apiGet.mockResolvedValue({ data: blob })
  const filters = {
    formId: "10",
    from: "2026-07-01",
    to: "2026-07-08",
    schoolId: "4",
    search: "موسوی",
    sortBy: "avgSuccessfulDurationSeconds",
    sortOrder: "DESC",
    page: 3,
    limit: 25,
  }
  await expect(exportStudentVoipComprehensiveReport(filters)).resolves.toBe(blob)
  expect(apiGet.mock.calls[0][0]).toBe("http://127.0.0.1:8040/reports/student-voip-comprehensive/export")
  const config = apiGet.mock.calls[0][1]
  expect(config.responseType).toBe("blob")
  expect(Object.fromEntries(config.params)).toEqual({
    formId: filters.formId,
    from: filters.from,
    to: filters.to,
    schoolId: filters.schoolId,
    search: filters.search,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  })
  expect(config.params.has("page")).toBe(false)
  expect(config.params.has("limit")).toBe(false)
})

test("maps inactive adviser timestamps, rows, total and passes abort signal", async () => {
  const data = {
    generatedAt: "2026-07-08T12:00:00.000Z",
    cutoffAt: "2026-07-05T12:00:00.000Z",
    items: [{ adviserId: 5, inactiveHours: 98, inactive: true }],
    meta: { page: 1, limit: 10, total: 24, lastPage: 3 },
  }
  apiGet.mockResolvedValue({ data: { data } })
  const controller = new AbortController()
  const result = await getInactiveAdvisersReport({ page: 1, limit: 10 }, controller.signal)
  expect(result).toEqual(data)
  expect(result.meta.total).toBe(24)
  expect(apiGet.mock.calls[0][1].signal).toBe(controller.signal)
})

test("downloads inactive advisers Excel with active filters and no pagination", async () => {
  const blob = new Blob(["xlsx"])
  apiGet.mockResolvedValue({ data: blob })
  const filters = {
    search: "فاطمه",
    schoolId: "4",
    sortBy: "inactiveHours",
    sortOrder: "DESC",
    page: 3,
    limit: 25,
  }
  await expect(exportInactiveAdvisersReport(filters)).resolves.toBe(blob)
  expect(apiGet.mock.calls[0][0]).toBe("http://127.0.0.1:8040/reports/inactive-advisers/export")
  const config = apiGet.mock.calls[0][1]
  expect(config.responseType).toBe("blob")
  expect(Object.fromEntries(config.params)).toEqual({
    search: filters.search,
    schoolId: filters.schoolId,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  })
  expect(config.params.has("page")).toBe(false)
  expect(config.params.has("limit")).toBe(false)
})

test("downloads a blob with active filters and without pagination", async () => {
  const blob = new Blob(["xlsx"])
  apiGet.mockResolvedValue({ data: blob })
  const filters = {
    from: "2026-07-01",
    to: "2026-07-08",
    schoolId: "4",
    search: "روشن",
    sortBy: "answeredCalls",
    sortOrder: "DESC",
    page: 7,
    limit: 50,
  }

  await expect(exportReportsCallsByAdviser(filters)).resolves.toBe(blob)
  const config = apiGet.mock.calls[0][1]
  expect(config.responseType).toBe("blob")
  expect(Object.fromEntries(config.params)).toEqual({
    from: filters.from,
    to: filters.to,
    schoolId: filters.schoolId,
    search: filters.search,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  })
  expect(config.params.has("page")).toBe(false)
  expect(config.params.has("limit")).toBe(false)
  expect(config.params.get("from")).toBe("2026-07-01")
  expect(config.params.toString()).not.toContain("%2B03%3A30")
})

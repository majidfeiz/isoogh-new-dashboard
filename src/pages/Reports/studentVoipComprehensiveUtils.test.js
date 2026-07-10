import {
  STUDENT_VOIP_SORT_FIELDS,
  canExportStudentVoipReport,
  canViewStudentVoipReport,
  formatStudentVoipDuration,
  formatStudentVoipPercent,
  hasRequiredStudentVoipFilters,
  parseStudentVoipQuery,
  resetStudentVoipView,
  saveStudentVoipBlob,
  scheduleStudentVoipSearch,
  serializeStudentVoipQuery,
  studentVoipViewState,
  toggleStudentVoipSort,
  uniqueStudentRows,
} from "./studentVoipComprehensiveUtils.js"

test("uses dedicated page and Excel permissions", () => {
  expect(canViewStudentVoipReport(["reports.student-voip-comprehensive.index"])).toBe(true)
  expect(canViewStudentVoipReport(["reports.index"])).toBe(false)
  expect(canExportStudentVoipReport(["reports.student-voip-comprehensive.export"])).toBe(true)
  expect(canExportStudentVoipReport(["reports.student-voip-comprehensive.index"])).toBe(false)
})

test("requires form and both dates and keeps selected date", () => {
  expect(hasRequiredStudentVoipFilters({ formId: "10", from: "a", to: "b" })).toBe(true)
  expect(hasRequiredStudentVoipFilters({ formId: "", from: "a", to: "b" })).toBe(false)
  const params = serializeStudentVoipQuery({ formId: 10, from: "2026-07-01", to: "2026-07-02" })
  expect(params.get("from")).toBe("2026-07-01")
  expect(parseStudentVoipQuery(params).formId).toBe("10")
})

test("show all preserves required filters and sort but resets search, school and page", () => {
  const query = { formId: "10", from: "from", to: "to", schoolId: "4", search: "سید", page: 8, sortBy: "totalCalls", sortOrder: "DESC" }
  expect(resetStudentVoipView(query)).toEqual({ ...query, schoolId: "", search: "", page: 1 })
})

test("supports sorting every API column and resets page", () => {
  STUDENT_VOIP_SORT_FIELDS.forEach((field) => {
    const result = toggleStudentVoipSort({ sortBy: "studentName", sortOrder: "ASC", page: 5 }, field)
    expect(result.sortBy).toBe(field)
    expect(result.page).toBe(1)
  })
})

test("debounces search and supports cancellation", () => {
  jest.useFakeTimers()
  const callback = jest.fn()
  scheduleStudentVoipSearch(callback, "موسوی")
  jest.advanceTimersByTime(399)
  expect(callback).not.toHaveBeenCalled()
  jest.advanceTimersByTime(1)
  expect(callback).toHaveBeenCalledWith("موسوی")
  const canceled = jest.fn()
  scheduleStudentVoipSearch(canceled, "قدیمی")()
  jest.runAllTimers()
  expect(canceled).not.toHaveBeenCalled()
  jest.useRealTimers()
})

test("keeps one row per student and formats time and successful ratio", () => {
  expect(uniqueStudentRows([{ studentId: 1 }, { studentId: 1 }, { studentId: 2 }])).toHaveLength(2)
  expect(formatStudentVoipDuration(526)).toBe("00:08:46")
  expect(formatStudentVoipDuration(58.44)).toBe("00:00:58")
  expect(formatStudentVoipPercent(23.1)).toContain("۲۳٫۱")
})

test("derives missing, loading, error, empty and ready states", () => {
  expect(studentVoipViewState({ hasFilters: false, loading: false, error: "", itemCount: 0 })).toBe("missing-filters")
  expect(studentVoipViewState({ hasFilters: true, loading: true, error: "", itemCount: 0 })).toBe("loading")
  expect(studentVoipViewState({ hasFilters: true, loading: false, error: "خطا", itemCount: 0 })).toBe("error")
  expect(studentVoipViewState({ hasFilters: true, loading: false, error: "", itemCount: 0 })).toBe("empty")
  expect(studentVoipViewState({ hasFilters: true, loading: false, error: "", itemCount: 1 })).toBe("ready")
})

test("saves Excel Blob using the required filename", () => {
  const link = { click: jest.fn(), remove: jest.fn(), href: "", download: "" }
  const documentRef = { createElement: jest.fn(() => link), body: { appendChild: jest.fn() } }
  const urlApi = { createObjectURL: jest.fn(() => "blob:student-voip"), revokeObjectURL: jest.fn() }
  expect(saveStudentVoipBlob(new Blob(["xlsx"]), documentRef, urlApi)).toBe("student-voip-comprehensive.xlsx")
  expect(link.click).toHaveBeenCalled()
})

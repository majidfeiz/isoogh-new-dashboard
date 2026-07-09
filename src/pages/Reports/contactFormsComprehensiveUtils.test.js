import {
  canViewComprehensiveReport,
  canExportComprehensiveReport,
  chartColor,
  comprehensiveViewState,
  formatReportDuration,
  normalizeFormIds,
  parseComprehensiveQuery,
  progressValue,
  scheduleDebouncedSearch,
  saveComprehensiveReportBlob,
  serializeComprehensiveQuery,
  toggleSort,
  withDebouncedSearch,
} from "./contactFormsComprehensiveUtils.js"

test("guards the route with its dedicated permission", () => {
  expect(canViewComprehensiveReport(["reports.contact-forms-comprehensive.index"])).toBe(true)
  expect(canViewComprehensiveReport(["reports.index"])).toBe(false)
  expect(canExportComprehensiveReport(["reports.contact-forms-comprehensive.export"])).toBe(true)
  expect(canExportComprehensiveReport(["reports.contact-forms-comprehensive.index"])).toBe(false)
})

test("saves the report blob with the required Excel filename", () => {
  const link = { click: jest.fn(), remove: jest.fn(), href: "", download: "" }
  const documentRef = {
    createElement: jest.fn(() => link),
    body: { appendChild: jest.fn() },
  }
  const urlApi = { createObjectURL: jest.fn(() => "blob:report"), revokeObjectURL: jest.fn() }
  const blob = new Blob(["xlsx"])

  expect(saveComprehensiveReportBlob(blob, documentRef, urlApi)).toBe("contact-forms-comprehensive.xlsx")
  expect(urlApi.createObjectURL).toHaveBeenCalledWith(blob)
  expect(link.click).toHaveBeenCalled()
  expect(urlApi.revokeObjectURL).toHaveBeenCalledWith("blob:report")
})

test("serializes multiple form ids and encodes timezone", () => {
  const params = serializeComprehensiveQuery({
    from: "2026-07-01T00:00:00+03:30",
    formIds: normalizeFormIds([12, 18, 21]),
    page: 2,
  })
  expect(params.get("formIds")).toBe("12,18,21")
  expect(params.toString()).toContain("%2B03%3A30")
  expect(parseComprehensiveQuery(params).page).toBe(2)
})

test("search and sort reset the forms page", () => {
  expect(withDebouncedSearch({ page: 4 }, "search", " فرم ")).toEqual({ page: 1, search: "فرم" })
  expect(toggleSort("formTitle", "ASC", "formTitle")).toEqual({ field: "formTitle", order: "DESC" })
  expect(toggleSort("formTitle", "DESC", "totalCalls")).toEqual({ field: "totalCalls", order: "ASC" })
})

test("debounces search and supports cancellation", () => {
  jest.useFakeTimers()
  const callback = jest.fn()
  const cancel = scheduleDebouncedSearch(callback, "فرم")
  jest.advanceTimersByTime(399)
  expect(callback).not.toHaveBeenCalled()
  jest.advanceTimersByTime(1)
  expect(callback).toHaveBeenCalledWith("فرم")
  const canceled = jest.fn()
  scheduleDebouncedSearch(canceled, "قدیمی")()
  jest.runAllTimers()
  expect(canceled).not.toHaveBeenCalled()
  cancel()
  jest.useRealTimers()
})

test("formats time, keeps unknown chart statuses and exposes view states", () => {
  expect(formatReportDuration(3661)).toBe("01:01:01")
  expect(chartColor({ key: "OTHER:FAILED" }, 2)).toBeTruthy()
  expect(progressValue(62.5)).toBe(62.5)
  expect(progressValue(140)).toBe(100)
  expect(comprehensiveViewState({ loading: false, error: "", formsCount: 0, statusesCount: 1, chartCount: 0 })).toBe("ready")
  expect(comprehensiveViewState({ loading: false, error: "", formsCount: 0, statusesCount: 0, chartCount: 0 })).toBe("empty")
  expect(comprehensiveViewState({ loading: false, error: "خطا", formsCount: 0, statusesCount: 0, chartCount: 0 })).toBe("error")
})

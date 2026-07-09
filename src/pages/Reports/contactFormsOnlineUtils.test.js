import {
  canExportOnlineReport,
  canViewOnlineReport,
  flattenOnlineGroups,
  formatOnlineDuration,
  formatOnlinePercent,
  onlineViewState,
  parseOnlineQuery,
  resetOnlineView,
  saveOnlineReportBlob,
  scheduleOnlineSearch,
  serializeOnlineQuery,
  sortedQuestions,
  toggleOnlineSort,
} from "./contactFormsOnlineUtils.js"

test("uses dedicated view and download permissions", () => {
  expect(canViewOnlineReport(["reports.contact-forms-online.index"])).toBe(true)
  expect(canViewOnlineReport(["reports.index"])).toBe(false)
  expect(canExportOnlineReport(["reports.contact-forms-online.export"])).toBe(true)
  expect(canExportOnlineReport(["reports.contact-forms-online.index"])).toBe(false)
})

test("keeps selected form and resets optional online view state", () => {
  const reset = resetOnlineView({ formId: "12", schoolId: "4", search: "مشاور", sortBy: "totalStudents" })
  expect(reset).toEqual(expect.objectContaining({ formId: "12", schoolId: "", search: "", page: 1 }))
  expect(parseOnlineQuery(serializeOnlineQuery(reset)).formId).toBe("12")
})

test("maps head and adviser rows and orders dynamic required questions", () => {
  const head = { rowType: "head", headAdviserId: 9 }
  const adviser = { rowType: "adviser", adviserId: 15 }
  expect(flattenOnlineGroups([{ head, advisers: [adviser] }])).toEqual([head, adviser])
  expect(sortedQuestions([
    { id: 2, order: 2, required: false },
    { id: 1, order: 1, required: true, sortKey: "question:1" },
  ])).toEqual([
    { id: 1, order: 1, required: true, sortKey: "question:1" },
    { id: 2, order: 2, required: false },
  ])
})

test("sorts dynamic questions and resets page", () => {
  const sorted = toggleOnlineSort({ sortBy: "headAdviserName", sortOrder: "ASC", page: 4 }, "question:501")
  expect(sorted).toEqual(expect.objectContaining({ sortBy: "question:501", sortOrder: "ASC", page: 1 }))
  expect(parseOnlineQuery(serializeOnlineQuery(sorted)).sortBy).toBe("question:501")
})

test("debounces search and allows cancellation", () => {
  jest.useFakeTimers()
  const callback = jest.fn()
  scheduleOnlineSearch(callback, "عطیه")
  jest.advanceTimersByTime(399)
  expect(callback).not.toHaveBeenCalled()
  jest.advanceTimersByTime(1)
  expect(callback).toHaveBeenCalledWith("عطیه")
  const canceled = jest.fn()
  scheduleOnlineSearch(canceled, "قدیمی")()
  jest.runAllTimers()
  expect(canceled).not.toHaveBeenCalled()
  jest.useRealTimers()
})

test("formats duration and does not clamp percentages above 100", () => {
  expect(formatOnlineDuration(3661)).toBe("01:01:01")
  expect(formatOnlinePercent(125.44)).toContain("۱۲۵٫۴")
})

test("derives no-form, loading, error, empty and ready states", () => {
  expect(onlineViewState({ formId: "", loading: false, error: "", groupCount: 0 })).toBe("no-form")
  expect(onlineViewState({ formId: "1", loading: true, error: "", groupCount: 0 })).toBe("loading")
  expect(onlineViewState({ formId: "1", loading: false, error: "خطا", groupCount: 0 })).toBe("error")
  expect(onlineViewState({ formId: "1", loading: false, error: "", groupCount: 0 })).toBe("empty")
  expect(onlineViewState({ formId: "1", loading: false, error: "", groupCount: 1 })).toBe("ready")
})

test("saves online Excel with required filename", () => {
  const link = { click: jest.fn(), remove: jest.fn(), href: "", download: "" }
  const documentRef = { createElement: jest.fn(() => link), body: { appendChild: jest.fn() } }
  const urlApi = { createObjectURL: jest.fn(() => "blob:online"), revokeObjectURL: jest.fn() }
  expect(saveOnlineReportBlob(new Blob(["xlsx"]), documentRef, urlApi)).toBe("contact-forms-online.xlsx")
  expect(link.click).toHaveBeenCalled()
})

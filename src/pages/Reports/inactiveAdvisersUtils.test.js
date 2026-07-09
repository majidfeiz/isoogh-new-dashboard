import {
  INACTIVE_ADVISER_SORT_FIELDS,
  canExportInactiveAdvisers,
  canViewInactiveAdvisers,
  formatInactiveHours,
  formatJalaliDateTime,
  hasNoCallHistory,
  inactiveAdvisersViewState,
  isAdminUser,
  parseInactiveAdvisersQuery,
  saveInactiveAdvisersBlob,
  scheduleInactiveAdvisersSearch,
  serializeInactiveAdvisersQuery,
  toggleInactiveAdvisersSort,
} from "./inactiveAdvisersUtils.js"

test("uses dedicated page and download permissions", () => {
  expect(canViewInactiveAdvisers(["reports.inactive-advisers.index"])).toBe(true)
  expect(canViewInactiveAdvisers(["reports.index"])).toBe(false)
  expect(canExportInactiveAdvisers(["reports.inactive-advisers.export"])).toBe(true)
})

test("shows school filter only for admin role variants", () => {
  expect(isAdminUser({ roles: [{ name: "admin" }] })).toBe(true)
  expect(isAdminUser({ roles: [{ slug: "super_admin" }] })).toBe(true)
  expect(isAdminUser({ roles: [{ name: "manager" }] })).toBe(false)
  expect(isAdminUser({ roles: [{ name: "head_adviser" }] })).toBe(false)
})

test("serializes filters and validates pagination", () => {
  const query = { search: "روشن", schoolId: "4", page: 2, limit: 25, sortBy: "lastCallAt", sortOrder: "ASC" }
  expect(parseInactiveAdvisersQuery(serializeInactiveAdvisersQuery(query))).toEqual(query)
})

test("debounces search and supports cancellation", () => {
  jest.useFakeTimers()
  const callback = jest.fn()
  scheduleInactiveAdvisersSearch(callback, "فاطمه")
  jest.advanceTimersByTime(399)
  expect(callback).not.toHaveBeenCalled()
  jest.advanceTimersByTime(1)
  expect(callback).toHaveBeenCalledWith("فاطمه")
  const canceled = jest.fn()
  scheduleInactiveAdvisersSearch(canceled, "قدیمی")()
  jest.runAllTimers()
  expect(canceled).not.toHaveBeenCalled()
  jest.useRealTimers()
})

test("sorts every supported column and resets page", () => {
  INACTIVE_ADVISER_SORT_FIELDS.forEach((field) => {
    const result = toggleInactiveAdvisersSort({ sortBy: "adviserName", sortOrder: "ASC", page: 5 }, field)
    expect(result.sortBy).toBe(field)
    expect(result.page).toBe(1)
  })
})

test("formats Jalali date, rolling inactive hours and no-call history", () => {
  expect(formatJalaliDateTime("2026-07-04T10:00:00.000Z")).toMatch(/^1405\/04\//)
  expect(formatInactiveHours(98, "2026-07-04T10:00:00.000Z")).toBe("۴ روز و ۲ ساعت")
  expect(formatInactiveHours(null, null)).toBe("بدون سابقه تماس")
  expect(hasNoCallHistory({ lastCallAt: null, inactiveHours: null })).toBe(true)
})

test("derives loading, error, empty and ready states", () => {
  expect(inactiveAdvisersViewState({ loading: true, error: "", itemCount: 0 })).toBe("loading")
  expect(inactiveAdvisersViewState({ loading: false, error: "خطا", itemCount: 0 })).toBe("error")
  expect(inactiveAdvisersViewState({ loading: false, error: "", itemCount: 0 })).toBe("empty")
  expect(inactiveAdvisersViewState({ loading: false, error: "", itemCount: 1 })).toBe("ready")
})

test("saves Excel Blob with required filename", () => {
  const link = { click: jest.fn(), remove: jest.fn(), href: "", download: "" }
  const documentRef = { createElement: jest.fn(() => link), body: { appendChild: jest.fn() } }
  const urlApi = { createObjectURL: jest.fn(() => "blob:inactive"), revokeObjectURL: jest.fn() }
  expect(saveInactiveAdvisersBlob(new Blob(["xlsx"]), documentRef, urlApi)).toBe("inactive-advisers.xlsx")
  expect(link.click).toHaveBeenCalled()
})

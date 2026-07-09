import {
  formatDuration,
  nextSort,
  parseReportQuery,
  reportTableState,
  serializeReportQuery,
  withSearch,
} from "./adviserCallPerformanceUtils.js"

test("serializes and restores active report filters", () => {
  const query = {
    from: "2026-07-01T00:00:00+03:30",
    to: "2026-07-08T00:00:00+03:30",
    schoolId: "12",
    search: "روشن",
    sortBy: "adviserName",
    sortOrder: "ASC",
    page: 3,
    limit: 25,
  }
  expect(parseReportQuery(serializeReportQuery(query))).toEqual(query)
})

test("changes sort direction and resets page", () => {
  expect(nextSort({ sortBy: "totalCalls", sortOrder: "ASC" }, "totalCalls"))
    .toEqual({ sortBy: "totalCalls", sortOrder: "DESC", page: 1 })
  expect(nextSort({ sortBy: "totalCalls", sortOrder: "DESC" }, "adviserName"))
    .toEqual({ sortBy: "adviserName", sortOrder: "ASC", page: 1 })
})

test("search resets page and duration uses HH:mm:ss", () => {
  expect(withSearch({ page: 8, search: "" }, "  فاطمه  ")).toEqual({
    page: 1,
    search: "فاطمه",
  })
  expect(formatDuration(3661)).toBe("01:01:01")
  expect(formatDuration(null)).toBe("—")
})

test("derives loading, empty, error and ready table states", () => {
  expect(reportTableState({ loading: true, error: "", itemCount: 0 })).toBe("loading")
  expect(reportTableState({ loading: false, error: "خطا", itemCount: 0 })).toBe("error")
  expect(reportTableState({ loading: false, error: "", itemCount: 0 })).toBe("empty")
  expect(reportTableState({ loading: false, error: "", itemCount: 1 })).toBe("ready")
})

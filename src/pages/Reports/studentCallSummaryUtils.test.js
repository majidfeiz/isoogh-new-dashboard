import {
  buildStudentCallSummaryRange, formatStudentCallDuration, logInconsistentCallTotals,
  parseStudentCallSummaryQuery, rowNumber,
} from "./studentCallSummaryUtils.js"

const jalali = (year, month, day) => ({ year, month: { number: month }, day })

test.each([[0, "00:00:00"], [65, "00:01:05"], [90061, "25:01:01"]])("formats duration %s", (seconds, expected) => {
  expect(formatStudentCallDuration(seconds)).toBe(expected)
})

test("builds paired inclusive/exclusive Tehran ISO boundaries", () => {
  expect(buildStudentCallSummaryRange(jalali(1405, 7, 18), jalali(1405, 7, 18))).toEqual({
    from: "2026-10-10T00:00:00+03:30", to: "2026-10-11T00:00:00+03:30", error: "",
  })
  expect(buildStudentCallSummaryRange(jalali(1405, 7, 18), null).error).toContain("هر دو تاریخ")
})

test("parses safe URL state and rejects unpaired dates/unknown sort", () => {
  const query = parseStudentCallSummaryQuery(new URLSearchParams("schoolId=8&from=x&page=3&limit=25&sortBy=bad&sortOrder=DESC"))
  expect(query).toEqual(expect.objectContaining({ schoolId: "8", from: "", to: "", page: 3, limit: 25, sortBy: "studentName", sortOrder: "DESC" }))
})

test("calculates server row number", () => expect(rowNumber(3, 25, 4)).toBe(55))

test("logs inconsistent totals without changing API rows", () => {
  const rows = [{ studentId: 1, totalCalls: 10, successfulCalls: 7, unsuccessfulCalls: 2 }]
  const logger = jest.fn()
  expect(logInconsistentCallTotals(rows, logger)).toBe(rows)
  expect(logger).toHaveBeenCalledWith(expect.stringContaining("inconsistent"), { studentId: 1 })
  expect(rows[0].totalCalls).toBe(10)
})

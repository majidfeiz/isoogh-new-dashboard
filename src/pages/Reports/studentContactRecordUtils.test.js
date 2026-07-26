import {
  callStatus,
  formStatus,
  getContactCallId,
  getStudentRecordId,
  globalRowNumber,
  parseRecordQuery,
  resetRecordQuery,
  serializeRecordQuery,
  toggleRecordSort,
} from "./studentContactRecordUtils.js"

test("query state is validated and serialized to API-compatible params", () => {
  const query = parseRecordQuery(new URLSearchParams("search=سارا&tagId=4&page=2&limit=25&sortBy=phone&sortOrder=DESC"))
  expect(query).toMatchObject({ search: "سارا", tagId: "4", page: 2, limit: 25, sortBy: "phone", sortOrder: "DESC" })
  expect(serializeRecordQuery(query).get("tagId")).toBe("4")
  expect(parseRecordQuery(new URLSearchParams("limit=500&sortBy=bad")).limit).toBe(10)
})

test("show all reset restores list defaults", () => {
  expect(resetRecordQuery()).toEqual({
    search: "", tagId: "", formId: "", schoolId: "", page: 1, limit: 10,
    sortBy: "studentName", sortOrder: "ASC",
  })
})

test("global row number uses server page and limit", () => {
  expect(globalRowNumber(3, 25, 4)).toBe(55)
})

test("operation resolves the student identifier used by real API variants", () => {
  expect(getStudentRecordId({ studentId: 125 })).toBe(125)
  expect(getStudentRecordId({ student_id: 126 })).toBe(126)
  expect(getStudentRecordId({ id: 127 })).toBe(127)
  expect(getStudentRecordId({})).toBeNull()
})

test("answer action resolves call identifiers returned by supported API variants", () => {
  expect(getContactCallId({ callId: 500 })).toBe(500)
  expect(getContactCallId({ call_id: 501 })).toBe(501)
  expect(getContactCallId({ id: 502 })).toBe(502)
  expect(getContactCallId({ historyId: 503 })).toBe(503)
  expect(getContactCallId({})).toBeNull()
})

test("server sort toggles and resets page", () => {
  const current = { page: 5, sortBy: "phone", sortOrder: "ASC" }
  expect(toggleRecordSort(current, "phone")).toMatchObject({ page: 1, sortBy: "phone", sortOrder: "DESC" })
  expect(toggleRecordSort(current, "ssn")).toMatchObject({ page: 1, sortBy: "ssn", sortOrder: "ASC" })
})

test("form and call badges have semantic fallbacks", () => {
  expect(formStatus("completed")).toEqual({ label: "تکمیل‌شده", color: "success" })
  expect(formStatus("pending")).toEqual({ label: "در انتظار تکمیل", color: "warning" })
  expect(callStatus("ANSWERED", "پاسخ داده شده").color).toBe("success")
  expect(callStatus("UNKNOWN", "")).toEqual({ label: "UNKNOWN", color: "secondary" })
})

import { incomingCallRangeError, parseIncomingCallQuery, serializeIncomingCallQuery } from "./incomingCallReportUtils.js"

test("keeps report filters in the URL and safely defaults invalid sorting", () => {
  const query = parseIncomingCallQuery(new URLSearchParams("schoolId=146&page=4&search=ali&status=answered&ssn=001&username=sara&formId=8&from=2026-10-20&to=2026-10-21&sortBy=bad&sortOrder=bad"))
  expect(query).toEqual(expect.objectContaining({ schoolId: "146", page: 4, search: "ali", status: "answered", ssn: "001", username: "sara", formId: "8", from: "2026-10-20", to: "2026-10-21", sortBy: "startedAt", sortOrder: "DESC" }))
  expect(serializeIncomingCallQuery({ ...query, page: 1 }).get("page")).toBeNull()
})

test("requires both date boundaries and rejects a reversed range", () => {
  expect(incomingCallRangeError({ from: "2026-10-20", to: "" })).toMatch(/با هم/)
  expect(incomingCallRangeError({ from: "2026-10-22", to: "2026-10-21" })).toMatch(/قبل/)
  expect(incomingCallRangeError({ from: "2026-10-20", to: "2026-10-21" })).toBe("")
})

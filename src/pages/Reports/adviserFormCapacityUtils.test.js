import { capacityView, parseCapacityQuery, serializeCapacityQuery } from "./adviserFormCapacityUtils.js"

test.each([
  [{ adviserFormActive: true, activeStudents: 199, capacity: 200, remainingCapacity: 1 }, "warning", 1],
  [{ adviserFormActive: true, activeStudents: 200, capacity: 200, remainingCapacity: 0 }, "danger", 0],
  [{ adviserFormActive: true, activeStudents: 207, capacity: 200, remainingCapacity: -7, overCapacity: true }, "danger", 0],
  [{ adviserFormActive: false, activeStudents: 0, capacity: 200, remainingCapacity: 200 }, "secondary", 0],
])("renders capacity states safely", (item, color, remaining) => {
  expect(capacityView(item)).toEqual(expect.objectContaining({ color, remaining }))
})

test("preserves filters in URL and supports page reset", () => {
  const query = parseCapacityQuery(new URLSearchParams("schoolId=2&formId=10&adviserId=5&search=رضا&page=4&limit=50&sortBy=formTitle&sortOrder=DESC"))
  expect(query).toEqual({ schoolId: "2", formId: "10", adviserId: "5", search: "رضا", page: 4, limit: 50, sortBy: "formTitle", sortOrder: "DESC" })
  expect(serializeCapacityQuery({ ...query, schoolId: "3", formId: "", adviserId: "", page: 1 }).toString()).toContain("schoolId=3")
  expect(serializeCapacityQuery({ ...query, page: 1 }).has("page")).toBe(false)
})

import { apiGet } from "../helpers/httpClient.jsx"
import { buildAdviserFormCapacityParams, getAdviserFormCapacity } from "./adviserFormCapacityService.jsx"

jest.mock("../helpers/httpClient.jsx", () => ({ apiGet: jest.fn() }))

test("sends optional ids, pagination and allowlisted sorting with exact names", () => {
  expect(buildAdviserFormCapacityParams({ schoolId: "2", formId: "10", adviserId: "5", search: " رضا ", page: 3, limit: 50, sortBy: "activeStudents", sortOrder: "DESC" })).toEqual({ schoolId: 2, formId: 10, adviserId: 5, search: "رضا", page: 3, limit: 50, sortBy: "activeStudents", sortOrder: "DESC" })
})

test("reads the common wrapper and clamps negative remaining capacity", async () => {
  apiGet.mockResolvedValue({ data: { data: { items: [{ school_id: 2, form_id: 10, adviser_id: 5, adviser_form_active: 1, active_students: 207, capacity: 200, remaining_capacity: -7, over_capacity: 1 }], meta: { page: 1, limit: 20, total: 1 } } } })
  const result = await getAdviserFormCapacity({ page: 1, limit: 20 })
  expect(result.items[0]).toEqual(expect.objectContaining({ schoolId: 2, formId: 10, adviserId: 5, adviserFormActive: true, activeStudents: 207, capacity: 200, remainingCapacity: 0, overCapacity: true }))
  expect(apiGet.mock.calls[0][1].params).toEqual({ schoolId: undefined, formId: undefined, adviserId: undefined, search: undefined, page: 1, limit: 20, sortBy: "remainingCapacity", sortOrder: "ASC" })
})

test("an inactive adviser-form connection has zero active and remaining capacity", async () => {
  apiGet.mockResolvedValue({ data: { data: { items: [{ adviserFormActive: false, activeStudents: 15, capacity: 200, remainingCapacity: 185 }] } } })
  const result = await getAdviserFormCapacity({})
  expect(result.items[0]).toEqual(expect.objectContaining({ adviserFormActive: false, activeStudents: 0, remainingCapacity: 0, overCapacity: false }))
})

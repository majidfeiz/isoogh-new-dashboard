import { adviserCapacityConflict } from "./adviserCapacityErrorUtils.js"

test("formats the backend 409 capacity payload", () => {
  const result = adviserCapacityConflict({ response: { status: 409, data: { data: { capacity: 200, activeCount: 199, remainingCapacity: 1, requested: 3, newStudents: 2 } } } })
  expect(result.message).toContain("ظرفیت این مشاور تکمیل است")
  expect(result.message).toContain("۱۹۹")
  expect(result.message).toContain("۱")
  expect(result.message).toContain("۳")
  expect(result.message).toContain("۲")
})

test("ignores non-capacity errors", () => expect(adviserCapacityConflict({ response: { status: 403 } })).toBeNull())

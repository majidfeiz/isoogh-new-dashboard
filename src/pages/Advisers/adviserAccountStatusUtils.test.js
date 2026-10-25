import { adviserAccountActive, adviserAccountErrorMessage, withAdviserAccountStatus } from "./adviserAccountStatusUtils.js"

const adviser = { id: 45, schools: [{ id: 12, name: "الف", is_active: true }, { id: 13, name: "ب", is_active: false }] }
test("keeps account status independent per school", () => {
  expect(adviserAccountActive(adviser, 12)).toBe(true)
  expect(adviserAccountActive(adviser, 13)).toBe(false)
  const updated = withAdviserAccountStatus(adviser, 12, false)
  expect(adviserAccountActive(updated, 12)).toBe(false)
  expect(adviserAccountActive(updated, 13)).toBe(false)
})
test("uses API messages for forbidden and missing advisers", () => {
  expect(adviserAccountErrorMessage({ response: { status: 403, data: { message: "خارج از دسترسی" } } })).toBe("خارج از دسترسی")
  expect(adviserAccountErrorMessage({ response: { status: 404 } })).toMatch(/یافت نشد/)
})

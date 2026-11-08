import { currentJalaliMonthRange, isReportManager, normalizeReportSchools, reportErrorMessage, validDashboardRange } from "./reportDashboardUtils.js"

test("builds the current Jalali month as an exclusive range in Tehran", () => {
  expect(currentJalaliMonthRange(new Date("2026-11-08T08:00:00.000Z"))).toEqual({ from: "1405/08/01", to: "1405/09/01" })
  expect(validDashboardRange({ from: "1405/08/01", to: "1405/09/01" })).toBe(true)
  expect(validDashboardRange({ from: "1405/09/01", to: "1405/08/01" })).toBe(false)
})

test("maps scoped and transient report errors", () => {
  expect(reportErrorMessage({ response: { status: 400 } })).toMatch(/مجموعه را انتخاب/)
  expect(reportErrorMessage({ response: { status: 403 } })).toMatch(/خارج از محدوده/)
  expect(reportErrorMessage({ response: { status: 503 } })).toMatch(/دوباره تلاش/)
})

test("recognizes a manager independently from broad school permissions and normalizes their school", () => {
  const user = { roles: [{ name: "manager" }], schools: [{ schoolId: 71, schoolName: "مجموعه مدیر" }] }
  expect(isReportManager(user)).toBe(true)
  expect(normalizeReportSchools(user)).toEqual([expect.objectContaining({ id: 71, name: "مجموعه مدیر" })])
  expect(normalizeReportSchools({ roles: ["manager"], school_id: 72, school_name: "مجموعه دوم" })).toEqual([{ id: 72, name: "مجموعه دوم" }])
})

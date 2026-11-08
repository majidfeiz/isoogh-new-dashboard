import React, { StrictMode } from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import ReportsDashboard from "./ReportsDashboard.jsx"
import { getReportsCallsByHour, getReportsCallsTrend, getReportsOverview } from "../../services/reportService.jsx"

let mockAuth
jest.mock("../../context/AuthContext.jsx", () => ({ useAuth: () => mockAuth }))
jest.mock("../../services/reportService.jsx", () => ({
  getReportsOverview: jest.fn(), getReportsCallsTrend: jest.fn(), getReportsCallsByHour: jest.fn(), getReportsStudentsCoverage: jest.fn(), getReportsFormsStatus: jest.fn(), getReportsMonthlyComparison: jest.fn(),
  reportQueryKey: (endpoint, params) => `${endpoint}|${params.schoolId}|${params.from}|${params.to}`,
  runReportQuery: (key, request) => request(), clearReportCache: jest.fn(),
}))
jest.mock("../../components/Common/Breadcrumb", () => () => null)
jest.mock("./components/PeriodPicker.jsx", () => ({ schoolControl }) => <div>{schoolControl}</div>)
jest.mock("./components/ReportSchoolPicker.jsx", () => ({ onChange }) => <button onClick={() => onChange("94")}>انتخاب مجموعه تست</button>)
jest.mock("./components/KpiCards.jsx", () => () => <div>KPI</div>)
jest.mock("./components/CallsTrendChart.jsx", () => () => <div>TREND</div>)
jest.mock("./components/CallsByHourChart.jsx", () => () => null)
jest.mock("./components/StudentsCoverageChart.jsx", () => () => null)
jest.mock("./components/FormsStatusChart.jsx", () => () => null)
jest.mock("./components/MonthlyComparisonChart.jsx", () => () => null)
jest.mock("./components/UncontactedStudentsTable.jsx", () => () => null)

beforeEach(() => {
  jest.clearAllMocks()
  mockAuth = { user: { id: 1 }, hasPermission: (permission) => ["reports.index", "schools.index"].includes(permission) }
  getReportsOverview.mockResolvedValue({})
  getReportsCallsTrend.mockResolvedValue({})
})

test("admin sends no heavy report request before selecting a school, then scopes priority requests", async () => {
  render(<StrictMode><MemoryRouter initialEntries={["/reports"]}><ReportsDashboard /></MemoryRouter></StrictMode>)
  expect(screen.getByText("برای مشاهده گزارش، مجموعه را انتخاب کنید")).toBeInTheDocument()
  expect(getReportsOverview).not.toHaveBeenCalled()
  expect(getReportsCallsTrend).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole("button", { name: "انتخاب مجموعه تست" }))
  await waitFor(() => expect(getReportsOverview).toHaveBeenCalled())
  expect(getReportsOverview).toHaveBeenLastCalledWith(expect.objectContaining({ schoolId: "94", from: expect.stringMatching(/^14/), to: expect.stringMatching(/^14/) }))
  expect(getReportsCallsTrend).toHaveBeenLastCalledWith(expect.objectContaining({ schoolId: "94" }))
})

test("manager with one permitted school is scoped automatically", async () => {
  mockAuth = {
    user: { id: 2, roles: [{ name: "manager" }], schools: [{ schoolId: 71, schoolName: "مجموعه مدیر" }] },
    hasPermission: (permission) => ["reports.index", "schools.index"].includes(permission),
    selectedSchoolId: "71",
    setSelectedSchoolId: jest.fn(),
  }
  render(<MemoryRouter initialEntries={["/reports"]}><ReportsDashboard /></MemoryRouter>)
  await waitFor(() => expect(getReportsOverview).toHaveBeenCalled())
  expect(getReportsOverview).toHaveBeenLastCalledWith(expect.objectContaining({ schoolId: "71" }))
  expect(getReportsCallsTrend).toHaveBeenLastCalledWith(expect.objectContaining({ schoolId: "71" }))
})

test("below-the-fold reports wait until their section becomes visible", async () => {
  let intersectionCallback
  const disconnect = jest.fn()
  global.IntersectionObserver = jest.fn((callback) => {
    intersectionCallback = callback
    return { observe: jest.fn(), disconnect }
  })
  render(<MemoryRouter initialEntries={["/reports?schoolId=94"]}><ReportsDashboard /></MemoryRouter>)
  await waitFor(() => expect(getReportsOverview).toHaveBeenCalled())
  expect(getReportsCallsByHour).not.toHaveBeenCalled()
  intersectionCallback([{ isIntersecting: true }])
  await waitFor(() => expect(getReportsCallsByHour).toHaveBeenCalledWith(expect.objectContaining({ schoolId: "94" })))
  expect(disconnect).toHaveBeenCalled()
  delete global.IntersectionObserver
})

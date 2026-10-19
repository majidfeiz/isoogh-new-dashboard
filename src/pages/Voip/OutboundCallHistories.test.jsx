import React from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import OutboundCallHistories from "./OutboundCallHistories.jsx"
import { createDefaultJalaliMonthRange, normalizeJalaliDateOnly as mockNormalizeJalaliDateOnly } from "../../helpers/jalaliDateOnly.js"
import { exportOutboundCallHistories, exportOutboundCallHistoriesExcel, getOutboundCallHistories, getOutboundCallHistoryTags } from "../../services/voipService.jsx"
import { getSupportForms } from "../../services/supportFormService.jsx"
import { getSchools } from "../../services/schoolService.jsx"

const mockHasPermission = jest.fn(() => false)
const mockUser = { roles: ["manager"] }

jest.mock("../../services/voipService.jsx", () => ({
  getOutboundCallHistories: jest.fn(), getOutboundCallHistoryTags: jest.fn().mockResolvedValue({ items: [], meta: { page: 1, lastPage: 1 } }),
  exportOutboundCallHistories: jest.fn(), exportOutboundCallHistoriesExcel: jest.fn(),
}))
jest.mock("../../services/supportFormService.jsx", () => ({ getSupportForms: jest.fn().mockResolvedValue({ items: [], pagination: { page: 1, lastPage: 1 } }) }))
jest.mock("../../services/schoolService.jsx", () => ({ getSchools: jest.fn().mockResolvedValue({ items: [] }) }))
jest.mock("../../context/AuthContext.jsx", () => ({ useAuth: () => ({ hasPermission: mockHasPermission, user: mockUser }) }))
jest.mock("../../components/Common/Breadcrumb", () => () => null)
jest.mock("../../components/Common/TableContainer", () => ({ data, isLoading }) => <div>{isLoading ? "در حال بارگذاری جدول" : `rows:${data.length}`}</div>)
jest.mock("../../components/Common/Paginations.jsx", () => ({ setCurrentPage }) => <button type="button" onClick={() => setCurrentPage(2)}>صفحه دوم</button>)
jest.mock("./OutboundExportActions.jsx", () => ({ onExport }) => <div><button onClick={() => onExport("xlsx")}>Excel test</button><button onClick={() => onExport("csv")}>CSV test</button></div>)
jest.mock("./outboundCallHistoryExcelUtils.js", () => ({ downloadOutboundExcel: jest.fn(), outboundExcelFilename: jest.fn(() => "calls.xlsx") }))
jest.mock("react-select", () => () => null)
jest.mock("react-multi-date-picker", () => ({ value, onChange, placeholder }) => <input aria-label={placeholder}
  value={value ? mockNormalizeJalaliDateOnly(value) : ""} onChange={(event) => onChange(event.target.value || null)} />)

const result = { items: [{ id: 1 }], pagination: { page: 1, limit: 15, total: 1, lastPage: 1 } }

beforeEach(() => {
  jest.clearAllMocks()
  getOutboundCallHistoryTags.mockResolvedValue({ items: [], meta: { page: 1, lastPage: 1 } })
  getSupportForms.mockResolvedValue({ items: [], pagination: { page: 1, lastPage: 1 } })
  getSchools.mockResolvedValue({ items: [] })
  getOutboundCallHistories.mockResolvedValue(result)
  exportOutboundCallHistories.mockResolvedValue(new Blob(["csv"]))
  exportOutboundCallHistoriesExcel.mockResolvedValue({ blob: new Blob(["xlsx"]), contentDisposition: "" })
  window.URL.createObjectURL = jest.fn(() => "blob:test")
  window.URL.revokeObjectURL = jest.fn()
})

const renderPage = (entry = "/voip/outbound-call-histories") => render(<MemoryRouter initialEntries={[entry]}><OutboundCallHistories /></MemoryRouter>)

test("first request always uses the fresh Tehran default range and ignores stale URL dates", async () => {
  const expected = createDefaultJalaliMonthRange("Asia/Tehran")
  renderPage("/voip/outbound-call-histories?page=8&start_date=1400/01/01&end_date=1400/02/01")
  await waitFor(() => expect(getOutboundCallHistories).toHaveBeenCalledTimes(1))
  expect(getOutboundCallHistories).toHaveBeenCalledWith(expect.objectContaining({
    page: 1, start_date: expected.startDate, end_date: expected.endDate,
  }))
  expect(getOutboundCallHistories.mock.calls.every(([params]) => params.start_date && params.end_date)).toBe(true)
  expect(screen.getByLabelText("تاریخ شروع")).toHaveValue(expected.startDate)
  expect(screen.getByLabelText("تاریخ پایان")).toHaveValue(expected.endDate)
})

test("a complete date change resets page, cancels the previous request and pagination preserves the range", async () => {
  let resolveFirst
  getOutboundCallHistories.mockReturnValueOnce(new Promise((resolve) => { resolveFirst = resolve })).mockResolvedValue(result)
  renderPage()
  await waitFor(() => expect(getOutboundCallHistories).toHaveBeenCalledTimes(1))
  const firstSignal = getOutboundCallHistories.mock.calls[0][0].signal
  fireEvent.change(screen.getByLabelText("تاریخ شروع"), { target: { value: "1405/05/01" } })
  fireEvent.change(screen.getByLabelText("تاریخ پایان"), { target: { value: "1405/05/20" } })
  await waitFor(() => expect(getOutboundCallHistories).toHaveBeenCalledTimes(2), { timeout: 1000 })
  expect(firstSignal.aborted).toBe(true)
  expect(getOutboundCallHistories).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1, start_date: "1405/05/01", end_date: "1405/05/20" }))
  fireEvent.click(screen.getByRole("button", { name: "صفحه دوم" }))
  await waitFor(() => expect(getOutboundCallHistories).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2, start_date: "1405/05/01", end_date: "1405/05/20" })))
  resolveFirst(result)
})

test("an incomplete or reversed range never requests and reset restores defaults", async () => {
  const expected = createDefaultJalaliMonthRange("Asia/Tehran")
  renderPage()
  await waitFor(() => expect(getOutboundCallHistories).toHaveBeenCalledTimes(1))
  getOutboundCallHistories.mockClear()
  fireEvent.change(screen.getByLabelText("تاریخ شروع"), { target: { value: "" } })
  await new Promise((resolve) => setTimeout(resolve, 300))
  expect(getOutboundCallHistories).not.toHaveBeenCalled()
  expect(screen.getByText("انتخاب هر دو تاریخ شروع و پایان الزامی است.")).toBeInTheDocument()
  fireEvent.change(screen.getByLabelText("تاریخ شروع"), { target: { value: "1405/08/01" } })
  fireEvent.change(screen.getByLabelText("تاریخ پایان"), { target: { value: "1405/07/01" } })
  await new Promise((resolve) => setTimeout(resolve, 300))
  expect(getOutboundCallHistories).not.toHaveBeenCalled()
  expect(screen.getByText("تاریخ شروع نمی‌تواند بعد از تاریخ پایان باشد.")).toBeInTheDocument()
  fireEvent.click(screen.getByRole("button", { name: /ریست فیلترها/ }))
  await waitFor(() => expect(getOutboundCallHistories).toHaveBeenCalledWith(expect.objectContaining({ start_date: expected.startDate, end_date: expected.endDate })), { timeout: 1000 })
})

test("Excel and CSV receive the active date range", async () => {
  renderPage()
  await waitFor(() => expect(getOutboundCallHistories).toHaveBeenCalled())
  fireEvent.click(screen.getByRole("button", { name: "Excel test" }))
  await waitFor(() => expect(exportOutboundCallHistoriesExcel).toHaveBeenCalledWith(expect.objectContaining({ start_date: expect.any(String), end_date: expect.any(String) })))
  fireEvent.click(screen.getByRole("button", { name: "CSV test" }))
  await waitFor(() => expect(exportOutboundCallHistories).toHaveBeenCalledWith(expect.objectContaining({ start_date: expect.any(String), end_date: expect.any(String) })))
})

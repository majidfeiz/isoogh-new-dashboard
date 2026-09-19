import React from "react"
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import AdviserFormPerformanceReport from "./AdviserFormPerformanceReport.jsx"
import * as service from "../../services/adviserFormPerformanceReportService.jsx"

let mockCanExport = true
jest.mock("../../services/adviserFormPerformanceReportService.jsx", () => ({
  getAdviserFormPerformanceSchools: jest.fn(),
  getAdviserFormPerformanceForms: jest.fn(),
  getAdviserFormPerformanceReport: jest.fn(),
  exportAdviserFormPerformanceReport: jest.fn(),
}))
jest.mock("../../components/Common/Breadcrumb", () => () => null)
jest.mock("../../context/AuthContext.jsx", () => ({ useAuth: () => ({ hasPermission: () => mockCanExport }) }))

const deferred = () => {
  let resolve
  const promise = new Promise((done) => { resolve = done })
  return { promise, resolve }
}

const report = {
  school: { id: 1, title: "الف" }, form: { id: 10, title: "فرم" },
  questions: [{ id: 8, title: "عنوان یکسان", required: false, order: 2 }, { id: 4, title: "عنوان یکسان", required: true, order: 1 }],
  rows: [{ studentId: 20, studentName: "دانش‌آموز", studentSsn: "001", studentUsername: "student", adviserName: "مشاور", headAdviserName: "سرمشاور", callCount: 6, answers: { "4": "اول", "8": null } }],
  meta: { page: 1, limit: 15, total: 1, lastPage: 1 },
}

beforeEach(() => {
  jest.clearAllMocks()
  mockCanExport = true
  service.getAdviserFormPerformanceSchools.mockResolvedValue([{ id: 1, title: "الف" }, { id: 2, title: "ب" }])
  service.getAdviserFormPerformanceForms.mockResolvedValue([{ id: 10, title: "فرم" }])
  service.getAdviserFormPerformanceReport.mockResolvedValue(report)
  service.exportAdviserFormPerformanceReport.mockResolvedValue({ blob: new Blob(["xlsx"]), contentDisposition: "" })
})

const renderPage = () => render(<MemoryRouter><AdviserFormPerformanceReport /></MemoryRouter>)

test("renders the RTL responsive table with six ordered fixed columns and id-based question columns", async () => {
  renderPage()
  fireEvent.change(await screen.findByLabelText("مجموعه"), { target: { value: "1" } })
  fireEvent.change(await screen.findByLabelText("فرم"), { target: { value: "10" } })
  const table = await screen.findByRole("table", { name: "گزارش عملکرد مشاوران" })
  expect(table.closest("[dir=rtl]")).toBeInTheDocument()
  expect(screen.getByTestId("report-table-scroll")).toHaveClass("table-responsive")
  const headers = within(table).getAllByRole("columnheader")
  expect(headers.slice(0, 6).map((cell) => cell.textContent)).toEqual([
    "نام دانش‌آموز", "کد ملی", "نام کاربری", "نام مشاور", "نام سرمشاور", "تعداد تماس",
  ])
  expect(headers[6]).toHaveAttribute("data-column-key", "question-4")
  expect(headers[7]).toHaveAttribute("data-column-key", "question-8")
  expect(within(table).getByText("6")).toBeInTheDocument()
  expect(within(table).getByText("اول")).toBeInTheDocument()
  expect(within(table).getByText("—")).toBeInTheDocument()
})

test("resets the form/report immediately and ignores stale form responses on rapid school changes", async () => {
  const first = deferred()
  const second = deferred()
  service.getAdviserFormPerformanceForms
    .mockImplementationOnce(() => first.promise)
    .mockImplementationOnce(() => second.promise)
  renderPage()
  const school = await screen.findByLabelText("مجموعه")
  fireEvent.change(school, { target: { value: "1" } })
  fireEvent.change(school, { target: { value: "2" } })
  await act(async () => second.resolve([{ id: 22, title: "فرم جدید" }]))
  expect(await screen.findByRole("option", { name: "فرم جدید" })).toBeInTheDocument()
  await act(async () => first.resolve([{ id: 11, title: "فرم قدیمی" }]))
  await waitFor(() => expect(screen.queryByRole("option", { name: "فرم قدیمی" })).not.toBeInTheDocument())
  expect(service.getAdviserFormPerformanceReport).not.toHaveBeenCalled()
})

test("keeps export hidden without the export permission", async () => {
  mockCanExport = false
  renderPage()
  await screen.findByLabelText("مجموعه")
  expect(screen.queryByTestId("export-button")).not.toBeInTheDocument()
})

test("debounces independent server searches, trims values, clears separately and exports active filters", async () => {
  renderPage()
  fireEvent.change(await screen.findByLabelText("مجموعه"), { target: { value: "1" } })
  fireEvent.change(await screen.findByLabelText("فرم"), { target: { value: "10" } })
  await screen.findByRole("table", { name: "گزارش عملکرد مشاوران" })
  service.getAdviserFormPerformanceReport.mockClear()

  fireEvent.change(screen.getByLabelText("جستجوی دانش‌آموز"), { target: { value: "  علی  " } })
  expect(service.getAdviserFormPerformanceReport).not.toHaveBeenCalled()
  await waitFor(() => expect(service.getAdviserFormPerformanceReport).toHaveBeenLastCalledWith(
    expect.objectContaining({ schoolId: "1", formId: "10", studentSearch: "علی", adviserSearch: "", page: 1 }),
    expect.any(AbortSignal),
  ), { timeout: 1000 })

  fireEvent.change(screen.getByLabelText("جستجوی مشاور"), { target: { value: " رضا " } })
  await waitFor(() => expect(service.getAdviserFormPerformanceReport).toHaveBeenLastCalledWith(
    expect.objectContaining({ studentSearch: "علی", adviserSearch: "رضا", page: 1 }),
    expect.any(AbortSignal),
  ), { timeout: 1000 })

  fireEvent.click(screen.getByRole("button", { name: "پاک‌کردن جستجوی دانش‌آموز" }))
  await waitFor(() => expect(service.getAdviserFormPerformanceReport).toHaveBeenLastCalledWith(
    expect.objectContaining({ studentSearch: "", adviserSearch: "رضا", page: 1 }),
    expect.any(AbortSignal),
  ))
  fireEvent.click(screen.getByTestId("export-button"))
  await waitFor(() => expect(service.exportAdviserFormPerformanceReport).toHaveBeenCalledWith({
    schoolId: "1", formId: "10", studentSearch: "", adviserSearch: "رضا",
  }))
})

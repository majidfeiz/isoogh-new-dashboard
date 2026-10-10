import React from "react"
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import StudentCallSummary from "./StudentCallSummary.jsx"
import * as reportService from "../../services/studentCallSummaryService.jsx"
import { getSchools } from "../../services/schoolService.jsx"

let mockCanExport = true
jest.mock("../../context/AuthContext.jsx", () => ({ useAuth: () => ({ hasPermission: () => mockCanExport }) }))
jest.mock("../../services/studentCallSummaryService.jsx", () => ({ getStudentCallSummary: jest.fn(), exportStudentCallSummary: jest.fn() }))
jest.mock("../../services/schoolService.jsx", () => ({ getSchools: jest.fn() }))
jest.mock("../../components/Common/Breadcrumb", () => () => null)
jest.mock("react-multi-date-picker", () => () => <input aria-label="date-picker" />)
jest.mock("../../components/Common/Paginations.jsx", () => ({ setCurrentPage }) => <button onClick={() => setCurrentPage(2)}>صفحه بعد</button>)
jest.mock("../../components/Common/TableContainer.jsx", () => ({ columns, data, onSortingChange }) => <table>
  <thead><tr>{columns.map((column) => <th key={column.id}>{column.header}</th>)}</tr></thead>
  <tbody>{data.map((item, rowIndex) => <tr key={item.studentId}>{columns.map((column) => <td key={column.id}>{column.cell ? column.cell({ getValue: () => item[column.accessorKey], row: { index: rowIndex } }) : item[column.accessorKey]}</td>)}</tr>)}</tbody>
  <tfoot><tr><td><button onClick={() => onSortingChange([{ id: "totalCalls", desc: true }])}>مرتب‌سازی تماس</button></td></tr></tfoot>
</table>)

const row = { studentId: 12, username: "student-12", studentName: "علی", totalConversationSeconds: 65, totalCalls: 18, successfulCalls: 11, unsuccessfulCalls: 7, adviserName: "مریم" }

beforeEach(() => {
  jest.clearAllMocks(); mockCanExport = true
  getSchools.mockResolvedValue({ items: [{ id: 1, title: "مجموعه یک" }, { id: 2, title: "مجموعه دو" }] })
  reportService.getStudentCallSummary.mockResolvedValue({ items: [row], meta: { page: 1, limit: 10, total: 1, lastPage: 1 } })
  reportService.exportStudentCallSummary.mockResolvedValue(new Blob(["xlsx"]))
  window.URL.createObjectURL = jest.fn(() => "blob:test")
  window.URL.revokeObjectURL = jest.fn()
})

const renderPage = (entry = "/reports/student-call-summary") => render(<MemoryRouter initialEntries={[entry]}><StudentCallSummary /></MemoryRouter>)

test("requires a school and does not request the report before selection", async () => {
  renderPage()
  expect(await screen.findByText("ابتدا مجموعه را انتخاب کنید.")).toBeInTheDocument()
  expect(reportService.getStudentCallSummary).not.toHaveBeenCalled()
  fireEvent.change(screen.getByLabelText(/مجموعه/), { target: { value: "1" } })
  await waitFor(() => expect(reportService.getStudentCallSummary).toHaveBeenCalledWith(expect.objectContaining({ schoolId: "1", page: 1 }), expect.any(AbortSignal)))
})

test("renders seven report columns plus row number and raw consistent totals", async () => {
  renderPage("/reports/student-call-summary?schoolId=1&page=1&limit=10")
  expect(await screen.findByText("student-12")).toBeInTheDocument()
  expect(screen.getAllByRole("columnheader")).toHaveLength(8)
  expect(screen.getByText("00:01:05")).toBeInTheDocument()
  expect(screen.getByText("۱۸")).toBeInTheDocument()
  expect(screen.getByText("۱۱")).toBeInTheDocument()
  expect(screen.getByText("۷")).toBeInTheDocument()
  expect(within(screen.getByText("student-12").closest("tr")).getByText("۱")).toBeInTheDocument()
})

test("debounces search and resets page; sort and pagination update server query", async () => {
  renderPage("/reports/student-call-summary?schoolId=1&page=3&limit=10")
  await screen.findByText("student-12")
  reportService.getStudentCallSummary.mockClear()
  fireEvent.change(screen.getByLabelText("جستجو"), { target: { value: " علی " } })
  expect(reportService.getStudentCallSummary).not.toHaveBeenCalled()
  await waitFor(() => expect(reportService.getStudentCallSummary).toHaveBeenCalledWith(expect.objectContaining({ search: "علی", page: 1 }), expect.any(AbortSignal)), { timeout: 1000 })
  fireEvent.click(await screen.findByText("مرتب‌سازی تماس"))
  await waitFor(() => expect(reportService.getStudentCallSummary).toHaveBeenCalledWith(expect.objectContaining({ sortBy: "totalCalls", sortOrder: "ASC", page: 1 }), expect.any(AbortSignal)))
  fireEvent.click(screen.getByText("صفحه بعد"))
  await waitFor(() => expect(reportService.getStudentCallSummary).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }), expect.any(AbortSignal)))
})

test("hides export without permission", async () => {
  mockCanExport = false
  renderPage()
  await screen.findByLabelText(/مجموعه/)
  expect(screen.queryByTestId("export-button")).not.toBeInTheDocument()
})

test("shows loading skeleton, empty state and mapped validation error", async () => {
  let resolveReport
  reportService.getStudentCallSummary.mockReturnValueOnce(new Promise((resolve) => { resolveReport = resolve }))
  const view = renderPage("/reports/student-call-summary?schoolId=1")
  await waitFor(() => expect(document.querySelectorAll(".placeholder").length).toBeGreaterThan(0))
  resolveReport({ items: [], meta: { page: 1, limit: 10, total: 0, lastPage: 1 } })
  expect(await screen.findByText("رکوردی برای فیلترهای انتخاب‌شده یافت نشد.")).toBeInTheDocument()
  view.unmount()

  reportService.getStudentCallSummary.mockRejectedValueOnce({ response: { status: 400 } })
  renderPage("/reports/student-call-summary?schoolId=1")
  expect(await screen.findByText("بازه زمانی یا ورودی‌های گزارش معتبر نیستند.")).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "تلاش مجدد" })).toBeInTheDocument()
})

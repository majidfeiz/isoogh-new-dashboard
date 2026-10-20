import React from "react"
import { fireEvent, render, screen, within } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"

import TableContainer from "../../components/Common/TableContainer.jsx"
import { createFormColumns, createStatusColumns } from "./ContactFormsComprehensive.jsx"
import {
  formatReportDuration,
  formatReportNumber,
  formatReportPercent,
} from "./contactFormsComprehensiveUtils.js"

jest.mock("../../context/AuthContext.jsx", () => ({ useAuth: () => ({ permissions: [], user: null }) }))
jest.mock("../../services/reportService.jsx", () => ({
  exportContactFormsComprehensiveReport: jest.fn(),
  getContactFormsComprehensiveReport: jest.fn(),
}))
jest.mock("../../services/schoolService.jsx", () => ({ getSchools: jest.fn() }))
jest.mock("../../services/supportFormService.jsx", () => ({ getAllSupportForms: jest.fn() }))

const distinctFixture = {
  formId: 12,
  formTitle: "فرم رگرسیون",
  assignedStudents: 10,
  completedStudents: 6,
  remainingStudents: 4,
  progressPercent: 60,
  totalCalls: 8,
  answeredCalls: 5,
  uniqueStudents: 7,
  totalDurationSeconds: 500,
  avgDurationSeconds: 100,
}

const renderFormsTable = (data, onSortingChange = jest.fn()) => render(
  <MemoryRouter>
    <TableContainer
      columns={createFormColumns()}
      data={data}
      isGlobalFilter={false}
      isPagination={false}
      manualSorting
      sortingState={[]}
      onSortingChange={onSortingChange}
    />
  </MemoryRouter>
)

test("renders all ten form fields in their exact independent column order", () => {
  renderFormsTable([distinctFixture])
  const table = screen.getByRole("table")
  const headers = within(table).getAllByRole("columnheader").map((cell) => cell.textContent)
  expect(headers).toEqual([
    "نام فرم", "تخصیص‌یافته", "تکمیل‌شده", "باقی‌مانده", "پیشرفت",
    "کل تماس", "پاسخ‌داده‌شده", "دانش‌آموز یکتا", "مجموع زمان", "میانگین زمان",
  ])

  const cells = within(within(table).getAllByRole("row")[1]).getAllByRole("cell")
    .map((cell) => cell.textContent)
  expect(cells).toEqual([
    distinctFixture.formTitle,
    formatReportNumber(distinctFixture.assignedStudents),
    formatReportNumber(distinctFixture.completedStudents),
    formatReportNumber(distinctFixture.remainingStudents),
    formatReportPercent(distinctFixture.progressPercent),
    formatReportNumber(distinctFixture.totalCalls),
    formatReportNumber(distinctFixture.answeredCalls),
    formatReportNumber(distinctFixture.uniqueStudents),
    formatReportDuration(distinctFixture.totalDurationSeconds),
    formatReportDuration(distinctFixture.avgDurationSeconds),
  ])
  expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "60")
})

test("renders zero and nullish numeric form values safely without blank, dash or NaN", () => {
  renderFormsTable([
    { formId: 1, formTitle: "همه صفر", ...Object.fromEntries(Object.keys(distinctFixture).filter((key) => typeof distinctFixture[key] === "number" && key !== "formId").map((key) => [key, 0])) },
    { formId: 2, formTitle: null, assignedStudents: null, completedStudents: undefined, remainingStudents: null, progressPercent: undefined, totalCalls: null, answeredCalls: undefined, uniqueStudents: null, totalDurationSeconds: undefined, avgDurationSeconds: null },
  ])
  const bodyCells = within(screen.getByRole("table")).getAllByRole("cell")
  expect(bodyCells).toHaveLength(20)
  expect(bodyCells.map((cell) => cell.textContent).join(" ")).not.toMatch(/NaN/)
  bodyCells.filter((_, index) => index % 10 !== 0).forEach((cell) => {
    expect(cell.textContent).not.toBe("")
    expect(cell.textContent).not.toBe("—")
  })
})

test.each(createFormColumns().map((column) => [column.id]))(
  "sort header %s sends the exact backend field and keeps all columns visible",
  (field) => {
    const onSortingChange = jest.fn()
    renderFormsTable([distinctFixture], onSortingChange)
    const header = createFormColumns().find((column) => column.id === field).header
    fireEvent.click(within(screen.getByRole("columnheader", { name: header })).getByText(header))
    expect(onSortingChange).toHaveBeenCalledTimes(1)
    expect(onSortingChange.mock.calls[0][0][0].id).toBe(field)
    expect(typeof onSortingChange.mock.calls[0][0][0].desc).toBe("boolean")
    expect(screen.getAllByRole("columnheader")).toHaveLength(10)
    expect(within(screen.getAllByRole("row")[1]).getAllByRole("cell")).toHaveLength(10)
  }
)

test("keeps an unknown backend status label unchanged", () => {
  render(<MemoryRouter><TableContainer columns={createStatusColumns()} data={[{
    key: "OTHER:FAILED", label: "سایر: FAILED", totalDurationSeconds: 0,
    avgDurationSeconds: 0, uniqueStudents: 3, totalCalls: 4, percent: 2.5,
  }]} isGlobalFilter={false} isPagination={false} /></MemoryRouter>)
  expect(screen.getByText("سایر: FAILED")).toBeInTheDocument()
})

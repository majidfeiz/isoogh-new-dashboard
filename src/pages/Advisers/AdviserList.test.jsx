import React from "react"
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import AdviserList, { renderAdviserCreatedAt } from "./AdviserList.jsx"
import { getAdvisers } from "../../services/adviserService.jsx"
import { getGrades } from "../../services/gradeService.jsx"
import { getSchools } from "../../services/schoolService.jsx"

jest.mock("../../services/adviserService.jsx", () => ({
  getAdvisers: jest.fn(), syncAdviserGrades: jest.fn(), updateAdviserSuperStatus: jest.fn(),
}))
jest.mock("../../services/gradeService.jsx", () => ({ getGrades: jest.fn() }))
jest.mock("../../services/schoolService.jsx", () => ({ getSchools: jest.fn() }))
jest.mock("../../hooks/useListState", () => ({ useListState: () => ({ saved: null, saveState: jest.fn() }) }))
jest.mock("../../context/AuthContext.jsx", () => ({ useAuth: () => ({ user: { id: 1, roles: ["admin"] }, hasPermission: () => false }) }))
jest.mock("../../components/Common/Breadcrumb", () => () => null)
jest.mock("./AdviserRowActions.jsx", () => () => null)
jest.mock("./AdviserSubordinatesModal.jsx", () => () => null)
jest.mock("../../components/Common/Paginations.jsx", () => () => null)
jest.mock("../../components/Common/TableContainer", () => ({ columns, data, onSortingChange }) => <table>
  <thead><tr>{columns.map((column) => <th key={column.id}>
    {column.id === "created_at" ? <button type="button" onClick={() => onSortingChange([{ id: "created_at", desc: false }])}>{column.header}</button> : column.header}
  </th>)}</tr></thead>
  <tbody>{data.map((item) => <tr key={item.id}>{columns.map((column) => <td key={column.id}>
    {column.id === "created_at" ? column.cell({ row: { original: item }, getValue: () => item.created_at }) : null}
  </td>)}</tr>)}</tbody>
</table>)

const advisers = [
  { id: 1, created_at: "2026-10-12T12:00:00.000Z", created_at_jalali: "1405/07/20 15:30:00" },
  { id: 2, created_at: "2026-10-11T12:00:00.000Z", created_at_jalali: null },
]

beforeEach(() => {
  jest.clearAllMocks()
  getGrades.mockResolvedValue({ items: [] })
  getSchools.mockResolvedValue({ items: [] })
  getAdvisers.mockResolvedValue({ items: advisers, pagination: { page: 1, limit: 10, total: 2, lastPage: 1 } })
})

test("renders the backend Jalali creation value verbatim and never falls back to Gregorian", async () => {
  render(<MemoryRouter><AdviserList /></MemoryRouter>)
  const table = await screen.findByRole("table")
  expect(within(table).getByText("1405/07/20 15:30:00")).toBeInTheDocument()
  expect(within(table).getByText("—")).toBeInTheDocument()
  expect(within(table).queryByText("2026-10-12T12:00:00.000Z")).not.toBeInTheDocument()
  expect(renderAdviserCreatedAt({ created_at: "2026-10-12T12:00:00.000Z", created_at_jalali: " 1405/07/20 15:30:00 " })).toBe("1405/07/20 15:30:00")
  expect(renderAdviserCreatedAt({ created_at: "2026-10-12T12:00:00.000Z", created_at_jalali: "" })).toBe("—")
})

test("keeps creation-date server sorting on created_at", async () => {
  render(<MemoryRouter><AdviserList /></MemoryRouter>)
  fireEvent.click(await screen.findByRole("button", { name: "تاریخ ایجاد" }))
  await waitFor(() => expect(getAdvisers).toHaveBeenLastCalledWith(expect.objectContaining({
    sortBy: "created_at", sortOrder: "ASC",
  })))
  expect(getAdvisers.mock.calls.some(([params]) => params.sortBy === "created_at_jalali")).toBe(false)
})

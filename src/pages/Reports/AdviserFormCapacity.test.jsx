import React from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter, useLocation } from "react-router-dom"
import AdviserFormCapacity from "./AdviserFormCapacity.jsx"
import { getAdviserFormCapacity } from "../../services/adviserFormCapacityService.jsx"
import { getSupportForms } from "../../services/supportFormService.jsx"
import { getAdvisers } from "../../services/adviserService.jsx"

jest.mock("../../services/adviserFormCapacityService.jsx", () => ({ getAdviserFormCapacity: jest.fn() }))
jest.mock("../../services/supportFormService.jsx", () => ({ getSupportForms: jest.fn() }))
jest.mock("../../services/adviserService.jsx", () => ({ getAdvisers: jest.fn() }))
jest.mock("../../components/Common/Breadcrumb.jsx", () => () => null)
jest.mock("../../components/Common/Paginations.jsx", () => () => null)
jest.mock("../IncomingCalls/IncomingCallsCommon.jsx", () => ({ SchoolPicker: ({ value, onChange }) => <select aria-label="مجموعه" value={value} onChange={(event) => onChange(event.target.value)}><option value="2">دو</option><option value="3">سه</option></select> }))

const Location = () => { const location = useLocation(); return <output data-testid="location">{location.search}</output> }
const rows = [
  { schoolId: 2, schoolName: "مدرسه", formId: 10, formTitle: "فرم یک", adviserId: 1, adviserName: "اول", adviserFormActive: true, activeStudents: 199, capacity: 200, remainingCapacity: 1, overCapacity: false },
  { schoolId: 2, schoolName: "مدرسه", formId: 10, formTitle: "فرم یک", adviserId: 2, adviserName: "دوم", adviserFormActive: true, activeStudents: 200, capacity: 200, remainingCapacity: 0, overCapacity: false },
  { schoolId: 2, schoolName: "مدرسه", formId: 10, formTitle: "فرم یک", adviserId: 3, adviserName: "سوم", adviserFormActive: true, activeStudents: 207, capacity: 200, remainingCapacity: 0, overCapacity: true },
  { schoolId: 2, schoolName: "مدرسه", formId: 10, formTitle: "فرم یک", adviserId: 4, adviserName: "چهارم", adviserFormActive: false, activeStudents: 0, capacity: 200, remainingCapacity: 0, overCapacity: false },
]

beforeEach(() => {
  getSupportForms.mockResolvedValue({ items: [{ id: 10, title: "فرم یک" }] })
  getAdvisers.mockResolvedValue({ items: [{ id: 5, name: "مشاور" }] })
  getAdviserFormCapacity.mockResolvedValue({ items: rows, pagination: { page: 3, limit: 20, total: 4 } })
})

test("shows normal, full, legacy and inactive capacities and clears dependent filters on school change", async () => {
  render(<MemoryRouter initialEntries={["/reports/adviser-form-capacity?schoolId=2&formId=10&adviserId=5&page=3"]}><AdviserFormCapacity /><Location /></MemoryRouter>)
  expect(await screen.findByText("۱۹۹")).toBeInTheDocument()
  expect(screen.getByText("ظرفیت تکمیل")).toBeInTheDocument()
  expect(screen.getAllByText("بیش از ظرفیت")).toHaveLength(2)
  expect(screen.getByText("غیرفعال")).toBeInTheDocument()
  fireEvent.change(screen.getByLabelText("مجموعه"), { target: { value: "3" } })
  await waitFor(() => expect(screen.getByTestId("location").textContent).toContain("schoolId=3"))
  expect(screen.getByTestId("location").textContent).not.toMatch(/formId|adviserId|page=/)
  await waitFor(() => expect(getSupportForms).toHaveBeenCalledWith(expect.objectContaining({ schoolId: "3" })))
  expect(getAdvisers).toHaveBeenCalledWith(expect.objectContaining({ schoolId: "3" }))
})

test("clears previous rows and shows the scoped message on 403", async () => {
  getAdviserFormCapacity.mockRejectedValue({ response: { status: 403 } })
  render(<MemoryRouter initialEntries={["/reports/adviser-form-capacity?schoolId=2"]}><AdviserFormCapacity /></MemoryRouter>)
  expect(await screen.findByText("به اطلاعات خارج از مجموعه انتخاب‌شده دسترسی ندارید.")).toBeInTheDocument()
  expect(screen.queryByText("۱۹۹")).not.toBeInTheDocument()
})

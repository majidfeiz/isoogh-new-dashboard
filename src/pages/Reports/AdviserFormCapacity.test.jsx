import React from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter, useLocation } from "react-router-dom"
import AdviserFormCapacity from "./AdviserFormCapacity.jsx"
import { getAdviserFormCapacity } from "../../services/adviserFormCapacityService.jsx"
import { getSupportForms } from "../../services/supportFormService.jsx"
import { getAdvisers } from "../../services/adviserService.jsx"
import { previewBillingCapacity, purchaseBillingCapacity } from "../../services/billingService.jsx"

jest.mock("../../services/adviserFormCapacityService.jsx", () => ({ getAdviserFormCapacity: jest.fn() }))
jest.mock("../../services/supportFormService.jsx", () => ({ getSupportForms: jest.fn() }))
jest.mock("../../services/adviserService.jsx", () => ({ getAdvisers: jest.fn() }))
jest.mock("../../services/billingService.jsx", () => ({ previewBillingCapacity: jest.fn(), purchaseBillingCapacity: jest.fn() }))
let mockCanPurchase = false
jest.mock("../../context/AuthContext.jsx", () => ({ useAuth: () => ({ hasPermission: () => mockCanPurchase }) }))
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
  mockCanPurchase = false
  getSupportForms.mockResolvedValue({ items: [{ id: 10, title: "فرم یک" }] })
  getAdvisers.mockResolvedValue({ items: [{ id: 5, name: "مشاور" }] })
  getAdviserFormCapacity.mockResolvedValue({ items: rows, pagination: { page: 3, limit: 20, total: 4 } })
})

test("previews capacity before purchase and reuses one idempotency key", async () => {
  mockCanPurchase = true
  previewBillingCapacity.mockResolvedValue({ currentCapacity: 200, addedCapacity: 20, capacityStepSeats: 20, steps: 1, pricePerStep: 1000, totalAmount: 1000, pricingEffectiveAt: "2026-11-01" })
  purchaseBillingCapacity.mockRejectedValueOnce({ response: { status: 503, data: { message: "خطای موقت" } } }).mockResolvedValueOnce({ invoiceId: 9 })
  render(<MemoryRouter initialEntries={["/reports/adviser-form-capacity?schoolId=2"]}><AdviserFormCapacity /></MemoryRouter>)
  await screen.findByText("۱۹۹")
  fireEvent.click(screen.getAllByRole("button", { name: "افزایش ظرفیت" })[0])
  fireEvent.change(screen.getByLabelText("ظرفیت هدف"), { target: { value: "220" } })
  fireEvent.click(screen.getByRole("button", { name: "دریافت پیش‌نمایش" }))
  expect(await screen.findByText("پیش‌نمایش قطعی backend")).toBeInTheDocument()
  expect(previewBillingCapacity).toHaveBeenCalledWith({ schoolId: 2, adviserId: 1, targetStudentCapacity: "220" })
  fireEvent.click(screen.getByRole("button", { name: "تأیید و خرید ظرفیت" }))
  await waitFor(() => expect(purchaseBillingCapacity).toHaveBeenCalledTimes(1))
  const firstKey = purchaseBillingCapacity.mock.calls[0][0].idempotencyKey
  expect(firstKey).toBeTruthy()
  await waitFor(() => expect(screen.getByRole("button", { name: "تأیید و خرید ظرفیت" })).not.toBeDisabled())
  fireEvent.click(screen.getByRole("button", { name: "تأیید و خرید ظرفیت" }))
  await waitFor(() => expect(purchaseBillingCapacity).toHaveBeenCalledTimes(2))
  expect(purchaseBillingCapacity.mock.calls[1][0].idempotencyKey).toBe(firstKey)
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

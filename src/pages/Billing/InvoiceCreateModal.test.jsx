import React from "react"
import { render, screen } from "@testing-library/react"
import InvoiceCreateModal from "./InvoiceCreateModal.jsx"

jest.mock("../../services/billingService.jsx", () => ({ createBillingInvoice: jest.fn(), getBillingPricing: jest.fn(() => Promise.resolve({ includedStudents: 200 })) }))
jest.mock("../../services/adviserService.jsx", () => ({ getAdvisers: jest.fn(() => Promise.resolve({ items: [] })) }))
jest.mock("../../services/adviserFormCapacityService.jsx", () => ({ getAdviserFormCapacity: jest.fn(() => Promise.resolve({ items: [] })) }))

const props = { open: true, toggle: jest.fn(), schools: [{ id: 94, name: "علامه حلی" }], fixedSchoolId: "94" }

test("hides all price override controls when overrides are not authorized", () => {
  render(<InvoiceCreateModal {...props} allowOverrides={false} />)
  expect(screen.queryByText("قیمت‌گذاری دستی")).not.toBeInTheDocument()
  expect(screen.queryByLabelText("تخفیف کل فاکتور (تومان)")).not.toBeInTheDocument()
  expect(screen.queryByLabelText("دلیل قیمت‌گذاری/تخفیف")).not.toBeInTheDocument()
})

test("shows manual pricing, discount and audit reason only for admins", () => {
  render(<InvoiceCreateModal {...props} allowOverrides />)
  expect(screen.getByText("قیمت‌گذاری دستی")).toBeInTheDocument()
  expect(screen.getByLabelText("تخفیف کل فاکتور (تومان)")).toBeInTheDocument()
  expect(screen.getByLabelText("دلیل قیمت‌گذاری/تخفیف")).toBeInTheDocument()
})

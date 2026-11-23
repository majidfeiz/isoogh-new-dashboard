import React from "react"
import { render, screen } from "@testing-library/react"
import PricingRuleSummary, { normalizePricingSnapshot } from "./PricingRuleSummary.jsx"

test("renders a pricing snapshot as Persian business labels instead of JSON", () => {
  render(<PricingRuleSummary snapshot={{ includedStudents: 200, targetStudentCapacity: 250, capacityStepSeats: 40, capacityStepPercent: 20, extraSteps: 2, surchargePerStep: 2000000, calculatedMonthlyAmount: 26000000 }} />)
  expect(screen.getByText("ظرفیت پایه")).toBeInTheDocument()
  expect(screen.getByText("ظرفیت هدف")).toBeInTheDocument()
  expect(screen.getByText("پله‌های اضافه")).toBeInTheDocument()
  expect(screen.getByText("مبلغ ماهانه")).toBeInTheDocument()
  expect(screen.queryByText(/includedStudents/)).not.toBeInTheDocument()
})

test("accepts a serialized snapshot and safely rejects invalid JSON", () => {
  expect(normalizePricingSnapshot('{"includedStudents":200}')).toEqual({ includedStudents: 200 })
  expect(normalizePricingSnapshot("invalid")).toEqual({})
})

test("renders monthly adviser-contract and new-adviser base/extra snapshots", () => {
  const { rerender } = render(<PricingRuleSummary snapshot={{ source: "adviser_contract_monthly", contracted_adviser_count: 56, adviser_monthly_amount: 4110000, included_students_per_adviser: 200 }} />)
  expect(screen.getByText("قرارداد ماهانه مشاور")).toBeInTheDocument()
  expect(screen.getByText("تعداد مشاور قراردادی")).toBeInTheDocument()
  expect(screen.getByText("مبلغ ماهانه هر مشاور")).toBeInTheDocument()
  rerender(<PricingRuleSummary snapshot={{ adviser_base_amount: 4110000, extra_steps_amount: 890000 }} />)
  expect(screen.getByText("مبلغ پایه مشاور جدید")).toBeInTheDocument()
  expect(screen.getByText("جمع پله‌های اضافه")).toBeInTheDocument()
})

test("keeps legacy snapshot fallback", () => {
  render(<PricingRuleSummary snapshot={{ includedStudents: 200, calculatedMonthlyAmount: 4110000 }} />)
  expect(screen.getByText("ظرفیت پایه")).toBeInTheDocument()
  expect(screen.getByText("مبلغ ماهانه")).toBeInTheDocument()
})

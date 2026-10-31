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

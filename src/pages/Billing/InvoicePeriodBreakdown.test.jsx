import React from "react";
import { render, screen } from "@testing-library/react";
import InvoicePeriodBreakdown from "./InvoicePeriodBreakdown.jsx";

test("renders the immutable monthly billing snapshot", () => {
  render(<InvoicePeriodBreakdown line={{ pricingSnapshot: { billingBasis: "jalali_month_overlap_v1", peakStudentCount: 230, monthlyBreakdown: [{ jalaliLabel: "مهر ۱۴۰۵", distinctStudentCount: 230, billedCapacity: 240, includedCapacity: 200, extraCapacity: 40, extraSteps: 1, baseMonthlyAmount: 1000, surchargePerStep: 100, calculatedAmount: 1100, forms: [{ formId: 1, formTitle: "فرم مهر", studentCount: 230 }] }] } }} />);
  expect(screen.getByText("مهر ۱۴۰۵")).toBeInTheDocument();
  expect(screen.getByText((_, element) => element.tagName === "SPAN" && element.textContent.includes("بیشترین تعداد ماهانه") && element.textContent.includes("۲۳۰"))).toBeInTheDocument();
  expect(screen.getByText("فرم مهر")).toBeInTheDocument();
  expect(screen.getByText(/مبلغ محاسباتی ماه/)).toBeInTheDocument();
});

test("does not rebuild missing snapshots for legacy invoices", () => {
  render(<InvoicePeriodBreakdown line={{ pricingSnapshot: { extraSteps: 2 } }} />);
  expect(screen.getByText("جزئیات دوره‌ای برای این فاکتور قدیمی ثبت نشده است.")).toBeInTheDocument();
});

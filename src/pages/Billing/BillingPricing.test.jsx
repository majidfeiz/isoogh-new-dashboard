import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import BillingPricing from "./BillingPricing.jsx";
import { getBillingPricing, getBillingPricingHistory, updateBillingPricing } from "../../services/billingService.jsx";

jest.mock("../../context/AuthContext.jsx", () => ({ useAuth: () => ({ hasPermission: () => true }) }));
jest.mock("../../services/billingService.jsx", () => ({ getBillingPricing: jest.fn(), getBillingPricingHistory: jest.fn(), updateBillingPricing: jest.fn() }));

beforeEach(() => {
  jest.clearAllMocks();
  getBillingPricing.mockResolvedValue({ baseMonthlyAmount: 100000, includedStudents: 200, extraStudentStep: 20, extraStepPercent: 5, capacityStepPercent: 10, capacityStepAmount: null, tax_percent: "3.5", vat_percent: "9" });
  getBillingPricingHistory.mockResolvedValue([]);
  updateBillingPricing.mockResolvedValue({ baseMonthlyAmount: 100000 });
});

test("loads decimal tax percentages from snake_case and saves camelCase fields", async () => {
  render(<MemoryRouter><BillingPricing /></MemoryRouter>);
  expect(await screen.findByLabelText("درصد مالیات")).toHaveValue(3.5);
  expect(screen.getByLabelText("درصد ارزش افزوده")).toHaveValue(9);
  fireEvent.change(screen.getByLabelText("درصد مالیات"), { target: { value: "4.25" } });
  fireEvent.change(screen.getByLabelText("درصد ارزش افزوده"), { target: { value: "10" } });
  fireEvent.click(screen.getByRole("button", { name: /ذخیره تنظیمات/ }));
  await waitFor(() => expect(updateBillingPricing).toHaveBeenCalledWith(expect.objectContaining({ taxPercent: 4.25, vatPercent: 10 })));
});

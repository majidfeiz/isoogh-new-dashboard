import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import BillingPricing, { EXTRA_STEP_PERCENT_ERROR, isValidExtraStepPercent } from "./BillingPricing.jsx";
import { getBillingPricing, getBillingPricingHistory, updateBillingPricing } from "../../services/billingService.jsx";

jest.mock("../../context/AuthContext.jsx", () => ({ useAuth: () => ({ hasPermission: () => true }) }));
jest.mock("../../services/billingService.jsx", () => ({ getBillingPricing: jest.fn(), getBillingPricingHistory: jest.fn(), updateBillingPricing: jest.fn() }));

beforeEach(() => {
  jest.clearAllMocks();
  getBillingPricing.mockResolvedValue({ baseMonthlyAmount: 100000, includedStudents: 200, extraStudentStep: 20, extraStepPercent: 5, capacityStepPercent: 10, capacityStepAmount: null, tax_percent: "3.5", vat_percent: "9" });
  getBillingPricingHistory.mockResolvedValue([]);
  updateBillingPricing.mockResolvedValue({ baseMonthlyAmount: 100000 });
});

const renderPricing = () => render(<MemoryRouter><BillingPricing /></MemoryRouter>);
const extraStepInput = async () => screen.findByLabelText("درصد افزایش مبلغ به‌ازای هر پله دانش‌آموز اضافه");
const save = () => fireEvent.click(screen.getByRole("button", { name: /ذخیره تنظیمات/ }));

test("loads decimal tax percentages from snake_case and saves camelCase fields", async () => {
  renderPricing();
  expect(await screen.findByLabelText("درصد مالیات")).toHaveValue(3.5);
  expect(screen.getByLabelText("درصد ارزش افزوده")).toHaveValue(9);
  fireEvent.change(screen.getByLabelText("درصد مالیات"), { target: { value: "4.25" } });
  fireEvent.change(screen.getByLabelText("درصد ارزش افزوده"), { target: { value: "10" } });
  fireEvent.click(screen.getByRole("button", { name: /ذخیره تنظیمات/ }));
  await waitFor(() => expect(updateBillingPricing).toHaveBeenCalledWith(expect.objectContaining({ taxPercent: 4.25, vatPercent: 10 })));
});

test("loads snake_case extra step percent and renders a constrained percent input", async () => {
  getBillingPricing.mockResolvedValueOnce({ base_monthly_amount: 100000, included_students: 200, extra_student_step: 20, extra_step_percent: "12.5", capacity_step_percent: 10, capacity_step_amount: null, tax_percent: 0, vat_percent: 0 });
  renderPricing();
  const input = await extraStepInput();
  expect(input).toHaveValue(12.5);
  expect(input).toHaveAttribute("min", "0");
  expect(input).toHaveAttribute("max", "100");
  expect(input).toHaveAttribute("step", "0.01");
  expect(screen.getByText("%")).toBeInTheDocument();
});

test.each(["0", "10", "12.5", "100"])("submits valid extraStepPercent %s as a Number", async (value) => {
  renderPricing();
  fireEvent.change(await extraStepInput(), { target: { value } });
  save();
  await waitFor(() => expect(updateBillingPricing).toHaveBeenCalledWith(expect.objectContaining({ extraStepPercent: Number(value) })));
  expect(typeof updateBillingPricing.mock.calls[0][0].extraStepPercent).toBe("number");
});

test.each(["100.01", "1000", "-1", "10.123", ""])("rejects invalid extraStepPercent %s", async (value) => {
  renderPricing();
  fireEvent.change(await extraStepInput(), { target: { value } });
  save();
  expect(await screen.findByText(EXTRA_STEP_PERCENT_ERROR)).toBeInTheDocument();
  expect(updateBillingPricing).not.toHaveBeenCalled();
});

test.each(["abc", "10%", "1,000", "10.123", "-1", "", "100.01"])("validator rejects unformatted or invalid value %s", (value) => {
  expect(isValidExtraStepPercent(value)).toBe(false);
});

test("keeps extra step percent separate from the fixed capacity step amount", async () => {
  renderPricing();
  fireEvent.change(await extraStepInput(), { target: { value: "12.5" } });
  fireEvent.change(screen.getByLabelText("مبلغ ثابت هر پله (تومان، اختیاری)"), { target: { value: "5000" } });
  save();
  await waitFor(() => expect(updateBillingPricing).toHaveBeenCalledWith(expect.objectContaining({ extraStepPercent: 12.5, capacityStepAmount: 50000 })));
});

test("shows a backend 400 validation error beside extraStepPercent", async () => {
  updateBillingPricing.mockRejectedValueOnce({ response: { status: 400, data: { message: { errors: { extra_step_percent: ["درصد واردشده معتبر نیست."] } } } } });
  renderPricing();
  await extraStepInput();
  save();
  expect(await screen.findByText("درصد واردشده معتبر نیست.")).toBeInTheDocument();
  expect(screen.queryByText(/خطای سرور/)).not.toBeInTheDocument();
});

test("refetches pricing and history after a successful save", async () => {
  renderPricing();
  await extraStepInput();
  save();
  await waitFor(() => {
    expect(getBillingPricing).toHaveBeenCalledTimes(2);
    expect(getBillingPricingHistory).toHaveBeenCalledTimes(2);
  });
});

test("prevents duplicate submissions while saving", async () => {
  let resolveUpdate;
  updateBillingPricing.mockImplementationOnce(() => new Promise((resolve) => { resolveUpdate = resolve; }));
  renderPricing();
  await extraStepInput();
  const button = screen.getByRole("button", { name: /ذخیره تنظیمات/ });
  fireEvent.click(button);
  fireEvent.click(button);
  expect(updateBillingPricing).toHaveBeenCalledTimes(1);
  expect(button).toBeDisabled();
  resolveUpdate({ baseMonthlyAmount: 100000 });
  await waitFor(() => expect(button).not.toBeDisabled());
});

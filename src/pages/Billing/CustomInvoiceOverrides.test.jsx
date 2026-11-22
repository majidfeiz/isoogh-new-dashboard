import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import CustomInvoiceModal from "./CustomInvoiceModal.jsx";
import { createCustomBillingInvoice } from "../../services/billingService.jsx";

jest.mock("../../services/billingService.jsx", () => ({ createCustomBillingInvoice: jest.fn() }));

const props = { open: true, toggle: jest.fn(), schools: [{ id: 94, name: "تهران" }], fixedSchoolId: "94", onCreated: jest.fn() };
const inputBeside = (label) => screen.getByText(label).parentElement.querySelector("input");
const fillRequired = () => {
  fireEvent.change(inputBeside("نام شرکت"), { target: { value: "شرکت تست" } });
  fireEvent.change(inputBeside("شناسه ملی"), { target: { value: "101" } });
  fireEvent.change(screen.getByLabelText("شرح ردیف 1"), { target: { value: "خدمت" } });
  fireEvent.change(screen.getByLabelText("مبلغ واحد ردیف 1"), { target: { value: "100000" } });
};

beforeEach(() => { jest.clearAllMocks(); createCustomBillingInvoice.mockResolvedValue({ id: 1, total_amount: "109000" }); });

test("hides overrides for non-admin mode", () => {
  render(<CustomInvoiceModal {...props} />);
  expect(screen.queryByLabelText("مالیات ثابت (ریال، اختیاری)")).not.toBeInTheDocument();
  expect(screen.queryByLabelText("ارزش افزوده ثابت (ریال، اختیاری)")).not.toBeInTheDocument();
});

test("omits blank tax override and sends explicit zero VAT override", async () => {
  render(<CustomInvoiceModal {...props} allowOverrides />);
  fillRequired();
  fireEvent.change(screen.getByLabelText("ارزش افزوده ثابت (ریال، اختیاری)"), { target: { value: "0" } });
  fireEvent.click(screen.getByRole("button", { name: "صدور فاکتور" }));
  await waitFor(() => expect(createCustomBillingInvoice).toHaveBeenCalled());
  const payload = createCustomBillingInvoice.mock.calls[0][0];
  expect(payload).not.toHaveProperty("taxAmount");
  expect(payload.vatAmount).toBe(0);
});

test("rejects negative and decimal fixed amounts", () => {
  render(<CustomInvoiceModal {...props} allowOverrides />);
  fireEvent.change(screen.getByLabelText("مالیات ثابت (ریال، اختیاری)"), { target: { value: "-1" } });
  expect(screen.getByLabelText("مالیات ثابت (ریال، اختیاری)")).toBeInvalid();
  fireEvent.change(screen.getByLabelText("ارزش افزوده ثابت (ریال، اختیاری)"), { target: { value: "1.5" } });
  expect(screen.getByLabelText("ارزش افزوده ثابت (ریال، اختیاری)")).toBeInvalid();
});

import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import BillingAutoInvoices from "./BillingAutoInvoices.jsx";
import { getAdvisers } from "../../services/adviserService.jsx";
import { addAutoInvoiceAdviser, createAutoInvoice, executeAutoInvoiceForMonth, executeAutoInvoices, getAutoInvoices, updateAutoInvoice } from "../../services/billingService.jsx";

jest.mock("../../context/AuthContext.jsx", () => ({ useAuth: () => ({ user: { schoolId: 94, schoolName: "مجموعه آزمون" }, selectedSchoolId: "94", setSelectedSchoolId: jest.fn(), hasPermission: () => true }) }));
jest.mock("../IncomingCalls/IncomingCallsCommon.jsx", () => ({ SchoolPicker: () => null }));
jest.mock("../../services/adviserService.jsx", () => ({ getAdvisers: jest.fn() }));
jest.mock("../../services/billingService.jsx", () => ({ addAutoInvoiceAdviser: jest.fn(), createAutoInvoice: jest.fn(), executeAutoInvoiceForMonth: jest.fn(), executeAutoInvoices: jest.fn(), getAutoInvoices: jest.fn(), updateAutoInvoice: jest.fn() }));

const schedule = { id: 12, name: "قرارداد ماهانه", is_active: true, jalali_day: 1, due_days: 7, contracted_adviser_count: 56, adviser_monthly_amount: 4110000, included_students_per_adviser: 200, items: [] };
const renderPage = () => render(<MemoryRouter><BillingAutoInvoices /></MemoryRouter>);
const Location = () => { const location = useLocation(); return <div data-testid="location">{location.pathname}{location.search}</div>; };
const renderPageWithLocation = () => render(<MemoryRouter initialEntries={["/billing/auto-invoices"]}><Routes><Route path="*" element={<><BillingAutoInvoices /><Location /></>} /></Routes></MemoryRouter>);
const selectNewAdviser = async () => {
  await screen.findByRole("option", { name: "مشاور جدید" });
  fireEvent.change(screen.getByLabelText("مشاور"), { target: { value: "31" } });
  await waitFor(() => expect(screen.getByRole("button", { name: "صدور فاکتور افزودن مشاور" })).not.toBeDisabled());
};

beforeEach(() => {
  jest.clearAllMocks();
  getAutoInvoices.mockResolvedValue([]);
  getAdvisers.mockResolvedValue({ items: [{ id: 31, name: "مشاور جدید" }] });
  createAutoInvoice.mockResolvedValue({ id: 1 });
  updateAutoInvoice.mockResolvedValue({ id: 12 });
  executeAutoInvoices.mockResolvedValue({});
  executeAutoInvoiceForMonth.mockResolvedValue({ invoice: { id: 88 } });
  addAutoInvoiceAdviser.mockResolvedValue({ invoice: { id: 77, totalAmount: 4110000, pricingSnapshot: { adviserBaseAmount: 4110000, includedStudentsPerAdviser: 200, extraSteps: 0 } } });
});

test("creates a 56 adviser contract without fixed invoice lines", async () => {
  renderPage();
  await screen.findByText("ردیف ثابتی تعریف نشده است.");
  fireEvent.change(screen.getByLabelText("نام تنظیم"), { target: { value: "قرارداد ماهانه مشاوران" } });
  fireEvent.change(screen.getByLabelText("تعداد مشاور قراردادی"), { target: { value: "56" } });
  fireEvent.change(screen.getByLabelText("مبلغ ماهانه هر مشاور (ریال)"), { target: { value: "4110000" } });
  expect(screen.getByText(/مبلغ پایه ماهانه قرارداد/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "ذخیره تنظیم" }));
  await waitFor(() => expect(createAutoInvoice).toHaveBeenCalledWith(expect.objectContaining({ schoolId: 94, adviserCount: 56, adviserMonthlyAmount: 4110000, includedStudentsPerAdviser: 200, items: [] })));
  expect(createAutoInvoice.mock.calls[0][0]).not.toHaveProperty("isActive");
});

test("blocks increasing the contracted count directly and points to add-adviser action", async () => {
  getAutoInvoices.mockResolvedValue([schedule]);
  renderPage();
  fireEvent.click(await screen.findByRole("button", { name: "ویرایش" }));
  fireEvent.change(screen.getByLabelText("تعداد مشاور قراردادی"), { target: { value: "57" } });
  fireEvent.click(screen.getByRole("button", { name: "ذخیره تنظیم" }));
  expect(await screen.findByText(/افزایش تعداد مشاور از ویرایش تنظیم مجاز نیست/)).toBeInTheDocument();
  expect(updateAutoInvoice).not.toHaveBeenCalled();
  expect(screen.getByRole("button", { name: "افزودن مشاور به قرارداد" })).toBeInTheDocument();
});

test("uses target capacity 200 for a base-only adviser invoice and keeps count unchanged before payment", async () => {
  getAutoInvoices.mockResolvedValue([schedule]);
  renderPage();
  fireEvent.click(await screen.findByRole("button", { name: "افزودن مشاور به قرارداد" }));
  await selectNewAdviser();
  expect(screen.getByLabelText("ظرفیت کل هدف")).toHaveValue(200);
  fireEvent.click(screen.getByRole("button", { name: "صدور فاکتور افزودن مشاور" }));
  await waitFor(() => expect(addAutoInvoiceAdviser).toHaveBeenCalledWith(12, expect.objectContaining({ schoolId: "94", adviserId: "31", targetStudentCapacity: 200 })));
  expect(await screen.findByText(/تعداد قراردادی فقط پس از پرداخت موفق افزایش می‌یابد/)).toBeInTheDocument();
  expect(screen.getByText("۵۶ مشاور")).toBeInTheDocument();
  expect(screen.getByText("مبلغ پایه مشاور جدید")).toBeInTheDocument();
});

test("shows backend base plus extra steps for capacity above 200", async () => {
  getAutoInvoices.mockResolvedValue([schedule]);
  addAutoInvoiceAdviser.mockResolvedValueOnce({ invoice: { total_amount: 5000000, pricing_snapshot: { adviser_base_amount: 4110000, extra_steps: 1, extra_steps_amount: 890000, included_students_per_adviser: 200, target_student_capacity: 240 } } });
  renderPage();
  fireEvent.click(await screen.findByRole("button", { name: "افزودن مشاور به قرارداد" }));
  await selectNewAdviser();
  fireEvent.change(screen.getByLabelText("ظرفیت کل هدف"), { target: { value: "240" } });
  fireEvent.click(screen.getByRole("button", { name: "صدور فاکتور افزودن مشاور" }));
  expect(await screen.findByText("جمع پله‌های اضافه")).toBeInTheDocument();
  expect(screen.getByText("مبلغ پایه مشاور جدید")).toBeInTheDocument();
});

test("reuses the same idempotency key when the user retries a failed attempt", async () => {
  getAutoInvoices.mockResolvedValue([schedule]);
  addAutoInvoiceAdviser.mockRejectedValueOnce({ response: { status: 500 } }).mockResolvedValueOnce({ invoice: { totalAmount: 4110000 } });
  renderPage();
  fireEvent.click(await screen.findByRole("button", { name: "افزودن مشاور به قرارداد" }));
  await selectNewAdviser();
  fireEvent.click(screen.getByRole("button", { name: "صدور فاکتور افزودن مشاور" }));
  await screen.findByText("دریافت اطلاعات با خطا روبه‌رو شد.");
  fireEvent.click(screen.getByRole("button", { name: "صدور فاکتور افزودن مشاور" }));
  await waitFor(() => expect(addAutoInvoiceAdviser).toHaveBeenCalledTimes(2));
  const firstKey = addAutoInvoiceAdviser.mock.calls[0][1].idempotencyKey;
  const secondKey = addAutoInvoiceAdviser.mock.calls[1][1].idempotencyKey;
  expect(firstKey).toBeTruthy();
  expect(secondKey).toBe(firstKey);
});

test("shows a clear conflict and does not create a second request automatically", async () => {
  getAutoInvoices.mockResolvedValue([schedule]);
  addAutoInvoiceAdviser.mockRejectedValueOnce({ response: { status: 409, data: {} } });
  renderPage();
  fireEvent.click(await screen.findByRole("button", { name: "افزودن مشاور به قرارداد" }));
  await selectNewAdviser();
  fireEvent.click(screen.getByRole("button", { name: "صدور فاکتور افزودن مشاور" }));
  expect(await screen.findByText(/فاکتور تکراری ساخته نشد/)).toBeInTheDocument();
  expect(addAutoInvoiceAdviser).toHaveBeenCalledTimes(1);
});

test("executes the selected Jalali month immediately and navigates to the returned invoice", async () => {
  getAutoInvoices.mockResolvedValue([schedule]);
  renderPageWithLocation();
  fireEvent.click(await screen.findByRole("button", { name: "صدور فاکتور" }));
  fireEvent.change(screen.getByLabelText("سال شمسی"), { target: { value: "1405" } });
  fireEvent.change(screen.getByLabelText("ماه شمسی"), { target: { value: "8" } });
  expect(screen.getByText((_, element) => element.classList?.contains("alert-warning") && element.textContent.includes("قرارداد ماهانه") && element.textContent.includes("مجموعه آزمون") && element.textContent.includes("آبان"))).toBeInTheDocument();
  fireEvent.submit(screen.getByRole("button", { name: "تأیید و صدور فاکتور" }).closest("form"));
  await waitFor(() => expect(executeAutoInvoiceForMonth).toHaveBeenCalledWith(12, { schoolId: "94", jalaliYear: 1405, jalaliMonth: "8" }));
  expect(await screen.findByTestId("location")).toHaveTextContent("/billing/invoices/88?schoolId=94");
});

test("repeating the same month follows the idempotent invoice returned by backend", async () => {
  getAutoInvoices.mockResolvedValue([schedule]);
  executeAutoInvoiceForMonth.mockResolvedValueOnce({ id: 99 });
  renderPageWithLocation();
  fireEvent.click(await screen.findByRole("button", { name: "صدور فاکتور" }));
  fireEvent.change(screen.getByLabelText("سال شمسی"), { target: { value: "1405" } });
  fireEvent.change(screen.getByLabelText("ماه شمسی"), { target: { value: "7" } });
  fireEvent.submit(screen.getByRole("button", { name: "تأیید و صدور فاکتور" }).closest("form"));
  await waitFor(() => expect(executeAutoInvoiceForMonth).toHaveBeenCalledTimes(1));
  expect(await screen.findByTestId("location")).toHaveTextContent("/billing/invoices/99?schoolId=94");
});

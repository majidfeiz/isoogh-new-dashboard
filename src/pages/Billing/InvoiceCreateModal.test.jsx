import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import InvoiceCreateModal, { billingPreviewKey } from "./InvoiceCreateModal.jsx";
import { createBillingInvoice, getBillingInvoicePreview } from "../../services/billingService.jsx";

jest.mock("../../services/billingService.jsx", () => ({ createBillingInvoice: jest.fn(), getBillingInvoicePreview: jest.fn() }));

const preview = {
  schoolId: 94, schoolName: "علامه حلی", durationMonths: 1, includedStudents: 200,
  period: { jalaliLabel: "۱۴۰۵/۰۸", periodStart: "2026-10-23", periodEnd: "2026-11-21", months: [{ jalaliLabel: "آبان ۱۴۰۵", periodStart: "2026-10-23", periodEnd: "2026-11-21", startUnix: 100, endExclusiveUnix: 200 }] },
  advisers: [{ adviserId: 12, adviserName: "مریم احمدی", currentCapacity: 210, suggestedTargetCapacity: 240, peakStudentCount: 230, months: [{ jalaliLabel: "آبان ۱۴۰۵", distinctStudentCount: 230, contributingFormCount: 2, forms: [{ formId: 1, formTitle: "فرم اول", formStartAt: 110, formEndAt: 190, studentCount: 150 }, { formId: 2, formTitle: "فرم دوم", formStartAt: 90, formEndAt: 210, studentCount: 140 }] }] }],
};
const props = { open: true, toggle: jest.fn(), schools: [{ id: 94, name: "علامه حلی" }], fixedSchoolId: "94" };
const selectAban1405 = () => {
  fireEvent.change(screen.getByLabelText("سال صورتحساب"), { target: { value: "1405" } });
  fireEvent.change(screen.getByLabelText("ماه شروع صورتحساب"), { target: { value: "8" } });
};

beforeEach(() => { jest.clearAllMocks(); getBillingInvoicePreview.mockResolvedValue(preview); });

test("renders backend Jalali period, peak usage and monthly form evidence", async () => {
  render(<InvoiceCreateModal {...props} />);
  expect(getBillingInvoicePreview).not.toHaveBeenCalled();
  selectAban1405();
  expect(await screen.findByText("مریم احمدی")).toBeInTheDocument();
  expect(screen.getAllByText("آبان ۱۴۰۵").length).toBeGreaterThan(0);
  expect(getBillingInvoicePreview).toHaveBeenCalledWith(expect.objectContaining({ schoolId: "94", jalaliYear: "1405", jalaliMonth: "8", durationMonths: 1 }));
  expect(screen.getByText(/۰۰:۰۰ تا .*۲۳:۵۹/)).toBeInTheDocument();
  expect(screen.queryByText(/۰۳:۳۰/)).not.toBeInTheDocument();
  expect(screen.getByText(/بیشترین مصرف ماهانه: ۲۳۰/)).toBeInTheDocument();
  fireEvent.click(screen.getByText("مبنای محاسبه"));
  expect(screen.getByText("فرم اول")).toBeInTheDocument();
  expect(screen.getByText(/دانش‌آموز تکراری بین فرم‌ها فقط یک‌بار/)).toBeInTheDocument();
  expect(screen.getByText("فعال در بخشی از ماه")).toBeInTheDocument();
});

test("uses a query key scoped by school, selected Jalali period, duration and adviser", () => {
  expect(billingPreviewKey({ schoolId: "94", jalaliYear: "1405", jalaliMonth: "8", durationMonths: 3, adviserId: "12" })).toEqual(["billing", "invoice-preview", 94, 1405, 8, 3, 12]);
});

test("cancels the previous preview request when duration changes", async () => {
  render(<InvoiceCreateModal {...props} />);
  selectAban1405();
  await screen.findByText("مریم احمدی");
  const firstSignal = getBillingInvoicePreview.mock.calls[0][0].signal;
  fireEvent.change(screen.getByLabelText("مدت اشتراک"), { target: { value: "3" } });
  await waitFor(() => expect(getBillingInvoicePreview).toHaveBeenLastCalledWith(expect.objectContaining({ schoolId: "94", jalaliYear: "1405", jalaliMonth: "8", durationMonths: 3 })));
  expect(firstSignal.aborted).toBe(true);
});

test("shows preview errors with retry and keeps submit disabled", async () => {
  getBillingInvoicePreview.mockRejectedValueOnce({ response: { status: 403 } }).mockResolvedValueOnce(preview);
  render(<InvoiceCreateModal {...props} />);
  selectAban1405();
  expect(await screen.findByText("خارج از دامنه دسترسی")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "صدور فاکتور" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "تلاش دوباره" }));
  expect(await screen.findByText("مریم احمدی")).toBeInTheDocument();
});

test("rejects a target below the backend peak and handles a month without forms", async () => {
  getBillingInvoicePreview.mockResolvedValue({ ...preview, advisers: [{ ...preview.advisers[0], months: [{ jalaliLabel: "آبان ۱۴۰۵", distinctStudentCount: 0, contributingFormCount: 0, forms: [] }] }] });
  render(<InvoiceCreateModal {...props} />);
  selectAban1405();
  await screen.findByText("مریم احمدی");
  fireEvent.click(screen.getByLabelText("انتخاب مریم احمدی"));
  fireEvent.change(screen.getByLabelText("ظرفیت دوره"), { target: { value: "229" } });
  fireEvent.change(screen.getByLabelText("نام و نام خانوادگی"), { target: { value: "کاربر تست" } });
  fireEvent.change(screen.getByLabelText("کد ملی"), { target: { value: "0012345678" } });
  expect(screen.getByLabelText("ظرفیت دوره")).toBeInvalid();
  expect(screen.getByRole("button", { name: "صدور فاکتور" })).toBeDisabled();
  fireEvent.click(screen.getByText("مبنای محاسبه"));
  expect(screen.getByText("در این ماه فرم مؤثری ثبت نشده است.")).toBeInTheDocument();
});

test("submits the explicitly selected Aban 1405 without replacing it automatically", async () => {
  createBillingInvoice.mockResolvedValue({ id: 10 });
  render(<InvoiceCreateModal {...props} />);
  selectAban1405();
  await screen.findByText("مریم احمدی");
  fireEvent.click(screen.getByLabelText("انتخاب مریم احمدی"));
  fireEvent.change(screen.getByLabelText("نام و نام خانوادگی"), { target: { value: "کاربر تست" } });
  fireEvent.change(screen.getByLabelText("کد ملی"), { target: { value: "0012345678" } });
  fireEvent.click(screen.getByRole("button", { name: "صدور فاکتور" }));
  await waitFor(() => expect(createBillingInvoice).toHaveBeenCalledWith(expect.objectContaining({ schoolId: 94, jalaliYear: 1405, jalaliMonth: 8, durationMonths: 1 })));
});

test("keeps an adviser selectable and allows another invoice when the period was billed before", async () => {
  const onCreated = jest.fn().mockResolvedValue(undefined);
  const toggle = jest.fn();
  getBillingInvoicePreview.mockResolvedValue({
    ...preview,
    advisers: [{ ...preview.advisers[0], hasInvoiceForPeriod: true, duplicatePeriod: true, previouslyBilled: true }],
    billedAdviserIds: [12],
  });
  createBillingInvoice
    .mockResolvedValueOnce({ id: 101, invoiceNumber: "INV-101" })
    .mockResolvedValueOnce({ id: 102, invoiceNumber: "INV-102" });
  render(<InvoiceCreateModal {...props} toggle={toggle} onCreated={onCreated} />);
  selectAban1405();
  await screen.findByText("مریم احمدی");
  const adviserCheckbox = screen.getByLabelText("انتخاب مریم احمدی");
  expect(adviserCheckbox).not.toBeDisabled();
  expect(screen.queryByText(/برای مشاور انتخاب‌شده در این دوره قبلاً فاکتور صادر شده است/)).not.toBeInTheDocument();
  fireEvent.click(adviserCheckbox);
  fireEvent.change(screen.getByLabelText("نام و نام خانوادگی"), { target: { value: "کاربر تست" } });
  fireEvent.change(screen.getByLabelText("کد ملی"), { target: { value: "0012345678" } });

  fireEvent.click(screen.getByRole("button", { name: "صدور فاکتور" }));
  await waitFor(() => expect(createBillingInvoice).toHaveBeenCalledTimes(1));
  await waitFor(() => expect(toggle).toHaveBeenCalledTimes(1));
  expect(onCreated).toHaveBeenLastCalledWith(expect.objectContaining({ id: 101, invoiceNumber: "INV-101" }));

  fireEvent.click(screen.getByRole("button", { name: "صدور فاکتور" }));
  await waitFor(() => expect(createBillingInvoice).toHaveBeenCalledTimes(2));
  expect(onCreated).toHaveBeenLastCalledWith(expect.objectContaining({ id: 102, invoiceNumber: "INV-102" }));
});

test("renders a three-month backend period that crosses the Jalali year boundary", async () => {
  getBillingInvoicePreview.mockResolvedValue({ ...preview, durationMonths: 3, period: { ...preview.period, jalaliLabel: "بهمن ۱۴۰۵ تا فروردین ۱۴۰۶", months: [{ jalaliLabel: "بهمن ۱۴۰۵" }, { jalaliLabel: "اسفند ۱۴۰۵" }, { jalaliLabel: "فروردین ۱۴۰۶" }] } });
  render(<InvoiceCreateModal {...props} />);
  fireEvent.change(screen.getByLabelText("سال صورتحساب"), { target: { value: "1405" } });
  fireEvent.change(screen.getByLabelText("ماه شروع صورتحساب"), { target: { value: "11" } });
  fireEvent.change(screen.getByLabelText("مدت اشتراک"), { target: { value: "3" } });
  expect(await screen.findByText("بهمن ۱۴۰۵ تا فروردین ۱۴۰۶")).toBeInTheDocument();
  expect(screen.getByText("بهمن ۱۴۰۵، اسفند ۱۴۰۵، فروردین ۱۴۰۶")).toBeInTheDocument();
});

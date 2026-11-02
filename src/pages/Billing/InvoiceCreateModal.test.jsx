import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import InvoiceCreateModal, { billingPreviewKey } from "./InvoiceCreateModal.jsx";
import { getBillingInvoicePreview } from "../../services/billingService.jsx";

jest.mock("../../services/billingService.jsx", () => ({ createBillingInvoice: jest.fn(), getBillingInvoicePreview: jest.fn() }));

const preview = {
  schoolId: 94, schoolName: "علامه حلی", durationMonths: 1, includedStudents: 200,
  period: { jalaliLabel: "مهر ۱۴۰۵", periodStart: "2026-09-23", periodEnd: "2026-10-22", months: [{ jalaliLabel: "مهر ۱۴۰۵", periodStart: "2026-09-23", periodEnd: "2026-10-22", startUnix: 100, endExclusiveUnix: 200 }] },
  advisers: [{ adviserId: 12, adviserName: "مریم احمدی", currentCapacity: 210, suggestedTargetCapacity: 240, peakStudentCount: 230, months: [{ jalaliLabel: "مهر ۱۴۰۵", distinctStudentCount: 230, contributingFormCount: 2, forms: [{ formId: 1, formTitle: "فرم اول", formStartAt: 110, formEndAt: 190, studentCount: 150 }, { formId: 2, formTitle: "فرم دوم", formStartAt: 90, formEndAt: 210, studentCount: 140 }] }] }],
};
const props = { open: true, toggle: jest.fn(), schools: [{ id: 94, name: "علامه حلی" }], fixedSchoolId: "94" };

beforeEach(() => { jest.clearAllMocks(); getBillingInvoicePreview.mockResolvedValue(preview); });

test("renders backend Jalali period, peak usage and monthly form evidence", async () => {
  render(<InvoiceCreateModal {...props} />);
  expect(await screen.findByText("مریم احمدی")).toBeInTheDocument();
  expect(screen.getAllByText("مهر ۱۴۰۵").length).toBeGreaterThan(0);
  expect(screen.getByText(/۰۰:۰۰ تا .*۲۳:۵۹/)).toBeInTheDocument();
  expect(screen.queryByText(/۰۳:۳۰/)).not.toBeInTheDocument();
  expect(screen.getByText(/بیشترین مصرف ماهانه: ۲۳۰/)).toBeInTheDocument();
  fireEvent.click(screen.getByText("مبنای محاسبه"));
  expect(screen.getByText("فرم اول")).toBeInTheDocument();
  expect(screen.getByText(/دانش‌آموز تکراری بین فرم‌ها فقط یک‌بار/)).toBeInTheDocument();
  expect(screen.getByText("فعال در بخشی از ماه")).toBeInTheDocument();
});

test("uses a query key scoped by school, duration and adviser", () => {
  expect(billingPreviewKey({ schoolId: "94", durationMonths: 3, adviserId: "12" })).toEqual(["billing", "invoice-preview", 94, 3, 12]);
});

test("cancels the previous preview request when duration changes", async () => {
  render(<InvoiceCreateModal {...props} />);
  await screen.findByText("مریم احمدی");
  const firstSignal = getBillingInvoicePreview.mock.calls[0][0].signal;
  fireEvent.change(screen.getByLabelText("مدت اشتراک"), { target: { value: "3" } });
  await waitFor(() => expect(getBillingInvoicePreview).toHaveBeenLastCalledWith(expect.objectContaining({ schoolId: "94", durationMonths: 3 })));
  expect(firstSignal.aborted).toBe(true);
});

test("shows preview errors with retry and keeps submit disabled", async () => {
  getBillingInvoicePreview.mockRejectedValueOnce({ response: { status: 403 } }).mockResolvedValueOnce(preview);
  render(<InvoiceCreateModal {...props} />);
  expect(await screen.findByText("خارج از دامنه دسترسی")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "صدور فاکتور" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "تلاش دوباره" }));
  expect(await screen.findByText("مریم احمدی")).toBeInTheDocument();
});

test("rejects a target below the backend peak and handles a month without forms", async () => {
  getBillingInvoicePreview.mockResolvedValue({ ...preview, advisers: [{ ...preview.advisers[0], months: [{ jalaliLabel: "مهر ۱۴۰۵", distinctStudentCount: 0, contributingFormCount: 0, forms: [] }] }] });
  render(<InvoiceCreateModal {...props} />);
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

import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import FormDetail, { callStatusConfig } from "./FormDetail.jsx";
import {
  getAdviserFormStudents,
  getAdviserSupportFormDetail,
  getAdviserSupportFormStats,
  getAdviserWorkShifts,
  makeCall,
  updateAdviserStudentStatus,
} from "../../services/adviserPortalService.jsx";

const mockHasPermission = jest.fn();

jest.mock("../../services/adviserPortalService.jsx", () => ({
  getAdviserSupportFormDetail: jest.fn(),
  getAdviserSupportFormStats: jest.fn(),
  getAdviserFormStudents: jest.fn(),
  getAdviserWorkShifts: jest.fn(),
  getStudentAnswers: jest.fn(),
  getStudentCallLogs: jest.fn(),
  makeCall: jest.fn(),
  submitAnswers: jest.fn(),
  updateAdviserStudentWorkShift: jest.fn(),
  updateAdviserStudentStatus: jest.fn(),
}));
jest.mock("../../context/AuthContext.jsx", () => ({ useAuth: () => ({ hasPermission: mockHasPermission }) }));
jest.mock("../../services/voipService.jsx", () => ({ getCallTrace: jest.fn() }));
jest.mock("react-toastify", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock("../../components/Common/Paginations.jsx", () => () => null);

const student = {
  id: 10659006,
  studentId: 20,
  name: "دانش‌آموز",
  successfulCallCount: 0,
  failedCallCount: 0,
  totalCallCount: 0,
  status: 0,
  workShiftId: 1,
};

const renderPage = (entry = "/adviser-calls/forms/10") => render(
  <MemoryRouter initialEntries={[entry]}>
    <Routes><Route path="/adviser-calls/forms/:formId" element={<FormDetail />} /></Routes>
  </MemoryRouter>
);

beforeEach(() => {
  jest.clearAllMocks();
  mockHasPermission.mockReturnValue(true);
  getAdviserSupportFormStats.mockResolvedValue({});
  getAdviserWorkShifts.mockResolvedValue([{ id: 1, name: "صبح" }]);
  getAdviserFormStudents.mockResolvedValue({ items: [student], pagination: { page: 1, limit: 15, total: 1, lastPage: 1 } });
});

test.each([
  [0, "بدون وضعیت", "secondary"],
  [1, "موفق", "success"],
  [2, "ناموفق/ناقص", "danger"],
])("maps status %s to the expected label and color", (status, label, color) => {
  expect(callStatusConfig[status]).toEqual({ label, color });
});

test("disables calling and work-shift changes when the server marks the form read-only", async () => {
  getAdviserSupportFormDetail.mockResolvedValue({ id: 10, schoolId: 146, title: "فرم بسته", isClosed: true, canEdit: false, canCall: false, questions: [] });
  renderPage();

  expect(await screen.findByText("تاریخ پایان این فرم تماس گذشته است؛ فرم فقط قابل مشاهده است.")).toBeInTheDocument();
  expect(await screen.findByTitle("برقراری تماس")).toBeDisabled();
  expect(screen.getByDisplayValue("صبح")).toBeDisabled();
  expect(screen.getByRole("combobox", { name: /تغییر وضعیت تماس/ })).toBeEnabled();
  expect(screen.getByTitle("مشاهده پروفایل دانش‌آموز")).toBeEnabled();
});

test("updates the assignment status after form end with row.id, keeps counts and refetches current query", async () => {
  getAdviserSupportFormDetail.mockResolvedValue({ id: 10, schoolId: 146, title: "فرم بسته", isClosed: true, canEdit: false, canCall: false, questions: [] });
  updateAdviserStudentStatus.mockResolvedValue({ assignmentId: 10659006, studentId: 20, status: 1 });
  getAdviserFormStudents
    .mockResolvedValueOnce({ items: [student], pagination: { page: 2, limit: 15, total: 20, lastPage: 2 } })
    .mockResolvedValueOnce({ items: [{ ...student, status: 1 }], pagination: { page: 2, limit: 15, total: 20, lastPage: 2 } });
  renderPage("/adviser-calls/forms/10?page=2&limit=15&status=0&workShiftId=1&search=test&sortBy=status&sortOrder=DESC");

  const control = await screen.findByRole("combobox", { name: /تغییر وضعیت تماس/ });
  fireEvent.change(control, { target: { value: "1" } });

  await waitFor(() => expect(updateAdviserStudentStatus).toHaveBeenCalledWith({
    formId: 10,
    assignmentId: 10659006,
    schoolId: 146,
    status: 1,
  }));
  await waitFor(() => expect(getAdviserFormStudents).toHaveBeenLastCalledWith(expect.objectContaining({
    formId: "10", page: 2, search: "test", status: "0", workShiftId: "1", sortBy: "status", sortOrder: "DESC",
  })));
  expect(screen.getByText("موفق", { selector: ".badge.bg-success" })).toBeInTheDocument();
  expect(screen.getByText("0", { selector: ".badge.bg-success" })).toBeInTheDocument();
  expect(screen.getByText("0", { selector: ".badge.bg-danger" })).toBeInTheDocument();
  expect(screen.getByText("0", { selector: ".badge.bg-primary" })).toBeInTheDocument();
  expect(screen.getByTitle("برقراری تماس")).toBeDisabled();
});

test("prevents duplicate status mutations for the same assignment", async () => {
  getAdviserSupportFormDetail.mockResolvedValue({ id: 10, schoolId: 146, title: "فرم", isClosed: false, canEdit: true, canCall: true, questions: [] });
  let resolveUpdate;
  updateAdviserStudentStatus.mockImplementation(() => new Promise((resolve) => { resolveUpdate = resolve; }));
  renderPage();
  const control = await screen.findByRole("combobox", { name: /تغییر وضعیت تماس/ });
  fireEvent.change(control, { target: { value: "1" } });
  fireEvent.change(control, { target: { value: "2" } });
  expect(updateAdviserStudentStatus).toHaveBeenCalledTimes(1);
  expect(control).toBeDisabled();
  resolveUpdate({ assignmentId: 10659006, status: 1 });
});

test("keeps manual status control disabled without update permission", async () => {
  mockHasPermission.mockReturnValue(false);
  getAdviserSupportFormDetail.mockResolvedValue({ id: 10, schoolId: 146, title: "فرم", isClosed: false, canEdit: true, canCall: true, questions: [] });
  renderPage();
  expect(await screen.findByRole("combobox", { name: /تغییر وضعیت تماس/ })).toBeDisabled();
});

test("keeps the old status and refetches after a forbidden mutation", async () => {
  getAdviserSupportFormDetail.mockResolvedValue({ id: 10, schoolId: 146, title: "فرم", isClosed: false, canEdit: true, canCall: true, questions: [] });
  updateAdviserStudentStatus.mockRejectedValue({ response: { status: 403 } });
  renderPage();
  const control = await screen.findByRole("combobox", { name: /تغییر وضعیت تماس/ });
  fireEvent.change(control, { target: { value: "2" } });
  await waitFor(() => expect(getAdviserFormStudents).toHaveBeenCalledTimes(2));
  expect(control).toHaveValue("0");
});

test("handles SUPPORT_FORM_ENDED from an in-flight call without removing existing data", async () => {
  getAdviserSupportFormDetail.mockResolvedValue({ id: 10, title: "فرم فعال", isClosed: false, canEdit: true, canCall: true, questions: [] });
  makeCall.mockRejectedValue({ response: { status: 403, data: { code: "SUPPORT_FORM_ENDED", endAt: 1817169010 } } });
  renderPage();

  const callButton = await screen.findByTitle("برقراری تماس");
  fireEvent.click(callButton);

  expect(await screen.findByText("تاریخ پایان این فرم تماس گذشته است؛ فرم فقط قابل مشاهده است.")).toBeInTheDocument();
  expect(callButton).toBeDisabled();
  expect(screen.getByText("دانش‌آموز")).toBeInTheDocument();
});

test("disables new calls after ADVISER_ACCOUNT_INACTIVE without clearing students", async () => {
  getAdviserSupportFormDetail.mockResolvedValue({ id: 10, schoolId: 146, title: "فرم فعال", isClosed: false, canEdit: true, canCall: true, questions: [] });
  makeCall.mockRejectedValue({ response: { status: 403, data: { code: "ADVISER_ACCOUNT_INACTIVE" } } });
  renderPage();
  const callButton = await screen.findByTitle("برقراری تماس");
  fireEvent.click(callButton);
  expect(await screen.findByText(/حساب شما در این مجموعه غیرفعال است/)).toBeInTheDocument();
  expect(callButton).toBeDisabled();
  expect(screen.getByText("دانش‌آموز")).toBeInTheDocument();
  expect(getAdviserFormStudents).toHaveBeenCalledTimes(1);
});

test("renders contact-form headings as readable fields instead of raw JSON", async () => {
  getAdviserSupportFormDetail.mockResolvedValue({
    id: 10,
    title: "فرم توانمندسازی",
    headings: JSON.stringify([{ headings_title: "تماس پایانی", headings_body: "جمع‌بندی وضعیت دانش‌آموز" }]),
    isClosed: false,
    canEdit: true,
    canCall: true,
    questions: [],
  });
  renderPage();

  expect(await screen.findByText("سرفصل‌های فرم تماس")).toBeInTheDocument();
  expect(screen.getByText("تماس پایانی")).toBeInTheDocument();
  expect(screen.getByText("جمع‌بندی وضعیت دانش‌آموز")).toBeInTheDocument();
  expect(screen.queryByText(/headings_title/)).not.toBeInTheDocument();
});

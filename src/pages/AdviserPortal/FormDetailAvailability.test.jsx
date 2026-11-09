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
  getStudentAnswers,
  submitAnswers,
  updateAdviserStudentStatus,
} from "../../services/adviserPortalService.jsx";
import { toast } from "react-toastify";

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
jest.mock("../../context/ActiveCallContext.jsx", () => ({
  useActiveCall: () => ({ activeCall: null, hydrate: jest.fn(), setSchoolId: jest.fn(), setBlockedOpen: jest.fn() }),
}));
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
  getStudentAnswers.mockResolvedValue([]);
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

test("keeps status unchanged and offers the exact call questionnaire for incomplete required answers", async () => {
  getAdviserSupportFormDetail.mockResolvedValue({
    id: 10,
    schoolId: 146,
    title: "فرم",
    isClosed: false,
    canEdit: true,
    canCall: true,
    questions: [
      { id: 101, text: "هدف تماس", type: 0, required: true, options: [] },
      { id: 102, text: "نتیجه پیگیری", type: 1, required: true, options: [{ id: 201, label: "انجام شد" }] },
    ],
  });
  updateAdviserStudentStatus.mockRejectedValue({ response: { status: 422, data: {
    code: "REQUIRED_QUESTIONS_INCOMPLETE_FOR_STATUS",
    message: "به دلیل تکمیل نشدن سؤالات اجباری فرم تماس، امکان تغییر وضعیت وجود ندارد. ابتدا فرم تماس را تکمیل کنید.",
    supportFormId: 10,
    studentId: 20,
    voipCallId: 555,
    missingQuestionIds: [101, 102],
    errors: [
      { questionId: 101, title: "هدف تماس", type: 0, multiChoice: false, message: "الزامی است" },
      { questionId: 102, title: "نتیجه پیگیری", type: 1, multiChoice: false, message: "الزامی است" },
    ],
  } } });
  renderPage();

  const control = await screen.findByRole("combobox", { name: /تغییر وضعیت تماس/ });
  fireEvent.change(control, { target: { value: "1" } });

  expect(await screen.findByText("هدف تماس", { selector: "li" })).toBeInTheDocument();
  expect(screen.getByText("نتیجه پیگیری", { selector: "li" })).toBeInTheDocument();
  expect(screen.getByText(/به دلیل تکمیل نشدن سؤالات اجباری/)).toBeInTheDocument();
  expect(control).toHaveValue("0");
  expect(getAdviserFormStudents).toHaveBeenCalledTimes(1);
  expect(getAdviserSupportFormStats).toHaveBeenCalledTimes(1);
  expect(toast.success).not.toHaveBeenCalledWith("وضعیت تماس دانش‌آموز به‌روزرسانی شد");

  fireEvent.click(screen.getByRole("button", { name: /تکمیل پاسخ‌نامه/ }));
  await waitFor(() => expect(getStudentAnswers).toHaveBeenCalledWith(10, 20, 555));
  expect(screen.getByText("تکمیل فرم تماس")).toBeInTheDocument();
});

test("refreshes students and stats after completing the questionnaire opened from a status error", async () => {
  getAdviserSupportFormDetail.mockResolvedValue({
    id: 10, schoolId: 146, title: "فرم", isClosed: false, canEdit: true, canCall: true,
    questions: [{ id: 101, text: "هدف تماس", type: 0, required: true, options: [] }],
  });
  updateAdviserStudentStatus.mockRejectedValue({ response: { status: 422, data: {
    code: "REQUIRED_QUESTIONS_INCOMPLETE_FOR_STATUS", message: "ابتدا پاسخ‌نامه را تکمیل کنید",
    supportFormId: 10, studentId: 20, voipCallId: 556,
    errors: [{ questionId: 101, title: "هدف تماس", type: 0, multiChoice: false, message: "الزامی است" }],
  } } });
  getStudentAnswers
    .mockResolvedValueOnce([])
    .mockResolvedValueOnce([{ voipCallId: 556, answers: [{ questionId: 101, answerText: "انجام شد" }] }]);
  submitAnswers.mockResolvedValue({ voipCallId: 556, status: 1, isComplete: true });
  renderPage();

  fireEvent.change(await screen.findByRole("combobox", { name: /تغییر وضعیت تماس/ }), { target: { value: "1" } });
  fireEvent.click(await screen.findByRole("button", { name: /تکمیل پاسخ‌نامه/ }));
  const answer = await screen.findByPlaceholderText("پاسخ خود را بنویسید...");
  fireEvent.change(answer, { target: { value: "انجام شد" } });
  fireEvent.click(screen.getByRole("button", { name: /ثبت پاسخ‌ها/ }));

  await waitFor(() => expect(submitAnswers).toHaveBeenCalledWith(expect.objectContaining({ voipCallId: 556 })));
  await waitFor(() => expect(getAdviserFormStudents).toHaveBeenCalledTimes(2));
  expect(getAdviserSupportFormStats).toHaveBeenCalledTimes(2);
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

import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AnswerDrawer } from "./FormDetail.jsx";
import { getStudentAnswers, submitAnswers } from "../../services/adviserPortalService.jsx";

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
}));
jest.mock("../../services/voipService.jsx", () => ({ getCallTrace: jest.fn() }));
jest.mock("react-toastify", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const student = { studentId: 20, name: "دانش‌آموز", phone: "0912" };
const form = {
  id: 10,
  questions: [
    { id: 1, type: 0, text: "متنی", options: [] },
    { id: 2, type: 1, text: "تکی", options: [{ id: 21, label: "اول" }] },
    { id: 3, type: 2, multiChoice: true, text: "چندتایی", options: [{ id: 31, label: "الف" }, { id: 32, label: "ب" }] },
    { id: 4, type: 0, text: "خالی", options: [] },
  ],
};
const context = (voipCallId) => ({ formId: 10, studentId: 20, voipCallId, student, isNewCall: true });

beforeEach(() => {
  getStudentAnswers.mockReset();
  submitAnswers.mockReset();
});

test("hydrates and edits the session selected by voipCallId then refetches it", async () => {
  getStudentAnswers.mockResolvedValueOnce([{ voipCallId: 700, answers: [
    { questionId: 1, answerText: "قبلی" },
    { questionId: 2, answerId: 21 },
    { questionId: 3, answerIds: [31, 32] },
    { questionId: 4, answerText: "تکمیل" },
  ] }]).mockResolvedValueOnce([{ voipCallId: 700, answers: [] }]);
  submitAnswers.mockResolvedValue({ voipCallId: 700, count: 4, isComplete: true, status: 1 });
  render(<AnswerDrawer open student={student} form={form} callContext={context(700)} onClose={jest.fn()} />);

  const text = await screen.findByDisplayValue("قبلی");
  fireEvent.change(text, { target: { value: "ویرایش" } });
  fireEvent.click(screen.getByRole("button", { name: /ثبت پاسخ‌ها/ }));

  await waitFor(() => expect(submitAnswers).toHaveBeenCalledWith(expect.objectContaining({
    formId: 10,
    studentId: 20,
    voipCallId: 700,
    answers: [
      { questionId: 1, answer: "ویرایش" },
      { questionId: 2, answerId: 21 },
      { questionId: 3, answerId: [31, 32] },
      { questionId: 4, answer: "تکمیل" },
    ],
  })));
  expect(getStudentAnswers).toHaveBeenLastCalledWith(10, 20, 700);
});

test("submits a type-1 multi-choice selection as an answerId array", async () => {
  const multiChoiceForm = {
    id: 10,
    questions: [{
      id: 7168,
      type: 1,
      multiChoice: true,
      text: "تعداد تماس گرفته شده",
      options: [{ id: 123, label: "1" }, { id: 124, label: "2" }],
    }],
  };
  getStudentAnswers.mockResolvedValueOnce([]).mockResolvedValueOnce([{ voipCallId: 3805790, answers: [] }]);
  submitAnswers.mockResolvedValue({ voipCallId: 3805790, count: 1, isComplete: true, status: 1 });
  render(<AnswerDrawer open student={student} form={multiChoiceForm} callContext={context(3805790)} onClose={jest.fn()} />);

  await waitFor(() => expect(screen.getByRole("button", { name: /ثبت پاسخ‌ها/ })).toBeEnabled());
  fireEvent.click(screen.getByRole("checkbox", { name: "2" }));
  fireEvent.click(screen.getByRole("button", { name: /ثبت پاسخ‌ها/ }));

  await waitFor(() => expect(submitAnswers).toHaveBeenCalledWith(expect.objectContaining({
    voipCallId: 3805790,
    answers: [{ questionId: 7168, answerId: [124] }],
  })));
});

test("submits one full empty snapshot for a new call and blocks double submit", async () => {
  let resolveSubmit;
  getStudentAnswers.mockResolvedValue([]);
  submitAnswers.mockReturnValue(new Promise((resolve) => { resolveSubmit = resolve; }));
  render(<AnswerDrawer open student={student} form={form} callContext={context(701)} onClose={jest.fn()} />);

  await waitFor(() => expect(screen.getByRole("button", { name: /ثبت پاسخ‌ها/ })).toBeEnabled());
  fireEvent.click(screen.getByRole("button", { name: /ثبت پاسخ‌ها/ }));
  const success = screen.getByRole("button", { name: /ثبت تماس موفق/ });
  fireEvent.click(success);
  fireEvent.click(success);

  expect(submitAnswers).toHaveBeenCalledTimes(1);
  expect(submitAnswers).toHaveBeenCalledWith(expect.objectContaining({
    voipCallId: 701,
    answers: [{ questionId: 1 }, { questionId: 2 }, { questionId: 3 }, { questionId: 4 }],
  }));
  await act(async () => resolveSubmit({ voipCallId: 701, count: 4, isComplete: false, status: 1 }));
});

test("uses the exact atomic context created from a queued call response", async () => {
  getStudentAnswers.mockResolvedValue([]);
  render(<AnswerDrawer open student={student} form={form} callContext={context(3521346)} onClose={jest.fn()} />);
  await waitFor(() => expect(screen.getByRole("button", { name: /ثبت پاسخ‌ها/ })).toBeEnabled());
  expect(getStudentAnswers).toHaveBeenCalledWith(10, 20, 3521346);
});

test("resets the previous call answers when voipCallId changes", async () => {
  getStudentAnswers
    .mockResolvedValueOnce([{ voipCallId: 800, answers: [{ questionId: 1, answerText: "تماس اول" }] }])
    .mockResolvedValueOnce([]);
  const { rerender } = render(<AnswerDrawer open student={student} form={form} callContext={context(800)} onClose={jest.fn()} />);
  expect(await screen.findByDisplayValue("تماس اول")).toBeInTheDocument();

  rerender(<AnswerDrawer open student={student} form={form} callContext={context(801)} onClose={jest.fn()} />);

  await waitFor(() => expect(getStudentAnswers).toHaveBeenLastCalledWith(10, 20, 801));
  await waitFor(() => expect(screen.queryByDisplayValue("تماس اول")).not.toBeInTheDocument());
  expect(screen.getAllByPlaceholderText("پاسخ خود را بنویسید...")[0]).toHaveValue("");
});

test("keeps user answers and the modal open on validation error", async () => {
  getStudentAnswers.mockResolvedValue([]);
  submitAnswers.mockRejectedValue({ response: { status: 400, data: { message: ["questionId تکراری است"] } } });
  render(<AnswerDrawer open student={student} form={form} callContext={context(702)} onClose={jest.fn()} />);

  await screen.findAllByPlaceholderText("پاسخ خود را بنویسید...");
  const text = screen.getAllByPlaceholderText("پاسخ خود را بنویسید...")[0];
  fireEvent.change(text, { target: { value: "پاسخ حفظ شود" } });
  fireEvent.click(screen.getByRole("button", { name: /ثبت پاسخ‌ها/ }));
  fireEvent.click(screen.getByRole("button", { name: /ثبت تماس موفق/ }));

  expect(await screen.findByText("questionId تکراری است")).toBeInTheDocument();
  expect(text).toHaveValue("پاسخ حفظ شود");
  expect(screen.getByText("تکمیل فرم تماس")).toBeInTheDocument();
});

test.each([
  [403, "این دانش‌آموز در این فرم به شما تخصیص داده نشده است"],
  [404, "تماس معتبر پیدا نشد"],
])("keeps user answers after a %s submit error", async (status, message) => {
  getStudentAnswers.mockResolvedValue([]);
  submitAnswers.mockRejectedValue({ response: { status } });
  render(<AnswerDrawer open student={student} form={form} callContext={context(703 + status)} onClose={jest.fn()} />);

  await screen.findAllByPlaceholderText("پاسخ خود را بنویسید...");
  const text = screen.getAllByPlaceholderText("پاسخ خود را بنویسید...")[0];
  fireEvent.change(text, { target: { value: "پاسخ باقی بماند" } });
  fireEvent.click(screen.getByRole("button", { name: /ثبت پاسخ‌ها/ }));
  fireEvent.click(screen.getByRole("button", { name: /ثبت تماس موفق/ }));

  expect(await screen.findByText(message)).toBeInTheDocument();
  expect(text).toHaveValue("پاسخ باقی بماند");
});

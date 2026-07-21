import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import AnswerSheetDetailModal from "./AnswerSheetDetailModal.jsx";
import AnswerSheetCallModal from "./AnswerSheetCallModal.jsx";
import { getAnswerSheet, getAnswerSheetCall } from "../../services/answerSheetService.jsx";

jest.mock("../../services/answerSheetService.jsx", () => ({
  getAnswerSheet: jest.fn(),
  getAnswerSheetCall: jest.fn(),
}));

beforeEach(() => {
  getAnswerSheet.mockReset();
  getAnswerSheetCall.mockReset();
});

test("answer modal shows resolved answers and a Persian empty answer", async () => {
  getAnswerSheet.mockResolvedValue({
    session: { supportFormTitle: "پیگیری هفتگی", studentName: "علی", adviserName: "مشاور" },
    answers: [
      { questionId: 1, question: "وضعیت مطالعه؟", resolvedAnswer: "خوب" },
      { questionId: 2, question: "توضیحات", resolvedAnswer: null },
    ],
  });
  render(<AnswerSheetDetailModal sessionId="session-1" isOpen toggle={jest.fn()} />);
  expect(await screen.findByText("خوب")).toBeInTheDocument();
  expect(screen.getByText("بدون پاسخ")).toBeInTheDocument();
  expect(getAnswerSheet).toHaveBeenCalledWith("session-1", expect.objectContaining({ signal: expect.any(AbortSignal) }));
});

test("call modal treats a missing CDR as a valid empty state", async () => {
  getAnswerSheetCall.mockResolvedValue(null);
  render(<AnswerSheetCallModal sessionId="session-2" isOpen toggle={jest.fn()} />);
  await waitFor(() => expect(screen.getByText("اطلاعات CDR برای این نوبت تماس موجود نیست.")).toBeInTheDocument());
});

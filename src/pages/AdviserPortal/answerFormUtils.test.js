import { buildAnswerPayload, createAnswerCallContext, getAnswerRequestError, getAnswerSubmitMessage, getFlowVoipCallId, getSessionForVoipCall, getUnansweredQuestions, hasQuestionAnswer, hydrateAnswers } from "./answerFormUtils.js";

const questions = [
  { id: 10, type: 0 },
  { id: 11, type: 1, options: [{ id: 51 }] },
  { id: 12, type: 2, multiChoice: true, options: [{ id: 61 }, { id: 62 }] },
];

test("validates text, single choice and multi choice answers", () => {
  expect(hasQuestionAnswer(questions[0], "   ")).toBe(false);
  expect(hasQuestionAnswer(questions[1], 0)).toBe(false);
  expect(hasQuestionAnswer(questions[1], "51")).toBe(true);
  expect(hasQuestionAnswer(questions[2], [])).toBe(false);
  expect(hasQuestionAnswer(questions[2], [0, "", 61])).toBe(true);
});

test("builds the API payload only from the current question list", () => {
  const answers = { 10: "  پاسخ  ", 11: "51", 12: [0, 61, "62"], 99: 777 };
  expect(getUnansweredQuestions(questions, answers)).toEqual([]);
  expect(buildAnswerPayload(questions, answers)).toEqual([
    { questionId: 10, answer: "پاسخ" },
    { questionId: 11, answerId: 51 },
    { questionId: 12, answerId: [61, 62] },
  ]);
});

test("sends a unique full snapshot including unanswered questions", () => {
  expect(buildAnswerPayload([...questions, questions[0]], { 10: "", 11: 999, 12: [] })).toEqual([
    { questionId: 10 },
    { questionId: 11 },
    { questionId: 12 },
  ]);
});

test("hydrates text, single and multi-choice values from one VoIP session", () => {
  expect(hydrateAnswers(questions, { answers: [
    { questionId: 10, answerText: "متن قبلی" },
    { questionId: 11, answerId: 51 },
    { questionId: 12, answerIds: [61, 62] },
  ] })).toEqual({ 10: "متن قبلی", 11: 51, 12: [61, 62] });
});

test("selects a session only by its exact voipCallId", () => {
  const sessions = [{ voipCallId: 900, answers: [] }, { voipCallId: 901, answers: [] }];
  expect(getSessionForVoipCall(sessions, 901)).toBe(sessions[1]);
  expect(() => getSessionForVoipCall(sessions, 902)).toThrow("متعلق به تماس انتخاب‌شده نیست");
});

test("reuses a new call id only for the same student and form flow", () => {
  const context = { currentVoipCallId: 777, currentStudentId: 20, targetStudentId: 20, currentFormId: 10, targetFormId: 10 };
  expect(getFlowVoipCallId(context)).toBe(777);
  expect(getFlowVoipCallId({ ...context, targetStudentId: 21 })).toBeNull();
  expect(getFlowVoipCallId({ ...context, targetFormId: 11 })).toBeNull();
});

test("creates one numeric immutable snapshot from the queued call response ids", () => {
  const student = { studentId: 20 };
  expect(createAnswerCallContext({ formId: "10", studentId: "20", voipCallId: "3521346", student, isNewCall: true })).toEqual({
    formId: 10,
    studentId: 20,
    voipCallId: 3521346,
    student,
    isNewCall: true,
  });
  expect(createAnswerCallContext({ formId: 10, studentId: 20, voipCallId: null })).toBeNull();
});

test("uses the returned status and completeness for the success message", () => {
  expect(getAnswerSubmitMessage({ status: 1, isComplete: false })).toBe("تماس با تأیید مشاور موفق ثبت شد");
  expect(getAnswerSubmitMessage({ status: 2, isComplete: false })).toBe("تماس ناموفق/ناقص ثبت شد");
});

test("maps authorization and missing-call errors to actionable messages", () => {
  expect(getAnswerRequestError({ response: { status: 404 } })).toBe("تماس معتبر پیدا نشد");
  expect(getAnswerRequestError({ response: { status: 403 } })).toBe("این دانش‌آموز در این فرم به شما تخصیص داده نشده است");
  expect(getAnswerRequestError({ response: { status: 400, data: { message: ["questionId تکراری است"] } } })).toBe("questionId تکراری است");
});

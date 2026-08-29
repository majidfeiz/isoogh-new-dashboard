import { buildAnswerPayload, getAnswerSubmitMessage, getUnansweredQuestions, hasQuestionAnswer } from "./answerFormUtils.js";

const questions = [
  { id: 10, type: 0 },
  { id: 11, type: 1 },
  { id: 12, type: 2, multiChoice: true },
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

test("uses the returned status and completeness for the success message", () => {
  expect(getAnswerSubmitMessage({ status: 1, isComplete: false })).toBe("تماس با تأیید مشاور موفق ثبت شد");
  expect(getAnswerSubmitMessage({ status: 2, isComplete: false })).toBe("تماس ناقص/ناموفق ثبت شد");
});

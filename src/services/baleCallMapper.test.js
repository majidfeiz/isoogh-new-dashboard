import { buildCallAnswerPayload, normalizeBaleCallRoom, normalizeCallDraftAnswers, normalizeCallQuestion } from "./baleCallMapper.js";

describe("Bale call question mapper", () => {
  it("uses question and answer fields from the backend contract", () => {
    expect(normalizeCallQuestion({ id: "21", title: "تعداد تماس", question: "تعداد تماس انجام‌شده را مشخص کنید", type: 1, required: true, multiChoice: false, options: [{ id: "101", answer: "یک تماس" }] })).toEqual({
      id: 21, text: "تعداد تماس انجام‌شده را مشخص کنید", title: "تعداد تماس", type: 1, required: true, multiChoice: false,
      options: [{ id: 101, label: "یک تماس", labelMissing: false }],
    });
  });

  it("provides visible fallbacks for missing titles and option labels", () => {
    expect(normalizeCallQuestion({ id: 1, type: 1, options: [{ id: 2 }] })).toMatchObject({ text: "سؤال بدون عنوان", options: [{ id: 2, label: "گزینه بدون عنوان", labelMissing: true }] });
  });

  it("keeps numeric single and multi option IDs through submit", () => {
    const single = normalizeCallQuestion({ id: 1, type: 1, multiChoice: false, options: [{ id: 11, answer: "الف" }] });
    const multi = normalizeCallQuestion({ id: 2, type: 1, multiChoice: true, options: [{ id: 21, answer: "ب" }, { id: 22, answer: "ج" }] });
    expect(buildCallAnswerPayload([single, multi], { 1: 11, 2: [21, 22] })).toEqual([{ questionId: 1, answerId: 11 }, { questionId: 2, answerId: [21, 22] }]);
  });

  it("restores single and multi draft option IDs as numbers", () => {
    const questions = [
      { id: 1, type: 1, multiChoice: false },
      { id: 2, type: 1, multiChoice: true },
      { id: 3, type: 0, multiChoice: false },
    ];
    expect(normalizeCallDraftAnswers([
      { questionId: "1", answerId: "11" },
      { questionId: "2", answerId: ["21", "22"] },
      { questionId: "3", answer: "توضیح" },
    ], questions)).toEqual({ 1: 11, 2: [21, 22], 3: "توضیح" });
  });

  it("normalizes questions at the call-room API boundary", () => {
    expect(normalizeBaleCallRoom({ form: { id: 9, questions: [{ id: 1, question: "متن", type: 0 }] } }).form.questions[0]).toMatchObject({ id: 1, text: "متن", type: 0 });
  });
});

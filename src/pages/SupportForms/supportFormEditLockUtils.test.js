import { supportFormQuestionPayload, supportFormEditableFieldsPayload } from "./supportFormEditLockUtils.js";

test("keeps existing question and option IDs and answers in the update DTO", () => {
  const original = [{
    id: 501, code: "Q1", question: "نتیجه تماس؟", answer: "بله", score: 2,
    required: true, title: "نتیجه", type: 1, multi_choice: false, rtl: true,
    options: [{ id: 701, answer: "بله", is_correct: true }, { id: 702, answer: "خیر", is_correct: false }],
  }];
  expect(supportFormQuestionPayload(original)).toEqual([{
    id: 501, question: "نتیجه تماس؟", answer: "بله", score: 2,
    required: true, title: "نتیجه", type: 1, multi_choice: false, rtl: true,
    options: [{ id: 701, answer: "بله", is_correct: true }, { id: 702, answer: "خیر", is_correct: false }],
  }]);
  expect(original[0].code).toBe("Q1");
});

test("omits questions and schedule when editing a form with calls", () => {
  const convert = jest.fn(() => 1);
  expect(supportFormEditableFieldsPayload({ start_at: new Date(), end_at: new Date() }, [{ question: "متن" }], true, true, convert))
    .toEqual({});
  expect(convert).not.toHaveBeenCalled();
});

test("includes questions and schedule when creating a form or editing before calls", () => {
  const form = { start_at: new Date(), end_at: new Date() };
  const questions = [{ question: "متن", options: [] }];
  const convert = jest.fn(() => 1790000000);
  const expected = { start_at: 1790000000, end_at: 1790000000, questions: supportFormQuestionPayload(questions) };

  expect(supportFormEditableFieldsPayload(form, questions, false, false, convert)).toEqual(expected);
  expect(supportFormEditableFieldsPayload(form, questions, true, false, convert)).toEqual(expected);
});

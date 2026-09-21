import { supportFormQuestionPayload, supportFormSchedulePayload } from "./supportFormEditLockUtils.js";

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

test("keeps exact received schedule values while schedule editing is locked", () => {
  const original = { start_at: 1790000000, end_at: 1790086399 };
  const convert = jest.fn(() => 1);
  expect(supportFormSchedulePayload({ start_at: new Date(), end_at: new Date() }, original, true, convert))
    .toEqual(original);
  expect(convert).not.toHaveBeenCalled();
});

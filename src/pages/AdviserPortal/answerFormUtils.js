const toValidId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

export const isMultiChoiceQuestion = (question = {}) =>
  question.type === 2 || Boolean(question.multiChoice);

export const isTextQuestion = (question = {}) =>
  question.type === 0 || question.type === 3;

export const hasQuestionAnswer = (question, value) => {
  if (isTextQuestion(question)) return typeof value === "string" && value.trim() !== "";
  if (isMultiChoiceQuestion(question)) {
    return Array.isArray(value) && value.some((item) => toValidId(item) !== null);
  }
  return toValidId(value) !== null;
};

export const getUnansweredQuestions = (questions = [], answers = {}) =>
  questions.filter((question) => !hasQuestionAnswer(question, answers[question.id]));

export const buildAnswerPayload = (questions = [], answers = {}) =>
  questions.flatMap((question) => {
    const value = answers[question.id];
    if (!hasQuestionAnswer(question, value)) return [];
    if (isTextQuestion(question)) {
      return [{ questionId: question.id, answer: value.trim() }];
    }
    if (isMultiChoiceQuestion(question)) {
      return [{ questionId: question.id, answerId: value.map(toValidId).filter((id) => id !== null) }];
    }
    return [{ questionId: question.id, answerId: toValidId(value) }];
  });

export const getAnswerSubmitMessage = ({ status, isComplete } = {}) => {
  if (Number(status) === 1 && isComplete === false) return "تماس با تأیید مشاور موفق ثبت شد";
  if (Number(status) === 1) return "تماس موفق ثبت شد";
  if (Number(status) === 2) return "تماس ناقص/ناموفق ثبت شد";
  return "پاسخ‌ها ثبت شد";
};

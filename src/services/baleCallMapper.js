export function normalizeCallQuestion(question = {}) {
  const rawOptions = Array.isArray(question.options) ? question.options : [];
  return {
    id: Number(question.id),
    text: question.question || question.title || "سؤال بدون عنوان",
    title: question.title || null,
    type: Number(question.type),
    required: Boolean(question.required),
    multiChoice: Boolean(question.multiChoice ?? question.multi_choice),
    options: rawOptions.map((option) => {
      const source = option?.answer || option?.label || option?.title || option?.text;
      return {
        id: Number(option?.id),
        label: source || "گزینه بدون عنوان",
        labelMissing: !source,
      };
    }),
  };
}

export function normalizeBaleCallRoom(value = {}) {
  const form = value.form || {};
  return {
    ...value,
    form: {
      ...form,
      questions: (Array.isArray(form.questions) ? form.questions : []).map(normalizeCallQuestion),
    },
  };
}

export function buildCallAnswerPayload(questions = [], answers = {}) {
  return questions.filter((question) => answers[question.id] != null).map((question) => {
    const value = answers[question.id];
    if (question.type === 0) return { questionId: question.id, answer: value };
    if (question.multiChoice) return { questionId: question.id, answerId: (Array.isArray(value) ? value : [value]).map(Number) };
    return { questionId: question.id, answerId: Number(value) };
  });
}

export function normalizeCallDraftAnswers(items = [], questions = []) {
  const questionById = new Map(questions.map((question) => [Number(question.id), question]));
  return Object.fromEntries(items.map((item) => {
    const questionId = Number(item.questionId);
    const question = questionById.get(questionId);
    const value = item.answer ?? item.answerId ?? item.answerIds;
    if (!question || question.type === 0) return [questionId, value];
    if (question.multiChoice) return [questionId, (Array.isArray(value) ? value : [value]).filter((id) => id != null).map(Number)];
    return [questionId, value == null ? value : Number(value)];
  }));
}

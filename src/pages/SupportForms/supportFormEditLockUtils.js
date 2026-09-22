export function supportFormQuestionPayload(questions = []) {
  return questions.map((question) => ({
    ...(question.id != null ? { id: question.id } : {}),
    question: question.question,
    answer: question.answer || null,
    score: Number(question.score) || 0,
    required: !!question.required,
    title: question.title || null,
    type: Number(question.type) || 0,
    multi_choice: !!question.multi_choice,
    rtl: !!question.rtl,
    options: (question.options || []).map((option) => ({
      ...(option.id != null ? { id: option.id } : {}),
      answer: option.answer,
      is_correct: !!option.is_correct,
    })),
  }));
}

export function supportFormEditableFieldsPayload(form, questions, isEdit, hasCalls, toUnixSeconds) {
  if (isEdit && hasCalls) return {};

  return {
    start_at: toUnixSeconds(form.start_at),
    end_at: toUnixSeconds(form.end_at),
    questions: supportFormQuestionPayload(questions),
  };
}

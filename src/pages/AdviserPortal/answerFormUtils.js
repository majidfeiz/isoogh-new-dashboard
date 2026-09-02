const toValidId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

export const getFlowVoipCallId = ({ currentVoipCallId, currentStudentId, targetStudentId, currentFormId, targetFormId }) => {
  const callId = toValidId(currentVoipCallId);
  if (!callId) return null;
  if (toValidId(currentStudentId) !== toValidId(targetStudentId)) return null;
  if (toValidId(currentFormId) !== toValidId(targetFormId)) return null;
  return callId;
};

export const createAnswerCallContext = ({ formId, studentId, voipCallId, student = null, isNewCall = false }) => {
  const normalizedFormId = toValidId(formId);
  const normalizedStudentId = toValidId(studentId);
  const normalizedVoipCallId = toValidId(voipCallId);
  if (!normalizedFormId || !normalizedStudentId || !normalizedVoipCallId) return null;
  return {
    formId: normalizedFormId,
    studentId: normalizedStudentId,
    voipCallId: normalizedVoipCallId,
    student,
    isNewCall: Boolean(isNewCall),
  };
};

const getQuestionOptionIds = (question = {}) =>
  new Set((question.options || []).map((option) => toValidId(option?.id)).filter(Boolean));

const getRawChoiceValues = (row = {}) => {
  const value = row?.answerIds ?? row?.answer_ids ?? row?.answerId ?? row?.answer_id ?? row?.answer;
  return Array.isArray(value) ? value : value == null ? [] : [value];
};

const getChoiceId = (value) =>
  toValidId(typeof value === "object" && value !== null
    ? value.id ?? value.answerId ?? value.answer_id ?? value.value
    : value);

const normalizeChoiceLabel = (value) => String(value ?? "")
  .replace(/\u064a/g, "\u06cc")
  .replace(/\u0643/g, "\u06a9")
  .replace(/[\u06f0-\u06f9]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0))
  .replace(/[\u0660-\u0669]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
  .replace(/\s+/g, " ")
  .trim();

const getChoiceIds = (question = {}, row = {}) => {
  const values = getRawChoiceValues(row);
  const optionIds = getQuestionOptionIds(question);
  const ids = values.map(getChoiceId).filter((id) => id && optionIds.has(id));
  if (ids.length) return ids;

  const optionByLabel = new Map((question.options || []).map((option) => [
    normalizeChoiceLabel(option?.label),
    toValidId(option?.id),
  ]));
  const textValues = [
    ...values.map((value) => typeof value === "object" && value !== null
      ? value.label ?? value.text ?? value.answer ?? value.title
      : value),
    row?.answerText,
    row?.answer_text,
  ].flat().filter((value) => value != null && String(value).trim());

  return [...new Set(textValues.flatMap((value) => {
    const normalized = normalizeChoiceLabel(value);
    const exactId = optionByLabel.get(normalized);
    if (exactId) return [exactId];
    return normalized.split(/[\u060c,|]/).map((part) => optionByLabel.get(normalizeChoiceLabel(part))).filter(Boolean);
  }))];
};

export const getAnswerDisplayText = (question = {}, row = {}) => {
  const explicitText = row?.answerText ?? row?.answer_text;
  if (typeof explicitText === "string" && explicitText.trim()) return explicitText.trim();
  if (isTextQuestion(question)) {
    return typeof row?.answer === "string" && row.answer.trim() ? row.answer.trim() : "—";
  }

  const optionById = new Map((question.options || []).map((option) => [toValidId(option?.id), option]));
  const labels = getRawChoiceValues(row).map((value) => {
    const embeddedLabel = typeof value === "object" && value !== null
      ? value.label ?? value.text ?? value.answer ?? value.title
      : null;
    if (embeddedLabel != null && String(embeddedLabel).trim()) return String(embeddedLabel).trim();
    const option = optionById.get(getChoiceId(value));
    return option?.label == null ? null : String(option.label).trim();
  }).filter(Boolean);
  return labels.length ? labels.join("، ") : "—";
};

export const isMultiChoiceQuestion = (question = {}) =>
  Boolean(question.multiChoice);

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

export const buildAnswerPayload = (questions = [], answers = {}) => {
  const seen = new Set();
  return questions.flatMap((question) => {
    const questionId = toValidId(question.id);
    if (!questionId || seen.has(questionId)) return [];
    seen.add(questionId);
    const value = answers[question.id];
    if (!hasQuestionAnswer(question, value)) return [{ questionId }];
    if (isTextQuestion(question)) {
      return [{ questionId, answer: value.trim() }];
    }
    const optionIds = getQuestionOptionIds(question);
    if (isMultiChoiceQuestion(question)) {
      const selectedIds = [...new Set(value.map(toValidId).filter((id) => id !== null && optionIds.has(id)))];
      return selectedIds.length ? [{ questionId, answerId: selectedIds }] : [{ questionId }];
    }
    const optionId = toValidId(value);
    return optionIds.has(optionId) ? [{ questionId, answerId: optionId }] : [{ questionId }];
  });
};

export const hydrateAnswers = (questions = [], session = null) => {
  const questionById = new Map(questions.map((question) => [toValidId(question.id), question]));
  return (session?.answers || []).reduce((result, row) => {
    const questionId = toValidId(row?.questionId ?? row?.question_id);
    const question = questionById.get(questionId);
    if (!question || Object.prototype.hasOwnProperty.call(result, questionId)) return result;
    if (isTextQuestion(question)) {
      result[questionId] = row?.answerText ?? row?.answer_text ?? row?.answer ?? "";
    } else if (isMultiChoiceQuestion(question)) {
      result[questionId] = getChoiceIds(question, row);
    } else {
      result[questionId] = getChoiceIds(question, row)[0] ?? "";
    }
    return result;
  }, {});
};

export const getSessionForVoipCall = (sessions = [], voipCallId) => {
  const expectedId = toValidId(voipCallId);
  if (!expectedId || !Array.isArray(sessions) || sessions.length === 0) return null;
  const session = sessions.find((item) => toValidId(item?.voipCallId ?? item?.voip_call_id) === expectedId);
  if (!session) throw new Error("پاسخنامه دریافت‌شده متعلق به تماس انتخاب‌شده نیست");
  return session;
};

export const getAnswerRequestError = (error) => {
  const body = error?.response?.data;
  const message = body?.message ?? body?.data?.message ?? body?.errors?.[0]?.message ?? body?.errors?.[0];
  if (error?.response?.status === 404) return "تماس معتبر پیدا نشد";
  if (error?.response?.status === 403) return "این دانش‌آموز در این فرم به شما تخصیص داده نشده است";
  if (Array.isArray(message)) return message.filter(Boolean).join("، ");
  if (typeof message === "string" && message) return message;
  if (error?.response?.status === 400) return "اطلاعات پاسخنامه معتبر نیست";
  if (!error?.response && error?.message === "voipCallId is required") return "تماس معتبر پیدا نشد";
  if (!error?.response && typeof error?.message === "string" && error.message) return error.message;
  return "دریافت یا ذخیره پاسخنامه انجام نشد";
};

export const getAnswerSubmitMessage = ({ status, isComplete } = {}) => {
  if (Number(status) === 1 && isComplete === false) return "تماس با تأیید مشاور موفق ثبت شد";
  if (Number(status) === 1) return "تماس موفق ثبت شد";
  if (Number(status) === 2) return "تماس ناموفق/ناقص ثبت شد";
  return "پاسخ‌ها ثبت شد";
};

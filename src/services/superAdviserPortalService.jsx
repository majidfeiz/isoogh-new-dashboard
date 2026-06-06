import { apiGet } from "../helpers/httpClient.jsx";
import { API_ROUTES, getApiUrl, API_BASE_URL } from "../helpers/apiRoutes.jsx";
import { getAccessToken } from "../helpers/authStorage.jsx";

// ─── Normalizers ─────────────────────────────────────────────────────────────

const normalizeSchool = (item = {}) => ({
  id: item?.id ?? null,
  name: item?.name ?? item?.title ?? "",
  code: item?.code ?? "",
  phone: item?.phone ?? item?.phone_number ?? "",
  logo: item?.logo ?? null,
  status: item?.status ?? 1,
});

const normalizeAdviser = (item = {}) => ({
  id: item?.id ?? null,
  userId: item?.user_id ?? item?.userId ?? null,
  code: item?.code ?? "",
  name: item?.name ?? "",
  phone: item?.phone ?? "",
  ssn: item?.ssn ?? item?.national_code ?? "",
  isSuper: item?.is_super ?? false,
  createdAt: item?.created_at ?? item?.createdAt ?? null,
});

const normalizeSupportForm = (item = {}) => ({
  id: item?.id ?? null,
  title: item?.title ?? "",
  schoolId: item?.school_id ?? item?.schoolId ?? null,
  gradeId: item?.grade_id ?? item?.gradeId ?? null,
  startAt: item?.start_at ?? item?.startAt ?? null,
  endAt: item?.end_at ?? item?.endAt ?? null,
  callDuration: item?.call_duration ?? item?.callDuration ?? 0,
  adviserCount: item?.adviser_count ?? item?.adviserCount ?? 0,
  createdAt: item?.created_at ?? item?.createdAt ?? null,
});

const normalizeStudent = (item = {}) => ({
  id: item?.id ?? null,
  userId: item?.user_id ?? item?.userId ?? null,
  code: item?.code ?? "",
  name: item?.name ?? "",
  phone: item?.phone ?? "",
  ssn: item?.ssn ?? item?.national_code ?? "",
  adviserId: item?.adviser_id ?? item?.adviserId ?? null,
  adviserName: item?.adviser_name ?? item?.adviserName ?? "",
});

const normalizePerformanceItem = (item = {}) => ({
  studentId: item?.student_id ?? item?.studentId ?? null,
  studentCode: item?.student_code ?? item?.studentCode ?? "",
  studentName: item?.student_name ?? item?.studentName ?? "",
  studentSsn: item?.student_ssn ?? item?.studentSsn ?? "",
  studentPhone: item?.student_phone ?? item?.studentPhone ?? "",
  studentUsername: item?.student_username ?? item?.studentUsername ?? "",
  adviserId: item?.adviser_id ?? item?.adviserId ?? null,
  adviserName: item?.adviser_name ?? item?.adviserName ?? "",
  totalCalls: item?.total_calls ?? item?.totalCalls ?? 0,
  successfulCalls: item?.successful_calls ?? item?.successfulCalls ?? 0,
  lastSuccessfulCallAt: item?.last_successful_call_at ?? item?.lastSuccessfulCallAt ?? null,
  registrationInfo: item?.registration_info ?? item?.registrationInfo ?? null,
  callProblems: item?.call_problems ?? item?.callProblems ?? null,
  conversationSummary: item?.conversation_summary ?? item?.conversationSummary ?? null,
  answers: (item?.answers ?? []).map((a) => ({
    questionId: a?.question_id ?? a?.questionId ?? null,
    questionTitle: a?.question_title ?? a?.questionTitle ?? "",
    answer: a?.answer ?? "",
    answerIds: a?.answer_ids ?? a?.answerIds ?? null,
    isAnswered: a?.is_answered ?? a?.isAnswered ?? false,
  })),
});

const normalizeMonitoringAdviser = (item = {}) => ({
  adviserId: item?.adviser_id ?? item?.adviserId ?? null,
  adviserName: item?.adviser_name ?? item?.adviserName ?? "",
  adviserCode: item?.adviser_code ?? item?.adviserCode ?? "",
  isOnlineToday: item?.is_online_today ?? item?.isOnlineToday ?? false,
  totalCallsToday: item?.total_calls_today ?? item?.totalCallsToday ?? 0,
  totalCallsAll: item?.total_calls_all ?? item?.totalCallsAll ?? 0,
  successfulCallsAll: item?.successful_calls_all ?? item?.successfulCallsAll ?? 0,
  unsuccessfulCallsAll: item?.unsuccessful_calls_all ?? item?.unsuccessfulCallsAll ?? 0,
  answeredFormsCount: item?.answered_forms_count ?? item?.answeredFormsCount ?? 0,
  totalCallDurationSeconds: item?.total_call_duration_seconds ?? item?.totalCallDurationSeconds ?? 0,
});

const normalizeSalaryAdviser = (item = {}) => ({
  adviserId: item?.adviser_id ?? item?.adviserId ?? null,
  adviserName: item?.adviser_name ?? item?.adviserName ?? "",
  adviserCode: item?.adviser_code ?? item?.adviserCode ?? "",
  totalCalls: item?.total_calls ?? item?.totalCalls ?? 0,
  successfulCalls: item?.successful_calls ?? item?.successfulCalls ?? 0,
  totalDurationSeconds: item?.total_duration_seconds ?? item?.totalDurationSeconds ?? 0,
  durationFormatted: item?.duration_formatted ?? item?.durationFormatted ?? "00:00:00",
});

const normalizePagination = (meta, page, limit, items) => ({
  page: meta?.page ?? page,
  limit: meta?.limit ?? limit,
  total: meta?.total ?? items.length,
  lastPage: meta?.lastPage ?? (meta?.total ? Math.ceil(meta.total / (meta?.limit || limit)) : 1),
});

// ─── Schools ──────────────────────────────────────────────────────────────────

export async function getSuperAdviserSchools({ page = 1, limit = 15, search = "" } = {}) {
  const url = getApiUrl(API_ROUTES.superAdviserPortal.schools);
  const res = await apiGet(url, { params: { page, limit, search: search || undefined } });
  const payload = res?.data;
  const data = payload?.data || {};
  const items = (data.items || data.data || []).map(normalizeSchool);
  return { items, pagination: normalizePagination(data.meta, page, limit, items) };
}

// ─── Advisers ─────────────────────────────────────────────────────────────────

export async function getSuperAdviserAdvisers({
  page = 1,
  limit = 15,
  search = "",
  schoolId = "",
} = {}) {
  const url = getApiUrl(API_ROUTES.superAdviserPortal.advisers);
  const res = await apiGet(url, {
    params: {
      page,
      limit,
      search: search || undefined,
      schoolId: schoolId || undefined,
    },
  });
  const payload = res?.data;
  const data = payload?.data || {};
  const items = (data.items || data.data || []).map(normalizeAdviser);
  return { items, pagination: normalizePagination(data.meta, page, limit, items) };
}

// ─── Support Forms ────────────────────────────────────────────────────────────

export async function getSuperAdviserSupportForms({
  page = 1,
  limit = 15,
  search = "",
  adviserId = "",
  schoolId = "",
} = {}) {
  const url = getApiUrl(API_ROUTES.superAdviserPortal.supportForms);
  const res = await apiGet(url, {
    params: {
      page,
      limit,
      search: search || undefined,
      adviserId: adviserId || undefined,
      schoolId: schoolId || undefined,
    },
  });
  const payload = res?.data;
  const data = payload?.data || {};
  const items = (data.items || data.data || []).map(normalizeSupportForm);
  return { items, pagination: normalizePagination(data.meta, page, limit, items) };
}

// ─── Students ─────────────────────────────────────────────────────────────────

export async function getSuperAdviserStudents({
  page = 1,
  limit = 15,
  search = "",
  adviserId = "",
} = {}) {
  const url = getApiUrl(API_ROUTES.superAdviserPortal.students);
  const res = await apiGet(url, {
    params: {
      page,
      limit,
      search: search || undefined,
      adviserId: adviserId || undefined,
    },
  });
  const payload = res?.data;
  const data = payload?.data || {};
  const items = (data.items || data.data || []).map(normalizeStudent);
  return { items, pagination: normalizePagination(data.meta, page, limit, items) };
}

// ─── Performance Report ───────────────────────────────────────────────────────

export async function getSuperAdviserPerformanceReport({
  supportFormId,
  page = 1,
  limit = 20,
  adviserId = "",
  search = "",
} = {}) {
  const url = getApiUrl(API_ROUTES.superAdviserPortal.performanceReport);
  const res = await apiGet(url, {
    params: {
      supportFormId,
      page,
      limit,
      adviserId: adviserId || undefined,
      search: search || undefined,
    },
  });
  const payload = res?.data;
  const data = payload?.data || {};
  const items = (data.items || data.data || []).map(normalizePerformanceItem);
  return { items, pagination: normalizePagination(data.meta, page, limit, items) };
}

// ─── Monitoring ───────────────────────────────────────────────────────────────

export async function getSuperAdviserMonitoring({
  date = "",
  schoolId = "",
  supportFormId = "",
} = {}) {
  const url = getApiUrl(API_ROUTES.superAdviserPortal.monitoring);
  const res = await apiGet(url, {
    params: {
      date: date || undefined,
      schoolId: schoolId || undefined,
      supportFormId: supportFormId || undefined,
    },
  });
  const payload = res?.data;
  const data = payload?.data || {};
  return {
    date: data.date ?? "",
    totalAdvisers: data.total_advisers ?? data.totalAdvisers ?? 0,
    onlineAdvisersToday: data.online_advisers_today ?? data.onlineAdvisersToday ?? 0,
    advisers: (data.advisers ?? []).map(normalizeMonitoringAdviser),
  };
}

// ─── Answer Sheet ─────────────────────────────────────────────────────────────

const normalizeAnswerSheetItem = (item = {}) => ({
  studentId: item?.student_id ?? item?.studentId ?? null,
  studentCode: item?.student_code ?? item?.studentCode ?? null,
  studentName: item?.student_name ?? item?.studentName ?? null,
  studentPhone: item?.student_phone ?? item?.studentPhone ?? null,
  studentSsn: item?.student_ssn ?? item?.studentSsn ?? null,
  adviserId: item?.adviser_id ?? item?.adviserId ?? null,
  adviserName: item?.adviser_name ?? item?.adviserName ?? null,
  totalCalls: item?.total_calls ?? item?.totalCalls ?? 0,
  successfulCalls: item?.successful_calls ?? item?.successfulCalls ?? 0,
  lastCallAt: item?.last_call_at ?? item?.lastCallAt ?? null,
  answers: (item?.answers ?? []).map((a) => ({
    questionId: a?.question_id ?? a?.questionId ?? null,
    questionTitle: a?.question_title ?? a?.questionTitle ?? "",
    resolvedAnswer: a?.resolved_answer ?? a?.resolvedAnswer ?? null,
    isAnswered: a?.is_answered ?? a?.isAnswered ?? false,
  })),
});

const normalizeAnswerSheetForm = (form = {}) => ({
  id: form?.id ?? null,
  title: form?.title ?? "",
  startAt: form?.start_at ?? form?.startAt ?? null,
  endAt: form?.end_at ?? form?.endAt ?? null,
});

const normalizeAnswerSheetQuestion = (q = {}) => ({
  id: q?.id ?? null,
  title: q?.title ?? "",
  type: q?.type ?? 0,
  multiChoice: q?.multi_choice ?? q?.multiChoice ?? false,
});

const normalizeStudentSession = (session = {}) => ({
  sessionDate: session?.session_date ?? session?.sessionDate ?? null,
  voipCallId: session?.voip_call_id ?? session?.voipCallId ?? null,
  answers: (session?.answers ?? []).map((a) => ({
    questionId: a?.question_id ?? a?.questionId ?? null,
    questionTitle: a?.question_title ?? a?.questionTitle ?? "",
    resolvedAnswer: a?.resolved_answer ?? a?.resolvedAnswer ?? null,
    isAnswered: a?.is_answered ?? a?.isAnswered ?? false,
  })),
});

export async function getSuperAdviserAnswerSheet({
  formId,
  page = 1,
  limit = 20,
  adviserId = "",
  search = "",
} = {}) {
  const url = getApiUrl(API_ROUTES.superAdviserPortal.answerSheet(formId));
  const res = await apiGet(url, {
    params: {
      page,
      limit,
      adviserId: adviserId || undefined,
      search: search || undefined,
    },
  });
  const payload = res?.data;
  const data = payload?.data || {};
  const items = (data.items || data.data || []).map(normalizeAnswerSheetItem);
  const questions = (data.questions || []).map(normalizeAnswerSheetQuestion);
  return {
    form: normalizeAnswerSheetForm(data.form || {}),
    questions,
    items,
    meta: normalizePagination(data.meta, page, limit, items),
  };
}

export async function exportSuperAdviserAnswerSheet({ formId, adviserId = "", search = "" } = {}) {
  const params = new URLSearchParams();
  if (adviserId) params.set("adviserId", adviserId);
  if (search) params.set("search", search);
  const token = getAccessToken();
  const url = `${API_BASE_URL}${API_ROUTES.superAdviserPortal.answerSheetExport(formId)}${params.toString() ? `?${params}` : ""}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("خطا در دریافت فایل");
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = `answer-sheet-form-${formId}.csv`;
  a.click();
  URL.revokeObjectURL(objectUrl);
}

export async function getSuperAdviserStudentAnswers({ formId, studentId } = {}) {
  const url = getApiUrl(API_ROUTES.superAdviserPortal.answerSheetStudentDetail(formId, studentId));
  const res = await apiGet(url);
  const payload = res?.data;
  const data = payload?.data || {};
  return {
    studentId: data?.student_id ?? data?.studentId ?? null,
    studentName: data?.student_name ?? data?.studentName ?? null,
    formId: data?.form_id ?? data?.formId ?? null,
    formTitle: data?.form_title ?? data?.formTitle ?? "",
    sessions: (data?.sessions ?? []).map(normalizeStudentSession),
  };
}

// ─── Salary ───────────────────────────────────────────────────────────────────

export async function getSuperAdviserSalary({
  year = new Date().getFullYear(),
  month = new Date().getMonth() + 1,
  adviserId = "",
  supportFormId = "",
} = {}) {
  const url = getApiUrl(API_ROUTES.superAdviserPortal.salary);
  const res = await apiGet(url, {
    params: {
      year,
      month,
      adviserId: adviserId || undefined,
      supportFormId: supportFormId || undefined,
    },
  });
  const payload = res?.data;
  const data = payload?.data || {};
  return {
    year: data.year ?? year,
    month: data.month ?? month,
    advisers: (data.advisers ?? []).map(normalizeSalaryAdviser),
    totalDurationSeconds: data.total_duration_seconds ?? data.totalDurationSeconds ?? 0,
    durationFormatted: data.duration_formatted ?? data.durationFormatted ?? "00:00:00",
  };
}

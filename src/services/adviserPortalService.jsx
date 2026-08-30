import { apiGet, apiPost, apiPatch, apiDelete } from "../helpers/httpClient.jsx";
import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx";

// ─── Normalizers ────────────────────────────────────────────────────────────

const normalizeSchool = (item = {}) => ({
  id: item?.id ?? null,
  name: item?.name ?? item?.title ?? "",
  logo: item?.logo ?? null,
  address: item?.address ?? "",
  phone: item?.phone ?? item?.phone_number ?? "",
  type: item?.type ?? "",
  status: item?.status ?? 1,
  code: item?.code ?? "",
});

const normalizeSupportForm = (item = {}) => ({
  id: item?.id ?? null,
  title: item?.title ?? "",
  callDuration: item?.call_duration ?? item?.callDuration ?? 0,
  startAt: item?.start_at ?? item?.startAt ?? null,
  endAt: item?.end_at ?? item?.endAt ?? null,
  headings: item?.headings ?? item?.description ?? "",
  totalStudents: item?.total_students ?? item?.totalStudents ?? 0,
  stats: item?.stats ?? null,
  gradeId: item?.grade_id ?? item?.gradeId ?? item?.grade?.id ?? null,
  grade: item?.grade ?? null,
  questions: (item?.questions ?? []).map(normalizeQuestion),
});

const normalizeQuestion = (q = {}) => ({
  id: q?.id ?? null,
  text: q?.text ?? q?.title ?? q?.question ?? "",
  type: q?.type ?? 0,
  multiChoice: q?.multi_choice ?? q?.multiChoice ?? false,
  required: q?.required ?? q?.is_required ?? false,
  options: (q?.options ?? []).map((o) =>
    typeof o === "string"
      ? { id: o, label: o, isCorrect: false }
      : { id: o?.id ?? o?.value, label: o?.answer ?? o?.label ?? o?.text ?? o?.value ?? "", isCorrect: o?.is_correct ?? o?.isCorrect ?? false }
  ),
  order: q?.order ?? q?.sort_order ?? 0,
});

/**
 * @typedef {Object} AdviserFormStudent
 * @property {number} successfulCallCount
 * @property {number} failedCallCount
 * @property {number} totalCallCount
 * @property {number|null} workShiftId
 * @property {{id: number, name: string}|null} workShift
 */

const normalizeCallCount = (value, fallback = 0) => {
  const count = Number(value);
  return Number.isFinite(count) ? Math.max(0, count) : fallback;
};

/** @returns {AdviserFormStudent & Record<string, *>} */
const normalizeStudent = (item = {}) => ({
  ...(() => {
    const successfulCallCount = normalizeCallCount(
      item?.successfulCallCount ?? item?.successful_call_count
    );
    const totalCallCount = normalizeCallCount(
      item?.totalCallCount ?? item?.total_call_count ?? item?.callCount ?? item?.call_count
    );
    const failedCallCount = normalizeCallCount(
      item?.failedCallCount ?? item?.failed_call_count,
      Math.max(0, totalCallCount - successfulCallCount)
    );
    return { successfulCallCount, failedCallCount, totalCallCount };
  })(),
  id: item?.id ?? null,
  studentId: item?.studentId ?? item?.student_id ?? item?.id ?? null,
  name: item?.name ?? `${item?.first_name ?? ""} ${item?.last_name ?? ""}`.trim(),
  phone: item?.phone ?? item?.phone_number ?? "",
  ssn: item?.ssn ?? item?.national_code ?? item?.code_melli ?? "",
  voipPhone: item?.voip_phone ?? item?.voipPhone ?? "",
  callCount: item?.call_count ?? item?.callCount ?? 0,
  lastCallAt: item?.last_call_at ?? item?.lastCallAt ?? null,
  hasAnswers: item?.has_answers ?? item?.hasAnswers ?? false,
  status: item?.status ?? 0,
  workShiftId: item?.workShiftId ?? item?.work_shift_id ?? null,
  workShift: item?.workShift ?? item?.work_shift ?? null,
  answerSessions: item?.answer_sessions ?? item?.answerSessions ?? [],
  lastVoipCallId: item?.lastVoipCallId ?? item?.last_voip_call_id ?? item?.voipCallId ?? item?.voip_call_id ?? null,
});

const normalizeWorkShift = (item = {}) => ({
  id: item?.id ?? null,
  name: item?.name ?? "",
});

const WORK_SHIFT_CACHE_TTL = 5 * 60 * 1000;
let workShiftCache = null;
let workShiftCacheTime = 0;
let workShiftRequest = null;

const normalizeStudentProfile = (item = {}) => ({
  studentId: item?.studentId ?? item?.student_id ?? null,
  userId: item?.userId ?? item?.user_id ?? null,
  name: item?.name ?? "",
  phone: item?.phone ?? "",
  phone2: item?.phone2 ?? null,
  phone3: item?.phone3 ?? null,
  ssn: item?.ssn ?? item?.national_code ?? "",
  voipPhone: item?.voipPhone ?? item?.voip_phone ?? "",
  code: item?.code ?? "",
  birthday: item?.birthday ?? "",
  shift: item?.shift ?? "",
  province: item?.province ?? "",
  city: item?.city ?? "",
  region: item?.region ?? null,
  instituteType: item?.instituteType ?? null,
  instituteName: item?.instituteName ?? "",
  gpa: item?.gpa ?? "",
  emergencyPhone: item?.emergencyPhone ?? item?.emergency_phone ?? "",
  totalCalls: item?.totalCalls ?? item?.total_calls ?? 0,
  lastCallAt: item?.lastCallAt ?? item?.last_call_at ?? null,
  hasAnswers: item?.hasAnswers ?? item?.has_answers ?? false,
  supportFormId: item?.supportFormId ?? item?.support_form_id ?? null,
  supportFormTitle: item?.supportFormTitle ?? item?.support_form_title ?? "",
  lastVoipCallId: item?.lastVoipCallId ?? item?.last_voip_call_id ?? item?.voipCallId ?? item?.voip_call_id ?? null,
});

const normalizeStudentCallLog = (item = {}) => ({
  id: item?.id ?? null,
  voipCallId: item?.voipCallId ?? item?.voip_call_id ?? item?.id ?? null,
  callGroupId: item?.callGroupId ?? item?.call_group_id ?? "",
  toPhone: item?.toPhone ?? item?.to_phone ?? "",
  disposition: item?.disposition ?? "",
  duration: item?.duration ?? "",
  startTimeUnix: item?.startTimeUnix ?? item?.starttime_unix_normalized ?? item?.starttime_unix ?? item?.start_time_unix ?? null,
  endTimeUnix: item?.endTimeUnix ?? item?.endtime_unix_normalized ?? item?.endtime_unix ?? item?.end_time_unix ?? null,
  startedAtJalali: item?.started_at_jalali ?? item?.call_started_at_jalali ?? item?.call_date_jalali ?? "",
  endedAtJalali: item?.ended_at_jalali ?? item?.call_ended_at_jalali ?? "",
  callDateJalali: item?.call_date_jalali ?? item?.callStartedAtJalali ?? "",
  hasAnswers: item?.hasAnswers ?? item?.has_answers ?? false,
  createdAt: item?.createdAt ?? item?.created_at ?? null,
});

const normalizeCallLog = (item = {}) => ({
  id: item?.id ?? null,
  studentName: item?.student_name ?? item?.studentName ?? item?.student?.name ?? "",
  studentPhone: item?.student_phone ?? item?.studentPhone ?? item?.student?.phone ?? "",
  supportFormTitle: item?.support_form_title ?? item?.supportFormTitle ?? item?.supportForm?.title ?? "",
  supportFormId: item?.support_form_id ?? item?.supportFormId ?? null,
  studentId: item?.student_id ?? item?.studentId ?? null,
  disposition: item?.disposition ?? "",
  duration: item?.duration ?? 0,
  callDate: item?.call_date_jalali ?? item?.call_started_at_jalali ?? item?.started_at_jalali ?? item?.call_date ?? item?.callDate ?? item?.created_at ?? null,
  callDateJalali: item?.call_date_jalali ?? item?.call_started_at_jalali ?? item?.started_at_jalali ?? "",
  hasAnswers: item?.has_answers ?? item?.hasAnswers ?? false,
  voipCallId: item?.voip_call_id ?? item?.voipCallId ?? null,
});

const normalizePagination = (meta, page, limit, items) => ({
  page: meta?.page ?? page,
  limit: meta?.limit ?? limit,
  total: meta?.total ?? items.length,
  lastPage: meta?.lastPage ?? (meta?.total ? Math.ceil(meta.total / (meta?.limit || limit)) : 1),
});

const normalizeIncompleteCall = (item = {}) => ({
  id: item?.id ?? null,
  studentId: item?.studentId ?? item?.student_id ?? item?.student?.id ?? null,
  supportFormId: item?.supportFormId ?? item?.support_form_id ?? item?.supportForm?.id ?? null,
  status: item?.status ?? 2,
  student: {
    id: item?.student?.id ?? item?.studentId ?? item?.student_id ?? null,
    code: item?.student?.code ?? "",
    name: item?.student?.name ?? "",
    phone: item?.student?.phone ?? "",
    ssn: item?.student?.ssn ?? "",
  },
  supportForm: {
    id: item?.supportForm?.id ?? item?.support_form?.id ?? item?.supportFormId ?? item?.support_form_id ?? null,
    title: item?.supportForm?.title ?? item?.support_form?.title ?? "",
  },
  profilePath: item?.profilePath ?? item?.profile_path ?? "",
  createdAt: item?.createdAt ?? item?.created_at ?? null,
  updatedAt: item?.updatedAt ?? item?.updated_at ?? null,
});

// ─── Schools ─────────────────────────────────────────────────────────────────

export async function getAdviserSchools({ page = 1, limit = 15, search = "" } = {}) {
  const url = getApiUrl(API_ROUTES.adviserPortal.schools);
  const res = await apiGet(url, { params: { page, limit, search: search || undefined } });
  const payload = res?.data;
  const data = payload?.data || {};
  const items = (data.items || data.data || []).map(normalizeSchool);
  return { items, pagination: normalizePagination(data.meta, page, limit, items) };
}

export async function getAdviserSchoolDetail(id) {
  const url = getApiUrl(API_ROUTES.adviserPortal.schoolDetail(id));
  const res = await apiGet(url);
  return normalizeSchool(res?.data?.data || res?.data || {});
}

export async function getAdviserSchoolStats(id) {
  const url = getApiUrl(API_ROUTES.adviserPortal.schoolStats(id));
  const res = await apiGet(url);
  return res?.data?.data || res?.data || {};
}

export async function exportAdviserSchools() {
  const url = getApiUrl(API_ROUTES.adviserPortal.schoolsExport);
  const res = await apiGet(url, { responseType: "blob" });
  return res?.data;
}

// ─── Support Forms ────────────────────────────────────────────────────────────

export async function getAdviserSupportForms({
  schoolId,
  page = 1,
  limit = 15,
  search = "",
  sortBy = "created_at",
  sortOrder = "DESC",
  gradeId = "",
} = {}) {
  const url = getApiUrl(API_ROUTES.adviserPortal.schoolSupportForms(schoolId));
  const res = await apiGet(url, {
    params: {
      page,
      limit,
      search: search || undefined,
      sortBy,
      sortOrder,
      gradeId: gradeId === "" || gradeId === null || typeof gradeId === "undefined" ? undefined : gradeId,
    },
  });
  const payload = res?.data;
  const data = payload?.data || {};
  const items = (data.items || data.data || []).map(normalizeSupportForm);
  return { items, pagination: normalizePagination(data.meta, page, limit, items) };
}

export async function getAdviserSupportFormDetail(id) {
  const url = getApiUrl(API_ROUTES.adviserPortal.supportFormDetail(id));
  const res = await apiGet(url);
  return normalizeSupportForm(res?.data?.data || res?.data || {});
}

export async function getAdviserSupportFormStats(id) {
  const url = getApiUrl(API_ROUTES.adviserPortal.supportFormStats(id));
  const res = await apiGet(url);
  return res?.data?.data || res?.data || {};
}

export async function getAdviserIncompleteCalls({
  schoolId,
  page = 1,
  limit = 15,
  search = "",
  sortBy = "id",
  sortOrder = "DESC",
} = {}) {
  const url = getApiUrl(API_ROUTES.adviserPortal.schoolIncompleteCalls(schoolId));
  const res = await apiGet(url, {
    params: { page, limit, search: search || undefined, sortBy, sortOrder },
    silent: true,
  });
  const data = res?.data?.data || {};
  const items = (data.items || data.data || []).map(normalizeIncompleteCall);
  return { items, pagination: normalizePagination(data.meta, page, limit, items) };
}

export async function exportAdviserIncompleteCalls({ schoolId, search = "" }) {
  const url = getApiUrl(API_ROUTES.adviserPortal.schoolIncompleteCallsExport(schoolId));
  return apiGet(url, {
    params: { search: search || undefined },
    responseType: "blob",
  });
}

// ─── Students ─────────────────────────────────────────────────────────────────

export async function getAdviserFormStudents({
  formId,
  page = 1,
  limit = 15,
  search = "",
  status,
  workShiftId,
  sortBy = "id",
  sortOrder = "ASC",
  signal,
} = {}) {
  const url = getApiUrl(API_ROUTES.adviserPortal.supportFormStudents(formId));
  const res = await apiGet(url, {
    params: {
      page,
      limit,
      search: search || undefined,
      status: status === "" || status === undefined ? undefined : Number(status),
      workShiftId: workShiftId === "" || workShiftId === undefined ? undefined : Number(workShiftId),
      sortBy,
      sortOrder,
    },
    signal,
  });
  const payload = res?.data;
  const data = payload?.data || {};
  const items = (data.items || data.data || []).map(normalizeStudent);
  return { items, pagination: normalizePagination(data.meta, page, limit, items) };
}

export async function getAdviserWorkShifts({ force = false } = {}) {
  const cacheIsFresh = workShiftCache && Date.now() - workShiftCacheTime < WORK_SHIFT_CACHE_TTL;
  if (!force && cacheIsFresh) return workShiftCache;
  if (!force && workShiftRequest) return workShiftRequest;

  const url = getApiUrl(API_ROUTES.adviserPortal.workShifts);
  workShiftRequest = apiGet(url)
    .then((res) => {
      const payload = res?.data?.data || res?.data || [];
      workShiftCache = (Array.isArray(payload) ? payload : []).map(normalizeWorkShift);
      workShiftCacheTime = Date.now();
      return workShiftCache;
    })
    .finally(() => {
      workShiftRequest = null;
    });
  return workShiftRequest;
}

export async function updateAdviserStudentWorkShift({ formId, studentId, workShiftId }) {
  const url = getApiUrl(API_ROUTES.adviserPortal.studentWorkShift(formId, studentId));
  const res = await apiPatch(url, { workShiftId }, { silent: true });
  const data = res?.data?.data || res?.data || {};
  return {
    studentId: data?.studentId ?? data?.student_id ?? studentId,
    workShiftId: data?.workShiftId ?? data?.work_shift_id ?? null,
    workShift: data?.workShift ?? data?.work_shift ?? null,
  };
}

// ─── Call ─────────────────────────────────────────────────────────────────────

export async function makeCall({ supportFormId, studentId, priority }) {
  const url = getApiUrl(API_ROUTES.adviserPortal.call);
  const normalizedPriority = priority === "" || priority == null ? null : Number(priority);
  if (normalizedPriority != null && (!Number.isInteger(normalizedPriority) || normalizedPriority < -100 || normalizedPriority > 100)) {
    throw new Error("priority must be an integer between -100 and 100");
  }
  const res = await apiPost(url, {
    supportFormId,
    studentId,
    ...(normalizedPriority != null ? { priority: normalizedPriority } : {}),
  });
  const data = res?.data?.data || res?.data || {};
  return {
    ...data,
    voipCallId: data?.voipCallId ?? data?.voip_call_id ?? data?.call?.voipCallId ?? data?.call?.voip_call_id ?? null,
    callGroupId: data?.callGroupId ?? data?.call_group_id ?? null,
    queueJobId: data?.queueJobId ?? data?.queue_job_id ?? null,
    traceId: data?.traceId ?? data?.trace_id ?? null,
  };
}

export async function submitAnswers({ formId, studentId, answers, voipCallId, callSuccessful }) {
  const normalizedVoipCallId = Number(voipCallId);
  if (!Number.isInteger(normalizedVoipCallId) || normalizedVoipCallId <= 0) {
    throw new Error("voipCallId is required");
  }
  const url = getApiUrl(API_ROUTES.adviserPortal.submitAnswers(formId, studentId));
  const res = await apiPost(url, {
    answers,
    callSuccessful,
    voipCallId: normalizedVoipCallId,
  }, { silent: true });
  return res?.data?.data || res?.data || {};
}

// ─── Call Logs ────────────────────────────────────────────────────────────────

export async function getAdviserCallLogs({
  page = 1,
  limit = 15,
  search = "",
  supportFormId = "",
  startDate = "",
  endDate = "",
  sortBy = "id",
  sortOrder = "DESC",
} = {}) {
  const url = getApiUrl(API_ROUTES.adviserPortal.callLogs);
  const res = await apiGet(url, {
    params: {
      page,
      limit,
      search: search || undefined,
      supportFormId: supportFormId || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      sortBy,
      sortOrder,
    },
  });
  const payload = res?.data;
  const data = payload?.data || {};
  const items = (data.items || data.data || []).map(normalizeCallLog);
  return { items, pagination: normalizePagination(data.meta, page, limit, items) };
}

// ─── Student Profile ──────────────────────────────────────────────────────────

export async function getStudentProfile(formId, studentId) {
  const url = getApiUrl(API_ROUTES.adviserPortal.studentProfile(formId, studentId));
  const res = await apiGet(url);
  return normalizeStudentProfile(res?.data?.data || res?.data || {});
}

export async function getStudentCallLogs({
  formId,
  studentId,
  page = 1,
  limit = 15,
  sortBy = "id",
  sortOrder = "DESC",
} = {}) {
  const url = getApiUrl(API_ROUTES.adviserPortal.studentCallLogs(formId, studentId));
  const res = await apiGet(url, { params: { page, limit, sortBy, sortOrder } });
  const payload = res?.data;
  const data = payload?.data || {};
  const items = (data.items || data.data || []).map(normalizeStudentCallLog);
  return { items, pagination: normalizePagination(data.meta, page, limit, items) };
}

export async function getStudentAnswers(formId, studentId, voipCallId) {
  const url = getApiUrl(API_ROUTES.adviserPortal.studentAnswers(formId, studentId));
  const normalizedVoipCallId = voipCallId == null ? null : Number(voipCallId);
  const res = normalizedVoipCallId
    ? await apiGet(url, { params: { voipCallId: normalizedVoipCallId }, silent: true })
    : await apiGet(url);
  const sessions = res?.data?.data || res?.data || [];
  if (!Array.isArray(sessions)) return [];
  const unique = new Map();
  sessions.forEach((session) => {
    const callId = Number(session?.voipCallId ?? session?.voip_call_id);
    if (!Number.isInteger(callId) || callId <= 0 || unique.has(callId)) return;
    unique.set(callId, { ...session, voipCallId: callId });
  });
  return [...unique.values()];
}

// ─── Contacts (Phone Book) ────────────────────────────────────────────────────

export async function getContactSubjects() {
  const url = getApiUrl(API_ROUTES.adviserPortal.contactSubjects);
  const res = await apiGet(url);
  return res?.data?.data || res?.data || [];
}

export async function getStudentContacts(formId, studentId) {
  const url = getApiUrl(API_ROUTES.adviserPortal.studentContacts(formId, studentId));
  const res = await apiGet(url);
  return res?.data?.data || res?.data || [];
}

export async function addStudentContact(formId, studentId, { phoneNumber, subjectId, setAsDefault }) {
  const url = getApiUrl(API_ROUTES.adviserPortal.studentContacts(formId, studentId));
  const res = await apiPost(url, { phoneNumber, subjectId, setAsDefault });
  return res?.data?.data || res?.data || {};
}

export async function setDefaultContact(formId, studentId, contactId) {
  const url = getApiUrl(API_ROUTES.adviserPortal.studentContactSetDefault(formId, studentId, contactId));
  const res = await apiPatch(url, {});
  return res?.data || {};
}

export async function deleteStudentContact(formId, studentId, contactId) {
  const url = getApiUrl(API_ROUTES.adviserPortal.studentContactDelete(formId, studentId, contactId));
  const res = await apiDelete(url);
  return res?.data || {};
}

// ─── Statistics ───────────────────────────────────────────────────────────────

export async function getAdviserStats({ year, month, signal } = {}) {
  const url = getApiUrl(API_ROUTES.adviserPortal.stats);
  const res = await apiGet(url, {
    params: {
      year: year === "" || year === null || typeof year === "undefined" ? undefined : year,
      month: month === "" || month === null || typeof month === "undefined" ? undefined : month,
    },
    signal,
  });
  return res?.data?.data || res?.data || {};
}

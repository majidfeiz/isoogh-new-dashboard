import { apiGet } from "../helpers/httpClient.jsx";
import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx";

const unwrap = (response) => response?.data?.data ?? response?.data ?? {};

export const ANSWER_SHEET_QUERY_KEY = "answer-sheets";

export async function getAnswerSheets({
  page = 1,
  limit = 10,
  schoolId = "",
  supportFormId = "",
  studentSearch = "",
  adviserSearch = "",
  dateFrom = "",
  dateTo = "",
  signal,
} = {}) {
  const response = await apiGet(getApiUrl(API_ROUTES.answerSheets.list), {
    signal,
    params: {
      page,
      limit,
      school_id: schoolId || undefined,
      support_form_id: supportFormId || undefined,
      student_search: studentSearch || undefined,
      adviser_search: adviserSearch || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    },
  });
  const data = unwrap(response);
  const items = Array.isArray(data?.items) ? data.items : Array.isArray(data?.data) ? data.data : [];
  const meta = data?.meta || data?.pagination || {};
  return {
    items,
    pagination: {
      page: meta.page ?? page,
      limit: meta.limit ?? limit,
      total: meta.total ?? items.length,
      lastPage: meta.lastPage ?? meta.last_page ?? Math.max(1, Math.ceil((meta.total || 0) / (meta.limit || limit))),
    },
  };
}

export async function getAnswerSheet(sessionId, { signal } = {}) {
  const response = await apiGet(getApiUrl(API_ROUTES.answerSheets.detail(sessionId)), { signal });
  const data = unwrap(response);
  return {
    session: data?.session || {},
    answers: Array.isArray(data?.answers) ? data.answers : [],
  };
}

export async function getAnswerSheetCall(sessionId, { signal } = {}) {
  const response = await apiGet(getApiUrl(API_ROUTES.answerSheets.call(sessionId)), { signal });
  const data = unwrap(response);
  const raw = data?.call || data;
  if (!raw || !Object.keys(raw).length) return null;
  const voipCall = raw.voipCall || {};
  const history = raw.history || raw.cdr || {};
  const unixDate = (value) => {
    const seconds = Number(value);
    return Number.isFinite(seconds) && seconds > 0 ? new Date(seconds * 1000).toISOString() : null;
  };
  return {
    ...raw,
    source: raw.source || voipCall.from_phone || history.src || null,
    destination: raw.destination || voipCall.to_phone || history.dst || null,
    disposition: raw.disposition || history.disposition || null,
    startedAt: raw.startedAt || unixDate(history.starttime_unix),
    endedAt: raw.endedAt || unixDate(history.endtime_unix),
    duration: raw.duration ?? history.duration ?? null,
    waitTime: raw.waitTime ?? history.wait ?? null,
    playtime: raw.playtime ?? history.playtime_seconds ?? history.playtime_string ?? null,
    files: Array.isArray(raw.files) ? raw.files : Array.isArray(history.files) ? history.files : [],
  };
}

export async function exportAnswerSheets(kind, filters = {}) {
  const route = kind === "answers" ? API_ROUTES.answerSheets.exportAnswers : API_ROUTES.answerSheets.exportTable;
  const response = await apiGet(getApiUrl(route), {
    responseType: "blob",
    params: {
      school_id: filters.schoolId || undefined,
      support_form_id: filters.supportFormId || undefined,
      student_search: filters.studentSearch || undefined,
      adviser_search: filters.adviserSearch || undefined,
      date_from: filters.dateFrom || undefined,
      date_to: filters.dateTo || undefined,
    },
  });
  return { blob: response.data, contentDisposition: response.headers?.["content-disposition"] || "" };
}

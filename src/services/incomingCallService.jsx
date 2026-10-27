import { apiGet, apiPost, apiPatch } from "../helpers/httpClient.jsx";
import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx";

const options = { silent: true };
const unwrap = (response) => response?.data?.data ?? response?.data;
const INCOMING_CALL_DESTINATIONS = ["consultant", "supporter", "voice"];
export const INCOMING_CALL_STATUSES = ["routing", "answered", "missed", "voice", "ended"];
export const INCOMING_CALL_SORT_FIELDS = ["startedAt", "endedAt", "durationSeconds", "status"];
export const normalizeIncomingCallPriorities = (priorities) => [
  ...new Set([
    ...(Array.isArray(priorities) ? priorities : []),
    ...INCOMING_CALL_DESTINATIONS,
  ].filter((item) => INCOMING_CALL_DESTINATIONS.includes(item))),
].slice(0, INCOMING_CALL_DESTINATIONS.length);
const schoolIdOf = (schoolId) => {
  const value = Number(schoolId);
  if (!Number.isInteger(value) || value <= 0) throw new Error("انتخاب مجموعه الزامی است");
  return value;
};
const pageResult = (response, page, limit) => {
  const payload = unwrap(response) || {};
  const items = Array.isArray(payload) ? payload : payload.items || payload.data || [];
  const meta = payload.meta || payload.pagination || {};
  return {
    items,
    pagination: {
      page: Number(meta.page ?? page), limit: Number(meta.limit ?? limit),
      total: Number(meta.total ?? items.length),
      lastPage: Number(meta.lastPage ?? Math.max(1, Math.ceil(Number(meta.total || items.length) / Number(meta.limit || limit)))),
    },
  };
};

export const normalizeIncomingCall = (item = {}) => ({
  ...item,
  callerNumber: item.callerNumber ?? item.caller ?? item.from ?? item.src ?? "",
  destination: item.destination ?? item.to ?? item.dst ?? "",
  destinationType: item.destinationType ?? item.destination_type ?? "",
  durationSeconds: item.durationSeconds ?? item.duration_seconds ?? item.duration,
  startedAt: item.startedAt ?? item.started_at ?? item.createdAt ?? item.created_at,
  answeredAt: item.answeredAt ?? item.answered_at,
  endedAt: item.endedAt ?? item.ended_at,
  supporterId: item.supporterId ?? item.supporter_id,
  uniqueId: item.uniqueId ?? item.unique_id ?? item.cuid ?? item.routing_key,
  appName: item.appName ?? item.app_name ?? "",
  student: item.student || null,
  adviser: item.adviser || null,
  supporter: item.supporter || null,
  supportForm: item.supportForm ?? item.support_form ?? null,
  audioFiles: Array.isArray(item.audioFiles ?? item.audio_files) ? (item.audioFiles ?? item.audio_files) : [],
});

const cleanText = (value) => typeof value === "string" ? value.trim() : value;
const dateBoundary = (date, nextDay = false) => {
  if (!date) return undefined;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(date));
  if (!match) return undefined;
  const value = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]) + (nextDay ? 1 : 0));
  return Number.isNaN(value.getTime()) ? undefined : value.toISOString();
};

export const buildIncomingCallParams = (params = {}, includePagination = true) => {
  const status = INCOMING_CALL_STATUSES.includes(params.status) ? params.status : undefined;
  const sortBy = INCOMING_CALL_SORT_FIELDS.includes(params.sortBy) ? params.sortBy : "startedAt";
  const sortOrder = params.sortOrder === "ASC" ? "ASC" : "DESC";
  const hasRange = Boolean(params.from && params.to);
  return {
    schoolId: schoolIdOf(params.schoolId),
    ...(includePagination ? { page: Number(params.page) || 1, limit: Number(params.limit) || 20 } : {}),
    search: cleanText(params.search) || undefined,
    status,
    ssn: cleanText(params.ssn) || undefined,
    username: cleanText(params.username) || undefined,
    formId: params.formId ? Number(params.formId) : undefined,
    from: hasRange ? dateBoundary(params.from) : undefined,
    to: hasRange ? dateBoundary(params.to, true) : undefined,
    sortBy,
    sortOrder,
  };
};

export const getIncomingCallSettings = async (schoolId) => unwrap(await apiGet(getApiUrl(API_ROUTES.incomingCalls.settings), { params: { schoolId: schoolIdOf(schoolId) }, ...options }));
export const getIncomingCallerProfile = async (callId, schoolId) => unwrap(await apiGet(getApiUrl(API_ROUTES.incomingCalls.callerProfile(callId)), { params: { schoolId: schoolIdOf(schoolId) }, ...options }));
export const updateIncomingCallSettings = async (schoolId, settings) => {
  const voiceDestination = settings?.voiceDestination?.trim();
  const payload = {
    schoolId: schoolIdOf(schoolId),
    priorities: normalizeIncomingCallPriorities(settings?.priorities),
    ...(voiceDestination ? { voiceDestination } : {}),
  };
  return unwrap(await apiPatch(getApiUrl(API_ROUTES.incomingCalls.settings), payload, options));
};
export const getIncomingSupporters = async (schoolId) => unwrap(await apiGet(getApiUrl(API_ROUTES.incomingCalls.supporters), { params: { schoolId: schoolIdOf(schoolId) }, ...options }));
export const createIncomingSupporter = async (schoolId, supporter) => unwrap(await apiPost(getApiUrl(API_ROUTES.incomingCalls.supporters), { ...supporter, schoolId: schoolIdOf(schoolId) }, options));
export const updateIncomingSupporter = async (id, schoolId, supporter) => unwrap(await apiPatch(getApiUrl(API_ROUTES.incomingCalls.supporter(id)), { ...supporter, schoolId: schoolIdOf(schoolId) }, options));
export const getIncomingAvailability = async (schoolId, signal) => {
  const data = unwrap(await apiGet(getApiUrl(API_ROUTES.incomingCalls.availability), {
    params: { schoolId: schoolIdOf(schoolId) },
    signal,
    ...options,
  }));
  return {
    actorType: data?.actorType ?? data?.actor_type ?? "",
    schoolId: Number(data?.schoolId ?? data?.school_id ?? schoolIdOf(schoolId)),
    isAvailable: data?.isAvailable === true || Number(data?.is_available) === 1,
  };
};
export const setIncomingAvailability = async (schoolId, isAvailable, config = options) => {
  const normalizedSchoolId = schoolIdOf(schoolId);
  const data = unwrap(await apiPatch(getApiUrl(API_ROUTES.incomingCalls.availability), {
    schoolId: normalizedSchoolId,
    isAvailable: Boolean(isAvailable),
  }, config));
  return {
    actorType: data?.actorType ?? data?.actor_type ?? "",
    schoolId: Number(data?.schoolId ?? data?.school_id ?? normalizedSchoolId),
    isAvailable: data?.isAvailable === true || Number(data?.is_available) === 1,
  };
};
export const getIncomingCalls = async (params = {}) => {
  const requestParams = buildIncomingCallParams(params);
  const result = pageResult(await apiGet(getApiUrl(API_ROUTES.incomingCalls.list), { params: requestParams, signal: params.signal, ...options }), requestParams.page, requestParams.limit);
  return { ...result, items: result.items.map(normalizeIncomingCall) };
};
const downloadFilename = (header, fallback) => {
  const encoded = String(header || "").match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  const plain = String(header || "").match(/filename="?([^";]+)"?/i)?.[1];
  try { return decodeURIComponent(encoded || plain || fallback); } catch (_) { return fallback; }
};
export const exportIncomingCalls = async (format, params = {}) => {
  const route = format === "xlsx" ? API_ROUTES.incomingCalls.exportXlsx : API_ROUTES.incomingCalls.exportCsv;
  const response = await apiGet(getApiUrl(route), {
    params: buildIncomingCallParams(params, false), responseType: "blob", timeout: 60000, ...options,
  });
  return {
    blob: response.data,
    filename: downloadFilename(response.headers?.["content-disposition"], `incoming-calls.${format === "xlsx" ? "xlsx" : "csv"}`),
  };
};
export const saveIncomingCallsExport = ({ blob, filename }, documentRef = document, urlApi = window.URL) => {
  const url = urlApi.createObjectURL(blob); const link = documentRef.createElement("a");
  link.href = url; link.download = filename; documentRef.body.appendChild(link); link.click(); link.remove(); urlApi.revokeObjectURL(url);
};
export const saveIncomingCallResult = async (id, { schoolId, result, note }) => unwrap(await apiPatch(getApiUrl(API_ROUTES.incomingCalls.result(id)), { schoolId: schoolIdOf(schoolId), result: result.trim(), note: note?.trim() || undefined }, options));
export const getIncomingStudents = async ({ schoolId, search = "", page = 1, limit = 15 }) => pageResult(await apiGet(getApiUrl(API_ROUTES.incomingCalls.students), { params: { schoolId: schoolIdOf(schoolId), search: search.trim() || undefined, page, limit }, ...options }), page, limit);
export const getIncomingStudentProfile = async (id, schoolId) => unwrap(await apiGet(getApiUrl(API_ROUTES.incomingCalls.studentProfile(id)), { params: { schoolId: schoolIdOf(schoolId) }, ...options }));
export const getIncomingStudentTimeline = async (id, schoolId) => unwrap(await apiGet(getApiUrl(API_ROUTES.incomingCalls.studentTimeline(id)), { params: { schoolId: schoolIdOf(schoolId) }, ...options }));

export const incomingCallErrorMessage = (error, conflictMessage) => {
  if (error?.response?.status === 403) return "به اطلاعات خارج از مجموعه انتخاب‌شده دسترسی ندارید.";
  if (error?.response?.status === 409 && conflictMessage) return conflictMessage;
  const data = error?.response?.data;
  const message = data?.message ?? data?.error;
  return Array.isArray(message) ? message.join("، ") : message || error?.message || "انجام درخواست ناموفق بود.";
};

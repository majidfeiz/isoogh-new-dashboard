import { apiGet, apiPost, apiPatch } from "../helpers/httpClient.jsx";
import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx";

const options = { silent: true };
const unwrap = (response) => response?.data?.data ?? response?.data;
const INCOMING_CALL_DESTINATIONS = ["consultant", "supporter", "voice"];
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
});

export const getIncomingCallSettings = async (schoolId) => unwrap(await apiGet(getApiUrl(API_ROUTES.incomingCalls.settings), { params: { schoolId: schoolIdOf(schoolId) }, ...options }));
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
export const setIncomingAvailability = async (schoolId, isAvailable, config = options) => unwrap(await apiPatch(getApiUrl(API_ROUTES.incomingCalls.availability), { schoolId: schoolIdOf(schoolId), isAvailable: Boolean(isAvailable) }, config));
export const getIncomingCalls = async ({ schoolId, page = 1, limit = 15, status = "", search = "" }) => {
  const result = pageResult(await apiGet(getApiUrl(API_ROUTES.incomingCalls.list), { params: { schoolId: schoolIdOf(schoolId), page, limit, status: status || undefined, search: search.trim() || undefined }, ...options }), page, limit);
  return { ...result, items: result.items.map(normalizeIncomingCall) };
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

import { apiGet, apiPost, apiPatch } from "../helpers/httpClient.jsx";
import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx";

const options = { silent: true };
const unwrap = (response) => response?.data?.data ?? response?.data;
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

export const getIncomingCallSettings = async (schoolId) => unwrap(await apiGet(getApiUrl(API_ROUTES.incomingCalls.settings), { params: { schoolId: schoolIdOf(schoolId) }, ...options }));
export const updateIncomingCallSettings = async (schoolId, settings) => unwrap(await apiPatch(getApiUrl(API_ROUTES.incomingCalls.settings), { ...settings, schoolId: schoolIdOf(schoolId) }, options));
export const getIncomingSupporters = async (schoolId) => unwrap(await apiGet(getApiUrl(API_ROUTES.incomingCalls.supporters), { params: { schoolId: schoolIdOf(schoolId) }, ...options }));
export const createIncomingSupporter = async (schoolId, supporter) => unwrap(await apiPost(getApiUrl(API_ROUTES.incomingCalls.supporters), { ...supporter, schoolId: schoolIdOf(schoolId) }, options));
export const updateIncomingSupporter = async (id, schoolId, supporter) => unwrap(await apiPatch(getApiUrl(API_ROUTES.incomingCalls.supporter(id)), { ...supporter, schoolId: schoolIdOf(schoolId) }, options));
export const setIncomingAvailability = async (schoolId, isAvailable, config = options) => unwrap(await apiPatch(getApiUrl(API_ROUTES.incomingCalls.availability), { schoolId: schoolIdOf(schoolId), isAvailable: Boolean(isAvailable) }, config));
export const getIncomingCalls = async ({ schoolId, page = 1, limit = 15, status = "", search = "" }) => pageResult(await apiGet(getApiUrl(API_ROUTES.incomingCalls.list), { params: { schoolId: schoolIdOf(schoolId), page, limit, status: status || undefined, search: search.trim() || undefined }, ...options }), page, limit);
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

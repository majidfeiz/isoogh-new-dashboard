import axios from "axios";
import { apiDelete, apiGet, apiPatch, apiPost } from "../helpers/httpClient.jsx";
import { API_BASE_URL, API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx";
import { mapBaleSchoolSettingsPayload } from "./baleSettingsMapper.js";
import { mapBaleGlobalSettingsPayload } from "./baleGlobalSettingsMapper.js";
export { mapBaleSchoolSettingsPayload } from "./baleSettingsMapper.js";

const compact = (value = {}) => Object.fromEntries(
  Object.entries(value).filter(([, item]) => item !== "" && item != null)
);
const unwrap = (response) => response?.data?.data ?? response?.data ?? {};
const listResult = (response, fallback = {}) => {
  const body = unwrap(response);
  const items = body.items ?? body.data ?? (Array.isArray(body) ? body : []);
  const meta = body.meta ?? body.pagination ?? {};
  const limit = Number(meta.limit ?? fallback.limit ?? 20);
  const total = Number(meta.total ?? items.length);
  return { items, pagination: { page: Number(meta.page ?? fallback.page ?? 1), limit, total, lastPage: Number(meta.lastPage ?? Math.max(1, Math.ceil(total / limit))) } };
};

export const getBaleSchools = async (params = {}) => listResult(
  await apiGet(getApiUrl(API_ROUTES.bale.adminSchools), { params: compact(params) }), params
);
export const getBaleSchoolSettings = async (id) => unwrap(await apiGet(getApiUrl(API_ROUTES.bale.adminSchoolSettings(id))));
export const updateBaleSchoolSettings = async (schoolId, form) => {
  const payload = mapBaleSchoolSettingsPayload(form);

  return unwrap(
    await apiPatch(
      getApiUrl(API_ROUTES.bale.adminSchoolSettings(schoolId)),
      payload
    )
  );
};
export const bulkUpdateBaleSchoolSettings = async (payload) => unwrap(await apiPatch(getApiUrl(API_ROUTES.bale.adminSchoolsBulkSettings), payload));
export const getBaleLogs = async (params = {}, signal) => listResult(await apiGet(getApiUrl(API_ROUTES.bale.adminLogs), { params: compact(params), signal }), params);
export const getBaleLogStats = async (params = {}, signal) => unwrap(await apiGet(getApiUrl(API_ROUTES.bale.adminLogStats), { params: compact(params), signal }));
export const getBaleLogUsers = async (params = {}, signal) => unwrap(await apiGet(getApiUrl(API_ROUTES.bale.adminLogUsers), { params: compact(params), signal, silent: true }));
export const getBaleConnections = async (params = {}) => listResult(await apiGet(getApiUrl(API_ROUTES.bale.adminConnections), { params: compact(params) }), params);
export const revokeBaleConnection = async (id) => unwrap(await apiDelete(getApiUrl(API_ROUTES.bale.adminConnection(id))));
export const getBaleHealth = async () => unwrap(await apiGet(getApiUrl(API_ROUTES.bale.adminHealth)));
export const getBaleGlobalSettings = async () => unwrap(await apiGet(getApiUrl(API_ROUTES.bale.adminSettings)));
export const updateBaleGlobalSettings = async (form) => unwrap(await apiPatch(getApiUrl(API_ROUTES.bale.adminSettings), mapBaleGlobalSettingsPayload(form)));
export const getBaleAdminStats = async () => unwrap(await apiGet(getApiUrl(API_ROUTES.bale.adminStats)));
export const getBaleWebhook = async () => unwrap(await apiGet(getApiUrl(API_ROUTES.bale.adminWebhook)));
export const registerBaleWebhook = async () => unwrap(await apiPost(getApiUrl(API_ROUTES.bale.adminWebhook)));
export const deleteBaleWebhook = async () => unwrap(await apiDelete(getApiUrl(API_ROUTES.bale.adminWebhook)));
export const getBaleOutbox = async (params = {}, signal) => listResult(await apiGet(getApiUrl(API_ROUTES.bale.adminOutbox), { params: compact(params), signal }), params);
export const retryBaleOutboxMessage = async (id) => unwrap(await apiPost(getApiUrl(API_ROUTES.bale.adminOutboxRetry(id))));
export const cancelBaleOutboxMessage = async (id) => unwrap(await apiDelete(getApiUrl(API_ROUTES.bale.adminOutboxItem(id))));
export const queueBaleNotification = async (data) => unwrap(await apiPost(getApiUrl(API_ROUTES.bale.adminNotifications), data));
export const createBaleLinkChallenge = async () => unwrap(await apiPost(getApiUrl(API_ROUTES.bale.linkChallenges)));
export const getMyBaleConnection = async () => unwrap(await apiGet(getApiUrl(API_ROUTES.bale.myConnection)));
export const revokeMyBaleConnection = async () => unwrap(await apiDelete(getApiUrl(API_ROUTES.bale.myConnection)));

const MINI_TOKEN_KEY = "isoogh_bale_mini_access_token";
export const getBaleMiniToken = () => sessionStorage.getItem(MINI_TOKEN_KEY);
export const setBaleMiniToken = (token) => token ? sessionStorage.setItem(MINI_TOKEN_KEY, token) : sessionStorage.removeItem(MINI_TOKEN_KEY);
export const clearBaleMiniSession = () => sessionStorage.removeItem(MINI_TOKEN_KEY);

export const baleMiniHttp = axios.create({ baseURL: API_BASE_URL, headers: { "Content-Type": "application/json" } });
baleMiniHttp.interceptors.request.use((config) => {
  const token = getBaleMiniToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
baleMiniHttp.interceptors.response.use((response) => response, (error) => {
  if (error?.response?.status === 401 && typeof window !== "undefined") {
    clearBaleMiniSession();
    window.dispatchEvent(new CustomEvent("isoogh:bale-mini-unauthorized"));
  }
  return Promise.reject(error);
});

export const exchangeBaleSession = async (initData) => unwrap(await baleMiniHttp.post(API_ROUTES.bale.exchange, { initData }));
export const getBaleBootstrap = async (params) => unwrap(await baleMiniHttp.get(API_ROUTES.bale.bootstrap, { params: compact(params) }));
export const startBaleCall = async (data, key) => unwrap(await baleMiniHttp.post(API_ROUTES.bale.adviserCalls, data, { headers: { "Idempotency-Key": key } }));
export const getBaleCallStatus = async (id, signal) => unwrap(await baleMiniHttp.get(API_ROUTES.bale.adviserCallStatus(id), { signal }));
export const getBaleCallDraft = async (id) => unwrap(await baleMiniHttp.get(API_ROUTES.bale.adviserCallDraft(id)));
export const getBaleCallRoom = async ({ formId, studentId, schoolId }, signal) => unwrap(await baleMiniHttp.get(API_ROUTES.bale.adviserCallRoom(formId, studentId), { params: { schoolId }, signal }));
export const saveBaleCallDraft = async (id, data) => unwrap(await baleMiniHttp.patch(API_ROUTES.bale.adviserCallDraft(id), data));
export const submitBaleCall = async (id, data, key) => unwrap(await baleMiniHttp.post(API_ROUTES.bale.adviserCallSubmit(id), data, { headers: { "Idempotency-Key": key } }));
export const getBalePreferences = async (schoolId) => unwrap(await baleMiniHttp.get(API_ROUTES.bale.preferences, { params: { schoolId } }));
export const updateBalePreferences = async (data) => unwrap(await baleMiniHttp.patch(API_ROUTES.bale.preferences, data));

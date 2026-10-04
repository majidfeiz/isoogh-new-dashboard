// src/services/dashboardService.jsx
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from "../helpers/httpClient.jsx";
import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx";
import { unwrapDashboardPayload } from "../pages/Dashboard/dashboardChartAdapter.js";

const BASE = "/dashboard";

const normalizeDashboardWidgets = (payload) => {
  const raw = payload?.data ?? payload;
  if (Array.isArray(raw)) return raw;
  return Array.isArray(raw?.widgets) ? raw.widgets : [];
};

const normalizePersonalDashboard = (response) => {
  const payload = unwrapDashboardPayload(response, { axiosResponse: true });
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.widgets)) return payload.widgets;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.widgets)) return payload.data.widgets;
  throw new Error("Invalid personal dashboard response");
};

export const getDefaultDashboard = async () => {
  const res = await apiGet(getApiUrl(`${BASE}/default`));
  const raw = res.data?.data ?? res.data;
  return raw ?? { widgets: [], gridCols: 12 };
};

export const getWidgetCatalog = async () => {
  const res = await apiGet(getApiUrl(`${BASE}/widgets`));
  const raw = res.data?.data ?? res.data;
  return Array.isArray(raw) ? raw : [];
};

export const getMyDashboard = async () => {
  const res = await apiGet(getApiUrl(`${BASE}/my`));
  return normalizePersonalDashboard(res);
};

export const saveDashboardLayout = async (widgets) => {
  const res = await apiPut(getApiUrl(API_ROUTES.dashboard.myLayout), { widgets });
  return normalizeDashboardWidgets(res.data);
};

export const addWidgetToDashboard = async (body) => {
  const res = await apiPost(getApiUrl(`${BASE}/my/widgets`), body);
  return res.data?.data ?? res.data;
};

export const updateDashboardWidget = async (id, body) => {
  const res = await apiPatch(getApiUrl(`${BASE}/my/widgets/${id}`), body);
  return res.data?.data ?? res.data;
};

export const removeDashboardWidget = async (id) => {
  await apiDelete(getApiUrl(`${BASE}/my/widgets/${id}`));
};

export const resetDashboard = async () => {
  await apiPost(getApiUrl(`${BASE}/my/reset`), {});
};

export const getWidgetRoles = async (widgetId) => {
  const res = await apiGet(getApiUrl(`${BASE}/widgets/${widgetId}/roles`));
  return res.data?.data ?? res.data;
};

export const updateWidgetRoles = async (widgetId, roleIds) => {
  const res = await apiPut(getApiUrl(`${BASE}/widgets/${widgetId}/roles`), { roleIds });
  return res.data?.data ?? res.data;
};

export const removeWidgetRole = async (widgetId, roleId) => {
  const res = await apiDelete(getApiUrl(`${BASE}/widgets/${widgetId}/roles/${roleId}`));
  return res.data?.data ?? res.data;
};

export const getAdminWidgets = async () => {
  const res = await apiGet(getApiUrl(`${BASE}/admin/widgets`));
  const raw = res.data?.data ?? res.data;
  return Array.isArray(raw) ? raw : [];
};

export const toggleWidgetStatus = async (widgetId, isActive) => {
  const res = await apiPatch(getApiUrl(`${BASE}/widgets/${widgetId}/status`), { isActive });
  return res.data?.data ?? res.data;
};

export const getDashboardStats = async ({ from, to } = {}) => {
  const params = new URLSearchParams();
  if (from && to) {
    params.set("from", from);
    params.set("to", to);
  }
  const res = await apiGet(getApiUrl(`${BASE}/stats`), { params });
  return unwrapDashboardPayload(res, { axiosResponse: true });
};

export const getDashboardChart = async (type, { from, to } = {}, config = {}) => {
  const params = new URLSearchParams();
  if (from && to) {
    params.set("from", from);
    params.set("to", to);
  }
  const res = await apiGet(getApiUrl(`${BASE}/chart/${type}`), { ...config, params });
  return unwrapDashboardPayload(res, { axiosResponse: true });
};

export const getDashboardRecent = async (type, limit = 5, { from, to } = {}) => {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  if (from && to) {
    params.set("from", from);
    params.set("to", to);
  }
  const res = await apiGet(getApiUrl(`${BASE}/recent/${type}`), { params });
  return unwrapDashboardPayload(res, { axiosResponse: true });
};

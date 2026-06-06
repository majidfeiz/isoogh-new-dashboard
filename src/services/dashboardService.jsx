// src/services/dashboardService.jsx
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from "../helpers/httpClient.jsx";
import { getApiUrl } from "../helpers/apiRoutes.jsx";

const BASE = "/dashboard";

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
  const raw = res.data?.data ?? res.data;
  return Array.isArray(raw) ? raw : [];
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

export const getDashboardStats = async () => {
  const res = await apiGet(getApiUrl(`${BASE}/stats`));
  return res.data?.data ?? res.data;
};

export const getDashboardChart = async (type) => {
  const res = await apiGet(getApiUrl(`${BASE}/chart/${type}`));
  return res.data?.data ?? res.data;
};

export const getDashboardRecent = async (type, limit = 5) => {
  const res = await apiGet(getApiUrl(`${BASE}/recent/${type}`), { params: { limit } });
  return res.data?.data ?? res.data;
};

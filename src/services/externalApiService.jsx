import { apiDelete, apiGet, apiPatch, apiPost } from "../helpers/httpClient.jsx";
import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx";

const normalizeIp = (ip = {}) => ({
  id: ip?.id ?? null,
  ip: ip?.ip ?? "",
  created_at: ip?.created_at ?? null,
});

const normalizeClient = (item = {}) => ({
  id: item?.id ?? null,
  name: item?.name ?? "",
  description: item?.description ?? "",
  api_key: item?.api_key ?? "",
  is_active: item?.is_active ?? true,
  school_id: item?.school_id ?? null,
  ips: Array.isArray(item?.ips) ? item.ips.map(normalizeIp) : [],
  created_at: item?.created_at ?? null,
  updated_at: item?.updated_at ?? null,
});

const normalizeLog = (item = {}) => ({
  id: item?.id ?? null,
  client_id: item?.client_id ?? null,
  ip: item?.ip ?? "",
  method: item?.method ?? "",
  path: item?.path ?? "",
  query_params: item?.query_params ?? {},
  response_status: item?.response_status ?? null,
  response_time_ms: item?.response_time_ms ?? null,
  created_at: item?.created_at ?? null,
});

export async function getExternalApiClients() {
  const url = getApiUrl(API_ROUTES.externalApiClients.list);
  const res = await apiGet(url);
  // پاسخ: { "data": [...] }
  const arr = res?.data?.data ?? res?.data ?? [];
  return Array.isArray(arr) ? arr.map(normalizeClient) : [];
}

export async function getExternalApiClient(id) {
  const url = getApiUrl(API_ROUTES.externalApiClients.detail(id));
  const res = await apiGet(url);
  const data = res?.data?.data ?? res?.data ?? {};
  return normalizeClient(data);
}

export async function createExternalApiClient(payload) {
  const url = getApiUrl(API_ROUTES.externalApiClients.create);
  const res = await apiPost(url, payload);
  return normalizeClient(res?.data?.data ?? res?.data ?? {});
}

export async function updateExternalApiClient(id, payload) {
  const url = getApiUrl(API_ROUTES.externalApiClients.update(id));
  const res = await apiPatch(url, payload);
  return normalizeClient(res?.data?.data ?? res?.data ?? {});
}

export async function deleteExternalApiClient(id) {
  const url = getApiUrl(API_ROUTES.externalApiClients.delete(id));
  const res = await apiDelete(url);
  return res?.data;
}

export async function regenerateApiKey(id) {
  const url = getApiUrl(API_ROUTES.externalApiClients.regenerateKey(id));
  const res = await apiPost(url);
  // پاسخ: { "api_key": "newkey....(64 chars)" }
  const data = res?.data?.data ?? res?.data ?? {};
  return typeof data === "string" ? data : (data?.api_key ?? "");
}

export async function addClientIp(clientId, ip) {
  const url = getApiUrl(API_ROUTES.externalApiClients.addIp(clientId));
  const res = await apiPost(url, { ip });
  return res?.data;
}

export async function deleteClientIp(clientId, ipId) {
  const url = getApiUrl(API_ROUTES.externalApiClients.deleteIp(clientId, ipId));
  const res = await apiDelete(url);
  return res?.data;
}

export async function getExternalApiLogs({ page = 1, per_page = 30, client_id } = {}) {
  const url = getApiUrl(API_ROUTES.externalApiClients.logs);
  const res = await apiGet(url, {
    params: {
      page,
      per_page,
      client_id: client_id || undefined,
    },
  });
  const payload = res?.data?.data ?? res?.data ?? {};
  const items = (payload?.data || []).map(normalizeLog);
  const meta = payload?.meta || {};
  return {
    items,
    pagination: {
      page: meta.page ?? page,
      per_page: meta.per_page ?? per_page,
      total: meta.total ?? items.length,
      lastPage: meta.last_page ?? 1,
    },
  };
}

import { apiDelete, apiGet, apiPatch, apiPost } from "../helpers/httpClient.jsx";
import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx";

const normalizeWebhook = (item = {}) => ({
  id: item?.id ?? null,
  name: item?.name ?? "",
  src: item?.src ?? "",
  webhook_url: item?.webhook_url ?? "",
  secret: item?.secret ?? "",
  is_active: item?.is_active ?? true,
  created_at: item?.created_at ?? null,
  updated_at: item?.updated_at ?? null,
});

const normalizeWebhookLog = (item = {}) => ({
  id: item?.id ?? null,
  webhook_id: item?.webhook_id ?? null,
  voip_call_history_id: item?.voip_call_history_id ?? null,
  payload: item?.payload ?? {},
  response_status: item?.response_status ?? null,
  response_body: item?.response_body ?? "",
  success: item?.success ?? false,
  sent_at: item?.sent_at ?? null,
});

export async function getVoipWebhooks() {
  const url = getApiUrl(API_ROUTES.voipWebhooks.list);
  const res = await apiGet(url);
  const data = res?.data?.data ?? res?.data ?? [];
  return Array.isArray(data) ? data.map(normalizeWebhook) : [];
}

export async function getVoipWebhook(id) {
  const url = getApiUrl(API_ROUTES.voipWebhooks.detail(id));
  const res = await apiGet(url);
  const data = res?.data?.data ?? res?.data ?? {};
  return normalizeWebhook(data);
}

export async function createVoipWebhook(payload) {
  const url = getApiUrl(API_ROUTES.voipWebhooks.create);
  const res = await apiPost(url, payload);
  return normalizeWebhook(res?.data?.data ?? res?.data ?? {});
}

export async function updateVoipWebhook(id, payload) {
  const url = getApiUrl(API_ROUTES.voipWebhooks.update(id));
  const res = await apiPatch(url, payload);
  return normalizeWebhook(res?.data?.data ?? res?.data ?? {});
}

export async function deleteVoipWebhook(id) {
  const url = getApiUrl(API_ROUTES.voipWebhooks.delete(id));
  const res = await apiDelete(url);
  return res?.data;
}

export async function testVoipWebhook(id) {
  const url = getApiUrl(API_ROUTES.voipWebhooks.test(id));
  const res = await apiPost(url);
  return res?.data;
}

export async function dispatchVoipWebhook(callHistoryId) {
  const url = getApiUrl(API_ROUTES.voipWebhooks.dispatch(callHistoryId));
  const res = await apiPost(url);
  return res?.data;
}

export async function getVoipWebhookLogs({ page = 1, per_page = 30, webhook_id } = {}) {
  const url = getApiUrl(API_ROUTES.voipWebhooks.logs);
  const res = await apiGet(url, {
    params: {
      page,
      per_page,
      webhook_id: webhook_id || undefined,
    },
  });
  const payload = res?.data?.data ?? res?.data ?? {};
  const items = (payload?.data || []).map(normalizeWebhookLog);
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

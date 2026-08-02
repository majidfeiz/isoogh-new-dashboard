import { apiDelete, apiGet, apiPatch, apiPost } from "../helpers/httpClient.jsx";
import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx";

const normalizeWebhook = (item = {}) => ({
  id: item?.id ?? null,
  name: item?.name ?? "",
  event_type: item?.event_type ?? "call_history",
  src: item?.src ?? "",
  school_id: item?.school_id ?? null,
  audit_modules: Array.isArray(item?.audit_modules) ? item.audit_modules : [],
  audit_action_types: Array.isArray(item?.audit_action_types) ? item.audit_action_types : [],
  webhook_url: item?.webhook_url ?? "",
  secret: "",
  is_active: item?.is_active ?? true,
  replay_from: item?.replay_from ?? null,
  max_attempts: item?.max_attempts ?? 3,
  retry_interval_minutes: item?.retry_interval_minutes ?? 10,
  created_at: item?.created_at ?? null,
  updated_at: item?.updated_at ?? null,
});

const normalizeJsonPayload = (value) => {
  if (typeof value !== "string") return value ?? {};

  try {
    const parsed = JSON.parse(value);
    return parsed ?? {};
  } catch {
    return value;
  }
};

const normalizeWebhookLog = (item = {}) => ({
  id: item?.id ?? null,
  webhook_id: item?.webhook_id ?? null,
  voip_call_history_id: item?.voip_call_history_id ?? null,
  audit_log_id: item?.audit_log_id ?? null,
  payload: normalizeJsonPayload(item?.payload),
  attempt_number: item?.attempt_number ?? null,
  next_attempt_at: item?.next_attempt_at ?? null,
  final_failure: item?.final_failure ?? false,
  error_message: item?.error_message ?? "",
  response_status: item?.response_status ?? null,
  response_body: item?.response_body ?? "",
  success: item?.success ?? false,
  sent_at: item?.sent_at ?? null,
});

export async function getVoipWebhooks() {
  const url = getApiUrl(API_ROUTES.voipWebhooks.list);
  const res = await apiGet(url);
  const data = res?.data?.data ?? res?.data ?? [];
  const items = Array.isArray(data) ? data : data?.items || data?.data || [];
  return Array.isArray(items) ? items.map(normalizeWebhook) : [];
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

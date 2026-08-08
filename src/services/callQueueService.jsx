import { apiGet, apiPost } from "../helpers/httpClient.jsx";
import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx";

const unwrap = (response) => response?.data?.data ?? response?.data ?? {};

export async function getCallQueue({ schoolId, status = "", page = 1, limit = 15, signal } = {}) {
  if (!schoolId) throw new Error("schoolId is required");
  const response = await apiGet(getApiUrl(API_ROUTES.voip.callQueue), {
    signal,
    silent: true,
    params: { schoolId, status: status || undefined, page, limit },
  });
  const data = unwrap(response);
  const items = Array.isArray(data.items) ? data.items : Array.isArray(data.data) ? data.data : [];
  const meta = data.meta || data.pagination || {};
  return {
    items,
    pagination: {
      page: meta.page ?? page,
      limit: meta.limit ?? limit,
      total: meta.total ?? items.length,
      lastPage: meta.lastPage ?? Math.max(1, Math.ceil((meta.total || 0) / (meta.limit || limit))),
    },
  };
}

export async function getCallQueueStats({ schoolId, signal } = {}) {
  if (!schoolId) throw new Error("schoolId is required");
  const response = await apiGet(getApiUrl(API_ROUTES.voip.callQueueStats), {
    signal,
    silent: true,
    params: { schoolId },
  });
  return unwrap(response);
}

export async function retryCallQueueJob(id, schoolId) {
  return unwrap(await apiPost(getApiUrl(API_ROUTES.voip.retryCallQueueJob(id)), { schoolId }, { silent: true }));
}

export async function cancelCallQueueJob(id, schoolId) {
  return unwrap(await apiPost(getApiUrl(API_ROUTES.voip.cancelCallQueueJob(id)), { schoolId }, { silent: true }));
}

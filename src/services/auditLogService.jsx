import { apiGet } from "../helpers/httpClient.jsx";
import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx";

const compact = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, value]) => value !== "" && value != null));

export async function getAuditLogs(params = {}) {
  const page = Number(params.page || 1);
  const limit = Number(params.limit || 20);
  const res = await apiGet(getApiUrl(API_ROUTES.auditLogs.list), { params: compact(params) });
  const payload = res?.data?.data ?? res?.data ?? {};
  const items = payload.items ?? [];
  const meta = payload.meta ?? {};
  return {
    items,
    pagination: {
      page: Number(meta.page ?? page),
      limit: Number(meta.limit ?? limit),
      total: Number(meta.total ?? items.length),
      lastPage: Number(meta.lastPage ?? Math.max(1, Math.ceil((meta.total || 0) / limit))),
    },
  };
}

export async function getAuditActors({ search = "", limit = 20 } = {}) {
  const res = await apiGet(getApiUrl(API_ROUTES.auditLogs.actors), {
    params: compact({ search, limit }),
    silent: true,
  });
  const items = res?.data?.data ?? res?.data ?? [];
  return (Array.isArray(items) ? items : []).map((item) => ({
    ...item,
    id: Number(item.id),
    activityCount: Number(item.activityCount || 0),
  }));
}

export async function getAuditStats(params = {}) {
  const res = await apiGet(getApiUrl(API_ROUTES.auditLogs.stats), {
    params: compact(params),
    silent: true,
  });
  return res?.data?.data ?? res?.data ?? {};
}

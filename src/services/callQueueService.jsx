import { apiGet, apiPost } from "../helpers/httpClient.jsx";
import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx";

const unwrap = (response) => response?.data?.data ?? response?.data ?? {};

const buildScopeParams = ({ schoolId, allSchools } = {}) => {
  if (schoolId && allSchools === true) throw new Error("schoolId and allSchools are mutually exclusive");
  if (schoolId) return { schoolId: Number(schoolId) };
  if (allSchools === true) return { allSchools: true };
  return {};
};

const buildReadParams = ({ schoolId, allSchools, from, to, ...values }) => {
  if (Boolean(from) !== Boolean(to)) throw new Error("from and to must be provided together");
  const params = new URLSearchParams();
  Object.entries({ ...buildScopeParams({ schoolId, allSchools }), ...values, ...(from && to ? { from, to } : {}) })
    .forEach(([key, value]) => { if (value !== undefined && value !== null && value !== "") params.set(key, String(value)); });
  return params;
};

export async function getCallQueue({ schoolId, allSchools = false, status = "", page = 1, limit = 20, from, to, signal } = {}) {
  const response = await apiGet(getApiUrl(API_ROUTES.voip.callQueue), {
    signal,
    silent: true,
    params: buildReadParams({ schoolId, allSchools, status, page, limit, from, to }),
  });
  const data = unwrap(response);
  const items = Array.isArray(data.items) ? data.items : Array.isArray(data.data) ? data.data : [];
  const meta = data.meta || data.pagination || {};
  return {
    items,
    scope: data.scope || { mode: schoolId ? "school" : allSchools === true ? "all" : "managed", schoolId: schoolId ? Number(schoolId) : null },
    pagination: {
      page: meta.page ?? page,
      limit: meta.limit ?? limit,
      total: meta.total ?? items.length,
      lastPage: meta.lastPage ?? Math.max(1, Math.ceil((meta.total || 0) / (meta.limit || limit))),
    },
  };
}

export async function getCallQueueStats({ schoolId, allSchools = false, from, to, signal } = {}) {
  const response = await apiGet(getApiUrl(API_ROUTES.voip.callQueueStats), {
    signal,
    silent: true,
    params: buildReadParams({ schoolId, allSchools, from, to }),
  });
  return unwrap(response);
}

export async function retryCallQueueJob(id, schoolId) {
  return unwrap(await apiPost(getApiUrl(API_ROUTES.voip.retryCallQueueJob(id)), { schoolId }, { silent: true }));
}

export async function cancelCallQueueJob(id, schoolId) {
  return unwrap(await apiPost(getApiUrl(API_ROUTES.voip.cancelCallQueueJob(id)), { schoolId }, { silent: true }));
}

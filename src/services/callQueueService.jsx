import { apiGet, apiPost } from "../helpers/httpClient.jsx";
import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx";

const unwrap = (response) => response?.data?.data ?? response?.data ?? {};

const buildScopeParams = ({ schoolId, allSchools } = {}) => {
  if (schoolId && allSchools === true) throw new Error("schoolId and allSchools are mutually exclusive");
  if (schoolId) return { schoolId: Number(schoolId) };
  if (allSchools === true) return { allSchools: true };
  return {};
};

export async function getCallQueue({ schoolId, allSchools = false, status = "", page = 1, limit = 20, signal } = {}) {
  const response = await apiGet(getApiUrl(API_ROUTES.voip.callQueue), {
    signal,
    silent: true,
    params: { ...buildScopeParams({ schoolId, allSchools }), status: status || undefined, page, limit },
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

export async function getCallQueueStats({ schoolId, allSchools = false, signal } = {}) {
  const response = await apiGet(getApiUrl(API_ROUTES.voip.callQueueStats), {
    signal,
    silent: true,
    params: buildScopeParams({ schoolId, allSchools }),
  });
  return unwrap(response);
}

export async function retryCallQueueJob(id, schoolId) {
  return unwrap(await apiPost(getApiUrl(API_ROUTES.voip.retryCallQueueJob(id)), { schoolId }, { silent: true }));
}

export async function cancelCallQueueJob(id, schoolId) {
  return unwrap(await apiPost(getApiUrl(API_ROUTES.voip.cancelCallQueueJob(id)), { schoolId }, { silent: true }));
}

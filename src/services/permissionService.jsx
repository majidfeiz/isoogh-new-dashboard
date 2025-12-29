import { apiGet, apiPost, apiPatch, apiDelete } from "../helpers/httpClient.jsx";
import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx";

// گرفتن لیست پرمیشن‌ها
export async function getPermissions({ page = 1, limit = 10, search = "" } = {}) {
  const url = getApiUrl(API_ROUTES.permissions.list);

  const response = await apiGet(url, {
    params: {
      page,
      limit,
      search: search || undefined,
    },
  });

  const payload = response.data;        
  const data = payload?.data || {};
  const items = data.items || [];
  const pagination = data.pagination || {};

  return {
    items,
    pagination: {
      page: pagination.page ?? page,
      limit: pagination.limit ?? limit,
      total: pagination.total ?? items.length,
      lastPage: pagination.lastPage ?? 1,
    },
  };
}

export async function createPermission(payload) {
  const url = getApiUrl(API_ROUTES.permissions.create);
  const res = await apiPost(url, payload);
  return res.data;
}

export async function getPermission(id) {
  const url = getApiUrl(API_ROUTES.permissions.detail(id));
  const res = await apiGet(url);
  return res.data?.data || res.data;
}

export async function updatePermission(id, payload) {
  const url = getApiUrl(API_ROUTES.permissions.update(id));
  const res = await apiPatch(url, payload);
  return res.data;
}

export async function deletePermission(id) {
  const url = getApiUrl(API_ROUTES.permissions.delete(id));
  const res = await apiDelete(url);
  return res.data;
}

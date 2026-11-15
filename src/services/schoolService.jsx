// src/services/schoolService.jsx
import { apiGet, apiPost, apiPatch, apiDelete } from "../helpers/httpClient.jsx";
import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx";

export async function getSchools({
  page = 1,
  limit = 10,
  search = "",
  sortBy,
  sortOrder,
  managerId,
} = {}) {
  const url = getApiUrl(API_ROUTES.schools.list);
  const response = await apiGet(url, {
    params: {
      page,
      limit,
      search: search || undefined,
      sortBy: sortBy || undefined,
      sortOrder: sortOrder || undefined,
      managerId: managerId || undefined,
    },
  });

  const payload = response?.data;
  const data = payload?.data || {};
  const items = data.items || data.data || [];
  const pagination = data.meta || data.pagination || payload?.meta || {};

  return {
    items,
    pagination: {
      page: pagination.page ?? page,
      limit: pagination.limit ?? limit,
      total: pagination.total ?? items.length,
      lastPage:
        pagination.lastPage ??
        (pagination.total && (pagination.limit || limit)
          ? Math.ceil((pagination.total || 0) / (pagination.limit || limit))
          : 1),
    },
  };
}

export async function getSchool(id) {
  const url = getApiUrl(API_ROUTES.schools.detail(id));
  const res = await apiGet(url);
  return res?.data?.data || res?.data;
}

export async function createSchool(payload) {
  const url = getApiUrl(API_ROUTES.schools.create);
  const res = await apiPost(url, payload);
  return res.data;
}

export async function updateSchool(id, payload) {
  const url = getApiUrl(API_ROUTES.schools.update(id));
  const res = await apiPatch(url, payload);
  return res.data;
}

export async function deleteSchool(id) {
  const url = getApiUrl(API_ROUTES.schools.delete(id));
  const res = await apiDelete(url);
  return res.data;
}

// src/services/gradeService.jsx
import { apiGet, apiPost, apiPatch, apiDelete } from "../helpers/httpClient.jsx";
import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx";

export async function getGrades({
  page = 1,
  limit = 10,
  search = "",
  sortBy,
  sortOrder,
} = {}) {
  const url = getApiUrl(API_ROUTES.grades.list);
  const response = await apiGet(url, {
    params: {
      page,
      limit,
      search: search || undefined,
      sortBy: sortBy || undefined,
      sortOrder: sortOrder || undefined,
    },
  });

  const payload = response?.data;
  const data = payload?.data || {};
  const items = data.items || data.data || [];
  const pagination = data.meta || data.pagination || {};

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

export async function getGrade(id) {
  const url = getApiUrl(API_ROUTES.grades.detail(id));
  const res = await apiGet(url);
  return res?.data?.data || res?.data;
}

export async function createGrade(payload) {
  const url = getApiUrl(API_ROUTES.grades.create);
  const res = await apiPost(url, payload);
  return res.data;
}

export async function updateGrade(id, payload) {
  const url = getApiUrl(API_ROUTES.grades.update(id));
  const res = await apiPatch(url, payload);
  return res.data;
}

export async function deleteGrade(id) {
  const url = getApiUrl(API_ROUTES.grades.delete(id));
  const res = await apiDelete(url);
  return res.data;
}

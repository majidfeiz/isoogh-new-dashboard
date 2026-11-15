// src/services/schoolService.jsx
import { apiGet, apiPost, apiPatch, apiDelete } from "../helpers/httpClient.jsx";
import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx";

export const ACTIVE_SCHOOLS_INVALIDATED_EVENT = "active-schools:invalidated";

export function invalidateActiveSchoolLists(detail = {}) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(ACTIVE_SCHOOLS_INVALIDATED_EVENT, { detail }));
  }
}

export function subscribeToActiveSchoolInvalidation(listener) {
  if (typeof window === "undefined" || typeof listener !== "function") return () => {};
  window.addEventListener(ACTIVE_SCHOOLS_INVALIDATED_EVENT, listener);
  return () => window.removeEventListener(ACTIVE_SCHOOLS_INVALIDATED_EVENT, listener);
}

export async function getSchools({
  page = 1,
  limit = 10,
  search = "",
  sortBy,
  sortOrder,
  managerId,
  signal,
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
    signal,
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

export async function updateSchoolStatus(schoolId, status) {
  if (status !== 0 && status !== 1) {
    throw new TypeError("status must be 0 or 1");
  }

  const url = getApiUrl(API_ROUTES.schools.update(schoolId));
  const response = await apiPatch(url, { status });
  return response?.data?.data || response?.data;
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

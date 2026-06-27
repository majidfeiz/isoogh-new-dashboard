// src/services/adviserService.jsx
import { apiGet, apiPost, apiPatch, apiDelete, apiPut } from "../helpers/httpClient.jsx";
import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx";

export async function getAdvisers({
  page = 1,
  limit = 10,
  search = "",
  sortBy,
  sortOrder,
  schoolId,
  userId,
  parentId,
  isSuper,
  gradeId,
} = {}) {
  const url = getApiUrl(API_ROUTES.advisers.list);
  const response = await apiGet(url, {
    params: {
      page,
      limit,
      search: search || undefined,
      sortBy: sortBy || undefined,
      sortOrder: sortOrder || undefined,
      schoolId: schoolId || undefined,
      userId: userId || undefined,
      parentId: parentId ?? undefined,
      isSuper:
        typeof isSuper === "boolean" ? isSuper : isSuper === "1" ? true : isSuper === "0" ? false : undefined,
      gradeId: gradeId || undefined,
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

export async function getAdviser(id) {
  const url = getApiUrl(API_ROUTES.advisers.detail(id));
  const res = await apiGet(url);
  return res?.data?.data || res?.data;
}

export async function createAdviser(payload) {
  const url = getApiUrl(API_ROUTES.advisers.create);
  const res = await apiPost(url, payload);
  return res.data;
}

export async function updateAdviser(id, payload) {
  const url = getApiUrl(API_ROUTES.advisers.update(id));
  const res = await apiPatch(url, payload);
  return res.data;
}

export async function deleteAdviser(id) {
  const url = getApiUrl(API_ROUTES.advisers.delete(id));
  const res = await apiDelete(url);
  return res.data;
}

const normalizePagedResponse = (response, fallback = {}) => {
  const payload = response?.data;
  const data = payload?.data ?? payload ?? {};
  const items = data.items || data.data || [];
  const pagination = data.meta || data.pagination || payload?.meta || {};
  const page = fallback.page ?? 1;
  const limit = fallback.limit ?? 10;

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
};

export async function getAdviserStudentCandidates(adviserId, params = {}) {
  const url = getApiUrl(API_ROUTES.advisers.studentCandidates(adviserId));
  const response = await apiGet(url, { params });
  return normalizePagedResponse(response, params);
}

export async function getAdviserStudents(adviserId, params = {}) {
  const url = getApiUrl(API_ROUTES.advisers.students(adviserId));
  const response = await apiGet(url, { params });
  return normalizePagedResponse(response, params);
}

export async function attachAdviserStudents(adviserId, payload) {
  const url = getApiUrl(API_ROUTES.advisers.students(adviserId));
  const response = await apiPost(url, payload);
  return response.data;
}

export async function attachAdviserStudentsBySearch(adviserId, payload) {
  const url = getApiUrl(API_ROUTES.advisers.studentsBySearch(adviserId));
  const response = await apiPost(url, payload);
  return response.data;
}

export async function attachAdviserStudentsByTag(adviserId, payload) {
  const url = getApiUrl(API_ROUTES.advisers.studentsByTag(adviserId));
  const response = await apiPost(url, payload);
  return response.data;
}

export async function detachAdviserStudent(adviserId, studentId) {
  const url = getApiUrl(API_ROUTES.advisers.detachStudent(adviserId, studentId));
  const response = await apiDelete(url);
  return response.data;
}

export async function detachAdviserStudents(adviserId) {
  const url = getApiUrl(API_ROUTES.advisers.students(adviserId));
  const response = await apiDelete(url);
  return response.data;
}

export async function getAdviserGrades(adviserId) {
  const url = getApiUrl(API_ROUTES.advisers.grades(adviserId));
  const res = await apiGet(url);
  return res?.data?.data || [];
}

export async function syncAdviserGrades(adviserId, gradeIds) {
  const url = getApiUrl(API_ROUTES.advisers.grades(adviserId));
  const res = await apiPut(url, { gradeIds });
  return res?.data?.data || [];
}

// src/services/studentService.jsx
import { apiGet, apiPost, apiPatch, apiDelete } from "../helpers/httpClient.jsx";
import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx";

// گرفتن لیست دانش‌آموزان
export async function getStudents({
  page = 1,
  limit = 10,
  search = "",
  sortBy,
  sortOrder,
  schoolId,
  userId,
} = {}) {
  const url = getApiUrl(API_ROUTES.students.list);

  const response = await apiGet(url, {
    params: {
      page,
      limit,
      search: search || undefined,
      sortBy: sortBy || undefined,
      sortOrder: sortOrder || undefined,
      schoolId: schoolId || undefined,
      userId: userId || undefined,
    },
  });

  const payload = response?.data;
  const data = payload?.data || {};
  const items = data.items || [];
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

// ساخت دانش‌آموز
export async function createStudent(payload) {
  const url = getApiUrl(API_ROUTES.students.create);
  const res = await apiPost(url, payload);
  return res.data;
}

// جزئیات دانش‌آموز
export async function getStudent(id) {
  const url = getApiUrl(API_ROUTES.students.detail(id));
  const res = await apiGet(url);
  return res.data?.data || res.data;
}

// ویرایش دانش‌آموز
export async function updateStudent(id, payload) {
  const url = getApiUrl(API_ROUTES.students.update(id));
  const res = await apiPatch(url, payload);
  return res.data;
}

// حذف دانش‌آموز
export async function deleteStudent(id) {
  const url = getApiUrl(API_ROUTES.students.delete(id));
  const res = await apiDelete(url);
  return res.data;
}

// ایمپورت اکسل دانش‌آموزان
export async function importStudents(formData, config = {}) {
  const url = getApiUrl(API_ROUTES.students.import);
  const res = await apiPost(url, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    ...config,
  });
  return res.data;
}

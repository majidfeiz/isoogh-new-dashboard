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
  tag,
  tagId,
  archiveStatus = "active",
  signal,
} = {}) {
  const url = getApiUrl(API_ROUTES.students.list);

  const response = await apiGet(url, {
    signal,
    params: {
      page,
      limit,
      search: search || undefined,
      sortBy: sortBy || undefined,
      sortOrder: sortOrder || undefined,
      schoolId: schoolId || undefined,
      userId: userId || undefined,
      tag: tag || undefined,
      tagId: tagId || undefined,
      archiveStatus: archiveStatus || undefined,
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

export async function archiveStudent(id) {
  const url = getApiUrl(API_ROUTES.students.archive(id));
  const res = await apiPatch(url);
  return res.data;
}

export async function unarchiveStudent(id) {
  const url = getApiUrl(API_ROUTES.students.unarchive(id));
  const res = await apiPatch(url);
  return res.data;
}

export async function importStudentArchive(formData, config = {}) {
  const url = getApiUrl(API_ROUTES.students.archiveImport);
  const res = await apiPost(url, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    ...config,
  });
  return res.data;
}

export async function importStudentUnarchive(formData, config = {}) {
  const url = getApiUrl(API_ROUTES.students.unarchiveImport);
  const res = await apiPost(url, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    ...config,
  });
  return res.data;
}

export async function getStudentRegistrationAvailability({ phone, username, signal } = {}) {
  const url = getApiUrl(API_ROUTES.students.registrationAvailability);
  const res = await apiGet(url, {
    params: {
      phone: phone || undefined,
      username: username || undefined,
    },
    signal,
  });
  return res.data?.data || res.data || {};
}

let contactSubjectsCache = null;

export async function getStudentContactSubjects({ force = false } = {}) {
  if (!force && contactSubjectsCache) return contactSubjectsCache;
  const res = await apiGet(getApiUrl(API_ROUTES.students.contactSubjects));
  const data = res.data?.data || res.data || [];
  contactSubjectsCache = Array.isArray(data) ? data : data.items || [];
  return contactSubjectsCache;
}

export async function getStudentContacts(studentId) {
  const res = await apiGet(getApiUrl(API_ROUTES.students.contacts(studentId)));
  const data = res.data?.data || res.data || [];
  return Array.isArray(data) ? data : data.items || [];
}

export async function createStudentContact(studentId, payload) {
  const res = await apiPost(getApiUrl(API_ROUTES.students.contacts(studentId)), payload);
  return res.data?.data || res.data;
}

export async function updateStudentContact(studentId, contactId, payload) {
  const res = await apiPatch(getApiUrl(API_ROUTES.students.contact(studentId, contactId)), payload);
  return res.data?.data || res.data;
}

export async function setDefaultStudentContact(studentId, contactId) {
  const res = await apiPatch(getApiUrl(API_ROUTES.students.contactSetDefault(studentId, contactId)));
  return res.data?.data || res.data;
}

export async function deleteStudentContact(studentId, contactId) {
  const res = await apiDelete(getApiUrl(API_ROUTES.students.contact(studentId, contactId)));
  return res.data?.data || res.data;
}

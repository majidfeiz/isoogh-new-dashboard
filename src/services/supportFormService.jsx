// src/services/supportFormService.jsx
import { apiGet, apiPost, apiPut, apiDelete } from "../helpers/httpClient.jsx";
import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx";

export async function getSupportForms({
  page = 1,
  limit = 10,
  search = "",
  schoolId,
  gradeId,
  sortBy,
  sortOrder,
} = {}) {
  const url = getApiUrl(API_ROUTES.supportForms.list);
  const response = await apiGet(url, {
    params: {
      page,
      limit,
      search: search || undefined,
      schoolId: schoolId || undefined,
      gradeId: gradeId || undefined,
      sortBy: sortBy || undefined,
      sortOrder: sortOrder || undefined,
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

export async function getSupportForm(id) {
  const url = getApiUrl(API_ROUTES.supportForms.detail(id));
  const res = await apiGet(url);
  return res?.data?.data || res?.data;
}

export async function createSupportForm(payload) {
  const url = getApiUrl(API_ROUTES.supportForms.create);
  const res = await apiPost(url, payload);
  return res.data;
}

export async function updateSupportForm(id, payload) {
  const url = getApiUrl(API_ROUTES.supportForms.update(id));
  const res = await apiPut(url, payload);
  return res.data;
}

export async function deleteSupportForm(id) {
  const url = getApiUrl(API_ROUTES.supportForms.delete(id));
  const res = await apiDelete(url);
  return res.data;
}

export async function getSupportFormAdvisers(id, params = {}) {
  const url = getApiUrl(API_ROUTES.supportForms.advisers(id));
  const response = await apiGet(url, { params });
  const payload = response?.data;
  const data = payload?.data ?? payload ?? {};
  const items = data.items || data.data || [];
  const pagination = data.meta || data.pagination || {};

  return {
    items,
    pagination: {
      page: pagination.page ?? params.page ?? 1,
      limit: pagination.limit ?? params.limit ?? 10,
      total: pagination.total ?? items.length,
      lastPage:
        pagination.lastPage ??
        (pagination.total && (pagination.limit || params.limit)
          ? Math.ceil((pagination.total || 0) / (pagination.limit || params.limit || 10))
          : 1),
    },
  };
}

export async function getSupportFormAdviserCandidates(id, params = {}) {
  const url = getApiUrl(API_ROUTES.supportForms.adviserCandidates(id));
  const response = await apiGet(url, { params });
  const payload = response?.data;
  const data = payload?.data ?? payload ?? {};
  const items = data.items || data.data || [];
  const pagination = data.meta || data.pagination || {};

  return {
    items,
    pagination: {
      page: pagination.page ?? params.page ?? 1,
      limit: pagination.limit ?? params.limit ?? 10,
      total: pagination.total ?? items.length,
      lastPage:
        pagination.lastPage ??
        (pagination.total && (pagination.limit || params.limit)
          ? Math.ceil((pagination.total || 0) / (pagination.limit || params.limit || 10))
          : 1),
    },
  };
}

export async function upsertSupportFormAdviser(id, payload) {
  const url = getApiUrl(API_ROUTES.supportForms.advisers(id));
  const res = await apiPost(url, payload);
  return res.data;
}

export async function detachSupportFormAdviser(id, adviserId) {
  const url = getApiUrl(API_ROUTES.supportForms.detachAdviser(id, adviserId));
  const res = await apiDelete(url);
  return res.data;
}

export async function getSupportFormAdviserStudents(id, adviserId, params = {}) {
  const url = getApiUrl(API_ROUTES.supportForms.adviserStudents(id, adviserId));
  const response = await apiGet(url, { params });
  const payload = response?.data;
  const data = payload?.data ?? payload ?? {};
  const items = data.items || data.data || [];
  const pagination = data.meta || data.pagination || {};

  return {
    items,
    pagination: {
      page: pagination.page ?? params.page ?? 1,
      limit: pagination.limit ?? params.limit ?? 10,
      total: pagination.total ?? items.length,
      lastPage:
        pagination.lastPage ??
        (pagination.total && (pagination.limit || params.limit)
          ? Math.ceil((pagination.total || 0) / (pagination.limit || params.limit || 10))
          : 1),
    },
  };
}

export async function getSupportFormAdviserStudentCandidates(id, adviserId, params = {}) {
  const url = getApiUrl(API_ROUTES.supportForms.adviserStudentCandidates(id, adviserId));
  const response = await apiGet(url, { params });
  const payload = response?.data;
  const data = payload?.data ?? payload ?? {};
  const items = data.items || data.data || [];
  const pagination = data.meta || data.pagination || {};

  return {
    items,
    pagination: {
      page: pagination.page ?? params.page ?? 1,
      limit: pagination.limit ?? params.limit ?? 10,
      total: pagination.total ?? items.length,
      lastPage:
        pagination.lastPage ??
        (pagination.total && (pagination.limit || params.limit)
          ? Math.ceil((pagination.total || 0) / (pagination.limit || params.limit || 10))
          : 1),
    },
  };
}

export async function attachSupportFormAdviserStudents(id, adviserId, payload) {
  const url = getApiUrl(API_ROUTES.supportForms.adviserStudents(id, adviserId));
  const res = await apiPost(url, payload);
  return res.data;
}

export async function attachSupportFormAdviserStudentsByTag(id, adviserId, payload) {
  const url = getApiUrl(API_ROUTES.supportForms.adviserStudentsByTag(id, adviserId));
  const res = await apiPost(url, payload);
  return res.data;
}

export async function detachSupportFormAdviserStudent(id, adviserId, studentId) {
  const url = getApiUrl(
    API_ROUTES.supportForms.detachAdviserStudent(id, adviserId, studentId)
  );
  const res = await apiDelete(url);
  return res.data;
}

export async function detachSupportFormAdviserStudents(id, adviserId) {
  const url = getApiUrl(API_ROUTES.supportForms.detachAdviserStudents(id, adviserId));
  const res = await apiDelete(url);
  return res.data;
}

export async function copySupportForm(id) {
  const url = getApiUrl(API_ROUTES.supportForms.copy(id));
  const res = await apiPost(url, {});
  return res.data;
}

export async function getSupportFormQuestions(id, params = {}) {
  const url = getApiUrl(API_ROUTES.supportForms.questions(id));
  const response = await apiGet(url, { params });
  const payload = response?.data;
  const data = payload?.data ?? payload ?? {};
  return Array.isArray(data) ? data : data.items || data.data || [];
}

export async function upsertSupportFormQuestion(id, payload) {
  const url = getApiUrl(API_ROUTES.supportForms.questions(id));
  const res = await apiPost(url, payload);
  return res.data;
}

export async function deleteSupportFormQuestion(id, qId) {
  const url = getApiUrl(API_ROUTES.supportForms.question(id, qId));
  const res = await apiDelete(url);
  return res.data;
}

export async function toggleSupportFormAdviserActive(id, adviserId, isActive) {
  const url = getApiUrl(API_ROUTES.supportForms.toggleAdviserActive(id, adviserId));
  const res = await apiPost(url, { is_active: isActive });
  return res.data;
}

export async function bulkAttachSupportFormAdvisers(id, adviserIds) {
  const url = getApiUrl(API_ROUTES.supportForms.setAdvisers(id));
  const res = await apiPost(url, { adviser_ids: adviserIds });
  return res.data;
}

export async function detachSupportFormAdviserByBody(id, adviserId) {
  const url = getApiUrl(API_ROUTES.supportForms.delAdvisers(id));
  const res = await apiPost(url, { adviser_id: adviserId });
  return res.data;
}

export async function getSupportFormAllStudents(id, params = {}) {
  const url = getApiUrl(API_ROUTES.supportForms.formStudents(id));
  const response = await apiGet(url, { params });
  const payload = response?.data;
  const data = payload?.data ?? payload ?? {};
  const items = data.items || data.data || [];
  const pagination = data.meta || data.pagination || {};
  return {
    items,
    pagination: {
      page: pagination.page ?? params.page ?? 1,
      limit: pagination.limit ?? params.limit ?? 10,
      total: pagination.total ?? items.length,
      lastPage:
        pagination.lastPage ??
        (pagination.total && (pagination.limit || params.limit)
          ? Math.ceil((pagination.total || 0) / (pagination.limit || params.limit || 10))
          : 1),
    },
  };
}

export async function getSupportFormInterruptedCalls(id, params = {}) {
  const url = getApiUrl(API_ROUTES.supportForms.interruptedCalls(id));
  const response = await apiGet(url, { params });
  const payload = response?.data;
  const data = payload?.data ?? payload ?? {};
  const items = data.items || data.data || [];
  const pagination = data.meta || data.pagination || {};
  return {
    items,
    pagination: {
      page: pagination.page ?? params.page ?? 1,
      limit: pagination.limit ?? params.limit ?? 10,
      total: pagination.total ?? items.length,
      lastPage:
        pagination.lastPage ??
        (pagination.total && (pagination.limit || params.limit)
          ? Math.ceil((pagination.total || 0) / (pagination.limit || params.limit || 10))
          : 1),
    },
  };
}

export async function changeStudentSupportFormStatus(payload) {
  const url = getApiUrl(API_ROUTES.supportForms.changeStudentStatus);
  const res = await apiPost(url, payload);
  return res.data;
}

export async function getStudentSupportFormStatus(payload) {
  const url = getApiUrl(API_ROUTES.supportForms.getStudentStatus);
  const res = await apiPost(url, payload);
  return res.data;
}

export async function getAdviserInterruptedCallsList(payload = {}) {
  const url = getApiUrl(API_ROUTES.supportForms.adviserInterruptedCalls);
  const res = await apiPost(url, payload);
  const data = res?.data?.data ?? res?.data ?? {};
  const items = data.items || data.data || [];
  const pagination = data.meta || data.pagination || {};
  return {
    items,
    pagination: {
      page: pagination.page ?? payload.page ?? 1,
      limit: pagination.limit ?? payload.limit ?? 10,
      total: pagination.total ?? items.length,
      lastPage:
        pagination.lastPage ??
        (pagination.total && (pagination.limit || payload.limit)
          ? Math.ceil((pagination.total || 0) / (pagination.limit || payload.limit || 10))
          : 1),
    },
  };
}

export async function autoImportAdviserStudents(id, adviserId) {
  const url = getApiUrl(API_ROUTES.supportForms.setAdviserStudents(id, adviserId));
  const res = await apiGet(url);
  return res.data;
}

export async function getAllSupportForms() {
  const url = getApiUrl(API_ROUTES.supportForms.allForms);
  const res = await apiGet(url);
  const data = res?.data?.data ?? res?.data ?? [];
  return Array.isArray(data) ? data : data.items || data.data || [];
}

export async function getSupportFormQuestionsOrForms(params = {}) {
  const url = getApiUrl(API_ROUTES.supportForms.questionsOrForms);
  const res = await apiGet(url, { params });
  const data = res?.data?.data ?? res?.data ?? [];
  return Array.isArray(data) ? data : data.items || data.data || [];
}

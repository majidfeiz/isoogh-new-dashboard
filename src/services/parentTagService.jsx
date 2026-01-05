// src/services/parentTagService.jsx
import { apiGet, apiPost, apiPatch, apiDelete } from "../helpers/httpClient.jsx";
import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx";

export async function getParentTags({
  page = 1,
  limit = 10,
  search = "",
  schoolId,
  parentId,
  rootOnly,
  sortBy,
  sortOrder,
} = {}) {
  const url = getApiUrl(API_ROUTES.parentTags.list);
  const response = await apiGet(url, {
    params: {
      page,
      limit,
      search: search || undefined,
      schoolId: schoolId || undefined,
      parentId: parentId || undefined,
      rootOnly: typeof rootOnly === "string" && rootOnly !== ""
        ? rootOnly
        : typeof rootOnly === "number"
        ? rootOnly
        : undefined,
      sortBy: sortBy || undefined,
      sortOrder: sortOrder || undefined,
    },
  });

  const payload = response?.data;
  const data = payload?.data ?? payload ?? {};
  const items = Array.isArray(data) ? data : data.items || data.data || [];
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

export async function getParentTag(id) {
  const url = getApiUrl(API_ROUTES.parentTags.detail(id));
  const res = await apiGet(url);
  return res?.data?.data || res?.data;
}

export async function createParentTag(payload) {
  const url = getApiUrl(API_ROUTES.parentTags.create);
  const res = await apiPost(url, payload);
  return res.data;
}

export async function updateParentTag(id, payload) {
  const url = getApiUrl(API_ROUTES.parentTags.update(id));
  const res = await apiPatch(url, payload);
  return res.data;
}

export async function deleteParentTag(id) {
  const url = getApiUrl(API_ROUTES.parentTags.delete(id));
  const res = await apiDelete(url);
  return res.data;
}

export async function getParentTagUsers(
  id,
  { page = 1, limit = 10, search = "", userId, schoolId, hasValue } = {}
) {
  const url = getApiUrl(API_ROUTES.parentTags.users(id));
  const response = await apiGet(url, {
    params: {
      page,
      limit,
      search: search || undefined,
      userId: userId || undefined,
      schoolId: schoolId || undefined,
      hasValue:
        typeof hasValue === "string" && hasValue !== ""
          ? hasValue
          : typeof hasValue === "number"
          ? hasValue
          : undefined,
    },
  });

  const payload = response?.data;
  const data = payload?.data ?? payload ?? {};
  const items = Array.isArray(data) ? data : data.items || data.data || [];
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

export async function attachUserToParentTag(id, userId) {
  const url = getApiUrl(API_ROUTES.parentTags.users(id));
  const res = await apiPost(url, { user_id: userId });
  return res.data;
}

export async function detachUserFromParentTag(id, userId) {
  const url = getApiUrl(API_ROUTES.parentTags.detachUser(id, userId));
  const res = await apiDelete(url);
  return res.data;
}

export async function saveParentTagValue(id, { userId, user_id, value }) {
  const url = getApiUrl(API_ROUTES.parentTags.values(id));
  const res = await apiPost(url, { user_id: userId ?? user_id, value });
  return res.data;
}

export async function deleteParentTagValue(id, userId) {
  const url = getApiUrl(API_ROUTES.parentTags.deleteValue(id, userId));
  const res = await apiDelete(url);
  return res.data;
}

export async function exportParentTags(params = {}) {
  const url = new URL(getApiUrl(API_ROUTES.parentTags.export));
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.append(key, value);
    }
  });
  const res = await apiGet(url.toString(), { responseType: "blob" });
  return res?.data;
}

export async function exportParentTagUsers(id, params = {}) {
  const url = new URL(getApiUrl(API_ROUTES.parentTags.exportUsers(id)));
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.append(key, value);
    }
  });
  const res = await apiGet(url.toString(), { responseType: "blob" });
  return res?.data;
}

export async function importParentTagUsers(formData, config = {}) {
  const url = getApiUrl(API_ROUTES.parentTags.import);
  const res = await apiPost(url, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    ...config,
  });
  return res?.data;
}

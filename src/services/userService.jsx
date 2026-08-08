// src/services/userService.jsx
import {
  apiGet,
  apiPost,
  apiPatch,
  apiDelete,
} from "../helpers/httpClient.jsx";
import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx";

// گرفتن لیست کاربران
export async function getUsers({
  page = 1,
  limit = 10,
  search = "",
  roleId,
  sortBy,
  sortOrder,
  archiveStatus,
} = {}) {
  const url = getApiUrl(API_ROUTES.users.list);

  const response = await apiGet(url, {
    params: {
      page,
      limit,
      search: search || undefined,
      roleId: roleId || undefined,
      sortBy: sortBy || undefined,
      sortOrder: sortOrder || undefined,
      archiveStatus: archiveStatus || undefined,
    },
  });

  const payload = response.data;
  const data = payload?.data || {};
  const items = data.items || [];
  // Backend returns pagination info under `meta` (or sometimes `pagination`)
  const pagination = data.pagination || data.meta || {};

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

// خروجی CSV کاربران
export async function exportUsers({
  page = 1,
  limit = 1000,
  search = "",
  roleId,
  sortBy = "id",
  sortOrder = "DESC",
  archiveStatus,
  onDownloadProgress,
} = {}) {
  const url = getApiUrl(API_ROUTES.users.export);

  const response = await apiGet(url, {
    responseType: "blob",
    onDownloadProgress,
    params: {
      page,
      limit,
      search: search || undefined,
      roleId: roleId || undefined,
      sortBy: sortBy || undefined,
      sortOrder: sortOrder || undefined,
      archiveStatus: archiveStatus || undefined,
    },
  });

  return response?.data;
}

// ساخت کاربر جدید
export async function createUser(payload) {
  const url = getApiUrl(API_ROUTES.users.create);
  const res = await apiPost(url, payload);
  return res.data;
}

// گرفتن جزئیات یک کاربر
export async function getUser(id, config = {}) {
  const url = getApiUrl(API_ROUTES.users.detail(id));
  const res = await apiGet(url, config);
  return res.data?.data || res.data;
}

// ویرایش کاربر
export async function updateUser(id, payload) {
  const url = getApiUrl(API_ROUTES.users.update(id));
  const res = await apiPatch(url, payload);
  return res.data;
}

// حذف کاربر
export async function deleteUser(id) {
  const url = getApiUrl(API_ROUTES.users.delete(id));
  const res = await apiDelete(url);
  return res.data;
}

export async function archiveUser(id) {
  const url = getApiUrl(API_ROUTES.users.archive(id));
  const res = await apiPatch(url);
  return res.data;
}

export async function unarchiveUser(id) {
  const url = getApiUrl(API_ROUTES.users.unarchive(id));
  const res = await apiPatch(url);
  return res.data;
}

export async function importUserRoles({ file, roleId, onUploadProgress } = {}) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("roleId", String(roleId));

  const url = getApiUrl(API_ROUTES.users.importRoles);
  const res = await apiPost(url, formData, { onUploadProgress, silent: true });
  return res?.data?.data || res?.data;
}

export async function downloadUserRoleImportTemplate() {
  const url = getApiUrl(API_ROUTES.users.importRolesTemplate);
  const res = await apiGet(url, {
    responseType: "blob",
    silent: true,
    headers: {
      Accept:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  });
  return res?.data;
}

// همگام‌سازی نقش‌های یک کاربر
export async function syncUserRoles(id, roleIds) {
  const url = getApiUrl(API_ROUTES.users.syncRoles(id));
  const res = await apiPost(url, { roleIds });
  return res.data;
}

// همگام‌سازی پرمیشن‌های مستقیم یک کاربر
export async function syncUserPermissions(id, permissionIds) {
  const url = getApiUrl(API_ROUTES.users.syncPermissions(id));
  const res = await apiPost(url, { permissionIds });
  return res.data;
}

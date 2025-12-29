// src/services/userService.jsx
import {
  apiGet,
  apiPost,
  apiPatch,
  apiDelete,
} from "../helpers/httpClient.jsx";
import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx";

// گرفتن لیست کاربران
export async function getUsers({ page = 1, limit = 10, search = "" } = {}) {
  const url = getApiUrl(API_ROUTES.users.list);

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

// ساخت کاربر جدید
export async function createUser(payload) {
  const url = getApiUrl(API_ROUTES.users.create);
  const res = await apiPost(url, payload);
  return res.data;
}

// گرفتن جزئیات یک کاربر
export async function getUser(id) {
  const url = getApiUrl(API_ROUTES.users.detail(id));
  const res = await apiGet(url);
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

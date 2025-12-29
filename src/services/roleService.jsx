// src/services/roleService.jsx
import {
  apiGet,
  apiPost,
  apiPatch,
  apiDelete,
} from "../helpers/httpClient.jsx";
import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx";

// گرفتن لیست نقش‌ها
export async function getRoles({ page = 1, limit = 10, search = "" } = {}) {
  const url = getApiUrl(API_ROUTES.roles.list);

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

// ساخت نقش جدید
export async function createRole(payload) {
  const url = getApiUrl(API_ROUTES.roles.create);
  const res = await apiPost(url, payload);
  return res.data;
}

// گرفتن جزئیات یک نقش
export async function getRole(id) {
  const url = getApiUrl(API_ROUTES.roles.detail(id));
  const res = await apiGet(url);
  return res.data?.data || res.data;
}

// ویرایش نقش
export async function updateRole(id, payload) {
  const url = getApiUrl(API_ROUTES.roles.update(id));
  const res = await apiPatch(url, payload);
  return res.data;
}

// حذف نقش
export async function deleteRole(id) {
  const url = getApiUrl(API_ROUTES.roles.delete(id));
  const res = await apiDelete(url);
  return res.data;
}

// همگام‌سازی پرمیشن‌های یک نقش (برای مرحله‌های بعد)
export async function syncRolePermissions(id, permissionIds) {
  const url = getApiUrl(API_ROUTES.roles.syncPermissions(id));
  const res = await apiPost(url, { permissionIds });
  return res.data;
}

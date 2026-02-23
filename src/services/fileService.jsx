import { apiDelete, apiGet, apiPatch, apiPost } from "../helpers/httpClient.jsx";
import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx";

const normalizeFileItem = (item = {}) => ({
  id: item?.id ?? null,
  code: item?.code ?? "",
  name: item?.name ?? "",
  url: item?.url ?? "",
  type: item?.type ?? "",
  size: item?.size ?? "",
  time: item?.time ?? "",
  title: item?.title ?? "",
  description: item?.description ?? "",
  created_at: item?.created_at ?? item?.createdAt ?? null,
  updated_at: item?.updated_at ?? item?.updatedAt ?? null,
});

export async function getFiles({
  page = 1,
  limit = 10,
  search = "",
  sortBy,
  sortOrder,
} = {}) {
  const url = getApiUrl(API_ROUTES.files.list);
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
  const items = (data.items || data.data || []).map(normalizeFileItem);
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

export async function getFile(id) {
  const url = getApiUrl(API_ROUTES.files.detail(id));
  const res = await apiGet(url);
  const payload = res?.data?.data || res?.data || {};
  return normalizeFileItem(payload);
}

export async function createFile(payload) {
  const url = getApiUrl(API_ROUTES.files.create);
  const res = await apiPost(url, payload);
  return res?.data;
}

export async function updateFile(id, payload) {
  const url = getApiUrl(API_ROUTES.files.update(id));
  const res = await apiPatch(url, payload);
  return res?.data;
}

export async function deleteFile(id) {
  const url = getApiUrl(API_ROUTES.files.delete(id));
  const res = await apiDelete(url);
  return res?.data;
}

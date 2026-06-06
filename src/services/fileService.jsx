import { apiDelete, apiGet, apiPatch, apiPost } from "../helpers/httpClient.jsx";
import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx";

const normalizeFileItem = (item = {}) => ({
  id: item?.id ?? null,
  code: item?.code ?? "",
  name: item?.name ?? "",
  title: item?.title ?? "",
  description: item?.description ?? "",
  size: item?.size ?? "",
  time: item?.time ?? "",
  type: item?.type ?? "",
  url: item?.url ?? "",
  arvan_url: item?.arvan_url ?? "",
  arvan_status: item?.arvan_status ?? 0,
  s3_file: item?.s3_file ?? null,
  s3_status: item?.s3_status ?? 0,
  fileable_type: item?.fileable_type ?? "",
  fileable_id: item?.fileable_id ?? null,
  status: item?.status ?? 0,
  used_count: item?.used_count ?? 0,
  file_checked: item?.file_checked ?? 0,
  ip: item?.ip ?? "",
  hash: item?.hash ?? null,
  volume: item?.volume ?? null,
  created_at: item?.created_at ?? item?.createdAt ?? null,
  updated_at: item?.updated_at ?? item?.updatedAt ?? null,
});

export async function getFiles({
  page = 1,
  limit = 10,
  search = "",
  fileable_type = "",
  fileable_id = "",
  status = "",
  sortBy,
  sortOrder,
} = {}) {
  const url = getApiUrl(API_ROUTES.files.list);
  const response = await apiGet(url, {
    params: {
      page,
      limit,
      search: search || undefined,
      fileable_type: fileable_type || undefined,
      fileable_id: fileable_id || undefined,
      status: status !== "" ? status : undefined,
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

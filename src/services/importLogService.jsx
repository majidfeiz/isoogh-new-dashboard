import { apiGet } from "../helpers/httpClient.jsx";
import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx";

const compact = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, value]) => value !== "" && value != null));

const normalizeList = (response, defaults = {}) => {
  const data = response?.data?.data || {};
  const items = data.items || [];
  const meta = data.meta || {};
  const limit = Number(meta.limit ?? defaults.limit ?? 20);
  return {
    importLog: data.importLog,
    items,
    pagination: {
      page: Number(meta.page ?? defaults.page ?? 1),
      limit,
      total: Number(meta.total ?? items.length),
      lastPage: Number(meta.lastPage ?? Math.max(1, Math.ceil(Number(meta.total || 0) / limit))),
    },
  };
};

export async function getImportLogs(params = {}, signal) {
  const response = await apiGet(getApiUrl(API_ROUTES.importLogs.list), { params: compact(params), signal, silent: true });
  return normalizeList(response, params);
}

export async function getImportLog(id, schoolId, signal) {
  const response = await apiGet(getApiUrl(API_ROUTES.importLogs.detail(id)), { params: compact({ schoolId }), signal, silent: true });
  return response?.data?.data;
}

export async function getImportLogRows(id, params = {}, signal) {
  const response = await apiGet(getApiUrl(API_ROUTES.importLogs.rows(id)), { params: compact(params), signal, silent: true });
  return normalizeList(response, params);
}

export function parseDownloadFilename(contentDisposition, fallback) {
  if (!contentDisposition) return fallback;
  const utf = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  const plain = contentDisposition.match(/filename="?([^";]+)"?/i);
  const raw = utf?.[1] || plain?.[1];
  if (!raw) return fallback;
  try { return decodeURIComponent(raw.trim()); } catch { return raw.trim(); }
}

const download = async (route, params, fallback) => {
  const response = await apiGet(getApiUrl(route), { params: compact(params), responseType: "blob" });
  return { blob: response.data, filename: parseDownloadFilename(response.headers?.["content-disposition"], fallback) };
};

export const exportImportLogs = (params = {}) => download(API_ROUTES.importLogs.export, params, "import-logs.xlsx");
export const exportImportLogRows = (id, params = {}) => download(API_ROUTES.importLogs.exportRows(id), params, `import-log-${id}-rows.xlsx`);

export function saveBlob({ blob, filename }) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

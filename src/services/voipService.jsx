// src/services/voipService.jsx
import { apiGet } from "../helpers/httpClient.jsx";
import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx";

/**
 * @typedef {Object} OutboundCallHistoryFile
 * @property {number|string|null} id
 * @property {string} code
 * @property {string} name
 * @property {string} url
 * @property {string} type
 * @property {string} size
 * @property {string} time
 * @property {string} title
 * @property {string} description
 */

/**
 * @typedef {"NO ANSWER"|"ANSWERED"|"BUSY"|"FAILED"} OutboundDisposition
 */

/**
 * @typedef {Object} OutboundCallHistory
 * @property {number|string|null} id
 * @property {OutboundDisposition} [disposition]
 * @property {OutboundCallHistoryFile[]} files
 */

const normalizeOutboundFile = (file = {}) => ({
  id: file?.id ?? null,
  code: file?.code ?? "",
  name: file?.name ?? "",
  url: file?.url ?? "",
  type: file?.type ?? "",
  size: file?.size ?? "",
  time: file?.time ?? "",
  title: file?.title ?? "",
  description: file?.description ?? "",
});

const normalizeOutboundCallItem = (item = {}) => ({
  ...item,
  files: Array.isArray(item?.files) ? item.files.map(normalizeOutboundFile) : [],
});

// مستندات سوکت تماس‌های خروجی (namespace, event ها و ...)
export async function getOutboundCallHistorySocketDocs() {
  const url = getApiUrl(API_ROUTES.voip.outboundCallHistoriesSocketDocs);
  const response = await apiGet(url);
  const payload = response?.data || {};
  return payload?.data || payload || {};
}

// لیست تماس‌های خروجی (paginate + search)
export async function getOutboundCallHistories({
  page = 1,
  per_page = 15,
  type = "",
  q = "",
  disposition = "ALL",
  sortBy = "",
  sortOrder = "",
  start_date = "",
  end_date = "",
  ssn = "",
  tagId = "",
  support_form_id = "",
  adviser_id = "",
  super_adviser_id = "",
  signal,
} = {}) {
  const url = getApiUrl(API_ROUTES.voip.outboundCallHistories);

  const response = await apiGet(url, {
    params: {
      page,
      per_page,
      type: type || undefined,
      q: q || undefined,
      disposition: disposition && disposition !== "ALL" ? disposition : undefined,
      // API فقط snake_case می‌خواهد
      sort_by: sortBy || undefined,
      sort_order: sortOrder || undefined,
      start_date: start_date || undefined,
      end_date: end_date || undefined,
      ssn: ssn?.trim?.() || undefined,
      tagId: tagId || undefined,
      support_form_id: support_form_id || undefined,
      adviser_id: adviser_id || undefined,
      super_adviser_id: super_adviser_id || undefined,
    },
    signal,
  });

  // ✅ Nest response:
  // معمولا داده‌ها در data.data قرار می‌گیرند؛ اینجا مقاوم‌سازی شده
  const payload = response.data;
  const wrapped = payload?.data ?? payload ?? {};

  const items = (wrapped?.data || wrapped?.items || []).map(normalizeOutboundCallItem);
  const meta = wrapped?.meta || wrapped?.pagination || {};

  return {
    items,
    pagination: {
      page: meta.page ?? page,
      limit: meta.limit ?? meta.per_page ?? per_page,
      total: meta.total ?? items.length,
      lastPage: meta.lastPage ?? meta.last_page ?? 1,
      sortBy: (meta.sort_by ?? sortBy) ?? null,
      sortOrder: (meta.sort_order ?? sortOrder) ?? null,
    },
  };
}

export async function getOutboundCallHistoryTags({ search = "", page = 1, limit = 20, signal } = {}) {
  const response = await apiGet(getApiUrl(API_ROUTES.voip.outboundCallHistoryTags), {
    params: { search: search?.trim?.() || undefined, page, limit },
    signal,
  });
  const payload = response?.data;
  const data = payload?.data ?? payload ?? {};
  const items = Array.isArray(data?.items) ? data.items : [];
  const meta = data?.meta || {};
  return {
    items: items.map((item) => ({
      id: item?.id ?? null,
      name: item?.name ?? "",
      schoolId: item?.schoolId ?? item?.school_id ?? null,
      parentId: item?.parentId ?? item?.parent_id ?? null,
    })),
    meta: {
      page: meta.page ?? page,
      limit: meta.limit ?? limit,
      total: meta.total ?? items.length,
      lastPage: meta.lastPage ?? 1,
    },
  };
}

// خروجی CSV برای تماس‌های خروجی
export async function exportOutboundCallHistories({
  type = "",
  q = "",
  disposition = "ALL",
  start_date = "",
  end_date = "",
  ssn = "",
  tagId = "",
  onDownloadProgress,
} = {}) {
  const url = getApiUrl(API_ROUTES.voip.exportOutboundCallHistories);

  const response = await apiGet(url, {
    responseType: "blob",
    onDownloadProgress,
    params: {
      type: type || undefined,
      q: q || undefined,
      disposition: disposition && disposition !== "ALL" ? disposition : undefined,
      start_date: start_date || undefined,
      end_date: end_date || undefined,
      ssn: ssn?.trim?.() || undefined,
      tagId: tagId || undefined,
    },
  });

  return response?.data;
}

/**
 * @typedef {"in_progress"|"waiting_for_cdr"|"completed"|"failed"} CallTraceStatus
 * @typedef {"info"|"success"|"warning"|"error"} CallTraceEventLevel
 *
 * @typedef {Object} CallTraceParty
 * @property {number} id
 * @property {string|null} code
 * @property {string|null} name
 * @property {string|null} phone
 *
 * @typedef {Object} CallTraceEvent
 * @property {number} id
 * @property {number} sequence
 * @property {string} step
 * @property {number} progress
 * @property {CallTraceEventLevel} level
 * @property {string} title
 * @property {string|null} message
 * @property {Record<string, unknown>|null} payload
 * @property {Record<string, unknown>|null} response
 * @property {number|null} httpStatus
 * @property {number|null} durationMs
 * @property {string} createdAt
 *
 * @typedef {Object} CallTrace
 * @property {number} id
 * @property {number} voipCallId
 * @property {string} correlationId
 * @property {CallTraceStatus} status
 * @property {number} progress
 * @property {string} currentStep
 * @property {string|null} callGroupId
 * @property {string|null} errorMessage
 * @property {CallTraceParty} adviser
 * @property {CallTraceParty} student
 * @property {{id: number, title: string|null}} supportForm
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {CallTraceEvent[]} [events]
 */

const unwrapData = (response) => {
  const payload = response?.data;
  return payload?.data ?? payload ?? {};
};

/**
 * @param {{page?: number, limit?: number, search?: string, status?: CallTraceStatus|string,
 * adviserId?: string|number, studentId?: string|number, supportFormId?: string|number,
 * from?: string, to?: string, signal?: AbortSignal}} filters
 */
export async function getCallTraces({
  page = 1,
  limit = 15,
  search = "",
  status = "",
  adviserId = "",
  studentId = "",
  supportFormId = "",
  from = "",
  to = "",
  signal,
} = {}) {
  const response = await apiGet(getApiUrl(API_ROUTES.voip.callTraces), {
    signal,
    params: {
      page,
      limit,
      search: search || undefined,
      status: status || undefined,
      adviserId: adviserId || undefined,
      studentId: studentId || undefined,
      supportFormId: supportFormId || undefined,
      from: from || undefined,
      to: to || undefined,
    },
  });
  const payload = response?.data ?? {};
  const data = payload?.data ?? payload;
  const allItems = Array.isArray(data)
    ? data
    : Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data?.data)
        ? data.data
        : [];
  const meta = data?.meta || data?.pagination || payload?.meta || payload?.pagination || {};
  const normalizedPage = Number(meta.page ?? meta.currentPage ?? page) || page;
  const normalizedLimit = Number(meta.limit ?? meta.perPage ?? meta.per_page ?? limit) || limit;

  // Compatibility guard for older API deployments that return the complete collection.
  // It prevents thousands of table rows from freezing the browser, but the backend must
  // still paginate to avoid transferring and parsing the complete dataset on every page.
  const isUnpaginatedResponse = allItems.length > normalizedLimit;
  const effectivePage = isUnpaginatedResponse ? page : normalizedPage;
  const items = isUnpaginatedResponse
    ? allItems.slice((effectivePage - 1) * normalizedLimit, effectivePage * normalizedLimit)
    : allItems;
  const total = Number(meta.total ?? meta.totalItems ?? (isUnpaginatedResponse ? allItems.length : items.length));
  const lastPage = Number(
    meta.lastPage ??
    meta.totalPages ??
    meta.last_page ??
    Math.max(1, Math.ceil(total / normalizedLimit)),
  );

  return {
    items,
    meta: {
      page: effectivePage,
      limit: normalizedLimit,
      total,
      lastPage,
    },
  };
}

/** @param {number|string} id @param {{signal?: AbortSignal}} options */
export async function getCallTrace(id, { signal } = {}) {
  const response = await apiGet(getApiUrl(API_ROUTES.voip.callTrace(id)), { signal });
  return unwrapData(response);
}

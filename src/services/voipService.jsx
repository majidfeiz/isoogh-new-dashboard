// src/services/voipService.jsx
import { apiGet } from "../helpers/httpClient.jsx";
import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx";
import { normalizeJalaliDateOnly } from "../helpers/jalaliDateOnly.js";

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
 * @property {number|null} [talk_duration_seconds]
 * @property {string|null} [student_name]
 * @property {string|null} [student_gender]
 * @property {string|null} [student_city]
 * @property {string|null} [student_province]
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

export const normalizeOutboundCallItem = (item = {}) => ({
  ...item,
  talk_duration_seconds: item?.talk_duration_seconds ?? null,
  student_name: item?.student_name ?? null,
  student_gender: item?.student_gender ?? null,
  student_city: item?.student_city ?? null,
  student_province: item?.student_province ?? null,
  files: Array.isArray(item?.files) ? item.files.map(normalizeOutboundFile) : [],
});

export const isOutboundCallHistory = (item = {}) => item?.type == null || item.type === "" || String(item.type).toLowerCase() === "outgoing";

const filterOutboundCallItems = (items = []) => items.filter((item) => {
  const outbound = isOutboundCallHistory(item);
  if (!outbound && process.env.NODE_ENV === "development") console.warn("Unexpected non-outgoing item received from outbound-call-histories; row ignored.");
  return outbound;
});

const requiredOutboundRange = (startDate, endDate) => {
  const start_date = normalizeJalaliDateOnly(startDate);
  const end_date = normalizeJalaliDateOnly(endDate);
  if (!start_date || !end_date) throw new Error("بازه تاریخ تماس‌های خروجی الزامی است");
  if (start_date > end_date) throw new Error("تاریخ شروع نمی‌تواند بعد از تاریخ پایان باشد");
  return { start_date, end_date };
};

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
  username = "",
  tagId = "",
  support_form_id = "",
  adviser_id = "",
  super_adviser_id = "",
  signal,
} = {}) {
  const url = getApiUrl(API_ROUTES.voip.outboundCallHistories);
  const range = requiredOutboundRange(start_date, end_date);

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
      ...range,
      ssn: ssn?.trim?.() || undefined,
      username: username?.trim?.() || undefined,
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

  const items = filterOutboundCallItems(wrapped?.data || wrapped?.items || []).map(normalizeOutboundCallItem);
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
  username = "",
  tagId = "",
  support_form_id = "",
  adviser_id = "",
  super_adviser_id = "",
  sort_by = "",
  sort_order = "",
  onDownloadProgress,
  signal,
} = {}) {
  const url = getApiUrl(API_ROUTES.voip.exportOutboundCallHistories);
  const range = requiredOutboundRange(start_date, end_date);

  const response = await apiGet(url, {
    responseType: "blob",
    onDownloadProgress,
    signal,
    params: {
      type: type || undefined,
      q: q || undefined,
      disposition: disposition && disposition !== "ALL" ? disposition : undefined,
      ...range,
      ssn: ssn?.trim?.() || undefined,
      username: username?.trim?.() || undefined,
      tagId: tagId || undefined,
      support_form_id: support_form_id || undefined,
      adviser_id: adviser_id || undefined,
      super_adviser_id: super_adviser_id || undefined,
      sort_by: sort_by || undefined,
      sort_order: sort_order || undefined,
    },
  });

  return response?.data;
}

export async function exportOutboundCallHistoriesExcel({
  type = "",
  q = "",
  disposition = "ALL",
  start_date = "",
  end_date = "",
  ssn = "",
  username = "",
  tagId = "",
  support_form_id = "",
  adviser_id = "",
  super_adviser_id = "",
  sort_by = "",
  sort_order = "",
  signal,
} = {}) {
  const range = requiredOutboundRange(start_date, end_date);
  const cleanedQuery = q?.trim?.() || undefined;
  const params = Object.fromEntries(Object.entries({
    type: cleanedQuery && type ? type : undefined,
    q: cleanedQuery,
    disposition: disposition && disposition !== "ALL" ? disposition : undefined,
    ...range,
    ssn: ssn?.trim?.() || undefined,
    username: username?.trim?.() || undefined,
    tagId: tagId || undefined,
    support_form_id: support_form_id || undefined,
    adviser_id: adviser_id || undefined,
    super_adviser_id: super_adviser_id || undefined,
    sort_by: sort_by || undefined,
    sort_order: sort_order || undefined,
  }).filter(([, value]) => value !== undefined));
  const response = await apiGet(getApiUrl(API_ROUTES.voip.exportOutboundCallHistoriesExcel), {
    responseType: "blob",
    timeout: 0,
    silent: true,
    signal,
    params,
  });
  return {
    blob: response.data,
    contentDisposition: response.headers?.["content-disposition"] || "",
    contentType: response.headers?.["content-type"] || response.data?.type || "",
  };
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

const waitForCallTraceRetry = (signal) => new Promise((resolve, reject) => {
  const onAbort = () => {
    clearTimeout(timer);
    reject(Object.assign(new Error("canceled"), { code: "ERR_CANCELED" }));
  };
  const timer = setTimeout(() => {
    signal?.removeEventListener("abort", onAbort);
    resolve();
  }, 300);
  if (signal?.aborted) {
    onAbort();
    return;
  }
  signal?.addEventListener("abort", onAbort, { once: true });
});

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
  const params = {
    page,
    limit,
    search: search || undefined,
    status: status || undefined,
    adviserId: adviserId || undefined,
    studentId: studentId || undefined,
    supportFormId: supportFormId || undefined,
    from: from || undefined,
    to: to || undefined,
  };
  let response;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      response = await apiGet(getApiUrl(API_ROUTES.voip.callTraces), { signal, silent: true, params });
      break;
    } catch (error) {
      const timeout = error?.code === "ECONNABORTED" || error?.code === "ETIMEDOUT";
      if (!timeout || attempt === 1 || signal?.aborted) throw error;
      await waitForCallTraceRetry(signal);
    }
  }
  const data = response?.data?.data;
  const items = Array.isArray(data?.items) ? data.items : [];
  const meta = data?.meta || {};
  const normalizedPage = Number(meta.page) || page;
  const normalizedLimit = Number(meta.limit) || limit;
  const total = Number(meta.total) || 0;
  const lastPage = Math.max(1, Number(meta.lastPage) || 1);

  return {
    items,
    meta: {
      page: normalizedPage,
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

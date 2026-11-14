import { apiGet, apiPatch, apiPost } from "../helpers/httpClient.jsx";

const compact = (params = {}) => Object.fromEntries(
  Object.entries(params).filter(([, value]) => value !== "" && value != null),
);

const unwrap = (response) => response?.data?.data ?? response?.data ?? {};

const paginationResult = (response, page, limit) => {
  const payload = unwrap(response);
  const items = payload.items ?? payload.data ?? [];
  const meta = payload.meta ?? payload.pagination ?? {};
  return {
    items: Array.isArray(items) ? items : [],
    meta: {
      page: Number(meta.page ?? page),
      limit: Number(meta.limit ?? limit),
      total: Number(meta.total ?? items.length ?? 0),
      lastPage: Number(meta.lastPage ?? Math.max(1, Math.ceil(Number(meta.total ?? items.length ?? 0) / limit))),
    },
  };
};

export async function getManagedJobs(params = {}, signal) {
  const page = Number(params.page || 1);
  const limit = Number(params.limit || 20);
  const response = await apiGet("/managed-jobs", { params: compact(params), signal, silent: true });
  return paginationResult(response, page, limit);
}

export async function getManagedJob(key, signal) {
  const response = await apiGet(`/managed-jobs/${encodeURIComponent(key)}`, { signal, silent: true });
  return unwrap(response);
}

export async function updateManagedJob(key, changes) {
  const payload = {};
  if (typeof changes.enabled === "boolean") payload.enabled = changes.enabled;
  if (changes.intervalSeconds !== undefined) payload.intervalSeconds = Number(changes.intervalSeconds);
  if (changes.configuration !== undefined) payload.configuration = changes.configuration;
  const response = await apiPatch(`/managed-jobs/${encodeURIComponent(key)}`, payload, { silent: true });
  return unwrap(response);
}

export async function executeManagedJob(key, reason) {
  const response = await apiPost(`/managed-jobs/${encodeURIComponent(key)}/execute`, { reason: String(reason).trim() }, { silent: true });
  return unwrap(response);
}

export async function getManagedJobRuns(params = {}, signal) {
  const page = Number(params.page || 1);
  const limit = Number(params.limit || 20);
  const response = await apiGet("/managed-jobs/runs", { params: compact(params), signal, silent: true });
  return paginationResult(response, page, limit);
}

export async function getManagedJobRun(id, signal) {
  const response = await apiGet(`/managed-jobs/runs/${encodeURIComponent(id)}`, { signal, silent: true });
  return unwrap(response);
}

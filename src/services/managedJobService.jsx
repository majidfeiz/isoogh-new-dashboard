import { apiGet, apiPatch, apiPost } from "../helpers/httpClient.jsx";

const compact = (params = {}) => Object.fromEntries(
  Object.entries(params).filter(([, value]) => value !== "" && value != null),
);

const unwrap = (response) => response?.data?.data ?? response?.data ?? {};

const booleanValue = (value, fallback = false) => {
  if (typeof value === "boolean") return value;
  if (value === 1 || value === "1" || value === "true") return true;
  if (value === 0 || value === "0" || value === "false") return false;
  return fallback;
};

export const normalizeManagedJob = (job = {}) => {
  const normalized = {
    ...job,
    key: job.key ?? job.jobKey ?? job.job_key,
  };
  if (job.enabled !== undefined) normalized.enabled = booleanValue(job.enabled);
  if (job.effectiveEnabled !== undefined || job.effective_enabled !== undefined) {
    normalized.effectiveEnabled = booleanValue(job.effectiveEnabled ?? job.effective_enabled);
  }
  if (job.environmentEnabled !== undefined || job.environment_enabled !== undefined) {
    normalized.environmentEnabled = booleanValue(job.environmentEnabled ?? job.environment_enabled);
  }
  if (job.running !== undefined) normalized.running = booleanValue(job.running);
  return normalized;
};

const paginationResult = (response, page, limit) => {
  const payload = unwrap(response);
  const items = payload.items ?? payload.data ?? [];
  const meta = payload.meta ?? payload.pagination ?? {};
  return {
    items: Array.isArray(items) ? items.map(normalizeManagedJob) : [],
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
  return normalizeManagedJob(unwrap(response));
}

export async function updateManagedJob(key, changes) {
  const payload = {};
  if (typeof changes.enabled === "boolean") payload.enabled = changes.enabled;
  if (changes.intervalSeconds !== undefined) payload.intervalSeconds = Number(changes.intervalSeconds);
  if (changes.configuration !== undefined) payload.configuration = changes.configuration;
  const response = await apiPatch(`/managed-jobs/${encodeURIComponent(key)}`, payload, { silent: true });
  return normalizeManagedJob(unwrap(response));
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

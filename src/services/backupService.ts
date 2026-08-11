import { apiGet, apiPatch, apiPost } from "../helpers/httpClient.jsx";
import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx";
import { clearAuthData, getAccessToken } from "../helpers/authStorage.jsx";

export type BackupSection = "outbound_calls" | "call_recordings" | "support_form_answers";

export interface BackupProgress {
  id: number | string;
  status?: string;
  totalFiles?: number;
  processedFiles?: number;
  downloadedFiles?: number;
  failedFiles?: number;
  downloadedBytes?: number;
  currentFile?: string | null;
  percent?: number;
  [key: string]: unknown;
}

export interface BackupFile {
  id: number | string;
  name: string;
  size: number;
  schoolId: number | string;
  schoolName: string;
  historyId?: number | string;
  downloadUrl: string;
}

export type BackupReportSection = "outbound_calls" | "support_form_answers";

const unwrap = <T>(response: any): T => (response?.data?.data ?? response?.data) as T;

const firstDefined = (...values: any[]) => values.find((value) => value !== undefined && value !== null);

export function normalizeBackupProgress(value: any): BackupProgress {
  const raw = value?.job ?? value?.backup ?? value?.resource ?? value ?? {};
  const nested = [raw, raw.progress, raw.snapshot, raw.stats, raw.counters]
    .filter((item) => item && typeof item === "object");
  const pick = (...keys: string[]) => firstDefined(
    ...nested.flatMap((source) => keys.map((key) => source[key])),
  );
  const totalFiles = Number(firstDefined(pick("totalFiles", "total_files", "filesTotal", "files_total", "total"), 0));
  const processedFiles = Number(firstDefined(pick("processedFiles", "processed_files", "filesProcessed", "files_processed", "processed"), 0));
  const backendPercent = pick("percent", "progressPercent", "progress_percent");
  const currentFile = firstDefined(pick("currentFile", "current_file"), null);
  return {
    ...raw,
    id: pick("id", "jobId", "job_id"),
    status: pick("status", "state"),
    totalFiles,
    processedFiles,
    downloadedFiles: Number(firstDefined(pick("downloadedFiles", "downloaded_files", "filesDownloaded", "files_downloaded"), 0)),
    failedFiles: Number(firstDefined(pick("failedFiles", "failed_files", "filesFailed", "files_failed"), 0)),
    downloadedBytes: Number(firstDefined(pick("downloadedBytes", "downloaded_bytes", "bytesDownloaded", "bytes_downloaded"), 0)),
    currentFile: currentFile && typeof currentFile === "object"
      ? String(firstDefined(currentFile.name, currentFile.fileName, currentFile.file_name, currentFile.id, "—"))
      : currentFile,
    percent: Number(firstDefined(
      backendPercent,
      totalFiles > 0 ? Math.min(100, (processedFiles / totalFiles) * 100) : 0,
    )),
  };
}

export function mergeBackupProgress(previous: BackupProgress, incoming: BackupProgress): BackupProgress {
  const totalFiles = Math.max(Number(previous.totalFiles || 0), Number(incoming.totalFiles || 0));
  const processedFiles = Math.max(Number(previous.processedFiles || 0), Number(incoming.processedFiles || 0));
  const calculatedPercent = totalFiles > 0 ? (processedFiles / totalFiles) * 100 : 0;
  return {
    ...previous,
    ...incoming,
    id: incoming.id ?? previous.id,
    status: incoming.status ?? previous.status,
    totalFiles,
    processedFiles,
    downloadedFiles: Math.max(Number(previous.downloadedFiles || 0), Number(incoming.downloadedFiles || 0)),
    failedFiles: Math.max(Number(previous.failedFiles || 0), Number(incoming.failedFiles || 0)),
    downloadedBytes: Math.max(Number(previous.downloadedBytes || 0), Number(incoming.downloadedBytes || 0)),
    currentFile: incoming.currentFile ?? previous.currentFile ?? null,
    percent: Math.max(Number(previous.percent || 0), Number(incoming.percent || 0), calculatedPercent),
  };
}

export function normalizeBackupFile(value: any): BackupFile {
  const raw = value?.file ?? value ?? {};
  return {
    ...raw,
    id: firstDefined(raw.id, raw.fileId, raw.file_id),
    name: String(firstDefined(raw.name, raw.fileName, raw.file_name, "recording")),
    size: Number(firstDefined(raw.size, raw.fileSize, raw.file_size, 0)),
    schoolId: firstDefined(raw.schoolId, raw.school_id),
    schoolName: String(firstDefined(raw.schoolName, raw.school_name, "school")),
    historyId: firstDefined(raw.historyId, raw.history_id),
    downloadUrl: String(firstDefined(raw.downloadUrl, raw.download_url, "")),
  };
}

export const TEMPORARY_BACKUP_ERROR_MESSAGE =
  "ارتباط با پایگاه داده موقتاً برقرار نیست؛ چند لحظه دیگر دوباره تلاش کنید";

export function isTemporaryBackupError(error: any) {
  return error?.response?.status === 503 || error?.status === 503;
}

export function retryAfterMilliseconds(error: any) {
  const headers = error?.response?.headers ?? error?.headers;
  const raw = headers?.get?.("retry-after") ?? headers?.["retry-after"] ?? headers?.["Retry-After"];
  if (raw == null || raw === "") return 0;
  const seconds = Number(raw);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const date = Date.parse(String(raw));
  return Number.isFinite(date) ? Math.max(0, date - Date.now()) : 0;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function parseStreamingEndpointError(response: Response) {
  let message = `خطا در دریافت خروجی (${response.status})`;
  try {
    const text = await response.text();
    const data = JSON.parse(text);
    const value = data?.message ?? data?.error;
    if (Array.isArray(value)) message = value.filter(Boolean).join("، ");
    else if (value) message = String(value);
  } catch {
    // Binary or empty error responses use the safe Persian status message.
  }
  const error = new Error(message) as Error & { status?: number; headers?: Headers };
  error.status = response.status;
  error.headers = response.headers;
  return error;
}

export async function executeBackup(payload: { school_ids?: number[]; sections: BackupSection[] }) {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const job = normalizeBackupProgress(unwrap<any>(await apiPost(
        getApiUrl(API_ROUTES.backups.execute),
        payload,
        { silent: true },
      )));
      if (job?.id == null || job.id === "") throw new Error("شناسه بک‌آپ از سرور دریافت نشد");
      return job;
    } catch (error) {
      lastError = error;
      if (!isTemporaryBackupError(error) || attempt === 2) break;
      const backoff = 500 * 2 ** attempt;
      await wait(Math.max(backoff, retryAfterMilliseconds(error)));
    }
  }
  if (isTemporaryBackupError(lastError)) {
    const error = lastError as any;
    error.message = TEMPORARY_BACKUP_ERROR_MESSAGE;
    error.temporaryBackupError = true;
  }
  throw lastError;
}

export async function getBackup(id: BackupProgress["id"]) {
  return normalizeBackupProgress(unwrap<any>(await apiGet(getApiUrl(API_ROUTES.backups.detail(id)), { silent: true })));
}

export async function getNextBackupFile(id: BackupProgress["id"], signal?: AbortSignal) {
  const response = await apiGet(getApiUrl(API_ROUTES.backups.nextFile(id)), {
    signal,
    silent: true,
    validateStatus: (status: number) => (status >= 200 && status < 300) || status === 204,
  });
  return response.status === 204 ? null : normalizeBackupFile(unwrap<any>(response));
}

export async function ackBackupFile(id: BackupProgress["id"], payload: {
  file_id: BackupFile["id"];
  outcome: "downloaded" | "failed";
  bytes: number;
}, signal?: AbortSignal) {
  const fileId = Number(payload.file_id);
  if (!Number.isInteger(fileId) || fileId < 1) throw new Error("شناسه فایل بک‌آپ معتبر نیست");
  return normalizeBackupProgress(unwrap<any>(await apiPatch(
    getApiUrl(API_ROUTES.backups.ackFile(id)),
    { ...payload, file_id: fileId },
    { signal, silent: true },
  )));
}

export async function backupAction(id: BackupProgress["id"], action: "pause" | "resume" | "cancel" | "finalize") {
  return normalizeBackupProgress(unwrap<any>(await apiPatch(getApiUrl(API_ROUTES.backups[action](id)), {})));
}

export async function fetchProtectedStream(path: string, signal?: AbortSignal) {
  const token = getAccessToken();
  const response = await fetch(getApiUrl(path), {
    signal,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}`) as Error & { status?: number };
    error.status = response.status;
    if (response.status === 503) {
      error.message = TEMPORARY_BACKUP_ERROR_MESSAGE;
      (error as any).temporaryBackupError = true;
      (error as any).headers = response.headers;
    }
    throw error;
  }
  if (!response.body) throw new Error("پاسخ قابل پخش از سرور دریافت نشد");
  return response;
}

export async function fetchBackupReportStream(path: string, signal?: AbortSignal): Promise<Response> {
  const token = getAccessToken();
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(getApiUrl(path), {
        signal,
        cache: "no-store",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw await parseStreamingEndpointError(response);

      const contentType = String(response.headers.get("Content-Type") || "").toLowerCase();
      if (!contentType.includes("text/csv")) throw new Error("فرمت پاسخ گزارش معتبر نیست");
      if (!response.body) throw new Error("پاسخ قابل پخش گزارش از سرور دریافت نشد");
      return response;
    } catch (error: any) {
      lastError = error;
      if (error?.name === "AbortError") throw error;
      if (error?.status === 401) {
        clearAuthData();
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          window.location.replace("/login");
        }
        throw error;
      }
      if (![502, 503].includes(Number(error?.status)) || attempt === 2) throw error;
      await wait(Math.max(500 * 2 ** attempt, retryAfterMilliseconds(error)));
    }
  }
  throw lastError;
}

export async function fetchStorageStream(url: string, signal?: AbortSignal) {
  let response: Response;
  try {
    response = await fetch(url, { signal, credentials: "omit", mode: "cors" });
  } catch (cause) {
    const error = new Error(
      "مرورگر دریافت فایل از فضای ذخیره‌سازی را مسدود کرد؛ تنظیمات CORS دامنه storage را بررسی کنید",
    ) as Error & { storageCorsError?: boolean; cause?: unknown };
    error.storageCorsError = true;
    error.cause = cause;
    throw error;
  }
  if (!response.ok || !response.body) throw new Error(`خطا در دریافت فایل (${response.status})`);
  return response;
}

import { apiGet, apiPatch, apiPost } from "../helpers/httpClient.jsx";
import { API_ROUTES, getApiUrl } from "../helpers/apiRoutes.jsx";
import { getAccessToken } from "../helpers/authStorage.jsx";

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

const unwrap = <T>(response: any): T => (response?.data?.data ?? response?.data) as T;

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

export async function executeBackup(payload: { school_ids?: number[]; sections: BackupSection[] }) {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const job = unwrap<BackupProgress>(await apiPost(
        getApiUrl(API_ROUTES.backups.execute),
        payload,
        { silent: true },
      ));
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
  return unwrap<BackupProgress>(await apiGet(getApiUrl(API_ROUTES.backups.detail(id)), { silent: true }));
}

export async function getNextBackupFile(id: BackupProgress["id"], signal?: AbortSignal) {
  const response = await apiGet(getApiUrl(API_ROUTES.backups.nextFile(id)), {
    signal,
    silent: true,
    validateStatus: (status: number) => (status >= 200 && status < 300) || status === 204,
  });
  return response.status === 204 ? null : unwrap<BackupFile>(response);
}

export async function ackBackupFile(id: BackupProgress["id"], payload: {
  file_id: BackupFile["id"];
  outcome: "downloaded" | "failed";
  bytes: number;
}, signal?: AbortSignal) {
  const fileId = Number(payload.file_id);
  if (!Number.isInteger(fileId) || fileId < 1) throw new Error("شناسه فایل بک‌آپ معتبر نیست");
  return unwrap<BackupProgress>(await apiPatch(
    getApiUrl(API_ROUTES.backups.ackFile(id)),
    { ...payload, file_id: fileId },
    { signal, silent: true },
  ));
}

export async function backupAction(id: BackupProgress["id"], action: "pause" | "resume" | "cancel" | "finalize") {
  return unwrap<BackupProgress>(await apiPatch(getApiUrl(API_ROUTES.backups[action](id)), {}));
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

export async function fetchStorageStream(url: string, signal?: AbortSignal) {
  const response = await fetch(url, { signal, credentials: "omit" });
  if (!response.ok || !response.body) throw new Error(`خطا در دریافت فایل (${response.status})`);
  return response;
}

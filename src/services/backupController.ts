import { AUTH_CLEARED_EVENT } from "../helpers/authStorage.jsx";
import { API_ROUTES } from "../helpers/apiRoutes.jsx";
import {
  ackBackupFile,
  backupAction,
  fetchBackupReportStream,
  fetchStorageStream,
  getBackup,
  getNextBackupFile,
  mergeBackupProgress,
  retryAfterMilliseconds,
  type BackupFile,
  type BackupProgress,
  type BackupReportSection,
  type BackupSection,
} from "./backupService";

export interface BackupFailure {
  fileId: BackupFile["id"];
  name: string;
  message: string;
  at: string;
}

export interface BackupManifest {
  version: 1;
  jobId: BackupProgress["id"];
  schoolIds: number[];
  sections: BackupSection[];
  snapshot: BackupProgress;
  progress: BackupProgress;
  lastAcknowledgedFileId: BackupFile["id"] | null;
  failures: BackupFailure[];
  reports: Partial<Record<BackupReportSection, BackupReportProgress>>;
  startedAt: string;
  updatedAt: string;
}

export type BackupReportStatus = "idle" | "connecting" | "streaming" | "completed" | "failed";
export interface BackupReportProgress {
  status: BackupReportStatus;
  filename: string;
  bytes: number;
  error?: string;
}

type Listener = (state: BackupProgress, metrics: {
  bytesPerSecond: number;
  etaSeconds: number | null;
  reports: Record<BackupReportSection, BackupReportProgress>;
}) => void;
type FileHandleWithMove = FileSystemFileHandle & { move?: (name: string) => Promise<void> };

const REPORTS: Record<BackupReportSection, { filename: string; api: (id: BackupProgress["id"]) => string }> = {
  outbound_calls: { filename: "outbound-calls.csv", api: API_ROUTES.backups.exportCalls },
  support_form_answers: { filename: "support-form-answers.csv", api: API_ROUTES.backups.exportAnswers },
};

const initialReportProgress = (): Record<BackupReportSection, BackupReportProgress> => ({
  outbound_calls: { status: "idle", filename: `reports/${REPORTS.outbound_calls.filename}`, bytes: 0 },
  support_form_answers: { status: "idle", filename: `reports/${REPORTS.support_form_answers.filename}`, bytes: 0 },
});

const activeJobs = new Map<string, Promise<void>>();
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const sleepWithSignal = (ms: number, signal: AbortSignal) => new Promise<void>((resolve, reject) => {
  if (signal.aborted) return reject(new DOMException("Aborted", "AbortError"));
  const timeout = window.setTimeout(() => {
    signal.removeEventListener("abort", onAbort);
    resolve();
  }, ms);
  const onAbort = () => {
    window.clearTimeout(timeout);
    reject(new DOMException("Aborted", "AbortError"));
  };
  signal.addEventListener("abort", onAbort, { once: true });
});
const safeName = (value: unknown, fallback = "file") =>
  String(value || fallback).normalize("NFKC").replace(/[\\/:*?"<>|\u0000-\u001f]/g, "-").replace(/^\.+|\.+$/g, "").slice(0, 140) || fallback;

function isRetryableAckError(error: any) {
  if (error?.response?.status === 503) return true;
  return !error?.response && (
    error?.code === "ERR_NETWORK" ||
    error?.code === "ECONNABORTED" ||
    error?.message === "Network Error" ||
    Boolean(error?.request)
  );
}

async function streamToFile(
  response: Response,
  handle: FileSystemFileHandle,
  signal: AbortSignal,
  onProgress?: (bytes: number) => void,
) {
  const reader = response.body!.getReader();
  const writable = await handle.createWritable();
  let bytes = 0;
  try {
    while (true) {
      if (signal.aborted) throw new DOMException("Aborted", "AbortError");
      const { done, value } = await reader.read();
      if (done) break;
      await writable.write(value);
      bytes += value.byteLength;
      onProgress?.(bytes);
    }
    await writable.close();
    return bytes;
  } catch (error) {
    await reader.cancel().catch(() => undefined);
    await writable.abort().catch(() => undefined);
    throw error;
  }
}

async function writeJson(directory: FileSystemDirectoryHandle, manifest: BackupManifest) {
  const file = await directory.getFileHandle("backup-manifest.json", { create: true });
  const writable = await file.createWritable();
  await writable.write(JSON.stringify(manifest, null, 2));
  await writable.close();
}

async function readManifest(directory: FileSystemDirectoryHandle) {
  try {
    const handle = await directory.getFileHandle("backup-manifest.json");
    const file = await handle.getFile();
    return JSON.parse(await file.text()) as Partial<BackupManifest>;
  } catch {
    return null;
  }
}

function reportFilename(response: Response, fallback: string) {
  const disposition = response.headers.get("Content-Disposition") || "";
  const utf8 = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  const regular = disposition.match(/filename="?([^";]+)"?/i)?.[1];
  let candidate = fallback;
  try { candidate = decodeURIComponent(utf8 || regular || fallback); } catch { candidate = regular || fallback; }
  const sanitized = safeName(candidate, fallback);
  return sanitized.toLowerCase().endsWith(".csv") ? sanitized : fallback;
}

async function streamReportToFile(
  response: Response,
  handle: FileSystemFileHandle,
  signal: AbortSignal,
  onProgress: (bytes: number) => void,
) {
  const reader = response.body!.getReader();
  const writable = await handle.createWritable();
  let bytes = 0;
  try {
    while (true) {
      if (signal.aborted) throw new DOMException("Aborted", "AbortError");
      const { done, value } = await reader.read();
      if (done) break;
      await writable.write(value);
      bytes += value.byteLength;
      onProgress(bytes);
    }
    await writable.close();
    return bytes;
  } catch (error) {
    await reader.cancel().catch(() => undefined);
    await writable.abort().catch(() => undefined);
    throw error;
  }
}

export class BackupController {
  private abortController: AbortController | null = null;
  private pauseRequested = false;
  private listeners = new Set<Listener>();
  private samples: Array<{ at: number; bytes: number }> = [];
  private reportProgress = initialReportProgress();

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener(AUTH_CLEARED_EVENT, () => this.stopLocal());
      window.addEventListener("beforeunload", () => this.stopLocal());
    }
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  private emit(state: BackupProgress) {
    const now = Date.now();
    const bytes = Number(state.downloadedBytes || 0);
    this.samples.push({ at: now, bytes });
    this.samples = this.samples.filter((sample) => now - sample.at <= 30000);
    const first = this.samples[0];
    const seconds = first ? Math.max((now - first.at) / 1000, 0.001) : 0;
    const bytesPerSecond = first && seconds ? Math.max(0, (bytes - first.bytes) / seconds) : 0;
    const percent = Number(state.percent || 0);
    const etaSeconds = bytesPerSecond > 0 && percent > 0 ? Math.round((seconds * (100 - percent)) / percent) : null;
    this.listeners.forEach((listener) => listener(state, {
      bytesPerSecond,
      etaSeconds,
      reports: { ...this.reportProgress },
    }));
  }

  stopLocal() {
    this.abortController?.abort();
    this.abortController = null;
  }

  requestPause() {
    this.pauseRequested = true;
  }

  async cancel(jobId: BackupProgress["id"]) {
    this.stopLocal();
    const running = activeJobs.get(String(jobId));
    if (running) {
      try {
        await running;
      } catch (error) {
        if (!(error instanceof DOMException) || error.name !== "AbortError") {
          // The server-side cancel remains authoritative even if the local loop
          // stopped because its in-flight request failed during cancellation.
        }
      }
    }
    const state = await backupAction(jobId, "cancel");
    this.emit(state);
    return state;
  }

  async pause(jobId: BackupProgress["id"]) {
    this.requestPause();
    const running = activeJobs.get(String(jobId));
    if (running) {
      try { await running; } catch (error) {
        if (!this.pauseRequested) throw error;
      }
    }
    const state = await backupAction(jobId, "pause");
    this.emit(state);
    return state;
  }

  async run(options: {
    job: BackupProgress;
    directory: FileSystemDirectoryHandle;
    schoolIds: number[];
    sections: BackupSection[];
    acknowledgeFailures: boolean;
    resume?: boolean;
  }) {
    const key = String(options.job.id);
    if (activeJobs.has(key)) throw new Error("این بک‌آپ هم‌اکنون در حال اجرا است");
    const task = this.withCrossTabLock(key, async () => this.process(options));
    activeJobs.set(key, task);
    try { await task; } finally { activeJobs.delete(key); }
  }

  private async withCrossTabLock(key: string, task: () => Promise<void>) {
    if (navigator.locks?.request) {
      let acquired = false;
      await navigator.locks.request(`backup-job-${key}`, { ifAvailable: true }, async (lock) => {
        if (!lock) return;
        acquired = true;
        await task();
      });
      if (!acquired) throw new Error("این بک‌آپ در تب دیگری در حال اجرا است");
      return;
    }

    const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(`backup-job-${key}`) : null;
    let occupied = false;
    channel?.addEventListener("message", (event) => {
      if (event.data === "running?") channel.postMessage("running");
      if (event.data === "running") occupied = true;
    });
    channel?.postMessage("running?");
    await sleep(180);
    if (occupied) {
      channel?.close();
      throw new Error("این بک‌آپ در تب دیگری در حال اجرا است");
    }
    try { await task(); } finally { channel?.close(); }
  }

  private async process(options: Parameters<BackupController["run"]>[0]) {
    this.abortController = new AbortController();
    this.pauseRequested = false;
    this.samples = [];
    const signal = this.abortController.signal;
    const root = await options.directory.getDirectoryHandle(`isoogh-backup-${options.job.id}`, { create: true });
    const reports = await root.getDirectoryHandle("reports", { create: true });
    const recordings = await root.getDirectoryHandle("recordings", { create: true });
    const now = new Date().toISOString();
    const storedManifest = await readManifest(root);
    this.reportProgress = {
      ...initialReportProgress(),
      ...(storedManifest?.reports || {}),
    };
    const manifest: BackupManifest = {
      ...(storedManifest as BackupManifest || {}),
      version: 1,
      jobId: options.job.id,
      schoolIds: options.schoolIds,
      sections: options.sections,
      snapshot: options.job,
      progress: options.job,
      lastAcknowledgedFileId: storedManifest?.lastAcknowledgedFileId ?? null,
      failures: storedManifest?.failures || [],
      reports: { ...this.reportProgress },
      startedAt: storedManifest?.startedAt || now,
      updatedAt: now,
    };
    this.emit(options.job);

    if (options.resume) {
      const state = await backupAction(options.job.id, "resume");
      manifest.progress = mergeBackupProgress(manifest.progress, state);
      this.emit(manifest.progress);
    }

    for (const section of ["outbound_calls", "support_form_answers"] as BackupReportSection[]) {
      if (!options.sections.includes(section)) continue;
      if (this.reportProgress[section].status === "completed") {
        try {
          const storedFilename = this.reportProgress[section].filename.split("/").pop() || REPORTS[section].filename;
          const existing = await reports.getFileHandle(storedFilename);
          const file = await existing.getFile();
          if (file.size === this.reportProgress[section].bytes && file.size > 0) continue;
        } catch {
          // Missing or changed local reports are downloaded again without scanning the directory.
        }
      }
      await this.writeReport(section, options.job.id, reports, root, manifest, signal);
    }
    await writeJson(root, manifest);

    if (options.sections.includes("call_recordings")) {
      while (!signal.aborted && !this.pauseRequested) {
        if (Number(manifest.progress.totalFiles || 0) === 0) {
          try {
            const refreshed = await getBackup(options.job.id);
            manifest.progress = mergeBackupProgress(manifest.progress, refreshed);
            this.emit(manifest.progress);
          } catch {
            // Progress refresh is best-effort; the queue endpoints remain authoritative.
          }
        }
        const file = await getNextBackupFile(options.job.id, signal);
        if (!file) break;
        this.emit({ ...manifest.progress, currentFile: file.name });
        let bytes = 0;
        let outcome: "downloaded" | "failed" = "downloaded";
        try {
          const baseBytes = Number(manifest.progress.downloadedBytes || 0);
          bytes = await this.downloadWithRetry(file, recordings, signal, (currentBytes) => {
            const totalFiles = Number(manifest.progress.totalFiles || 0);
            const processedFiles = Number(manifest.progress.processedFiles || 0);
            const fileFraction = Number(file.size || 0) > 0
              ? Math.min(1, currentBytes / Number(file.size))
              : 0;
            this.emit({
              ...manifest.progress,
              currentFile: file.name,
              downloadedBytes: baseBytes + currentBytes,
              percent: totalFiles > 0
                ? Math.min(100, ((processedFiles + fileFraction) / totalFiles) * 100)
                : Number(manifest.progress.percent || 0),
            });
          });
        } catch (error) {
          if (signal.aborted) throw error;
          if (!options.acknowledgeFailures) throw error;
          const failure = { fileId: file.id, name: safeName(file.name), message: error instanceof Error ? error.message : "خطای نامشخص", at: new Date().toISOString() };
          manifest.failures.push(failure);
          outcome = "failed";
          bytes = 0;
        }

        const state = await this.ackWithRetry(options.job.id, {
          file_id: file.id,
          outcome,
          bytes,
        }, signal);
        manifest.progress = mergeBackupProgress(manifest.progress, state);
        manifest.lastAcknowledgedFileId = file.id;
        manifest.updatedAt = new Date().toISOString();
        await writeJson(root, manifest);
        this.emit(manifest.progress);
      }
    }

    if (!signal.aborted && !this.pauseRequested) {
      const state = await backupAction(options.job.id, "finalize");
      manifest.progress = mergeBackupProgress(manifest.progress, state);
      manifest.updatedAt = new Date().toISOString();
      await writeJson(root, manifest);
      this.emit(manifest.progress);
    }
    this.abortController = null;
  }

  private async writeReport(
    section: BackupReportSection,
    jobId: BackupProgress["id"],
    directory: FileSystemDirectoryHandle,
    root: FileSystemDirectoryHandle,
    manifest: BackupManifest,
    signal: AbortSignal,
  ) {
    const config = REPORTS[section];
    const update = async (progress: BackupReportProgress) => {
      this.reportProgress = { ...this.reportProgress, [section]: progress };
      manifest.reports = { ...manifest.reports, [section]: progress };
      manifest.updatedAt = new Date().toISOString();
      this.emit(manifest.progress);
      await writeJson(root, manifest);
    };

    await update({ status: "connecting", filename: `reports/${config.filename}`, bytes: 0 });
    try {
      const response = await fetchBackupReportStream(config.api(jobId), signal);
      const filename = reportFilename(response, config.filename);
      await update({ status: "streaming", filename: `reports/${filename}`, bytes: 0 });
      const file = await directory.getFileHandle(filename, { create: true });
      const bytes = await streamReportToFile(response, file, signal, (writtenBytes) => {
        const progress = { status: "streaming" as const, filename: `reports/${filename}`, bytes: writtenBytes };
        this.reportProgress = { ...this.reportProgress, [section]: progress };
        manifest.reports = { ...manifest.reports, [section]: progress };
        this.emit(manifest.progress);
      });
      await update({ status: "completed", filename: `reports/${filename}`, bytes });
    } catch (error) {
      if ((error as any)?.name === "AbortError") throw error;
      await update({
        status: "failed",
        filename: `reports/${config.filename}`,
        bytes: 0,
        error: error instanceof Error ? error.message : "ذخیره گزارش ناموفق بود",
      });
      throw error;
    }
  }

  private async downloadWithRetry(
    file: BackupFile,
    root: FileSystemDirectoryHandle,
    signal: AbortSignal,
    onProgress?: (bytes: number) => void,
  ) {
    let lastError: unknown;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try { return await this.downloadFile(file, root, signal, onProgress); }
      catch (error) {
        lastError = error;
        if (signal.aborted || attempt === 3) break;
        await sleep(500 * 2 ** (attempt - 1));
      }
    }
    throw lastError;
  }

  private async ackWithRetry(
    jobId: BackupProgress["id"],
    payload: { file_id: BackupFile["id"]; outcome: "downloaded" | "failed"; bytes: number },
    signal: AbortSignal,
  ) {
    let attempt = 0;
    while (!signal.aborted) {
      try {
        return await ackBackupFile(jobId, payload, signal);
      } catch (error) {
        if (signal.aborted || !isRetryableAckError(error)) {
          if (error && typeof error === "object") (error as any).backupAckError = true;
          throw error;
        }
        const backoff = Math.min(30000, 1000 * 2 ** Math.min(attempt, 5));
        attempt += 1;
        await sleepWithSignal(Math.max(backoff, retryAfterMilliseconds(error)), signal);
      }
    }
    throw new DOMException("Aborted", "AbortError");
  }

  private async downloadFile(
    file: BackupFile,
    root: FileSystemDirectoryHandle,
    signal: AbortSignal,
    onProgress?: (bytes: number) => void,
  ) {
    const school = await root.getDirectoryHandle(`${file.schoolId}-${safeName(file.schoolName, "school")}`, { create: true });
    const finalName = `${file.id}-${safeName(file.name)}`;
    try {
      const existing = await school.getFileHandle(finalName);
      const existingFile = await existing.getFile();
      if (existingFile.size === Number(file.size)) return existingFile.size;
    } catch (error) {
      if (!(error instanceof DOMException) || error.name !== "NotFoundError") throw error;
    }

    const canMove = typeof FileSystemFileHandle !== "undefined" && "move" in FileSystemFileHandle.prototype;
    const targetName = canMove ? `${file.id}.part` : finalName;
    const response = await fetchStorageStream(file.downloadUrl, signal);
    const target = await school.getFileHandle(targetName, { create: true }) as FileHandleWithMove;
    let bytes = 0;
    try {
      bytes = await streamToFile(response, target, signal, onProgress);
    } catch (error) {
      if (canMove) await school.removeEntry(targetName).catch(() => undefined);
      throw error;
    }
    if (canMove) {
      if (target.move) {
        try {
          await target.move(finalName);
          return bytes;
        } catch {
          // Some external-volume providers expose move() but reject it at runtime.
        }
      }
      const part = await target.getFile();
      const finalHandle = await school.getFileHandle(finalName, { create: true });
      await streamToFile({ body: part.stream() } as Response, finalHandle, signal);
      await school.removeEntry(targetName);
      return bytes;
    }
    return bytes;
  }
}

export const backupController = new BackupController();
export { isRetryableAckError, reportFilename, safeName, streamReportToFile, streamToFile };

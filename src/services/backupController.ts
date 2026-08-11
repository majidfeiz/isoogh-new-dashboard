import { AUTH_CLEARED_EVENT } from "../helpers/authStorage.jsx";
import { API_ROUTES } from "../helpers/apiRoutes.jsx";
import {
  ackBackupFile,
  backupAction,
  fetchProtectedStream,
  fetchStorageStream,
  getNextBackupFile,
  retryAfterMilliseconds,
  type BackupFile,
  type BackupProgress,
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
  startedAt: string;
  updatedAt: string;
}

type Listener = (state: BackupProgress, metrics: { bytesPerSecond: number; etaSeconds: number | null }) => void;
type FileHandleWithMove = FileSystemFileHandle & { move?: (name: string) => Promise<void> };

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

async function streamToFile(response: Response, handle: FileSystemFileHandle, signal: AbortSignal) {
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

export class BackupController {
  private abortController: AbortController | null = null;
  private pauseRequested = false;
  private listeners = new Set<Listener>();
  private samples: Array<{ at: number; bytes: number }> = [];

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
    this.listeners.forEach((listener) => listener(state, { bytesPerSecond, etaSeconds }));
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
    const manifest: BackupManifest = {
      version: 1,
      jobId: options.job.id,
      schoolIds: options.schoolIds,
      sections: options.sections,
      snapshot: options.job,
      progress: options.job,
      lastAcknowledgedFileId: null,
      failures: [],
      startedAt: now,
      updatedAt: now,
    };

    if (options.resume) {
      const state = await backupAction(options.job.id, "resume");
      manifest.progress = state;
      this.emit(state);
    } else {
      if (options.sections.includes("outbound_calls")) await this.writeReport(reports, "calls.xlsx", API_ROUTES.backups.exportCalls(options.job.id), signal);
      if (options.sections.includes("support_form_answers")) await this.writeReport(reports, "answers.xlsx", API_ROUTES.backups.exportAnswers(options.job.id), signal);
      await writeJson(root, manifest);
    }

    if (options.sections.includes("call_recordings")) {
      while (!signal.aborted && !this.pauseRequested) {
        const file = await getNextBackupFile(options.job.id, signal);
        if (!file) break;
        let bytes = 0;
        let outcome: "downloaded" | "failed" = "downloaded";
        try {
          bytes = await this.downloadWithRetry(file, recordings, signal);
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
        manifest.progress = state;
        manifest.lastAcknowledgedFileId = file.id;
        manifest.updatedAt = new Date().toISOString();
        await writeJson(root, manifest);
        this.emit(state);
      }
    }

    if (!signal.aborted && !this.pauseRequested) {
      const state = await backupAction(options.job.id, "finalize");
      manifest.progress = state;
      manifest.updatedAt = new Date().toISOString();
      await writeJson(root, manifest);
      this.emit(state);
    }
    this.abortController = null;
  }

  private async writeReport(directory: FileSystemDirectoryHandle, name: string, path: string, signal: AbortSignal) {
    const response = await fetchProtectedStream(path, signal);
    const file = await directory.getFileHandle(name, { create: true });
    await streamToFile(response, file, signal);
  }

  private async downloadWithRetry(file: BackupFile, root: FileSystemDirectoryHandle, signal: AbortSignal) {
    let lastError: unknown;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try { return await this.downloadFile(file, root, signal); }
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

  private async downloadFile(file: BackupFile, root: FileSystemDirectoryHandle, signal: AbortSignal) {
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
    const target = await school.getFileHandle(targetName, { create: true }) as FileHandleWithMove;
    const response = await fetchStorageStream(file.downloadUrl, signal);
    const bytes = await streamToFile(response, target, signal);
    if (canMove) {
      if (!target.move) throw new Error("مرورگر انتقال امن فایل موقت را پشتیبانی نمی‌کند");
      await target.move(finalName);
    }
    return bytes;
  }
}

export const backupController = new BackupController();
export { isRetryableAckError, safeName, streamToFile };

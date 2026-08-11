jest.mock("../helpers/httpClient.jsx", () => ({
  apiGet: jest.fn(), apiPatch: jest.fn(), apiPost: jest.fn(),
}));

import { TextDecoder, TextEncoder } from "util";
import { apiGet, apiPatch, apiPost } from "../helpers/httpClient.jsx";
import { ackBackupFile, executeBackup, fetchBackupReport, getNextBackupFile, mergeBackupProgress, normalizeBackupProgress, TEMPORARY_BACKUP_ERROR_MESSAGE } from "./backupService";

const mockedGet = apiGet as jest.Mock;
const mockedPatch = apiPatch as jest.Mock;
const mockedPost = apiPost as jest.Mock;

describe("backup queue API", () => {
  const originalFetch = global.fetch;

  beforeAll(() => {
    Object.assign(global, { TextDecoder, TextEncoder });
  });

  afterEach(() => {
    jest.clearAllMocks();
    global.fetch = originalFetch;
  });

  const binaryResponse = (options: { status?: number; contentType?: string; bytes?: number[]; retryAfter?: string } = {}) => {
    const status = options.status ?? 200;
    const headers = new Headers({
      "Content-Type": options.contentType || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ...(options.retryAfter == null ? {} : { "Retry-After": options.retryAfter }),
    });
    const bytes = new Uint8Array(options.bytes || [0x50, 0x4b, 3, 4]);
    return {
      ok: status >= 200 && status < 300,
      status,
      headers,
      arrayBuffer: async () => bytes.buffer,
    } as Response;
  };

  it("maps HTTP 204 to the end of the queue", async () => {
    mockedGet.mockResolvedValue({ status: 204 });
    await expect(getNextBackupFile(12)).resolves.toBeNull();
  });

  it.each([401, 403])("rejects protected queue status %s", async (status) => {
    mockedGet.mockRejectedValue({ response: { status } });
    await expect(getNextBackupFile(12)).rejects.toMatchObject({ response: { status } });
  });

  it("sends the ACK file identifier as a positive integer file_id", async () => {
    mockedPatch.mockResolvedValue({ data: { data: { id: 12 } } });
    await ackBackupFile(12, { file_id: "7", outcome: "downloaded", bytes: 42 });
    expect(mockedPatch).toHaveBeenCalledWith(
      "http://127.0.0.1:8040/backups/12/files/ack",
      { file_id: 7, outcome: "downloaded", bytes: 42 },
      { signal: undefined, silent: true },
    );
  });

  it("retries execute 503 three times, stays silent, and returns a Persian retryable error", async () => {
    mockedPost.mockRejectedValue({ response: { status: 503, headers: { "retry-after": "0" } } });

    await expect(executeBackup({ sections: ["call_recordings"] })).rejects.toMatchObject({
      message: TEMPORARY_BACKUP_ERROR_MESSAGE,
      temporaryBackupError: true,
    });

    expect(mockedPost).toHaveBeenCalledTimes(3);
    expect(mockedPost.mock.calls.every((call) => call[2]?.silent === true)).toBe(true);
  });

  it("normalizes snake_case progress returned by the backend", () => {
    expect(normalizeBackupProgress({ job: {
      id: 12,
      total_files: 100,
      processed_files: 25,
      downloaded_files: 24,
      failed_files: 1,
      downloaded_bytes: 523845,
      current_file: { file_name: "call.mp3" },
    } })).toEqual(expect.objectContaining({
      totalFiles: 100,
      processedFiles: 25,
      downloadedFiles: 24,
      failedFiles: 1,
      downloadedBytes: 523845,
      currentFile: "call.mp3",
      percent: 25,
    }));
  });

  it("reads counters nested under progress and preserves monotonic values across sparse ACKs", () => {
    const initial = normalizeBackupProgress({ id: 12, progress: {
      total_files: 100,
      processed_files: 25,
      downloaded_bytes: 523845,
    } });
    const sparseAck = normalizeBackupProgress({ id: 12, status: "running" });
    expect(mergeBackupProgress(initial, sparseAck)).toEqual(expect.objectContaining({
      totalFiles: 100,
      processedFiles: 25,
      downloadedBytes: 523845,
      percent: 25,
    }));
  });

  it("returns the raw XLSX bytes without JSON unwrapping", async () => {
    global.fetch = jest.fn().mockResolvedValue(binaryResponse()) as jest.Mock;

    await expect(fetchBackupReport("/backups/12/export/calls")).resolves.toMatchObject({
      bytes: new Uint8Array([0x50, 0x4b, 3, 4]),
    });
  });

  it("extracts a JSON API error instead of treating it as an XLSX file", async () => {
    const json = Array.from(new TextEncoder().encode(JSON.stringify({ message: "گزارش آماده نیست" })));
    global.fetch = jest.fn().mockResolvedValue(binaryResponse({ status: 400, contentType: "application/json", bytes: json })) as jest.Mock;

    await expect(fetchBackupReport("/backups/12/export/calls")).rejects.toThrow("گزارش آماده نیست");
  });

  it("retries a report response with status 503 at most three times", async () => {
    global.fetch = jest.fn().mockResolvedValue(binaryResponse({ status: 503, contentType: "application/json", bytes: [], retryAfter: "0" })) as jest.Mock;

    await expect(fetchBackupReport("/backups/12/export/calls")).rejects.toMatchObject({ status: 503 });
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });
});

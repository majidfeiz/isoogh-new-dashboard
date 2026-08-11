jest.mock("../helpers/httpClient.jsx", () => ({
  apiGet: jest.fn(), apiPatch: jest.fn(), apiPost: jest.fn(),
}));

import { apiGet, apiPatch, apiPost } from "../helpers/httpClient.jsx";
import { ackBackupFile, executeBackup, fetchBackupReportStream, getNextBackupFile, mergeBackupProgress, normalizeBackupProgress, TEMPORARY_BACKUP_ERROR_MESSAGE } from "./backupService";

const mockedGet = apiGet as jest.Mock;
const mockedPatch = apiPatch as jest.Mock;
const mockedPost = apiPost as jest.Mock;

describe("backup queue API", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    jest.clearAllMocks();
    global.fetch = originalFetch;
  });

  const streamResponse = (options: { status?: number; contentType?: string; errorText?: string; retryAfter?: string } = {}) => {
    const status = options.status ?? 200;
    const headers = new Headers({
      "Content-Type": options.contentType || "text/csv; charset=utf-8",
      ...(options.retryAfter == null ? {} : { "Retry-After": options.retryAfter }),
    });
    return {
      ok: status >= 200 && status < 300,
      status,
      headers,
      body: { getReader: jest.fn() },
      text: jest.fn(async () => options.errorText || ""),
      blob: jest.fn(() => { throw new Error("blob must not be called"); }),
      arrayBuffer: jest.fn(() => { throw new Error("arrayBuffer must not be called"); }),
    } as unknown as Response;
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

  it("returns the raw CSV response body without buffering it", async () => {
    const response = streamResponse();
    global.fetch = jest.fn().mockResolvedValue(response) as jest.Mock;

    await expect(fetchBackupReportStream("/backups/12/export/calls")).resolves.toBe(response);
    expect(response.blob).not.toHaveBeenCalled();
    expect(response.arrayBuffer).not.toHaveBeenCalled();
  });

  it("extracts a JSON API error instead of writing it as CSV", async () => {
    global.fetch = jest.fn().mockResolvedValue(streamResponse({ status: 400, contentType: "application/json", errorText: JSON.stringify({ message: "گزارش آماده نیست" }) })) as jest.Mock;

    await expect(fetchBackupReportStream("/backups/12/export/calls")).rejects.toThrow("گزارش آماده نیست");
  });

  it.each([502, 503])("retries a report response with status %s at most three times", async (status) => {
    global.fetch = jest.fn().mockResolvedValue(streamResponse({ status, contentType: "application/json", errorText: JSON.stringify({ message: "خطای موقت خروجی" }), retryAfter: "0" })) as jest.Mock;

    await expect(fetchBackupReportStream("/backups/12/export/calls")).rejects.toMatchObject({ status, message: "خطای موقت خروجی" });
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });
});

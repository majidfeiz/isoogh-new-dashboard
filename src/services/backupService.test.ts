jest.mock("../helpers/httpClient.jsx", () => ({
  apiGet: jest.fn(), apiPatch: jest.fn(), apiPost: jest.fn(),
}));

import { apiGet, apiPatch, apiPost } from "../helpers/httpClient.jsx";
import { ackBackupFile, executeBackup, getNextBackupFile, mergeBackupProgress, normalizeBackupProgress, TEMPORARY_BACKUP_ERROR_MESSAGE } from "./backupService";

const mockedGet = apiGet as jest.Mock;
const mockedPatch = apiPatch as jest.Mock;
const mockedPost = apiPost as jest.Mock;

describe("backup queue API", () => {
  afterEach(() => jest.clearAllMocks());

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
});

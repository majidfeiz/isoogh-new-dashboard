jest.mock("../helpers/httpClient.jsx", () => ({
  apiGet: jest.fn(), apiPatch: jest.fn(), apiPost: jest.fn(),
}));

import { apiGet, apiPatch, apiPost } from "../helpers/httpClient.jsx";
import { ackBackupFile, executeBackup, getNextBackupFile, TEMPORARY_BACKUP_ERROR_MESSAGE } from "./backupService";

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
});

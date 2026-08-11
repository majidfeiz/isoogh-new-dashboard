jest.mock("./backupService", () => ({
  ackBackupFile: jest.fn(),
  backupAction: jest.fn(),
  fetchProtectedStream: jest.fn(),
  fetchStorageStream: jest.fn(),
  getNextBackupFile: jest.fn(),
  retryAfterMilliseconds: jest.fn(() => 0),
}));

import { BackupController } from "./backupController";
import { ackBackupFile, backupAction, fetchStorageStream, getNextBackupFile } from "./backupService";

const mockedAck = ackBackupFile as jest.MockedFunction<typeof ackBackupFile>;
const mockedAction = backupAction as jest.MockedFunction<typeof backupAction>;
const mockedFetch = fetchStorageStream as jest.MockedFunction<typeof fetchStorageStream>;
const mockedNext = getNextBackupFile as jest.MockedFunction<typeof getNextBackupFile>;

function streamResponse() {
  let read = false;
  return { body: { getReader: () => ({
    read: async () => read ? { done: true } : (read = true, { done: false, value: new Uint8Array([1, 2, 3]) }),
    cancel: jest.fn().mockResolvedValue(undefined),
  }) } } as unknown as Response;
}

function directoryFixture() {
  const events: string[] = [];
  const writes: unknown[] = [];
  const writable = () => ({
    write: jest.fn(async (value) => { writes.push(value); events.push("write"); }),
    close: jest.fn(async () => { events.push("close"); }),
    abort: jest.fn(),
  });
  const fileHandle = { createWritable: jest.fn(async () => writable()), getFile: jest.fn() };
  const school = { getFileHandle: jest.fn(async (_name: string, options?: { create?: boolean }) => {
    if (!options?.create) {
      const error = new DOMException("missing", "NotFoundError");
      throw error;
    }
    return fileHandle;
  }) };
  const recordings = { getDirectoryHandle: jest.fn(async () => school) };
  const reports = { getFileHandle: jest.fn(async () => fileHandle) };
  const root = {
    getDirectoryHandle: jest.fn(async (name: string) => name === "reports" ? reports : recordings),
    getFileHandle: jest.fn(async () => fileHandle),
  };
  const directory = { getDirectoryHandle: jest.fn(async () => root) } as unknown as FileSystemDirectoryHandle;
  return { directory, events, writes, school };
}

describe("backup controller queue workflow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(navigator, "locks", {
      configurable: true,
      value: { request: jest.fn(async (_name, _options, callback) => callback({})) },
    });
    mockedAck.mockResolvedValue({ id: 12, processedFiles: 1, totalFiles: 1, downloadedBytes: 3 });
    mockedAction.mockResolvedValue({ id: 12, status: "completed" });
    mockedFetch.mockResolvedValue(streamResponse());
  });

  it("retries, ACKs only after close, writes a sanitized manifest, and finalizes on 204", async () => {
    const fixture = directoryFixture();
    mockedNext.mockResolvedValueOnce({ id: 7, name: "call.mp3", size: 3, schoolId: 2, schoolName: "مدرسه", downloadUrl: "https://secret.example/token" }).mockResolvedValueOnce(null);
    mockedFetch.mockRejectedValueOnce(new Error("network")).mockRejectedValueOnce(new Error("network")).mockResolvedValueOnce(streamResponse());
    mockedAck.mockImplementation(async () => {
      expect(fixture.events).toContain("close");
      return { id: 12, processedFiles: 1, totalFiles: 1, downloadedBytes: 3 };
    });

    await new BackupController().run({ job: { id: 12 }, directory: fixture.directory, schoolIds: [2], sections: ["call_recordings"], acknowledgeFailures: true });

    expect(mockedFetch).toHaveBeenCalledTimes(3);
    expect(mockedAck).toHaveBeenCalledWith(12, { file_id: 7, outcome: "downloaded", bytes: 3 }, expect.any(AbortSignal));
    expect(mockedAction).toHaveBeenLastCalledWith(12, "finalize");
    expect(JSON.stringify(fixture.writes)).not.toContain("secret.example");
  });

  it("allows only one loop per job", async () => {
    const fixture = directoryFixture();
    let release!: () => void;
    mockedNext.mockImplementationOnce(() => new Promise((resolve) => { release = () => resolve(null); }));
    const controller = new BackupController();
    const first = controller.run({ job: { id: 99 }, directory: fixture.directory, schoolIds: [], sections: ["call_recordings"], acknowledgeFailures: true });
    await new Promise((resolve) => setTimeout(resolve, 0));
    await expect(controller.run({ job: { id: 99 }, directory: fixture.directory, schoolIds: [], sections: ["call_recordings"], acknowledgeFailures: true })).rejects.toThrow("در حال اجرا");
    release();
    await first;
  });

  it("resume asks the server for next and never scans the directory", async () => {
    const fixture = directoryFixture();
    mockedNext.mockResolvedValueOnce(null);
    await new BackupController().run({ job: { id: 20 }, directory: fixture.directory, schoolIds: [], sections: ["call_recordings"], acknowledgeFailures: true, resume: true });
    expect(mockedAction).toHaveBeenCalledWith(20, "resume");
    expect(mockedNext).toHaveBeenCalledTimes(1);
    expect((fixture.directory as any).values).toBeUndefined();
  });

  it("retries a 503 ACK with the same file_id before requesting next", async () => {
    const fixture = directoryFixture();
    mockedNext
      .mockResolvedValueOnce({ id: 8, name: "call.mp3", size: 3, schoolId: 2, schoolName: "مدرسه", downloadUrl: "https://storage.example/file" })
      .mockResolvedValueOnce(null);
    mockedAck
      .mockRejectedValueOnce({ response: { status: 503, headers: { "retry-after": "0" } } })
      .mockResolvedValueOnce({ id: 12, processedFiles: 1, totalFiles: 1, downloadedBytes: 3 });

    await new BackupController().run({ job: { id: 12 }, directory: fixture.directory, schoolIds: [2], sections: ["call_recordings"], acknowledgeFailures: true });

    expect(mockedAck).toHaveBeenCalledTimes(2);
    expect(mockedAck.mock.calls[0][1].file_id).toBe(8);
    expect(mockedAck.mock.calls[1][1].file_id).toBe(8);
    expect(mockedAck.mock.invocationCallOrder[1]).toBeLessThan(mockedNext.mock.invocationCallOrder[1]);
  });

  it("fully stops the local loop before sending cancel to the backend", async () => {
    const fixture = directoryFixture();
    let localStopped = false;
    mockedNext.mockImplementationOnce((_id, signal) => new Promise((_resolve, reject) => {
      signal?.addEventListener("abort", () => {
        localStopped = true;
        reject(new DOMException("Aborted", "AbortError"));
      }, { once: true });
    }));
    mockedAction.mockImplementation(async (_id, action) => {
      if (action === "cancel") expect(localStopped).toBe(true);
      return { id: 44, status: "cancelled" };
    });
    const controller = new BackupController();
    const running = controller.run({ job: { id: 44 }, directory: fixture.directory, schoolIds: [], sections: ["call_recordings"], acknowledgeFailures: true });
    const runningExpectation = expect(running).rejects.toMatchObject({ name: "AbortError" });
    await new Promise((resolve) => setTimeout(resolve, 0));

    await expect(controller.cancel(44)).resolves.toMatchObject({ status: "cancelled" });
    await runningExpectation;
    expect(mockedAction).toHaveBeenCalledWith(44, "cancel");
  });
});

jest.mock("./backupService", () => ({
  ackBackupFileBatch: jest.fn(),
  backupAction: jest.fn(),
  fetchBackupReportStream: jest.fn(),
  fetchProtectedStream: jest.fn(),
  fetchStorageStream: jest.fn(),
  getBackup: jest.fn(),
  getBackupFileBatch: jest.fn(),
  mergeBackupProgress: (previous: any, incoming: any) => ({ ...previous, ...incoming, totalFiles: Math.max(previous.totalFiles || 0, incoming.totalFiles || 0) }),
  retryAfterMilliseconds: jest.fn(() => 0),
}));

import { BackupController } from "./backupController";
import { ackBackupFileBatch, backupAction, fetchBackupReportStream, fetchStorageStream, getBackup, getBackupFileBatch } from "./backupService";

const mockedAck = ackBackupFileBatch as jest.MockedFunction<typeof ackBackupFileBatch>;
const mockedAction = backupAction as jest.MockedFunction<typeof backupAction>;
const mockedReport = fetchBackupReportStream as jest.MockedFunction<typeof fetchBackupReportStream>;
const mockedFetch = fetchStorageStream as jest.MockedFunction<typeof fetchStorageStream>;
const mockedGetBackup = getBackup as jest.MockedFunction<typeof getBackup>;
const mockedNext = getBackupFileBatch as jest.MockedFunction<typeof getBackupFileBatch>;

function streamResponse(filename = "outbound-calls.csv") {
  let read = false;
  return { body: { getReader: () => ({
    read: async () => read ? { done: true } : (read = true, { done: false, value: new Uint8Array([1, 2, 3]) }),
    cancel: jest.fn().mockResolvedValue(undefined),
  }) }, headers: new Headers({ "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${filename}"` }) } as unknown as Response;
}

function directoryFixture(options: { reportCloseFails?: boolean; manifest?: object } = {}) {
  const events: string[] = [];
  const writes: unknown[] = [];
  const writable = () => ({
    write: jest.fn(async (value) => { writes.push(value); events.push("write"); }),
    close: jest.fn(async () => { events.push("close"); }),
    abort: jest.fn(),
  });
  const fileHandle = { createWritable: jest.fn(async () => writable()), getFile: jest.fn() };
  const reportWritable = () => ({
    write: jest.fn(async (value) => { writes.push(value); events.push("report-write"); }),
    close: jest.fn(async () => {
      events.push("report-close");
      if (options.reportCloseFails) throw new Error("disk disconnected");
    }),
    abort: jest.fn().mockResolvedValue(undefined),
  });
  const reportFileHandle = {
    createWritable: jest.fn(async () => reportWritable()),
    getFile: jest.fn(async () => ({ size: 3 })),
  };
  const manifestHandle = {
    createWritable: jest.fn(async () => writable()),
    getFile: jest.fn(async () => ({
      text: async () => options.manifest ? JSON.stringify(options.manifest) : "",
    })),
  };
  const school = { getFileHandle: jest.fn(async (_name: string, options?: { create?: boolean }) => {
    if (!options?.create) {
      const error = new DOMException("missing", "NotFoundError");
      throw error;
    }
    return fileHandle;
  }) };
  const recordings = { getDirectoryHandle: jest.fn(async () => school) };
  const reports = { getFileHandle: jest.fn(async () => reportFileHandle) };
  const root = {
    getDirectoryHandle: jest.fn(async (name: string) => name === "reports" ? reports : recordings),
    getFileHandle: jest.fn(async () => manifestHandle),
  };
  const directory = { getDirectoryHandle: jest.fn(async () => root) } as unknown as FileSystemDirectoryHandle;
  return { directory, events, writes, school, reports, reportFileHandle };
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
    mockedReport.mockResolvedValue(streamResponse());
    mockedGetBackup.mockImplementation(async (id) => ({ id, totalFiles: 1, processedFiles: 0 }));
  });

  it("retries, ACKs only after close, writes a sanitized manifest, and finalizes on 204", async () => {
    const fixture = directoryFixture();
    mockedNext.mockResolvedValueOnce([{ id: 7, name: "call.mp3", size: 3, schoolId: 2, schoolName: "مدرسه", downloadUrl: "https://secret.example/token" }]).mockResolvedValueOnce([]);
    mockedFetch.mockRejectedValueOnce(new Error("network")).mockRejectedValueOnce(new Error("network")).mockResolvedValueOnce(streamResponse());
    mockedAck.mockImplementation(async () => {
      expect(fixture.events).toContain("close");
      return { id: 12, processedFiles: 1, totalFiles: 1, downloadedBytes: 3 };
    });

    await new BackupController().run({ job: { id: 12 }, directory: fixture.directory, schoolIds: [2], sections: ["call_recordings"], acknowledgeFailures: true });

    expect(mockedFetch).toHaveBeenCalledTimes(3);
    expect(mockedAck).toHaveBeenCalledWith(12, [{ file_id: 7, outcome: "downloaded", bytes: 3 }], expect.any(AbortSignal));
    expect(mockedAction).toHaveBeenLastCalledWith(12, "finalize");
    expect(JSON.stringify(fixture.writes)).not.toContain("secret.example");
  });

  it("allows only one loop per job", async () => {
    const fixture = directoryFixture();
    let release!: () => void;
    mockedNext.mockImplementationOnce(() => new Promise((resolve) => { release = () => resolve([]); }));
    const controller = new BackupController();
    const first = controller.run({ job: { id: 99 }, directory: fixture.directory, schoolIds: [], sections: ["call_recordings"], acknowledgeFailures: true });
    await new Promise((resolve) => setTimeout(resolve, 0));
    await expect(controller.run({ job: { id: 99 }, directory: fixture.directory, schoolIds: [], sections: ["call_recordings"], acknowledgeFailures: true })).rejects.toThrow("در حال اجرا");
    release();
    await first;
  });

  it("resume asks the server for next and never scans the directory", async () => {
    const fixture = directoryFixture();
    mockedNext.mockResolvedValueOnce([]);
    await new BackupController().run({ job: { id: 20 }, directory: fixture.directory, schoolIds: [], sections: ["call_recordings"], acknowledgeFailures: true, resume: true });
    expect(mockedAction).toHaveBeenCalledWith(20, "resume");
    expect(mockedNext).toHaveBeenCalledTimes(1);
    expect((fixture.directory as any).values).toBeUndefined();
  });

  it("retries a 503 ACK with the same file_id before requesting next", async () => {
    const fixture = directoryFixture();
    mockedNext
      .mockResolvedValueOnce([{ id: 8, name: "call.mp3", size: 3, schoolId: 2, schoolName: "مدرسه", downloadUrl: "https://storage.example/file" }])
      .mockResolvedValueOnce([]);
    mockedAck
      .mockRejectedValueOnce({ response: { status: 503, headers: { "retry-after": "0" } } })
      .mockResolvedValueOnce({ id: 12, processedFiles: 1, totalFiles: 1, downloadedBytes: 3 });

    await new BackupController().run({ job: { id: 12 }, directory: fixture.directory, schoolIds: [2], sections: ["call_recordings"], acknowledgeFailures: true });

    expect(mockedAck).toHaveBeenCalledTimes(2);
    expect(mockedAck.mock.calls[0][1][0].file_id).toBe(8);
    expect(mockedAck.mock.calls[1][1][0].file_id).toBe(8);
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

  it("settles and ACKs the current batch before pausing", async () => {
    const fixture = directoryFixture();
    let release!: () => void;
    let first = true;
    mockedNext.mockResolvedValueOnce([{ id: 9, name: "call.mp3", size: 3, schoolId: 2, schoolName: "مدرسه", downloadUrl: "https://storage.example/file" }]);
    mockedFetch.mockResolvedValue({ body: { getReader: () => ({
      read: () => first ? (first = false, new Promise((resolve) => { release = () => resolve({ done: false, value: new Uint8Array([1, 2, 3]) }); })) : Promise.resolve({ done: true }),
      cancel: jest.fn().mockResolvedValue(undefined),
    }) } } as unknown as Response);
    mockedAction.mockImplementation(async (id, action) => {
      if (action === "pause") expect(mockedAck).toHaveBeenCalled();
      return { id, status: action === "pause" ? "paused" : "completed" };
    });
    const controller = new BackupController();
    const running = controller.run({ job: { id: 45, downloadConcurrency: 1 }, directory: fixture.directory, schoolIds: [], sections: ["call_recordings"], acknowledgeFailures: true });
    await new Promise((resolve) => setTimeout(resolve, 0));
    const pausing = controller.pause(45);
    release();
    await running;
    await pausing;
    expect(mockedAction).toHaveBeenCalledWith(45, "pause");
    expect(mockedAction).not.toHaveBeenCalledWith(45, "finalize");
  });

  it("writes only the selected report with its Content-Disposition CSV filename and then finalizes", async () => {
    const fixture = directoryFixture();
    mockedAction.mockImplementation(async (id, action) => {
      if (action === "finalize") expect(fixture.events).toContain("report-close");
      return { id, status: "completed" };
    });

    await new BackupController().run({ job: { id: 31 }, directory: fixture.directory, schoolIds: [], sections: ["outbound_calls"], acknowledgeFailures: true });

    expect(mockedReport).toHaveBeenCalledTimes(1);
    expect(mockedReport).toHaveBeenCalledWith("/backups/31/export/calls", expect.any(AbortSignal));
    expect(fixture.reports.getFileHandle).toHaveBeenCalledWith("outbound-calls.csv", { create: true });
    expect(mockedAction).toHaveBeenCalledWith(31, "finalize");
  });

  it("does not finalize when closing a selected report fails", async () => {
    const fixture = directoryFixture({ reportCloseFails: true });

    await expect(new BackupController().run({ job: { id: 32 }, directory: fixture.directory, schoolIds: [], sections: ["support_form_answers"], acknowledgeFailures: true })).rejects.toThrow("disk disconnected");

    expect(mockedAction).not.toHaveBeenCalledWith(32, "finalize");
    expect(fixture.reportFileHandle.createWritable).toHaveBeenCalledTimes(1);
  });

  it("does not mark or finalize a report when its stream disconnects", async () => {
    const fixture = directoryFixture();
    let reads = 0;
    mockedReport.mockResolvedValue({
      headers: new Headers({ "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=outbound-calls.csv" }),
      body: { getReader: () => ({
        read: jest.fn(async () => {
          reads += 1;
          if (reads === 1) return { done: false, value: new Uint8Array([0xef, 0xbb, 0xbf]) };
          throw new Error("stream disconnected");
        }),
        cancel: jest.fn().mockResolvedValue(undefined),
      }) },
    } as unknown as Response);

    await expect(new BackupController().run({ job: { id: 34 }, directory: fixture.directory, schoolIds: [], sections: ["outbound_calls"], acknowledgeFailures: true })).rejects.toThrow("stream disconnected");

    expect(mockedAction).not.toHaveBeenCalledWith(34, "finalize");
    expect(fixture.writes.some((value) => typeof value === "string" && value.includes('"status": "failed"'))).toBe(true);
  });

  it("skips a completed unchanged report on resume without scanning the directory", async () => {
    const fixture = directoryFixture({ manifest: {
      reports: { outbound_calls: { status: "completed", filename: "reports/outbound-calls.csv", bytes: 3 } },
    } });

    await new BackupController().run({ job: { id: 33 }, directory: fixture.directory, schoolIds: [], sections: ["outbound_calls"], acknowledgeFailures: true, resume: true });

    expect(mockedReport).not.toHaveBeenCalled();
    expect(fixture.reports.getFileHandle).toHaveBeenCalledWith("outbound-calls.csv");
    expect((fixture.reports as any).values).toBeUndefined();
    expect(mockedAction).toHaveBeenCalledWith(33, "finalize");
  });
});
